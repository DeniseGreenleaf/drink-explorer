// Favorites Management
const Favorites = {
    // Initialize favorites functionality
    init() {
        this.updateFavoritesCount();
        this.bindEvents();
    },

    // Bind favorites-related events
    bindEvents() {
        // Listen for storage changes (if multiple tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === CONFIG.STORAGE.FAVORITES_KEY) {
                this.updateFavoritesCount();
                this.refreshCurrentView();
            }
        });
    },

    // Update favorites count in navigation
    updateFavoritesCount() {
        const favoritesLink = document.getElementById('favorites-link');
        const favorites = Storage.getFavorites();
        
        if (favoritesLink) {
            const count = favorites.length;
            const originalText = 'Favorites';
            
            if (count > 0) {
                favoritesLink.textContent = `${originalText} (${count})`;
            } else {
                favoritesLink.textContent = originalText;
            }
        }
    },

    // Add cocktail to favorites with animation
    async addToFavorites(cocktailId, showAnimation = true) {
        try {
            // If we don't have full cocktail data, fetch it
            let cocktail = this.getCachedCocktail(cocktailId);
            
            if (!cocktail) {
                cocktail = await API.getCocktailById(cocktailId);
            }

            if (!cocktail) {
                throw new Error('Cocktail not found');
            }

            const success = Storage.addToFavorites(cocktail);
            
            if (success) {
                this.updateFavoritesCount();
                
                if (showAnimation) {
                    this.showFavoriteAnimation('added');
                }
                
                // Update UI elements
                this.updateFavoriteButtons(cocktailId, true);
                
                return true;
            } else {
                UI.showToast('Already in favorites');
                return false;
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            UI.showToast('Failed to add to favorites');
            return false;
        }
    },

    // Remove cocktail from favorites
    removeFromFavorites(cocktailId, showAnimation = true) {
        try {
            const success = Storage.removeFromFavorites(cocktailId);
            
            if (success) {
                this.updateFavoritesCount();
                
                if (showAnimation) {
                    this.showFavoriteAnimation('removed');
                }
                
                // Update UI elements
                this.updateFavoriteButtons(cocktailId, false);
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            UI.showToast('Failed to remove from favorites');
            return false;
        }
    },

    // Toggle favorite status
    async toggleFavorite(cocktailId) {
        const isFavorite = Storage.isFavorite(cocktailId);
        
        if (isFavorite) {
            return this.removeFromFavorites(cocktailId);
        } else {
            return await this.addToFavorites(cocktailId);
        }
    },

    // Update all favorite buttons for a cocktail
    updateFavoriteButtons(cocktailId, isFavorite) {
        const buttons = document.querySelectorAll(`[data-cocktail-id="${cocktailId}"].favorite-btn`);
        
        buttons.forEach(button => {
            if (isFavorite) {
                button.classList.add('active');
                button.innerHTML = '❤️';
                button.title = 'Remove from favorites';
            } else {
                button.classList.remove('active');
                button.innerHTML = '🤍';
                button.title = 'Add to favorites';
            }
        });
    },

    // Show favorite animation
    showFavoriteAnimation(action) {
        const message = action === 'added' ? 'Added to favorites ❤️' : 'Removed from favorites 💔';
        UI.showToast(message);
        
        // Optional: Add floating heart animation
        this.createFloatingHeart(action === 'added');
    },

    // Create floating heart animation
    createFloatingHeart(isAdded) {
        const heart = document.createElement('div');
        heart.innerHTML = isAdded ? '❤️' : '💔';
        heart.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            font-size: 3rem;
            z-index: 10000;
            pointer-events: none;
            animation: floatingHeart 2s ease-out forwards;
            transform: translate(-50%, -50%);
        `;

        // Add CSS animation if not already present
        if (!document.getElementById('floating-heart-styles')) {
            const style = document.createElement('style');
            style.id = 'floating-heart-styles';
            style.textContent = `
                @keyframes floatingHeart {
                    0% { 
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 0;
                    }
                    20% { 
                        transform: translate(-50%, -50%) scale(1.2);
                        opacity: 1;
                    }
                    100% { 
                        transform: translate(-50%, -200px) scale(0.8);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(heart);
        
        setTimeout(() => {
            if (document.body.contains(heart)) {
                document.body.removeChild(heart);
            }
        }, 2000);
    },

    // Get cached cocktail data (from current page)
    getCachedCocktail(cocktailId) {
        // Try to find cocktail in current search results
        if (Search.currentResults && Search.currentResults.length > 0) {
            const cocktail = Search.currentResults.find(c => c.idDrink === cocktailId);
            if (cocktail) return cocktail;
        }

        // Try to find in favorites
        const favorites = Storage.getFavorites();
        const favorite = favorites.find(f => f.idDrink === cocktailId);
        if (favorite) return favorite;

        return null;
    },

    // Refresh current view if showing favorites
    refreshCurrentView() {
        if (Navigation.isOnPage('favorites')) {
            Navigation.loadFavoritesPage();
        }
    },

    // Export favorites
    exportFavorites(format = 'json') {
        const favorites = Storage.getFavorites();
        
        if (favorites.length === 0) {
            UI.showToast('No favorites to export');
            return;
        }

        const data = favorites.map(cocktail => ({
            name: cocktail.strDrink,
            category: cocktail.strCategory,
            glass: cocktail.strGlass,
            image: cocktail.strDrinkThumb,
            id: cocktail.idDrink,
            dateAdded: cocktail.dateAdded
        }));

        if (format === 'json') {
            this.downloadFavoritesAsJson(data);
        } else if (format === 'csv') {
            this.downloadFavoritesAsCsv(data);
        }
    },

    // Download favorites as JSON
    downloadFavoritesAsJson(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-favorite-cocktails-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Download favorites as CSV
    downloadFavoritesAsCsv(data) {
        const headers = ['Name', 'Category', 'Glass', 'Image URL', 'ID', 'Date Added'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                `"${row.name}"`,
                `"${row.category || ''}"`,
                `"${row.glass || ''}"`,
                `"${row.image || ''}"`,
                row.id,
                `"${new Date(row.dateAdded).toLocaleDateString()}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-favorite-cocktails-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Import favorites from file
    async importFavorites(file) {
        try {
            const text = await file.text();
            let importData;

            if (file.name.endsWith('.json')) {
                importData = JSON.parse(text);
            } else {
                throw new Error('Only JSON files are supported for import');
            }

            if (!Array.isArray(importData)) {
                throw new Error('Invalid file format');
            }

            const currentFavorites = Storage.getFavorites();
            let importedCount = 0;
            let duplicateCount = 0;

            for (const item of importData) {
                if (!item.id || !item.name) continue;

                const isExisting = currentFavorites.some(fav => fav.idDrink === item.id);
                
                if (!isExisting) {
                    // Convert import format to storage format
                    const favoriteData = {
                        idDrink: item.id,
                        strDrink: item.name,
                        strDrinkThumb: item.image || '',
                        strCategory: item.category || '',
                        strGlass: item.glass || '',
                        dateAdded: item.dateAdded || new Date().toISOString()
                    };
                    
                    currentFavorites.push(favoriteData);
                    importedCount++;
                } else {
                    duplicateCount++;
                }
            }

            if (importedCount > 0) {
                Storage.saveFavorites(currentFavorites);
                this.updateFavoritesCount();
                this.refreshCurrentView();
            }

            UI.showToast(`Imported ${importedCount} favorites${duplicateCount > 0 ? ` (${duplicateCount} duplicates skipped)` : ''}`);
            
            return { imported: importedCount, duplicates: duplicateCount };

        } catch (error) {
            console.error('Import error:', error);
            UI.showToast('Failed to import favorites');
            return { imported: 0, duplicates: 0 };
        }
    },

    // Get favorites statistics
    getFavoritesStats() {
        const favorites = Storage.getFavorites();
        
        if (favorites.length === 0) {
            return {
                total: 0,
                categories: {},
                glasses: {},
                oldestFavorite: null,
                newestFavorite: null
            };
        }

        const categories = {};
        const glasses = {};
        let oldest = favorites[0];
        let newest = favorites[0];

        favorites.forEach(fav => {
            // Count categories
            if (fav.strCategory) {
                categories[fav.strCategory] = (categories[fav.strCategory] || 0) + 1;
            }

            // Count glasses
            if (fav.strGlass) {
                glasses[fav.strGlass] = (glasses[fav.strGlass] || 0) + 1;
            }

            // Find oldest and newest
            const favDate = new Date(fav.dateAdded);
            const oldestDate = new Date(oldest.dateAdded);
            const newestDate = new Date(newest.dateAdded);

            if (favDate < oldestDate) oldest = fav;
            if (favDate > newestDate) newest = fav;
        });

        return {
            total: favorites.length,
            categories,
            glasses,
            oldestFavorite: oldest,
            newestFavorite: newest
        };
    }
};