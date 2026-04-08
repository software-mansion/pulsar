import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useFilteredPresets } from '@/components/PresetList';
import Preset from '@/components/Preset';
import Card from '@/components/Card';
import SelectedTags from '@/components/SelectedTags';
import { useDeferredValue, useMemo, useState } from 'react';
import { useFilters } from '@/contexts/FilterContext';

const infoIcon = require('@/assets/images/info.svg');
const slidersIcon = require('@/assets/images/sliders.svg');
const xIcon = require('@/assets/images/x.svg');

const defaultEdges = {
  top: 'additive',
  left: 'additive',
  bottom: 'off',
  right: 'additive',
};

export default function PresetsScreen() {
  const { filteredPresets, selectedTags, showFavouritesOnly } = useFilteredPresets();
  const { compactLayout } = useFilters();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  const displayedPresets = useMemo(() => {
    if (!deferredQuery.trim()) return filteredPresets;
    const q = deferredQuery.toLowerCase();
    return filteredPresets.filter(preset =>
      preset.name.toLowerCase().includes(q) ||
      preset.description.toLowerCase().includes(q) ||
      preset.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [filteredPresets, deferredQuery]);

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

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search presets..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.searchClear} onPress={() => setSearchQuery('')}>
            <Image source={xIcon} style={styles.searchClearIcon} />
          </TouchableOpacity>
        )}
      </View>

      <SelectedTags />
    </>
  ), [searchQuery]);

  const listEmpty = useMemo(() => {
    if (deferredQuery.trim()) {
      return (
        <Card>
          <ThemedText type='subtitle'>No presets found 😕</ThemedText>
          <ThemedText>Try a different search term or clear the search.</ThemedText>
        </Card>
      );
    }
    if (showFavouritesOnly) {
      return (
        <Card>
          <ThemedText type='subtitle'>No favorite presets 😕</ThemedText>
          <ThemedText>Tap the heart icon on a preset to add it to your favorites.</ThemedText>
        </Card>
      );
    }
    if (selectedTags.length > 0) {
      return (
        <Card>
          <ThemedText type='subtitle'>No presets for selected tags 😕</ThemedText>
          <ThemedText>Try adjusting your filters to see more presets.</ThemedText>
        </Card>
      );
    }
    return null;
  }, [selectedTags.length, deferredQuery, showFavouritesOnly]);

  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <FlatList
        data={displayedPresets}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: '#5BB9E0',
    borderWidth: 2,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#001A72',
    fontSize: 16,
  },
  searchClear: {
    padding: 10,
  },
  searchClearIcon: {
    width: 16,
    height: 16,
  },
});
