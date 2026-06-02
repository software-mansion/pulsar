package com.swmansion.pulsar;

// Shim. Only compiled when USE_LOCAL_PULSAR_ANDROID=1, where the
// borrowed Android/Pulsar sources reference com.swmansion.pulsar.BuildConfig
// but this module's namespace (com.swmansion.pulsar.reactnative) means
// AGP would otherwise generate the real BuildConfig at the wrong package.
// In published mode this file is excluded — the real BuildConfig comes
// from the com.swmansion:pulsar Maven artifact.
public final class BuildConfig {
  public static final boolean DEBUG = false;
}
