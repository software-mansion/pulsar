package com.swmansion.pulsar.kmp.bundle

/**
 * Pure-Kotlin raw DEFLATE (RFC 1951) decoder — a faithful port of the canonical `tinf` algorithm.
 * Used so the KMP bundle loader has one unzip code path across Android and Kotlin/Native (which has
 * no `java.util.zip`).
 */
internal class InflateException(message: String) : Exception(message)

internal object Inflate {
    private val lengthBits = intArrayOf(0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0)
    private val lengthBase = intArrayOf(3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258)
    private val distBits = intArrayOf(0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13)
    private val distBase = intArrayOf(1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577)
    private val clcOrder = intArrayOf(16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15)

    private class Tree {
        val counts = IntArray(16)
        val symbols = IntArray(288)
    }

    private class State(val input: ByteArray, val out: ByteArray) {
        var pos = 0
        var tag = 0
        var bitcount = 0
        var outPos = 0

        fun getBit(): Int {
            if (bitcount == 0) {
                tag = input[pos++].toInt() and 0xFF
                bitcount = 8
            }
            val bit = tag and 1
            tag = tag ushr 1
            bitcount--
            return bit
        }

        fun readBits(num: Int, base: Int): Int {
            var value = 0
            for (i in 0 until num) value = value or (getBit() shl i)
            return value + base
        }

        fun decodeSymbol(t: Tree): Int {
            var sum = 0
            var cur = 0
            var len = 0
            do {
                cur = 2 * cur + getBit()
                len++
                sum += t.counts[len]
                cur -= t.counts[len]
            } while (cur >= 0)
            return t.symbols[sum + cur]
        }
    }

    private fun buildTree(t: Tree, lengths: IntArray, num: Int) {
        for (i in 0 until 16) t.counts[i] = 0
        for (i in 0 until num) t.counts[lengths[i]]++
        t.counts[0] = 0
        val offsets = IntArray(16)
        var sum = 0
        for (i in 0 until 16) {
            offsets[i] = sum
            sum += t.counts[i]
        }
        for (i in 0 until num) {
            if (lengths[i] != 0) t.symbols[offsets[lengths[i]]++] = i
        }
    }

    private fun fixedTrees(lt: Tree, dt: Tree) {
        val ll = IntArray(288)
        for (i in 0 until 144) ll[i] = 8
        for (i in 144 until 256) ll[i] = 9
        for (i in 256 until 280) ll[i] = 7
        for (i in 280 until 288) ll[i] = 8
        buildTree(lt, ll, 288)
        val dl = IntArray(30) { 5 }
        buildTree(dt, dl, 30)
    }

    private fun decodeTrees(s: State, lt: Tree, dt: Tree) {
        val hlit = s.readBits(5, 257)
        val hdist = s.readBits(5, 1)
        val hclen = s.readBits(4, 4)

        val codeLengths = IntArray(19)
        for (i in 0 until hclen) codeLengths[clcOrder[i]] = s.readBits(3, 0)
        val clTree = Tree()
        buildTree(clTree, codeLengths, 19)

        val lengths = IntArray(hlit + hdist)
        var num = 0
        while (num < hlit + hdist) {
            val sym = s.decodeSymbol(clTree)
            when {
                sym < 16 -> lengths[num++] = sym
                sym == 16 -> {
                    val prev = lengths[num - 1]
                    var count = s.readBits(2, 3)
                    while (count-- > 0) lengths[num++] = prev
                }
                sym == 17 -> {
                    var count = s.readBits(3, 3)
                    while (count-- > 0) lengths[num++] = 0
                }
                else -> {
                    var count = s.readBits(7, 11)
                    while (count-- > 0) lengths[num++] = 0
                }
            }
        }
        buildTree(lt, lengths.copyOfRange(0, hlit), hlit)
        buildTree(dt, lengths.copyOfRange(hlit, hlit + hdist), hdist)
    }

    private fun inflateBlock(s: State, lt: Tree, dt: Tree) {
        while (true) {
            val sym = s.decodeSymbol(lt)
            if (sym == 256) return
            if (sym < 256) {
                s.out[s.outPos++] = sym.toByte()
            } else {
                val lengthSym = sym - 257
                val length = s.readBits(lengthBits[lengthSym], lengthBase[lengthSym])
                val distSym = s.decodeSymbol(dt)
                val distance = s.readBits(distBits[distSym], distBase[distSym])
                val start = s.outPos - distance
                for (i in 0 until length) s.out[s.outPos++] = s.out[start + i]
            }
        }
    }

    private fun inflateStored(s: State) {
        s.bitcount = 0 // align to byte boundary
        val len = (s.input[s.pos].toInt() and 0xFF) or ((s.input[s.pos + 1].toInt() and 0xFF) shl 8)
        s.pos += 4 // skip LEN + NLEN
        for (i in 0 until len) s.out[s.outPos++] = s.input[s.pos++]
    }

    fun raw(input: ByteArray, expectedSize: Int): ByteArray {
        if (expectedSize == 0) return ByteArray(0)
        val s = State(input, ByteArray(expectedSize))
        val lt = Tree()
        val dt = Tree()
        while (true) {
            val bfinal = s.getBit()
            when (s.readBits(2, 0)) {
                0 -> inflateStored(s)
                1 -> { fixedTrees(lt, dt); inflateBlock(s, lt, dt) }
                2 -> { decodeTrees(s, lt, dt); inflateBlock(s, lt, dt) }
                else -> throw InflateException("invalid DEFLATE block type")
            }
            if (bfinal == 1) break
        }
        if (s.outPos != expectedSize) throw InflateException("inflate size mismatch: ${s.outPos} != $expectedSize")
        return s.out
    }
}
