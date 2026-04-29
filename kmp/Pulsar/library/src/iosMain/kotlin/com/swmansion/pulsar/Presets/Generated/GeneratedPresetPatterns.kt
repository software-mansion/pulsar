package com.swmansion.pulsar

internal data class IOSPresetPattern(
    val continuous: List<List<List<Float>>>,
    val discrete: List<List<Float>>,
)

internal val iosGeneratedPresetPatterns: Map<String, IOSPresetPattern> = mapOf(
    "Afterglow" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 0.3f), listOf(75f, 0.703f, 0.203f), listOf(150f, 0.5f, 0.1f)),
    ),
    "Aftershock" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.8f, 0.8f), listOf(299f, 0.5f, 0.247f), listOf(399f, 0.494f, 0.266f), listOf(500f, 0.497f, 0.263f)),
    ),
    "Alarm" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.9f), listOf(130f, 0.0f), listOf(200f, 0.9f), listOf(330f, 0.0f), listOf(400f, 0.9f), listOf(530f, 0.0f), listOf(600f, 0.9f), listOf(730f, 0.0f), listOf(800f, 0.9f), listOf(930f, 0.0f), listOf(1000f, 0.9f), listOf(1130f, 0.0f)), listOf(listOf(0f, 0.82f), listOf(130f, 0.82f), listOf(200f, 0.48f), listOf(330f, 0.48f), listOf(400f, 0.82f), listOf(530f, 0.82f), listOf(600f, 0.48f), listOf(730f, 0.48f), listOf(800f, 0.82f), listOf(930f, 0.82f), listOf(1000f, 0.48f), listOf(1130f, 0.48f))),
        discrete = listOf(listOf(0f, 0.9f, 0.8f), listOf(200f, 0.9f, 0.5f), listOf(400f, 0.9f, 0.8f), listOf(600f, 0.9f, 0.5f), listOf(800f, 0.9f, 0.8f), listOf(1000f, 0.9f, 0.5f)),
    ),
    "Anvil" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 1.0f), listOf(60f, 0.6f), listOf(150f, 0.3f), listOf(300f, 0.1f), listOf(500f, 0.0f)), listOf(listOf(0f, 0.12f), listOf(5f, 0.1f), listOf(500f, 0.08f))),
        discrete = listOf(listOf(0f, 1.0f, 0.15f), listOf(80f, 0.5f, 0.2f)),
    ),
    "Applause" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.2f), listOf(1482f, 0.266f), listOf(1564f, 0.0f)), listOf(listOf(0f, 0.5f), listOf(990f, 0.72f), listOf(1250f, 0.7f))),
        discrete = listOf(listOf(0f, 0.2f, 0.5f), listOf(150f, 0.25f, 0.52f), listOf(290f, 0.3f, 0.54f), listOf(420f, 0.4f, 0.56f), listOf(540f, 0.5f, 0.58f), listOf(650f, 0.484f, 0.6f), listOf(750f, 0.509f, 0.62f), listOf(868f, 0.503f, 0.65f), listOf(968f, 0.45f, 0.716f), listOf(1063f, 0.434f, 0.725f), listOf(1159f, 0.488f, 0.759f), listOf(1256f, 0.506f, 1.0f), listOf(1349f, 0.528f, 1.0f), listOf(1432f, 0.519f, 1.0f), listOf(1530f, 0.528f, 1.0f)),
    ),
    "Ascent" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.55f), listOf(155f, 0.0f), listOf(205f, 0.65f), listOf(335f, 0.0f), listOf(385f, 0.75f), listOf(495f, 0.0f), listOf(545f, 0.85f), listOf(635f, 0.0f), listOf(685f, 0.92f), listOf(755f, 0.0f), listOf(805f, 0.97f), listOf(860f, 0.0f), listOf(905f, 1.0f), listOf(1700f, 0.65f), listOf(2100f, 0.25f), listOf(2400f, 0.0f)), listOf(listOf(0f, 0.3f), listOf(200f, 0.37f), listOf(380f, 0.42f), listOf(540f, 0.55f), listOf(680f, 0.65f), listOf(800f, 0.73f), listOf(900f, 0.87f), listOf(2400f, 0.87f))),
        discrete = listOf(listOf(0f, 0.55f, 0.3f), listOf(200f, 0.65f, 0.37f), listOf(380f, 0.75f, 0.42f), listOf(540f, 0.85f, 0.55f), listOf(680f, 0.92f, 0.65f), listOf(800f, 0.97f, 0.73f), listOf(900f, 1.0f, 0.87f)),
    ),
    "BalloonPop" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(50f, 0.1f), listOf(200f, 0.0f), listOf(300f, 0.15f), listOf(500f, 0.0f), listOf(600f, 0.25f), listOf(800f, 0.0f), listOf(900f, 0.35f), listOf(1100f, 0.0f), listOf(1200f, 0.5f), listOf(1380f, 0.0f), listOf(1400f, 1.0f), listOf(1440f, 0.6f), listOf(1550f, 0.1f), listOf(1700f, 0.0f)), listOf(listOf(0f, 0.2f), listOf(1380f, 0.5f), listOf(1400f, 1.0f), listOf(1700f, 0.3f))),
        discrete = listOf(listOf(0f, 0.1f, 0.3f), listOf(300f, 0.2f, 0.35f), listOf(600f, 0.3f, 0.4f), listOf(900f, 0.45f, 0.45f), listOf(1200f, 0.6f, 0.5f), listOf(1400f, 1.0f, 0.9f)),
    ),
    "Barrage" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.994f, 0.994f), listOf(51f, 0.994f, 0.994f), listOf(100f, 0.991f, 0.991f), listOf(156f, 1.0f, 1.0f), listOf(208f, 0.991f, 0.991f), listOf(260f, 1.0f, 1.0f), listOf(309f, 1.0f, 1.0f)),
    ),
    "BassDrop" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 0.509f), listOf(71f, 1.0f, 0.069f)),
    ),
    "Batter" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.9f), listOf(45f, 0.35f), listOf(60f, 0.8f), listOf(102f, 0.32f), listOf(120f, 0.93f), listOf(158f, 0.35f), listOf(175f, 0.83f), listOf(208f, 0.38f), listOf(225f, 1.0f), listOf(380f, 0.0f)), listOf(listOf(0f, 0.35f), listOf(225f, 0.38f), listOf(380f, 0.32f))),
        discrete = listOf(listOf(0f, 0.9f, 0.35f), listOf(60f, 0.82f, 0.32f), listOf(120f, 0.95f, 0.36f), listOf(175f, 0.85f, 0.33f), listOf(225f, 1.0f, 0.38f)),
    ),
    "BellToll" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(10f, 1.0f, 0.903f), listOf(201f, 1.0f, 0.513f), listOf(399f, 0.997f, 0.147f)),
    ),
    "Blip" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.5f), listOf(100f, 0.35f), listOf(200f, 0.0f)), listOf(listOf(0f, 0.6f), listOf(200f, 0.58f))),
        discrete = listOf(listOf(0f, 0.55f, 0.6f)),
    ),
    "Bloom" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(15f, 0.28f), listOf(80f, 0.15f), listOf(120f, 0.5f), listOf(200f, 0.15f), listOf(300f, 0.0f)), listOf(listOf(0f, 0.48f), listOf(200f, 0.62f), listOf(300f, 0.58f))),
        discrete = listOf(listOf(0f, 0.3f, 0.5f), listOf(120f, 0.55f, 0.62f)),
    ),
    "Bongo" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.594f, 0.594f), listOf(73f, 0.588f, 0.588f), listOf(151f, 0.588f, 0.588f), listOf(299f, 0.4f, 0.4f), listOf(380f, 0.394f, 0.394f), listOf(451f, 0.394f, 0.394f)),
    ),
    "Boulder" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 0.2f)),
    ),
    "BreakingWave" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 0.497f, 0.497f), listOf(89f, 0.497f, 0.497f), listOf(202f, 1.0f, 0.1f)),
    ),
    "Breath" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(800f, 0.5f), listOf(1600f, 0.05f), listOf(2400f, 0.5f), listOf(3200f, 0.0f)), listOf(listOf(0f, 0.15f), listOf(800f, 0.25f), listOf(1600f, 0.1f), listOf(2400f, 0.25f), listOf(3200f, 0.15f))),
        discrete = listOf(),
    ),
    "Buildup" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.994f, 0.053f), listOf(51f, 0.994f, 0.122f), listOf(100f, 0.991f, 0.228f), listOf(156f, 1.0f, 0.394f), listOf(208f, 0.991f, 0.613f), listOf(260f, 1.0f, 0.803f), listOf(309f, 1.0f, 1.0f)),
    ),
    "Burst" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(15f, 0.18f), listOf(80f, 0.4f), listOf(100f, 0.85f), listOf(130f, 0.3f), listOf(300f, 0.0f)), listOf(listOf(0f, 0.55f), listOf(80f, 0.65f), listOf(100f, 0.72f), listOf(300f, 0.4f))),
        discrete = listOf(listOf(0f, 0.2f, 0.55f), listOf(100f, 0.45f, 0.65f), listOf(180f, 0.9f, 0.7f)),
    ),
    "Buzz" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.9f), listOf(100f, 0.85f), listOf(150f, 0.65f), listOf(250f, 0.3f), listOf(350f, 0.0f)), listOf(listOf(0f, 0.85f), listOf(350f, 0.8f))),
        discrete = listOf(listOf(0f, 0.9f, 0.85f)),
    ),
    "Cadence" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.809f, 0.897f), listOf(199f, 1.0f, 0.413f)),
    ),
    "CameraShutter" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.6f), listOf(30f, 0.05f), listOf(60f, 0.8f), listOf(100f, 0.1f), listOf(150f, 0.0f)), listOf(listOf(0f, 0.78f), listOf(30f, 0.6f), listOf(60f, 0.72f), listOf(150f, 0.65f))),
        discrete = listOf(listOf(0f, 0.6f, 0.75f), listOf(60f, 0.8f, 0.7f)),
    ),
    "Canter" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 1.0f, 0.203f), listOf(77f, 0.697f, 0.5f), listOf(173f, 0.703f, 0.244f)),
    ),
    "Cascade" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.994f, 0.994f), listOf(99f, 0.997f, 0.997f), listOf(199f, 0.997f, 0.997f), listOf(551f, 0.8f, 0.8f), listOf(649f, 0.803f, 0.803f), listOf(751f, 0.797f, 0.797f), listOf(1118f, 0.5f, 0.5f), listOf(1219f, 0.491f, 0.491f), listOf(1318f, 0.494f, 0.494f), listOf(1660f, 0.497f, 0.213f), listOf(1762f, 0.506f, 0.209f), listOf(1863f, 0.488f, 0.213f)),
    ),
    "Castanets" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 1.0f, 0.897f), listOf(199f, 1.0f, 0.9f)),
    ),
    "CatPaw" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.6f, 0.3f), listOf(75f, 0.6f, 0.08f)),
    ),
    "Charge" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.62f), listOf(100f, 0.35f), listOf(200f, 0.0f), listOf(900f, 0.0f), listOf(905f, 0.85f), listOf(980f, 0.5f), listOf(1100f, 0.35f), listOf(1250f, 0.0f), listOf(1600f, 0.0f), listOf(1603f, 1.0f), listOf(1770f, 1.0f), listOf(1873f, 0.334f), listOf(2046f, 0.0f)), listOf(listOf(0f, 0.62f), listOf(200f, 0.6f), listOf(900f, 0.68f), listOf(1250f, 0.65f), listOf(1600f, 0.82f), listOf(1680f, 0.7f), listOf(1860f, 0.6f))),
        discrete = listOf(listOf(0f, 0.65f, 0.62f), listOf(900f, 0.85f, 0.68f), listOf(1600f, 1.0f, 0.82f)),
    ),
    "Chime" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.5f), listOf(70f, 0.08f), listOf(150f, 0.0f), listOf(180f, 0.7f), listOf(260f, 0.12f), listOf(380f, 0.0f)), listOf(listOf(0f, 0.48f), listOf(150f, 0.48f), listOf(180f, 0.65f), listOf(380f, 0.6f))),
        discrete = listOf(listOf(0f, 0.5f, 0.5f), listOf(180f, 0.7f, 0.65f)),
    ),
    "Chip" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 0.75f, 1.0f)),
    ),
    "Chirp" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.35f), listOf(80f, 0.0f), listOf(150f, 0.45f), listOf(230f, 0.0f), listOf(280f, 0.55f), listOf(360f, 0.0f)), listOf(listOf(0f, 0.6f), listOf(360f, 0.72f))),
        discrete = listOf(listOf(0f, 0.4f, 0.65f), listOf(150f, 0.5f, 0.68f), listOf(280f, 0.6f, 0.72f)),
    ),
    "Clamor" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.78f), listOf(70f, 0.0f), listOf(120f, 0.78f), listOf(190f, 0.0f), listOf(240f, 0.78f), listOf(310f, 0.0f), listOf(360f, 0.78f), listOf(430f, 0.0f)), listOf(listOf(0f, 0.68f), listOf(430f, 0.68f))),
        discrete = listOf(listOf(0f, 0.8f, 0.68f), listOf(120f, 0.8f, 0.68f), listOf(240f, 0.8f, 0.68f), listOf(360f, 0.8f, 0.68f)),
    ),
    "Clasp" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.65f), listOf(45f, 0.0f), listOf(80f, 0.9f), listOf(130f, 0.3f), listOf(220f, 0.0f)), listOf(listOf(0f, 0.72f), listOf(80f, 0.78f), listOf(220f, 0.75f))),
        discrete = listOf(listOf(0f, 0.65f, 0.72f), listOf(80f, 0.9f, 0.78f)),
    ),
    "Cleave" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.85f), listOf(65f, 0.0f), listOf(100f, 0.7f), listOf(165f, 0.2f), listOf(250f, 0.0f)), listOf(listOf(0f, 0.8f), listOf(250f, 0.76f))),
        discrete = listOf(listOf(0f, 0.85f, 0.8f), listOf(100f, 0.7f, 0.78f)),
    ),
    "Coil" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(50f, 0.15f), listOf(200f, 0.2f), listOf(400f, 0.3f), listOf(570f, 0.4f), listOf(590f, 0.0f), listOf(600f, 1.0f), listOf(650f, 0.0f)), listOf(listOf(0f, 0.3f), listOf(570f, 0.5f), listOf(600f, 0.8f), listOf(650f, 0.8f))),
        discrete = listOf(listOf(0f, 0.2f, 0.4f), listOf(600f, 1.0f, 0.7f)),
    ),
    "CoinDrop" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.5f), listOf(35f, 0.0f), listOf(120f, 0.7f), listOf(145f, 0.0f), listOf(210f, 0.4f), listOf(230f, 0.0f), listOf(300f, 0.8f), listOf(325f, 0.0f), listOf(380f, 0.35f), listOf(397f, 0.0f), listOf(460f, 0.6f), listOf(480f, 0.0f), listOf(520f, 0.9f), listOf(550f, 0.0f), listOf(590f, 0.45f), listOf(608f, 0.0f), listOf(650f, 0.7f), listOf(675f, 0.0f)), listOf(listOf(0f, 0.8f), listOf(675f, 0.9f))),
        discrete = listOf(listOf(0f, 0.5f, 0.8f), listOf(120f, 0.7f, 0.85f), listOf(210f, 0.4f, 0.75f), listOf(300f, 0.8f, 0.9f), listOf(380f, 0.35f, 0.7f), listOf(460f, 0.6f, 0.8f), listOf(520f, 0.9f, 0.9f), listOf(590f, 0.45f, 0.75f), listOf(650f, 0.7f, 0.85f)),
    ),
    "CombinationLock" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(4f, 0.62f), listOf(25f, 0.0f), listOf(180f, 0.6f), listOf(201f, 0.0f), listOf(360f, 0.63f), listOf(381f, 0.0f), listOf(540f, 0.6f), listOf(561f, 0.0f), listOf(720f, 0.62f), listOf(741f, 0.0f), listOf(900f, 0.9f), listOf(935f, 0.2f), listOf(980f, 0.0f)), listOf(listOf(0f, 0.75f), listOf(900f, 0.75f), listOf(980f, 0.7f))),
        discrete = listOf(listOf(0f, 0.62f, 0.75f), listOf(180f, 0.6f, 0.75f), listOf(360f, 0.63f, 0.75f), listOf(540f, 0.6f, 0.75f), listOf(720f, 0.62f, 0.75f), listOf(900f, 0.9f, 0.72f)),
    ),
    "Crescendo" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.303f, 0.303f), listOf(99f, 0.397f, 0.397f), listOf(202f, 0.506f, 0.506f), listOf(300f, 0.609f, 0.609f), listOf(399f, 0.703f, 0.703f), listOf(502f, 0.809f, 0.809f), listOf(601f, 0.981f, 0.981f)),
    ),
    "Dewdrop" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.4f), listOf(65f, 0.0f), listOf(130f, 0.6f), listOf(210f, 0.0f)), listOf(listOf(0f, 0.5f), listOf(130f, 0.65f), listOf(210f, 0.62f))),
        discrete = listOf(listOf(0f, 0.4f, 0.52f), listOf(130f, 0.6f, 0.65f)),
    ),
    "Dirge" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(30f, 0.4f), listOf(300f, 0.2f), listOf(700f, 0.0f), listOf(900f, 0.0f), listOf(930f, 0.38f), listOf(1200f, 0.18f), listOf(1700f, 0.0f), listOf(1900f, 0.0f), listOf(1930f, 0.32f), listOf(2200f, 0.12f), listOf(2600f, 0.0f)), listOf(listOf(0f, 0.14f), listOf(2600f, 0.11f))),
        discrete = listOf(listOf(0f, 0.45f, 0.15f), listOf(900f, 0.4f, 0.13f), listOf(1900f, 0.35f, 0.12f)),
    ),
    "Dissolve" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(50f, 0.38f), listOf(300f, 0.28f), listOf(600f, 0.2f), listOf(900f, 0.12f), listOf(1200f, 0.0f)), listOf(listOf(0f, 0.38f), listOf(1200f, 0.18f))),
        discrete = listOf(listOf(0f, 0.4f, 0.4f), listOf(400f, 0.25f, 0.2f)),
    ),
    "DogBark" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.9f), listOf(50f, 0.65f), listOf(120f, 0.15f), listOf(200f, 0.0f), listOf(280f, 0.85f), listOf(325f, 0.6f), listOf(400f, 0.12f), listOf(500f, 0.0f)), listOf(listOf(0f, 0.2f), listOf(500f, 0.2f))),
        discrete = listOf(listOf(0f, 0.9f, 0.22f), listOf(280f, 0.85f, 0.22f)),
    ),
    "Drone" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(20f, 0.28f), listOf(180f, 0.28f), listOf(280f, 0.0f), listOf(500f, 0.0f), listOf(520f, 0.28f), listOf(680f, 0.28f), listOf(780f, 0.0f), listOf(1000f, 0.0f), listOf(1020f, 0.28f), listOf(1180f, 0.28f), listOf(1280f, 0.0f), listOf(1500f, 0.0f), listOf(1520f, 0.28f), listOf(1680f, 0.28f), listOf(1780f, 0.0f)), listOf(listOf(0f, 0.45f), listOf(1780f, 0.45f))),
        discrete = listOf(listOf(0f, 0.3f, 0.45f), listOf(500f, 0.3f, 0.45f), listOf(1000f, 0.3f, 0.45f), listOf(1500f, 0.3f, 0.45f)),
    ),
    "EngineRev" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.15f), listOf(700f, 0.75f), listOf(710f, 0.2f), listOf(720f, 0.25f), listOf(1400f, 0.95f), listOf(1600f, 0.5f), listOf(1800f, 0.0f)), listOf(listOf(0f, 0.08f), listOf(700f, 0.45f), listOf(720f, 0.12f), listOf(1400f, 0.55f), listOf(1800f, 0.3f))),
        discrete = listOf(listOf(700f, 0.8f, 0.4f), listOf(1400f, 1.0f, 0.5f)),
    ),
    "Exhale" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.6f), listOf(100f, 0.4f), listOf(200f, 0.25f), listOf(500f, 0.2f), listOf(800f, 0.15f), listOf(1200f, 0.0f)), listOf(listOf(0f, 0.6f), listOf(200f, 0.28f), listOf(1200f, 0.15f))),
        discrete = listOf(listOf(0f, 0.6f, 0.6f), listOf(150f, 0.35f, 0.3f), listOf(500f, 0.2f, 0.15f)),
    ),
    "Explosion" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 1.0f), listOf(80f, 0.7f), listOf(200f, 0.5f), listOf(400f, 0.3f), listOf(700f, 0.1f), listOf(1000f, 0.0f)), listOf(listOf(0f, 0.2f), listOf(5f, 0.15f), listOf(1000f, 0.05f))),
        discrete = listOf(listOf(0f, 1.0f, 0.4f), listOf(50f, 0.8f, 0.328f), listOf(120f, 0.722f, 0.256f), listOf(187f, 0.594f, 0.138f)),
    ),
    "FadeOut" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 1.0f), listOf(86f, 0.8f, 0.8f), listOf(192f, 0.603f, 0.603f), listOf(298f, 0.406f, 0.406f), listOf(408f, 0.291f, 0.209f), listOf(506f, 0.297f, 0.075f)),
    ),
    "Fanfare" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.6f), listOf(80f, 0.0f), listOf(130f, 0.7f), listOf(200f, 0.0f), listOf(250f, 0.8f), listOf(315f, 0.0f), listOf(360f, 1.0f), listOf(460f, 0.5f), listOf(580f, 0.0f)), listOf(listOf(0f, 0.38f), listOf(130f, 0.52f), listOf(250f, 0.62f), listOf(360f, 0.78f), listOf(580f, 0.82f))),
        discrete = listOf(listOf(0f, 0.6f, 0.4f), listOf(130f, 0.7f, 0.55f), listOf(250f, 0.8f, 0.65f), listOf(360f, 1.0f, 0.8f)),
    ),
    "Feather" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.45f), listOf(70f, 0.15f), listOf(180f, 0.0f)), listOf(listOf(0f, 0.42f), listOf(180f, 0.38f))),
        discrete = listOf(listOf(0f, 0.45f, 0.45f)),
    ),
    "Finale" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.7f), listOf(75f, 0.0f), listOf(200f, 0.7f), listOf(275f, 0.0f), listOf(400f, 0.9f), listOf(520f, 0.3f), listOf(680f, 0.0f)), listOf(listOf(0f, 0.55f), listOf(400f, 0.65f), listOf(680f, 0.6f))),
        discrete = listOf(listOf(400f, 0.9f, 0.65f)),
    ),
    "FingerDrum" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 0.591f, 0.591f), listOf(100f, 0.588f, 0.588f), listOf(231f, 0.6f, 0.328f)),
    ),
    "Firecracker" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 1.0f), listOf(75f, 1.0f, 1.0f)),
    ),
    "Fizz" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.5f), listOf(60f, 0.15f), listOf(120f, 0.6f), listOf(178f, 0.1f), listOf(230f, 0.7f), listOf(290f, 0.15f), listOf(330f, 0.75f), listOf(390f, 0.2f), listOf(420f, 0.65f), listOf(500f, 0.0f)), listOf(listOf(0f, 0.62f), listOf(420f, 0.72f), listOf(500f, 0.68f))),
        discrete = listOf(listOf(0f, 0.5f, 0.65f), listOf(120f, 0.6f, 0.7f), listOf(230f, 0.7f, 0.73f), listOf(330f, 0.75f, 0.75f), listOf(420f, 0.65f, 0.7f)),
    ),
    "Flare" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(20f, 0.18f), listOf(60f, 0.52f), listOf(90f, 0.95f), listOf(100f, 1.0f), listOf(120f, 0.75f), listOf(140f, 0.65f), listOf(200f, 0.35f), listOf(380f, 0.0f)), listOf(listOf(0f, 0.7f), listOf(60f, 0.82f), listOf(100f, 0.92f), listOf(200f, 0.75f), listOf(380f, 0.6f))),
        discrete = listOf(listOf(0f, 0.2f, 0.7f), listOf(60f, 0.55f, 0.8f), listOf(100f, 1.0f, 0.9f), listOf(140f, 0.7f, 0.85f), listOf(200f, 0.4f, 0.75f)),
    ),
    "Flick" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(6f, 0.4f), listOf(45f, 0.05f), listOf(80f, 0.0f)), listOf(listOf(0f, 0.5f), listOf(80f, 0.5f))),
        discrete = listOf(listOf(0f, 0.42f, 0.5f)),
    ),
    "Flinch" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(4f, 0.95f), listOf(60f, 0.3f), listOf(120f, 0.8f), listOf(170f, 0.4f), listOf(280f, 0.0f)), listOf(listOf(0f, 0.73f), listOf(120f, 0.68f), listOf(280f, 0.55f))),
        discrete = listOf(listOf(0f, 0.9f, 0.75f), listOf(120f, 0.75f, 0.7f), listOf(200f, 0.4f, 0.58f)),
    ),
    "Flourish" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(50f, 0.2f), listOf(200f, 0.65f), listOf(380f, 0.95f), listOf(480f, 0.5f), listOf(650f, 0.0f)), listOf(listOf(0f, 0.43f), listOf(380f, 0.78f), listOf(650f, 0.65f))),
        discrete = listOf(listOf(0f, 0.25f, 0.45f), listOf(200f, 0.7f, 0.65f), listOf(380f, 0.95f, 0.78f), listOf(500f, 0.6f, 0.62f), listOf(584f, 0.628f, 0.628f), listOf(682f, 0.6f, 0.6f), listOf(754f, 0.456f, 0.456f), listOf(827f, 0.303f, 0.303f), listOf(917f, 0.2f, 0.2f)),
    ),
    "Flurry" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.45f), listOf(40f, 0.0f), listOf(60f, 0.55f), listOf(95f, 0.0f), listOf(115f, 0.65f), listOf(148f, 0.0f), listOf(165f, 0.82f), listOf(240f, 0.1f), listOf(300f, 0.0f)), listOf(listOf(0f, 0.55f), listOf(165f, 0.72f), listOf(300f, 0.7f))),
        discrete = listOf(listOf(0f, 0.5f, 0.55f), listOf(60f, 0.6f, 0.6f), listOf(115f, 0.7f, 0.65f), listOf(165f, 0.85f, 0.7f)),
    ),
    "Flush" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(30f, 0.22f), listOf(80f, 0.45f), listOf(100f, 0.78f), listOf(140f, 0.52f), listOf(200f, 0.2f), listOf(380f, 0.0f)), listOf(listOf(0f, 0.3f), listOf(100f, 0.35f), listOf(150f, 0.28f), listOf(380f, 0.22f))),
        discrete = listOf(listOf(0f, 0.25f, 0.3f), listOf(100f, 0.5f, 0.35f), listOf(150f, 0.8f, 0.3f), listOf(200f, 0.55f, 0.25f)),
    ),
    "Gallop" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(10f, 1.0f, 0.603f), listOf(155f, 1.0f, 0.163f), listOf(601f, 0.997f, 0.609f), listOf(750f, 1.0f, 0.153f)),
    ),
    "Gavel" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(10f, 1.0f, 0.106f), listOf(201f, 1.0f, 0.609f)),
    ),
    "Glitch" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.9f), listOf(20f, 0.1f), listOf(55f, 1.0f), listOf(65f, 0.0f), listOf(100f, 0.85f), listOf(118f, 0.0f), listOf(160f, 0.95f), listOf(175f, 0.15f), listOf(220f, 0.0f)), listOf(listOf(0f, 0.9f), listOf(20f, 0.2f), listOf(55f, 1.0f), listOf(65f, 0.1f), listOf(100f, 0.88f), listOf(118f, 0.15f), listOf(160f, 0.92f), listOf(220f, 0.3f))),
        discrete = listOf(listOf(0f, 0.9f, 0.9f), listOf(30f, 0.2f, 0.3f), listOf(55f, 1.0f, 0.95f), listOf(70f, 0.1f, 0.2f), listOf(100f, 0.85f, 0.85f), listOf(130f, 0.05f, 0.1f), listOf(160f, 0.95f, 0.9f), listOf(185f, 0.3f, 0.4f)),
    ),
    "GuitarStrum" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.9f), listOf(60f, 0.65f), listOf(200f, 0.45f), listOf(450f, 0.28f), listOf(750f, 0.14f), listOf(1100f, 0.05f), listOf(1400f, 0.0f)), listOf(listOf(0f, 0.58f), listOf(5f, 0.55f), listOf(1400f, 0.52f))),
        discrete = listOf(listOf(0f, 0.9f, 0.55f)),
    ),
    "Hail" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.3f), listOf(400f, 0.3f), listOf(430f, 0.0f)), listOf(listOf(0f, 0.7f), listOf(430f, 0.7f))),
        discrete = listOf(listOf(0f, 0.6f, 0.7f), listOf(40f, 0.8f, 0.75f), listOf(75f, 0.4f, 0.65f), listOf(100f, 0.9f, 0.8f), listOf(130f, 0.5f, 0.7f), listOf(165f, 0.7f, 0.75f), listOf(190f, 1.0f, 0.85f), listOf(225f, 0.45f, 0.65f), listOf(255f, 0.8f, 0.78f), listOf(285f, 0.6f, 0.7f), listOf(310f, 0.9f, 0.82f), listOf(345f, 0.5f, 0.68f), listOf(370f, 0.7f, 0.74f)),
    ),
    "Hammer" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.75f), listOf(90f, 0.05f), listOf(180f, 0.0f), listOf(220f, 0.8f), listOf(310f, 0.05f), listOf(380f, 0.0f), listOf(420f, 0.88f), listOf(508f, 0.05f), listOf(550f, 0.0f), listOf(590f, 0.92f), listOf(678f, 0.05f), listOf(710f, 0.0f), listOf(740f, 1.0f), listOf(816f, 0.05f), listOf(840f, 0.0f), listOf(870f, 1.0f), listOf(950f, 0.05f), listOf(1050f, 0.0f)), listOf(listOf(0f, 0.28f), listOf(1050f, 0.28f))),
        discrete = listOf(listOf(0f, 0.75f, 0.3f), listOf(220f, 0.8f, 0.32f), listOf(420f, 0.88f, 0.3f), listOf(590f, 0.92f, 0.32f), listOf(740f, 1.0f, 0.3f), listOf(870f, 1.0f, 0.3f)),
    ),
    "Heartbeat" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.8f), listOf(80f, 0.0f), listOf(120f, 0.5f), listOf(200f, 0.0f), listOf(800f, 0.0f), listOf(810f, 0.8f), listOf(880f, 0.0f), listOf(920f, 0.5f), listOf(1000f, 0.0f)), listOf(listOf(0f, 0.2f), listOf(1000f, 0.2f))),
        discrete = listOf(listOf(0f, 0.9f, 0.2f), listOf(120f, 0.6f, 0.2f), listOf(800f, 0.9f, 0.2f), listOf(920f, 0.6f, 0.2f)),
    ),
    "Herald" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 0.497f, 0.497f), listOf(89f, 0.497f, 0.497f), listOf(208f, 1.0f, 1.0f)),
    ),
    "HoofBeat" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(10f, 1.0f, 0.106f), listOf(201f, 1.0f, 0.109f)),
    ),
    "Ignition" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 1.0f, 0.203f), listOf(77f, 0.697f, 0.5f), listOf(173f, 1.0f, 0.703f)),
    ),
    "Impact" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.85f), listOf(60f, 0.35f), listOf(120f, 0.15f), listOf(200f, 0.0f)), listOf(listOf(0f, 0.6f), listOf(200f, 0.35f))),
        discrete = listOf(listOf(0f, 0.9f, 0.6f), listOf(80f, 0.5f, 0.5f), listOf(150f, 0.25f, 0.4f)),
    ),
    "Jolt" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 1.0f)),
    ),
    "KeyboardMechanical" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(4f, 0.52f), listOf(18f, 0.2f), listOf(22f, 0.7f), listOf(38f, 0.15f), listOf(55f, 0.0f)), listOf(listOf(0f, 0.68f), listOf(22f, 0.76f), listOf(55f, 0.7f))),
        discrete = listOf(listOf(0f, 0.55f, 0.68f), listOf(22f, 0.72f, 0.74f)),
    ),
    "KeyboardMembrane" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(12f, 0.33f), listOf(50f, 0.18f), listOf(100f, 0.06f), listOf(140f, 0.0f)), listOf(listOf(0f, 0.38f), listOf(140f, 0.35f))),
        discrete = listOf(listOf(0f, 0.35f, 0.38f)),
    ),
    "Knell" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.9f), listOf(200f, 0.5f), listOf(300f, 0.1f), listOf(350f, 0.5f), listOf(430f, 0.1f), listOf(550f, 0.0f)), listOf(listOf(0f, 0.58f), listOf(300f, 0.52f), listOf(550f, 0.48f))),
        discrete = listOf(listOf(0f, 0.9f, 0.58f), listOf(350f, 0.5f, 0.5f)),
    ),
    "Knock" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.65f), listOf(70f, 0.08f), listOf(200f, 0.0f), listOf(280f, 0.65f), listOf(348f, 0.08f), listOf(480f, 0.0f), listOf(560f, 0.65f), listOf(628f, 0.08f), listOf(760f, 0.0f)), listOf(listOf(0f, 0.32f), listOf(760f, 0.32f))),
        discrete = listOf(listOf(0f, 0.65f, 0.35f), listOf(280f, 0.65f, 0.35f), listOf(560f, 0.65f, 0.35f)),
    ),
    "Lament" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.85f), listOf(190f, 0.3f), listOf(295f, 0.0f), listOf(355f, 0.7f), listOf(535f, 0.25f), listOf(645f, 0.0f), listOf(705f, 0.55f), listOf(880f, 0.18f), listOf(995f, 0.0f), listOf(1055f, 0.75f), listOf(1620f, 0.35f), listOf(2150f, 0.1f), listOf(2450f, 0.0f)), listOf(listOf(0f, 0.55f), listOf(350f, 0.42f), listOf(700f, 0.37f), listOf(1050f, 0.3f), listOf(2450f, 0.26f))),
        discrete = listOf(listOf(0f, 0.85f, 0.55f), listOf(350f, 0.7f, 0.42f), listOf(700f, 0.55f, 0.37f), listOf(1050f, 0.75f, 0.3f)),
    ),
    "Latch" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.72f), listOf(60f, 0.15f), listOf(100f, 0.38f), listOf(170f, 0.08f), listOf(230f, 0.0f)), listOf(listOf(0f, 0.68f), listOf(100f, 0.45f), listOf(230f, 0.42f))),
        discrete = listOf(listOf(0f, 0.75f, 0.68f), listOf(100f, 0.4f, 0.45f)),
    ),
    "Lighthouse" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(15f, 0.4f), listOf(150f, 0.4f), listOf(250f, 0.0f), listOf(400f, 0.0f), listOf(415f, 0.4f), listOf(550f, 0.4f), listOf(650f, 0.0f), listOf(800f, 0.0f), listOf(815f, 0.4f), listOf(950f, 0.4f), listOf(1050f, 0.0f)), listOf(listOf(0f, 0.5f), listOf(1050f, 0.5f))),
        discrete = listOf(listOf(0f, 0.45f, 0.5f), listOf(400f, 0.45f, 0.5f), listOf(800f, 0.45f, 0.5f)),
    ),
    "Lilt" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.45f), listOf(72f, 0.0f), listOf(160f, 0.65f), listOf(240f, 0.12f), listOf(360f, 0.0f)), listOf(listOf(0f, 0.5f), listOf(160f, 0.65f), listOf(360f, 0.6f))),
        discrete = listOf(listOf(0f, 0.45f, 0.52f), listOf(160f, 0.65f, 0.65f)),
    ),
    "Lock" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.25f), listOf(100f, 0.15f), listOf(140f, 0.0f), listOf(150f, 0.9f), listOf(175f, 0.2f), listOf(220f, 0.0f)), listOf(listOf(0f, 0.4f), listOf(140f, 0.5f), listOf(150f, 0.75f), listOf(220f, 0.6f))),
        discrete = listOf(listOf(0f, 0.3f, 0.5f), listOf(150f, 0.9f, 0.7f)),
    ),
    "Lope" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(6f, 0.68f), listOf(60f, 0.15f), listOf(80f, 0.43f), listOf(140f, 0.12f), listOf(160f, 0.68f), listOf(220f, 0.15f), listOf(240f, 0.43f), listOf(300f, 0.12f), listOf(320f, 0.73f), listOf(450f, 0.0f)), listOf(listOf(0f, 0.72f), listOf(450f, 0.7f))),
        discrete = listOf(listOf(0f, 0.7f, 0.72f), listOf(80f, 0.45f, 0.65f), listOf(160f, 0.7f, 0.72f), listOf(240f, 0.45f, 0.65f), listOf(320f, 0.75f, 0.75f)),
    ),
    "March" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(15f, 0.6f), listOf(150f, 0.45f), listOf(250f, 0.0f), listOf(300f, 0.0f), listOf(315f, 0.65f), listOf(450f, 0.5f), listOf(550f, 0.0f), listOf(600f, 0.0f), listOf(615f, 0.6f), listOf(750f, 0.4f), listOf(900f, 0.0f)), listOf(listOf(0f, 0.25f), listOf(900f, 0.25f))),
        discrete = listOf(listOf(0f, 0.65f, 0.28f), listOf(300f, 0.7f, 0.28f), listOf(600f, 0.65f, 0.28f)),
    ),
    "Metronome" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.45f), listOf(80f, 0.0f), listOf(200f, 0.0f), listOf(208f, 0.45f), listOf(280f, 0.0f)), listOf(listOf(0f, 0.5f), listOf(280f, 0.5f))),
        discrete = listOf(listOf(0f, 0.5f, 0.5f), listOf(200f, 0.5f, 0.5f)),
    ),
    "Murmur" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 0.6f, 0.303f), listOf(80f, 0.6f, 0.3f)),
    ),
    "Nudge" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.6f), listOf(60f, 0.0f), listOf(120f, 0.4f), listOf(180f, 0.0f)), listOf(listOf(0f, 0.5f), listOf(180f, 0.5f))),
        discrete = listOf(listOf(0f, 0.6f, 0.5f), listOf(120f, 0.4f, 0.5f)),
    ),
    "PassingCar" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(80f, 0.1f), listOf(200f, 0.35f), listOf(350f, 0.75f), listOf(450f, 1.0f), listOf(550f, 0.7f), listOf(700f, 0.3f), listOf(900f, 0.08f), listOf(1100f, 0.0f)), listOf(listOf(0f, 0.35f), listOf(200f, 0.42f), listOf(450f, 0.38f), listOf(700f, 0.3f), listOf(1100f, 0.22f))),
        discrete = listOf(),
    ),
    "Patter" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 0.603f, 0.2f), listOf(82f, 0.606f, 0.197f), listOf(179f, 0.609f, 0.594f)),
    ),
    "Peal" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.75f), listOf(80f, 0.0f), listOf(180f, 0.75f), listOf(258f, 0.0f), listOf(360f, 0.75f), listOf(438f, 0.0f)), listOf(listOf(0f, 0.62f), listOf(438f, 0.62f))),
        discrete = listOf(listOf(0f, 0.75f, 0.62f), listOf(180f, 0.75f, 0.62f), listOf(360f, 0.75f, 0.62f)),
    ),
    "Peck" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(4f, 0.55f), listOf(28f, 0.0f)), listOf(listOf(0f, 0.58f), listOf(28f, 0.56f))),
        discrete = listOf(listOf(0f, 0.55f, 0.58f)),
    ),
    "Pendulum" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.7f), listOf(300f, 0.08f), listOf(600f, 0.5f), listOf(900f, 0.05f), listOf(1200f, 0.3f), listOf(1500f, 0.03f), listOf(1800f, 0.15f), listOf(2100f, 0.01f), listOf(2400f, 0.0f)), listOf(listOf(0f, 0.42f), listOf(2400f, 0.38f))),
        discrete = listOf(listOf(300f, 0.12f, 0.35f), listOf(900f, 0.08f, 0.35f), listOf(1500f, 0.05f, 0.35f), listOf(2100f, 0.02f, 0.35f)),
    ),
    "Ping" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(4f, 0.65f), listOf(35f, 0.0f)), listOf(listOf(0f, 0.72f), listOf(35f, 0.68f))),
        discrete = listOf(listOf(0f, 0.65f, 0.72f)),
    ),
    "Pip" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.32f), listOf(40f, 0.0f), listOf(60f, 0.22f), listOf(100f, 0.0f)), listOf(listOf(0f, 0.65f), listOf(100f, 0.7f))),
        discrete = listOf(listOf(0f, 0.35f, 0.65f), listOf(60f, 0.25f, 0.7f)),
    ),
    "Piston" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 0.397f), listOf(73f, 1.0f, 0.397f)),
    ),
    "Plink" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.55f), listOf(65f, 0.0f), listOf(150f, 0.55f), listOf(215f, 0.0f)), listOf(listOf(0f, 0.52f), listOf(215f, 0.52f))),
        discrete = listOf(listOf(0f, 0.55f, 0.52f), listOf(150f, 0.55f, 0.52f)),
    ),
    "Plummet" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(300f, 0.02f), listOf(600f, 0.06f), listOf(800f, 0.15f), listOf(880f, 0.3f), listOf(895f, 0.5f), listOf(900f, 0.0f), listOf(905f, 1.0f), listOf(960f, 0.4f), listOf(1050f, 0.0f)), listOf(listOf(0f, 0.3f), listOf(895f, 0.4f), listOf(905f, 0.3f), listOf(1050f, 0.25f))),
        discrete = listOf(listOf(900f, 1.0f, 0.4f)),
    ),
    "Plunk" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 0.5f, 0.2f)),
    ),
    "Poke" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.6f), listOf(62f, 0.0f), listOf(100f, 0.6f), listOf(162f, 0.0f), listOf(200f, 0.7f), listOf(280f, 0.0f)), listOf(listOf(0f, 0.6f), listOf(200f, 0.65f), listOf(280f, 0.63f))),
        discrete = listOf(listOf(0f, 0.6f, 0.6f), listOf(100f, 0.6f, 0.6f), listOf(200f, 0.7f, 0.65f)),
    ),
    "Pound" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.95f), listOf(65f, 0.0f), listOf(100f, 0.95f), listOf(165f, 0.0f), listOf(200f, 0.95f), listOf(265f, 0.0f)), listOf(listOf(0f, 0.72f), listOf(265f, 0.72f))),
        discrete = listOf(listOf(0f, 0.95f, 0.7f), listOf(100f, 0.95f, 0.7f), listOf(200f, 0.95f, 0.7f)),
    ),
    "PowerDown" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.8f), listOf(200f, 0.7f), listOf(450f, 0.55f), listOf(750f, 0.4f), listOf(1050f, 0.25f), listOf(1350f, 0.12f), listOf(1600f, 0.03f), listOf(1800f, 0.0f)), listOf(listOf(0f, 0.6f), listOf(1800f, 0.03f))),
        discrete = listOf(listOf(0f, 0.8f, 0.6f)),
    ),
    "Propel" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.55f), listOf(70f, 0.2f), listOf(120f, 0.88f), listOf(200f, 0.2f), listOf(300f, 0.0f)), listOf(listOf(0f, 0.56f), listOf(120f, 0.72f), listOf(300f, 0.65f))),
        discrete = listOf(listOf(0f, 0.6f, 0.58f), listOf(120f, 0.9f, 0.72f)),
    ),
    "Pulse" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(300f, 0.3f), listOf(700f, 0.3f), listOf(1000f, 0.0f), listOf(1300f, 0.3f), listOf(1700f, 0.3f), listOf(2000f, 0.0f)), listOf(listOf(0f, 0.4f), listOf(2000f, 0.4f))),
        discrete = listOf(),
    ),
    "Pummel" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(4f, 0.9f), listOf(45f, 0.6f), listOf(70f, 0.78f), listOf(100f, 0.55f), listOf(130f, 0.92f), listOf(165f, 0.65f), listOf(190f, 0.82f), listOf(230f, 0.7f), listOf(250f, 1.0f), listOf(320f, 0.4f), listOf(450f, 0.0f)), listOf(listOf(0f, 0.85f), listOf(450f, 0.82f))),
        discrete = listOf(listOf(0f, 0.9f, 0.85f), listOf(70f, 0.75f, 0.82f), listOf(130f, 0.95f, 0.87f), listOf(190f, 0.8f, 0.83f), listOf(250f, 1.0f, 0.88f)),
    ),
    "Push" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(6f, 0.48f), listOf(50f, 0.15f), listOf(90f, 0.0f)), listOf(listOf(0f, 0.52f), listOf(90f, 0.5f))),
        discrete = listOf(listOf(0f, 0.5f, 0.52f)),
    ),
    "Radar" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(6f, 0.55f), listOf(50f, 0.2f), listOf(120f, 0.0f), listOf(800f, 0.0f), listOf(806f, 0.55f), listOf(850f, 0.2f), listOf(920f, 0.0f), listOf(1600f, 0.0f), listOf(1606f, 0.55f), listOf(1650f, 0.2f), listOf(1720f, 0.0f), listOf(2400f, 0.0f), listOf(2406f, 0.55f), listOf(2450f, 0.2f), listOf(2520f, 0.0f)), listOf(listOf(0f, 0.55f), listOf(2520f, 0.55f))),
        discrete = listOf(listOf(0f, 0.55f, 0.55f), listOf(800f, 0.55f, 0.55f), listOf(1600f, 0.55f, 0.55f), listOf(2400f, 0.55f, 0.55f)),
    ),
    "Rain" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(50f, 0.08f), listOf(200f, 0.05f), listOf(400f, 0.08f), listOf(600f, 0.05f), listOf(850f, 0.08f), listOf(950f, 0.0f)), listOf(listOf(0f, 0.6f), listOf(950f, 0.6f))),
        discrete = listOf(listOf(0f, 0.2f, 0.6f), listOf(80f, 0.15f, 0.5f), listOf(150f, 0.3f, 0.7f), listOf(210f, 0.1f, 0.5f), listOf(310f, 0.25f, 0.6f), listOf(380f, 0.2f, 0.55f), listOf(460f, 0.35f, 0.65f), listOf(520f, 0.1f, 0.5f), listOf(610f, 0.2f, 0.6f), listOf(700f, 0.15f, 0.55f), listOf(760f, 0.3f, 0.7f), listOf(850f, 0.2f, 0.6f)),
    ),
    "Ramp" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(15f, 0.38f), listOf(80f, 0.0f), listOf(120f, 0.55f), listOf(190f, 0.0f), listOf(240f, 0.72f), listOf(310f, 0.0f), listOf(380f, 1.0f), listOf(520f, 0.2f), listOf(650f, 0.0f)), listOf(listOf(0f, 0.48f), listOf(380f, 0.78f), listOf(650f, 0.75f))),
        discrete = listOf(listOf(0f, 0.4f, 0.5f), listOf(120f, 0.6f, 0.6f), listOf(240f, 0.8f, 0.7f), listOf(380f, 1.0f, 0.8f)),
    ),
    "Rap" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 0.6f, 0.5f), listOf(120f, 0.4f, 0.5f)),
    ),
    "Ratchet" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(10f, 1.0f, 0.9f), listOf(201f, 1.0f, 0.906f), listOf(398f, 0.997f, 0.906f)),
    ),
    "Rebound" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 1.0f), listOf(80f, 1.0f, 0.3f)),
    ),
    "Ripple" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(70f, 0.0f), listOf(145f, 0.5f), listOf(200f, 0.0f), listOf(265f, 0.2f), listOf(310f, 0.0f), listOf(365f, 0.07f), listOf(420f, 0.0f)), listOf(listOf(0f, 0.7f), listOf(140f, 0.5f), listOf(260f, 0.33f), listOf(420f, 0.18f))),
        discrete = listOf(listOf(0f, 0.858f, 0.72f), listOf(140f, 0.52f, 0.48f), listOf(260f, 0.22f, 0.32f), listOf(360f, 0.08f, 0.2f)),
    ),
    "Rivet" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 1.0f), listOf(75f, 1.0f, 1.0f), listOf(150f, 1.0f, 1.0f)),
    ),
    "Rustle" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.65f), listOf(75f, 0.05f), listOf(200f, 0.3f), listOf(290f, 0.0f)), listOf(listOf(0f, 0.6f), listOf(200f, 0.48f), listOf(290f, 0.45f))),
        discrete = listOf(),
    ),
    "Shockwave" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 1.0f), listOf(50f, 0.7f), listOf(120f, 0.45f), listOf(200f, 0.3f), listOf(320f, 0.15f), listOf(450f, 0.08f), listOf(600f, 0.03f), listOf(800f, 0.0f)), listOf(listOf(0f, 0.4f), listOf(5f, 0.3f), listOf(800f, 0.2f))),
        discrete = listOf(listOf(0f, 1.0f, 0.35f), listOf(200f, 0.4f, 0.3f), listOf(450f, 0.15f, 0.25f)),
    ),
    "Snap" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(4f, 0.7f), listOf(30f, 0.15f), listOf(40f, 0.3f), listOf(90f, 0.0f)), listOf(listOf(0f, 0.55f), listOf(40f, 0.47f), listOf(90f, 0.45f))),
        discrete = listOf(listOf(0f, 0.7f, 0.55f), listOf(40f, 0.3f, 0.48f)),
    ),
    "Sonar" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.35f), listOf(130f, 0.04f), listOf(500f, 0.0f), listOf(600f, 0.35f), listOf(730f, 0.04f), listOf(1100f, 0.0f), listOf(1200f, 0.35f), listOf(1330f, 0.04f), listOf(1550f, 0.0f), listOf(1620f, 0.0f), listOf(1663f, 0.855f), listOf(1700f, 0.0f), listOf(1800f, 0.65f), listOf(1855f, 0.0f), listOf(1920f, 0.4f), listOf(2000f, 0.0f)), listOf(listOf(0f, 0.72f), listOf(1550f, 0.72f), listOf(1655f, 0.8f), listOf(2000f, 0.7f))),
        discrete = listOf(listOf(0f, 0.35f, 0.7f), listOf(600f, 0.35f, 0.7f), listOf(1200f, 0.35f, 0.7f), listOf(1800f, 0.65f, 0.65f), listOf(1920f, 0.4f, 0.6f)),
    ),
    "Spark" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(4f, 0.22f), listOf(28f, 0.0f), listOf(69f, 0.52f), listOf(95f, 0.0f), listOf(142f, 1.0f), listOf(185f, 0.0f)), listOf(listOf(0f, 0.5f), listOf(65f, 0.75f), listOf(138f, 1.0f), listOf(185f, 1.0f))),
        discrete = listOf(listOf(0f, 0.22f, 0.55f), listOf(65f, 0.52f, 0.78f), listOf(138f, 1.0f, 1.0f)),
    ),
    "Spin" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.38f), listOf(60f, 0.0f), listOf(250f, 0.38f), listOf(308f, 0.0f), listOf(500f, 0.38f), listOf(558f, 0.0f), listOf(750f, 0.38f), listOf(808f, 0.0f), listOf(1000f, 0.38f), listOf(1058f, 0.0f), listOf(1250f, 0.38f), listOf(1308f, 0.0f), listOf(1500f, 0.38f), listOf(1558f, 0.0f), listOf(1750f, 0.38f), listOf(1808f, 0.0f)), listOf(listOf(0f, 0.55f), listOf(1808f, 0.55f))),
        discrete = listOf(listOf(0f, 0.4f, 0.55f), listOf(250f, 0.4f, 0.55f), listOf(500f, 0.4f, 0.55f), listOf(750f, 0.4f, 0.55f), listOf(1000f, 0.4f, 0.55f), listOf(1250f, 0.4f, 0.55f), listOf(1500f, 0.4f, 0.55f), listOf(1750f, 0.4f, 0.55f)),
    ),
    "Stagger" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.68f), listOf(45f, 0.15f), listOf(60f, 0.38f), listOf(100f, 0.15f), listOf(120f, 0.52f), listOf(162f, 0.12f), listOf(180f, 0.33f), listOf(320f, 0.0f)), listOf(listOf(0f, 0.55f), listOf(60f, 0.65f), listOf(120f, 0.5f), listOf(180f, 0.6f), listOf(320f, 0.55f))),
        discrete = listOf(listOf(0f, 0.7f, 0.55f), listOf(60f, 0.4f, 0.65f), listOf(120f, 0.55f, 0.5f), listOf(180f, 0.35f, 0.6f)),
    ),
    "Stamp" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.55f), listOf(55f, 0.0f), listOf(150f, 0.55f), listOf(205f, 0.0f)), listOf(listOf(0f, 0.5f), listOf(205f, 0.5f))),
        discrete = listOf(listOf(0f, 0.55f, 0.5f), listOf(150f, 0.55f, 0.5f)),
    ),
    "Stampede" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(10f, 1.0f, 0.306f), listOf(155f, 1.0f, 0.163f), listOf(601f, 0.997f, 0.303f), listOf(750f, 1.0f, 0.153f)),
    ),
    "Stomp" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 0.3f), listOf(75f, 1.0f, 0.3f), listOf(150f, 1.0f, 0.3f)),
    ),
    "StoneSkip" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.706f, 0.706f), listOf(77f, 0.697f, 0.5f), listOf(181f, 0.703f, 0.244f)),
    ),
    "Strike" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.72f), listOf(40f, 0.2f), listOf(80f, 0.0f)), listOf(listOf(0f, 0.62f), listOf(80f, 0.6f))),
        discrete = listOf(listOf(0f, 0.75f, 0.62f)),
    ),
    "Summon" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.8f), listOf(180f, 0.0f), listOf(300f, 0.7f), listOf(370f, 0.0f), listOf(430f, 0.7f), listOf(500f, 0.0f)), listOf(listOf(0f, 0.52f), listOf(180f, 0.52f), listOf(300f, 0.62f), listOf(500f, 0.62f))),
        discrete = listOf(listOf(0f, 0.8f, 0.55f), listOf(300f, 0.7f, 0.6f), listOf(430f, 0.7f, 0.6f)),
    ),
    "Surge" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.45f), listOf(60f, 0.1f), listOf(75f, 0.58f), listOf(130f, 0.12f), listOf(145f, 0.7f), listOf(195f, 0.15f), listOf(210f, 0.8f), listOf(330f, 0.0f)), listOf(listOf(0f, 0.82f), listOf(210f, 0.93f), listOf(330f, 0.9f))),
        discrete = listOf(listOf(0f, 0.5f, 0.82f), listOf(75f, 0.62f, 0.86f), listOf(145f, 0.74f, 0.9f), listOf(210f, 0.8f, 0.92f)),
    ),
    "Sway" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(20f, 0.45f), listOf(250f, 0.35f), listOf(500f, 0.0f), listOf(700f, 0.0f), listOf(720f, 0.45f), listOf(950f, 0.35f), listOf(1200f, 0.0f), listOf(1400f, 0.0f), listOf(1420f, 0.45f), listOf(1650f, 0.35f), listOf(1900f, 0.0f)), listOf(listOf(0f, 0.22f), listOf(1900f, 0.22f))),
        discrete = listOf(listOf(0f, 0.5f, 0.25f), listOf(700f, 0.5f, 0.25f), listOf(1400f, 0.5f, 0.25f)),
    ),
    "Sweep" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.4f), listOf(120f, 0.05f), listOf(400f, 0.02f), listOf(590f, 0.0f), listOf(600f, 0.4f), listOf(720f, 0.05f), listOf(1000f, 0.02f), listOf(1190f, 0.0f), listOf(1200f, 0.4f), listOf(1320f, 0.05f), listOf(1600f, 0.02f), listOf(1790f, 0.0f), listOf(1800f, 0.4f), listOf(1920f, 0.05f), listOf(2100f, 0.0f)), listOf(listOf(0f, 0.72f), listOf(2100f, 0.72f))),
        discrete = listOf(listOf(0f, 0.4f, 0.7f), listOf(600f, 0.4f, 0.7f), listOf(1200f, 0.4f, 0.7f), listOf(1800f, 0.4f, 0.7f)),
    ),
    "Swell" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.45f), listOf(75f, 0.0f), listOf(350f, 0.65f), listOf(425f, 0.0f)), listOf(listOf(0f, 0.45f), listOf(350f, 0.52f), listOf(425f, 0.52f))),
        discrete = listOf(listOf(0f, 0.45f, 0.48f), listOf(350f, 0.65f, 0.52f)),
    ),
    "Syncopate" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(10f, 1.0f, 0.903f), listOf(201f, 1.0f, 0.513f), listOf(399f, 0.997f, 0.906f)),
    ),
    "Throb" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.8f), listOf(80f, 0.0f), listOf(150f, 0.45f), listOf(230f, 0.0f)), listOf(listOf(0f, 0.65f), listOf(230f, 0.6f))),
        discrete = listOf(listOf(0f, 0.8f, 0.65f), listOf(150f, 0.45f, 0.6f)),
    ),
    "Thud" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(15f, 0.45f), listOf(80f, 0.35f), listOf(160f, 0.0f)), listOf(listOf(0f, 0.42f), listOf(160f, 0.4f))),
        discrete = listOf(listOf(0f, 0.5f, 0.42f)),
    ),
    "Thump" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 0.45f)),
    ),
    "Thunder" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(100f, 0.05f), listOf(300f, 0.1f), listOf(500f, 0.2f), listOf(590f, 0.3f), listOf(600f, 1.0f), listOf(680f, 0.7f), listOf(800f, 0.5f), listOf(1000f, 0.3f), listOf(1300f, 0.15f), listOf(1700f, 0.05f), listOf(2000f, 0.0f)), listOf(listOf(0f, 0.1f), listOf(600f, 0.08f), listOf(2000f, 0.05f))),
        discrete = listOf(listOf(600f, 1.0f, 0.15f), listOf(700f, 0.8f, 0.12f), listOf(900f, 0.5f, 0.1f), listOf(1200f, 0.3f, 0.08f)),
    ),
    "ThunderRoll" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.994f, 0.053f), listOf(51f, 0.994f, 0.122f), listOf(100f, 0.991f, 0.228f), listOf(156f, 1.0f, 0.394f), listOf(208f, 0.991f, 0.613f), listOf(260f, 1.0f, 0.803f), listOf(309f, 1.0f, 1.0f), listOf(368f, 1.0f, 1.0f), listOf(420f, 0.8f, 0.8f), listOf(482f, 0.606f, 0.606f), listOf(544f, 0.394f, 0.394f), listOf(605f, 0.194f, 0.194f), listOf(670f, 0.091f, 0.091f)),
    ),
    "TickTock" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.8f, 0.8f), listOf(400f, 0.4f, 0.4f), listOf(800f, 0.8f, 0.8f), listOf(1200f, 0.4f, 0.4f)),
    ),
    "TidalSurge" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.594f, 0.594f), listOf(73f, 0.588f, 0.588f), listOf(151f, 0.588f, 0.588f), listOf(299f, 1.0f, 0.3f), listOf(380f, 1.0f, 0.303f), listOf(455f, 1.0f, 0.3f)),
    ),
    "TideSwell" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.775f, 0.053f), listOf(51f, 0.722f, 0.122f), listOf(100f, 0.7f, 0.228f), listOf(156f, 0.653f, 0.394f), listOf(208f, 0.638f, 0.613f), listOf(260f, 0.622f, 0.803f), listOf(309f, 0.606f, 1.0f), listOf(368f, 0.6f, 1.0f), listOf(420f, 0.606f, 0.8f), listOf(482f, 0.609f, 0.606f), listOf(549f, 0.647f, 0.394f), listOf(605f, 0.684f, 0.181f), listOf(670f, 0.728f, 0.075f), listOf(727f, 0.775f, 0.034f)),
    ),
    "Tremor" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(0f, 1.0f, 0.0f)),
    ),
    "Trigger" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(4f, 1.0f), listOf(55f, 0.35f), listOf(80f, 0.5f), listOf(140f, 0.2f), listOf(200f, 0.25f), listOf(280f, 0.0f)), listOf(listOf(0f, 0.72f), listOf(80f, 0.55f), listOf(280f, 0.42f))),
        discrete = listOf(listOf(0f, 0.872f, 0.7f), listOf(80f, 0.5f, 0.55f), listOf(200f, 0.25f, 0.45f)),
    ),
    "Triumph" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.4f), listOf(70f, 0.0f), listOf(120f, 0.55f), listOf(180f, 0.0f), listOf(260f, 0.7f), listOf(320f, 0.0f), listOf(420f, 0.85f), listOf(480f, 0.0f), listOf(600f, 1.0f), listOf(660f, 0.0f), listOf(750f, 1.0f), listOf(810f, 0.0f), listOf(900f, 1.0f), listOf(980f, 0.4f), listOf(1100f, 0.0f)), listOf(listOf(0f, 0.5f), listOf(600f, 0.75f), listOf(1100f, 0.85f))),
        discrete = listOf(listOf(0f, 0.4f, 0.55f), listOf(120f, 0.55f, 0.6f), listOf(260f, 0.7f, 0.65f), listOf(420f, 0.85f, 0.7f), listOf(600f, 1.0f, 0.8f), listOf(750f, 1.0f, 0.8f), listOf(900f, 1.0f, 0.8f)),
    ),
    "Trumpet" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(10f, 0.3f), listOf(40f, 0.0f), listOf(80f, 0.4f), listOf(110f, 0.0f), listOf(150f, 0.5f), listOf(175f, 0.0f), listOf(210f, 0.6f), listOf(232f, 0.0f), listOf(260f, 0.7f), listOf(278f, 0.0f), listOf(310f, 1.0f), listOf(380f, 0.6f), listOf(460f, 0.0f)), listOf(listOf(0f, 0.4f), listOf(310f, 0.7f), listOf(460f, 0.9f))),
        discrete = listOf(listOf(0f, 0.3f, 0.5f), listOf(80f, 0.4f, 0.55f), listOf(150f, 0.5f, 0.6f), listOf(210f, 0.6f, 0.65f), listOf(260f, 0.7f, 0.7f), listOf(310f, 1.0f, 0.85f)),
    ),
    "Typewriter" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(6f, 0.85f), listOf(40f, 0.3f), listOf(55f, 0.38f), listOf(90f, 0.12f), listOf(110f, 0.15f), listOf(160f, 0.04f), listOf(200f, 0.0f)), listOf(listOf(0f, 0.42f), listOf(55f, 0.38f), listOf(200f, 0.34f))),
        discrete = listOf(listOf(0f, 0.88f, 0.42f), listOf(55f, 0.35f, 0.38f), listOf(110f, 0.12f, 0.35f)),
    ),
    "Unfurl" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.5f), listOf(68f, 0.0f), listOf(93f, 0.62f), listOf(158f, 0.0f), listOf(183f, 0.74f), listOf(248f, 0.0f), listOf(273f, 0.86f), listOf(338f, 0.0f), listOf(363f, 1.0f), listOf(850f, 0.6f), listOf(1050f, 0.2f), listOf(1180f, 0.0f)), listOf(listOf(0f, 0.28f), listOf(90f, 0.4f), listOf(180f, 0.49f), listOf(270f, 0.62f), listOf(360f, 0.7f), listOf(1180f, 0.7f))),
        discrete = listOf(listOf(0f, 0.5f, 0.28f), listOf(90f, 0.62f, 0.4f), listOf(180f, 0.74f, 0.49f), listOf(270f, 0.86f, 0.62f), listOf(360f, 1.0f, 0.7f)),
    ),
    "Vortex" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.05f), listOf(200f, 0.08f), listOf(400f, 0.13f), listOf(600f, 0.22f), listOf(800f, 0.35f), listOf(950f, 0.52f), listOf(1050f, 0.72f), listOf(1150f, 0.9f), listOf(1195f, 0.0f), listOf(1200f, 1.0f), listOf(1250f, 0.3f), listOf(1400f, 0.0f)), listOf(listOf(0f, 0.25f), listOf(600f, 0.4f), listOf(1000f, 0.62f), listOf(1150f, 0.82f), listOf(1200f, 0.9f), listOf(1400f, 0.5f))),
        discrete = listOf(listOf(1200f, 1.0f, 0.8f)),
    ),
    "Wane" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(20f, 0.42f), listOf(180f, 0.22f), listOf(450f, 0.0f)), listOf(listOf(0f, 0.5f), listOf(180f, 0.4f), listOf(450f, 0.35f))),
        discrete = listOf(),
    ),
    "WarDrum" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(10f, 1.0f, 0.106f), listOf(201f, 1.0f, 0.109f), listOf(398f, 0.997f, 0.103f)),
    ),
    "Waterfall" to IOSPresetPattern(
        continuous = listOf(listOf(), listOf()),
        discrete = listOf(listOf(1f, 0.994f, 0.994f), listOf(51f, 0.994f, 0.806f), listOf(100f, 0.991f, 0.597f), listOf(156f, 1.0f, 0.394f), listOf(208f, 0.991f, 0.203f), listOf(260f, 1.0f, 0.094f), listOf(309f, 1.0f, 0.072f)),
    ),
    "Wave" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(400f, 0.38f), listOf(800f, 0.05f), listOf(1200f, 0.4f), listOf(1600f, 0.05f), listOf(2000f, 0.38f), listOf(2400f, 0.05f), listOf(2800f, 0.0f)), listOf(listOf(0f, 0.35f), listOf(2800f, 0.35f))),
        discrete = listOf(),
    ),
    "Wisp" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(8f, 0.22f), listOf(60f, 0.0f)), listOf(listOf(0f, 0.48f), listOf(60f, 0.48f))),
        discrete = listOf(listOf(0f, 0.25f, 0.48f)),
    ),
    "Wobble" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.65f), listOf(80f, 0.5f), listOf(180f, 0.0f)), listOf(listOf(0f, 0.82f), listOf(180f, 0.75f))),
        discrete = listOf(),
    ),
    "Woodpecker" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(5f, 0.65f), listOf(430f, 0.65f), listOf(460f, 0.0f)), listOf(listOf(0f, 0.82f), listOf(460f, 0.82f))),
        discrete = listOf(listOf(0f, 0.75f, 0.82f), listOf(45f, 0.75f, 0.82f), listOf(90f, 0.75f, 0.82f), listOf(135f, 0.75f, 0.82f), listOf(180f, 0.75f, 0.82f), listOf(225f, 0.75f, 0.82f), listOf(270f, 0.75f, 0.82f), listOf(315f, 0.75f, 0.82f), listOf(360f, 0.75f, 0.82f), listOf(405f, 0.75f, 0.82f)),
    ),
    "Zipper" to IOSPresetPattern(
        continuous = listOf(listOf(listOf(0f, 0.0f), listOf(6f, 0.234f), listOf(432f, 0.231f), listOf(460f, 0.0f)), listOf(listOf(0f, 0.616f), listOf(358f, 0.594f), listOf(460f, 0.35f))),
        discrete = listOf(listOf(0f, 0.35f, 0.8f), listOf(40f, 0.35f, 0.8f), listOf(80f, 0.35f, 0.8f), listOf(120f, 0.35f, 0.8f), listOf(160f, 0.35f, 0.8f), listOf(200f, 0.35f, 0.8f), listOf(240f, 0.35f, 0.8f), listOf(280f, 0.35f, 0.8f), listOf(320f, 0.35f, 0.8f), listOf(360f, 0.35f, 0.8f), listOf(400f, 0.35f, 0.8f), listOf(430f, 0.6f, 0.75f)),
    ),
)
