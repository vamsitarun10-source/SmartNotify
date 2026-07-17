# ClassReminder ProGuard Rules

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}
-dontwarn com.facebook.react.**

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# React Navigation
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbidomodule.** { *; }

# Notifee
-keep class app.notifee.** { *; }
-dontwarn app.notifee.**

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Keep JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# General
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
