import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useFilters } from '@/contexts/FilterContext';
import { Image } from 'expo-image';

const xIcon = require('@/assets/images/x.svg');

export default function SelectedTags() {
  const { selectedTags, setSelectedTags } = useFilters();

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const clearAll = () => {
    setSelectedTags([]);
  };

  if (selectedTags.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {selectedTags.map((tag, index) => (
        <Pressable 
          key={`${tag}-${index}`}
          style={styles.tag}
          onPress={() => removeTag(tag)}
        >
          <Text style={styles.tagText}>{tag}</Text>
          <Image source={xIcon} style={styles.xIcon} />
        </Pressable>
      ))}
      <Pressable style={styles.clearAllButton} onPress={clearAll}>
        <Text style={styles.clearAllText}>Clear all</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFEFF',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 8,
  },
  tagText: {
    color: '#001A72',
    fontSize: 13,
    fontWeight: '500',
  },
  xIcon: {
    width: 17,
    height: 17,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFEFF',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    color: '#001A72',
    fontSize: 13,
    fontWeight: '500',
  },
});
