package com.swmansion.pulsar.kmp.bundle

/** Portable ZIP reader (STORE + DEFLATE via [Inflate]) — one code path across Android and iOS. */
internal object Unzip {
    private const val LOCAL_SIG = 0x04034b50
    private const val CEN_SIG = 0x02014b50
    private const val EOCD_SIG = 0x06054b50

    fun read(data: ByteArray): Map<String, ByteArray> {
        fun u16(o: Int) = (data[o].toInt() and 0xFF) or ((data[o + 1].toInt() and 0xFF) shl 8)
        fun u32(o: Int) = (data[o].toInt() and 0xFF) or ((data[o + 1].toInt() and 0xFF) shl 8) or
            ((data[o + 2].toInt() and 0xFF) shl 16) or ((data[o + 3].toInt() and 0xFF) shl 24)

        var eocd = -1
        var i = data.size - 22
        while (i >= 0) {
            if (u32(i) == EOCD_SIG) { eocd = i; break }
            i--
        }
        if (eocd < 0) throw InflateException("not a .pulsar/zip archive")

        val count = u16(eocd + 10)
        var ptr = u32(eocd + 16)
        val out = LinkedHashMap<String, ByteArray>()
        for (n in 0 until count) {
            if (u32(ptr) != CEN_SIG) throw InflateException("corrupt zip central directory")
            val method = u16(ptr + 10)
            val compSize = u32(ptr + 20)
            val uncompSize = u32(ptr + 24)
            val nameLen = u16(ptr + 28)
            val extraLen = u16(ptr + 30)
            val commentLen = u16(ptr + 32)
            val localOff = u32(ptr + 42)
            val name = data.decodeToString(ptr + 46, ptr + 46 + nameLen)

            if (u32(localOff) != LOCAL_SIG) throw InflateException("corrupt zip local header")
            val lNameLen = u16(localOff + 26)
            val lExtraLen = u16(localOff + 28)
            val dataStart = localOff + 30 + lNameLen + lExtraLen
            if (!name.endsWith("/")) {
                val raw = data.copyOfRange(dataStart, dataStart + compSize)
                out[name] = if (method == 0) raw else Inflate.raw(raw, uncompSize)
            }
            ptr += 46 + nameLen + extraLen + commentLen
        }
        return out
    }
}
