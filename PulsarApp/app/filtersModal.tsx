import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Switch, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import Button from '@/components/Button';
import { Colors } from '@/constants/theme';
import { Image } from 'expo-image';
import { TagsInfo } from '@/constants/Tags';
import { useFilters } from '@/contexts/FilterContext';
import { usePostHog } from 'posthog-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings } from 'react-native-pulsar';

const closeIcon = require('@/assets/images/x.svg');
const checkIcon = require('@/assets/images/check.svg');

type FilterState = {
  [key: string]: boolean;
};

type FiltersCollection = {
  [groupName: string]: FilterState;
};

const defaultEdges = {
  top: 'additive',
  left: 'additive',
  bottom: 'off',
  right: 'additive',
};

export default function FiltersModal() {
  const posthog = usePostHog();
  const { selectedTags, setSelectedTags, soundEnabled, setSoundEnabled, showSystemPresets, setShowSystemPresets, selectedSystemPresetTags, setSelectedSystemPresetTags, compactLayout, setCompactLayout, showFavouritesOnly, setShowFavouritesOnly } = useFilters();

  const SYSTEM_PRESET_TAG_OPTIONS = ['Effect', 'Primitive', 'Vendor', 'iOS Fallback'];

  const toggleSystemPresetTag = (tag: string) => {
    setSelectedSystemPresetTags(
      selectedSystemPresetTags.includes(tag)
        ? selectedSystemPresetTags.filter(t => t !== tag)
        : [...selectedSystemPresetTags, tag]
    );
  };

  const createInitialStates = (): FiltersCollection => {
    const states: FiltersCollection = {};
    
    TagsInfo.forEach(group => {
      const state: FilterState = {};
      group.tags.forEach(tag => {
        state[tag.name] = selectedTags.includes(tag.name);
      });
      states[group.groupName] = state;
    });
    
    return states;
  };

  const [filters, setFilters] = useState<FiltersCollection>(createInitialStates);

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    Settings.enableSound(value);
  };

  const toggleFilter = (groupName: string, tagName: string) => {
    setFilters(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        [tagName]: !prev[groupName][tagName],
      },
    }));
  };

  const clearAll = () => {
    const clearedStates: FiltersCollection = {};

    TagsInfo.forEach(group => {
      const state: FilterState = {};
      group.tags.forEach(tag => {
        state[tag.name] = false;
      });
      clearedStates[group.groupName] = state;
    });

    setFilters(clearedStates);
    posthog.capture('preset_filters_cleared', {
      previously_selected_tags: selectedTags,
      previously_selected_count: selectedTags.length,
    });
  };

  const handleShowResults = () => {
    const selected: string[] = [];
    Object.keys(filters).forEach(groupName => {
      Object.keys(filters[groupName]).forEach(tagName => {
        if (filters[groupName][tagName]) {
          selected.push(tagName);
        }
      });
    });

    posthog.capture('preset_filters_applied', {
      selected_tags: selected,
      selected_count: selected.length,
    });
    setSelectedTags(selected);
    router.back();
  };

  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Image source={closeIcon} style={styles.closeIcon} />
          </Pressable>
          <ThemedText style={styles.title}>Filters</ThemedText>
          <Pressable onPress={clearAll}>
            <Text style={styles.clearAll}>Clear all</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
          <View style={styles.soundToggleSection}>
            <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
            <View style={styles.soundToggleRow}>
              <Text style={styles.checkboxLabel}>Sound</Text>
              <Switch
                value={soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: '#D8EEF7', true: '#87CCE8' }}
                thumbColor={soundEnabled ? '#2B85AB' : '#f0f0f0'}
              />
            </View>
            <View style={[styles.soundToggleRow, styles.marginTop]}>
              <Text style={styles.checkboxLabel}>Compact layout</Text>
              <Switch
                value={compactLayout}
                onValueChange={setCompactLayout}
                trackColor={{ false: '#D8EEF7', true: '#87CCE8' }}
                thumbColor={compactLayout ? '#2B85AB' : '#f0f0f0'}
              />
            </View>
            <View style={[styles.soundToggleRow, styles.marginTop]}>
              <Text style={styles.checkboxLabel}>Show favorites only</Text>
              <Switch
                value={showFavouritesOnly}
                onValueChange={setShowFavouritesOnly}
                trackColor={{ false: '#D8EEF7', true: '#87CCE8' }}
                thumbColor={showFavouritesOnly ? '#2B85AB' : '#f0f0f0'}
              />
            </View>
          </View>

          <View style={styles.soundToggleSection}>
            <ThemedText style={styles.sectionTitle}>System Presets</ThemedText>
            <View style={[styles.soundToggleRow, styles.marginTop]}>
              <Text style={styles.checkboxLabel}>Enable system presets</Text>
              <Switch
                value={showSystemPresets}
                onValueChange={setShowSystemPresets}
                trackColor={{ false: '#D8EEF7', true: '#87CCE8' }}
                thumbColor={showSystemPresets ? '#2B85AB' : '#f0f0f0'}
              />
            </View>
            {showSystemPresets && Platform.OS === 'android' && (
              <View style={styles.systemPresetTagsSection}>
                <View style={styles.optionsGrid}>
                  {SYSTEM_PRESET_TAG_OPTIONS.map(tag => (
                    <CheckboxItem
                      key={tag}
                      label={tag}
                      checked={selectedSystemPresetTags.includes(tag)}
                      onToggle={() => toggleSystemPresetTag(tag)}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          {TagsInfo.map(group => (
            <FilterSection
              key={group.groupName}
              title={group.groupName}
              filters={filters[group.groupName]}
              onToggle={(tagName) => toggleFilter(group.groupName, tagName)}
              options={group.tags.map(tag => tag.name)}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button 
            label="Show results"
            showIcon="arrow"
            onComplete={handleShowResults}
            style={styles.showResultsButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

interface FilterSectionProps {
  title: string;
  filters: FilterState;
  onToggle: (value: string) => void;
  options: string[];
}

function FilterSection({ title, filters, onToggle, options }: FilterSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <CheckboxItem
            key={option}
            label={option}
            checked={filters[option]}
            onToggle={() => onToggle(option)}
          />
        ))}
      </View>
    </View>
  );
}

interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

function CheckboxItem({ label, checked, onToggle }: CheckboxItemProps) {
  return (
    <Pressable style={styles.checkboxContainer} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Image source={checkIcon} style={styles.checkmark} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 30,
    height: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  clearAll: {
    fontSize: 18,
    color: '#001A72',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#001A72',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#87CCE8',
    borderColor: '#001A72',
  },
  checkmark: {
    height: 16,
    width: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'white',
    boxShadow: '0px 20px 45px #5BB9E0',
  },
  showResultsButton: {
    width: '100%',
  },
  soundToggleSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  soundToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marginTop: {
    marginTop: 12,
  },
  systemPresetTagsSection: {
    marginTop: 16,
  },
});
