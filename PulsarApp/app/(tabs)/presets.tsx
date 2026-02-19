import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

const infoIcon = require('@/assets/images/info.svg');
const slidersIcon = require('@/assets/images/sliders.svg');

export default function PresetsScreen() {
  
  return (
    <SafeAreaView>
      <BasicLayout>
        <ScrollView>

          <ThemedText type="title" style={Margins.marginTop4X}>
            Get to know Pulsar presets
          </ThemedText>
          <ThemedText style={Margins.marginTop2X}>
            Don't spend time creating your own patterns. Just use ours and enjoy the benefits of having haptics in your app by using presets.
          </ThemedText>

          <Link href="/tagsModal" style={Margins.marginTop4X}>
            <Link.Trigger>
              <View style={styles.learnMoreContainer}>
                <Text style={styles.learnMore}>Learn more about tags</Text>
                <Image source={infoIcon} style={styles.infoIcon} />
              </View>
            </Link.Trigger>
          </Link>

          <View style={[styles.presetsTitleContainer, Margins.marginTop4X]}>
            <ThemedText type="subtitle">
              Presets
            </ThemedText>
            <Link href="/tagsModal">
              <Link.Trigger>
                <Image source={slidersIcon} style={styles.settingsIcon} />
              </Link.Trigger>
            </Link>
          </View>

        </ScrollView>
      </BasicLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  learnMore: {
    color: '#001A72',
    fontSize: 16,
  },
  infoIcon: {
    width: 22,
    height: 22,
    marginLeft: 8,
  },
  learnMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsIcon: {
    width: 25,
    height: 25,
    marginTop: 20,
  },
});
