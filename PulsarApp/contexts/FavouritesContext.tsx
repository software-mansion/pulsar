import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface FavouritesContextType {
  favouritePresets: string[];
  toggleFavourite: (presetName: string) => void;
  isFavourite: (presetName: string) => boolean;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favouritePresets, setFavouritePresets] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('@pulsar_favourite_presets').then(val => {
      if (val !== null) {
        try {
          setFavouritePresets(JSON.parse(val));
        } catch {
          setFavouritePresets([]);
        }
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@pulsar_favourite_presets', JSON.stringify(favouritePresets)).catch(console.error);
  }, [favouritePresets]);

  const toggleFavourite = (presetName: string) => {
    setFavouritePresets(prev =>
      prev.includes(presetName)
        ? prev.filter(name => name !== presetName)
        : [...prev, presetName]
    );
  };

  const isFavourite = (presetName: string) => favouritePresets.includes(presetName);

  return (
    <FavouritesContext.Provider value={{ favouritePresets, toggleFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}
