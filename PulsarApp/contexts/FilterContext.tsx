import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface FilterContextType {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  showSystemPresets: boolean;
  setShowSystemPresets: (enabled: boolean) => void;
  selectedSystemPresetTags: string[];
  setSelectedSystemPresetTags: (tags: string[]) => void;
  compactLayout: boolean;
  setCompactLayout: (enabled: boolean) => void;
  showFavouritesOnly: boolean;
  setShowFavouritesOnly: (enabled: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSystemPresets, setShowSystemPresets] = useState(false);
  const [selectedSystemPresetTags, setSelectedSystemPresetTags] = useState<string[]>(['Effect', 'Primitive']);
  const [compactLayout, setCompactLayout] = useState(false);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@pulsar_compact_layout').then(val => {
      if (val !== null) setCompactLayout(val === 'true');
    }).catch(console.error);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@pulsar_compact_layout', compactLayout ? 'true' : 'false').catch(console.error);
  }, [compactLayout]);

  return (
    <FilterContext.Provider value={{ selectedTags, setSelectedTags, soundEnabled, setSoundEnabled, showSystemPresets, setShowSystemPresets, selectedSystemPresetTags, setSelectedSystemPresetTags, compactLayout, setCompactLayout, showFavouritesOnly, setShowFavouritesOnly }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
