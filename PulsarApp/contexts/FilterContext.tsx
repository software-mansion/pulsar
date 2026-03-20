import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <FilterContext.Provider value={{ selectedTags, setSelectedTags, soundEnabled, setSoundEnabled }}>
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
