import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PresetsConfig } from '@/constants/PresetsConfig';
import Preset from './Preset';

export default function PresetList() {
  return (
    <View style={styles.container}>
      {PresetsConfig.map((preset, index) => (
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
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 30,
    marginTop: 20,
    paddingBottom: 50,
  },
});
