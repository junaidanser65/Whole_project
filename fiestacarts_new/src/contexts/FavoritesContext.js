import React, { createContext, useContext, useState } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = (vendor) => {
    setFavorites(prev => [...prev, vendor]);
  };

  const removeFavorite = (vendorId) => {
    setFavorites(prev => prev.filter(v => v.id !== vendorId));
  };

  const isFavorite = (vendorId) => {
    return favorites.some(v => v.id === vendorId);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 