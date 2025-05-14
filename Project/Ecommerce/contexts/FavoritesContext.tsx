
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface FavoritesContextType {
  favorites: string[];
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addToFavorites: () => {},
  removeFromFavorites: () => {},
  isFavorite: () => false,
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (productId: string) => {
    if (!favorites.includes(productId)) {
      setFavorites(prev => [...prev, productId]);
      toast.success('Added to favorites');
    }
  };

  const removeFromFavorites = (productId: string) => {
    setFavorites(prev => prev.filter(id => id !== productId));
    toast.success('Removed from favorites');
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
