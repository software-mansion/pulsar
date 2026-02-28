import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { PresetsConfig } from '@/constants/PresetsConfig';
import { TagsInfo } from '@/constants/Tags';
import { useFilters } from '@/contexts/FilterContext';
import Preset from './Preset';
import Card from './Card';
import { ThemedText } from './themed-text';

export default function PresetList() {
  const { selectedTags } = useFilters();

  const selectedTagsByGroup = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    
    selectedTags.forEach(tagName => {
      TagsInfo.forEach(group => {
        const tagExists = group.tags.some(tag => tag.name === tagName);
        if (tagExists) {
          if (!grouped[group.groupName]) {
            grouped[group.groupName] = [];
          }
          grouped[group.groupName].push(tagName);
        }
      });
    });
    
    return grouped;
  }, [selectedTags]);

  const filteredPresets = useMemo(() => {
    if (selectedTags.length === 0) {
      return PresetsConfig;
    }
    
    return PresetsConfig.filter(preset => {
      const presetTagLabels = preset.tags.map(tag => tag.label);
      
      for (const groupName in selectedTagsByGroup) {
        const selectedTagsInGroup = selectedTagsByGroup[groupName];
        const hasTagFromGroup = selectedTagsInGroup.some(tagName => 
          presetTagLabels.includes(tagName)
        );
        if (!hasTagFromGroup) {
          return false;
        }
      }
      
      return true;
    });
  }, [selectedTags, selectedTagsByGroup]);

  return (
    <View style={styles.container}>
      {filteredPresets.length === 0 && selectedTags.length > 0 ? (
        <Card>
          <ThemedText type='subtitle'>No presets for selected tags 😕</ThemedText>
          <ThemedText>Try adjusting your filters to see more presets.</ThemedText>
        </Card>
      ) : (
        filteredPresets.map((preset, index) => (
          <Preset
            key={`${preset.shortName}-${index}`}
            title={preset.name}
            subtitle={preset.description}
            tags={preset.tags.map((tag) => ({
              label: tag.label,
            }))}
            image={preset.image}
            onPress={preset.play}
            duration={preset.duration}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 30,
    marginTop: 20,
    paddingBottom: 50,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
