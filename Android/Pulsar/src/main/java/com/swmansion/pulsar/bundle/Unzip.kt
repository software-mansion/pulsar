package com.swmansion.pulsar.bundle

import java.io.ByteArrayInputStream
import java.util.zip.ZipInputStream

/** Reads a `.pulsar` (zip) into a map of entry path -> bytes using the JDK's zip support. */
internal object Unzip {
    fun read(bytes: ByteArray): Map<String, ByteArray> {
        val out = LinkedHashMap<String, ByteArray>()
        ZipInputStream(ByteArrayInputStream(bytes)).use { zis ->
            var entry = zis.nextEntry
            while (entry != null) {
                if (!entry.isDirectory) {
                    out[entry.name] = zis.readBytes()
                }
                zis.closeEntry()
                entry = zis.nextEntry
            }
        }
        return out
    }
}
