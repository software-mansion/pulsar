import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useFilteredPresets } from '@/components/PresetList';
import Preset from '@/components/Preset';
import Card from '@/components/Card';
import SelectedTags from '@/components/SelectedTags';
import { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';

const infoIcon = require('@/assets/images/info.svg');
const slidersIcon = require('@/assets/images/sliders.svg');

const defaultEdges = {
  top: 'additive',
  left: 'additive',
  bottom: 'off',
  right: 'additive',
};

export default function PresetsScreen() {
  const { filteredPresets, selectedTags } = useFilteredPresets();
  const { compactLayout } = useFilters();

  const listHeader = useMemo(() => (
    <>
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
        <Link href="/filtersModal">
          <Link.Trigger>
            <Image source={slidersIcon} style={styles.settingsIcon} />
          </Link.Trigger>
        </Link>
      </View>

      <SelectedTags />
    </>
  ), []);

  const listEmpty = useMemo(() => selectedTags.length > 0 ? (
    <Card>
      <ThemedText type='subtitle'>No presets for selected tags 😕</ThemedText>
      <ThemedText>Try adjusting your filters to see more presets.</ThemedText>
    </Card>
  ) : null, [selectedTags.length]);

  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <FlatList
        data={filteredPresets}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        renderItem={({ item }) => (
          <Preset
            title={item.name}
            subtitle={item.description}
            tags={item.tags}
            image={item.image}
            onPress={item.play}
            duration={item.duration}
            compact={compactLayout}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: compactLayout ? 12 : 30 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 50,
  },
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
    marginBottom: 15,
  },
  settingsIcon: {
    width: 25,
    height: 25,
    marginTop: 20,
  },
});
