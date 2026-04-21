import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Settings, HapticSupport } from 'react-native-pulsar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useFilteredPresets } from '@/components/PresetList';
import Preset from '@/components/Preset';
import Card from '@/components/Card';
import SelectedTags from '@/components/SelectedTags';
import Button from '@/components/Button';
import { useDeferredValue, useMemo, useRef, useState } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import Animated, { runOnJS, useAnimatedScrollHandler } from 'react-native-reanimated';

const infoIcon = require('@/assets/images/info.svg');
const slidersIcon = require('@/assets/images/sliders.svg');
const xIcon = require('@/assets/images/x.svg');
type PresetListItem = ReturnType<typeof useFilteredPresets>['filteredPresets'][number];

const defaultEdges = {
  top: 'additive',
  left: 'additive',
  bottom: 'off',
  right: 'additive',
};

function getHapticsSupportName(level: HapticSupport): string {
  switch (level) {
    case HapticSupport.ADVANCED_SUPPORT: return 'Advanced';
    case HapticSupport.STANDARD_SUPPORT: return 'Standard';
    case HapticSupport.LIMITED_SUPPORT: return 'Limited';
    case HapticSupport.MINIMAL_SUPPORT: return 'Minimal';
    default: return 'None';
  }
}

export default function PresetsScreen() {
  const { filteredPresets, selectedTags, showFavouritesOnly } = useFilteredPresets();
  const { compactLayout } = useFilters();
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const deferredQuery = useDeferredValue(searchQuery);
  const listRef = useRef<FlatList<PresetListItem>>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const hapticsSupportName = getHapticsSupportName(Settings.getHapticsSupportLevel());
  const scrollHandler = useAnimatedScrollHandler<{ isVisible: boolean }>({
    onScroll: (event, context) => {
      const shouldShow = event.contentOffset.y > 500;
      if (context.isVisible !== shouldShow) {
        context.isVisible = shouldShow;
        runOnJS(setShowScrollToTop)(shouldShow);
      }
    },
  });

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
        Do not spend time creating your own patterns. Just use ours and enjoy the benefits of having haptics in your app by using presets.
      </ThemedText>

      <ThemedText style={[Margins.marginTop2X, styles.hapticsSupportInfo]}>
        Haptic support level: {hapticsSupportName}
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
  ), [hapticsSupportName, searchQuery]);

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

  const handleScrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.FlatList<PresetListItem>
          ref={listRef}
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
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        />
        {showScrollToTop && (
          <Button
            onClick={handleScrollToTop}
            showIcon="arrow"
            largeIcon
            disableHaptics
            style={styles.scrollToTopButton}
            iconStyle={styles.scrollToTopIcon}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
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
  hapticsSupportInfo: {
    fontSize: 13,
    color: '#2B85AB',
  },
  scrollToTopButton: {
    position: 'absolute',
    width: 52,
    height: 52,
    paddingHorizontal: 0,
    paddingVertical: 0,
    bottom: 20,
    right: 20,
  },
  scrollToTopIcon: {
    width: 18,
    height: 18,
    marginLeft: 0,
    transform: [{ rotate: '-90deg' }],
  },
});
