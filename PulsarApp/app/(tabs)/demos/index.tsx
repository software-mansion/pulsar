import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { Ionicons } from "@expo/vector-icons";

import BasicLayout from "@/components/BasicLayout";
import { ThemedText } from "@/components/themed-text";
import { Margins } from "@/constants/theme";

const defaultEdges = {
  top: "additive",
  left: "additive",
  bottom: "off",
  right: "additive",
};

const demos = [
  {
    slug: "slider-demo",
    title: "Slider",
  },
  {
    slug: "buttons-demo",
    title: "Buttons",
  },
  {
    slug: "countdown-timer-demo",
    title: "Countdown timer",
  },
  {
    slug: "balloon-demo",
    title: "Balloon",
  },
  {
    slug: "dot-loader-demo",
    title: "Dot Loader",
  },
  {
    slug: "notification-haptics-demo",
    title: "Notification",
  },
  {
    slug: "sensor-haptics-demo",
    title: "Accelerometer",
  },
];

export default function DemosScreen() {
  const posthog = usePostHog();

  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BasicLayout>
          <ThemedText type="title" style={Margins.marginTop4X}>
            Haptics demos
          </ThemedText>
          <ThemedText style={Margins.marginTop2X}>
            Feel them with real use cases.
          </ThemedText>

          <View style={styles.list}>
            {demos.map((demo) => (
              <Link
                key={demo.slug}
                href={`/demos/${demo.slug}` as any}
                onPress={() => {
                  posthog.capture("demo_opened", {
                    demo_slug: demo.slug,
                    demo_title: demo.title,
                  });
                }}
              >
                <Link.Trigger>
                  <View style={styles.card}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>
                      {demo.title}
                    </ThemedText>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#38ACDD"
                      style={styles.cardArrow}
                    />
                  </View>
                </Link.Trigger>
              </Link>
            ))}
          </View>
        </BasicLayout>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  list: {
    marginTop: 20,
    gap: 12,
  },
  card: {
    backgroundColor: "white",
    boxShadow: "-3px 3px 0px #38ACDD",
    borderRadius: 4,
    borderColor: "#38ACDD",
    borderWidth: 2,
    padding: 15,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 28,
    flex: 1,
  },
  cardArrow: {
    marginLeft: 8,
  },
});
