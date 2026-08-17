package com.swmansion.pulsar;

// Shim. Only compiled when USE_LOCAL_PULSAR_ANDROID=1, where the borrowed
// Android/Pulsar sources reference com.swmansion.pulsar.BuildConfig but this
// module's namespace (com.swmansion.pulsar.flutter) means AGP generates the
// real BuildConfig at a different package. Forwarding keeps DEBUG tracking
// the actual build type. In published mode this file is excluded — the real
// BuildConfig comes from the com.swmansion:pulsar Maven artifact.
public final class BuildConfig {
  public static final boolean DEBUG = com.swmansion.pulsar.flutter.BuildConfig.DEBUG;

  private BuildConfig() {}
}
