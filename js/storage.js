// LocalStorage Management
const Storage = {
    // Get favorites from localStorage
    getFavorites() {
        try {
            const favorites = localStorage.getItem(CONFIG.STORAGE.FAVORITES_KEY);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Error getting favorites:', error);
            return [];
        }
    },

    // Save favorites to localStorage
    saveFavorites(favorites) {
        try {
            localStorage.setItem(CONFIG.STORAGE.FAVORITES_KEY, JSON.stringify(favorites));
            return true;
        } catch (error) {
            console.error('Error saving favorites:', error);
            return false;
        }
    },

    // Add cocktail to favorites
    addToFavorites(cocktail) {
        try {
            const favorites = this.getFavorites();
            
            // Check if already in favorites
            const isAlreadyFavorite = favorites.some(fav => fav.idDrink === cocktail.idDrink);
            
            if (!isAlreadyFavorite) {
                // Store essential cocktail data
                const favoriteData = {
                    idDrink: cocktail.idDrink,
                    strDrink: cocktail.strDrink,
                    strDrinkThumb: cocktail.strDrinkThumb,
                    strCategory: cocktail.strCategory,
                    strGlass: cocktail.strGlass,
                    dateAdded: new Date().toISOString()
                };
                
                favorites.push(favoriteData);
                return this.saveFavorites(favorites);
            }
            
            return false; // Already in favorites
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return false;
        }
    },

    // Remove cocktail from favorites
    removeFromFavorites(cocktailId) {
        try {
            const favorites = this.getFavorites();
            const updatedFavorites = favorites.filter(fav => fav.idDrink !== cocktailId);
            return this.saveFavorites(updatedFavorites);
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return false;
        }
    },

    // Check if cocktail is in favorites
    isFavorite(cocktailId) {
        const favorites = this.getFavorites();
        return favorites.some(fav => fav.idDrink === cocktailId);
    },

    // Get search history
    getSearchHistory() {
        try {
            const history = localStorage.getItem(CONFIG.STORAGE.SEARCH_HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error getting search history:', error);
            return [];
        }
    },

    // Add search to history
    addToSearchHistory(searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim().length < 2) return;
            
            const history = this.getSearchHistory();
            const cleanTerm = searchTerm.trim().toLowerCase();
            
            // Remove if already exists
            const filteredHistory = history.filter(item => item.term !== cleanTerm);
            
            // Add to beginning
            filteredHistory.unshift({
                term: cleanTerm,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 10 searches
            const limitedHistory = filteredHistory.slice(0, 10);
            
            localStorage.setItem(CONFIG.STORAGE.SEARCH_HISTORY_KEY, JSON.stringify(limitedHistory));
        } catch (error) {
            console.error('Error adding to search history:', error);
        }
    },

    // Clear all favorites
    clearFavorites() {
        try {
            localStorage.removeItem(CONFIG.STORAGE.FAVORITES_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing favorites:', error);
            return false;
        }
    },

    // Clear search history
    clearSearchHistory() {
        try {
            localStorage.removeItem(CONFIG.STORAGE.SEARCH_HISTORY_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing search history:', error);
            return false;
        }
    },

    // Get storage info (for debugging)
    getStorageInfo() {
        const favorites = this.getFavorites();
        const searchHistory = this.getSearchHistory();
        
        return {
            favoritesCount: favorites.length,
            searchHistoryCount: searchHistory.length,
            storageUsed: this.getStorageSize()
        };
    },

    // Calculate storage size
    getStorageSize() {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        return totalSize;
    }
};