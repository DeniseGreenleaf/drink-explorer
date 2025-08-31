// Main Application
class CocktailApp {
    constructor() {
        this.isInitialized = false;
        this.isOnline = navigator.onLine;
    }

    // Initialize the application
    async init() {
        try {
            console.log('🍸 Initializing Cocktail Wiki...');
            
            // Check if DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
                return;
            }

            if (this.isInitialized) return;

            // Initialize modules in order
            await this.initializeModules();
            
            // Set up global event listeners
            this.setupGlobalEvents();
            
            // Handle initial navigation
            this.handleInitialNavigation();
            
            this.isInitialized = true;
            console.log('✅ Cocktail Wiki initialized successfully!');
            
        } catch (error) {
            console.error('❌ Failed to initialize Cocktail Wiki:', error);
            this.showInitializationError(error);
        }
    }

    // Initialize all modules
    async initializeModules() {
        // Initialize core modules
        Navigation.init();
        Favorites.init();
        
        // Add CSS animations
        this.addCustomCSS();
        
        console.log('📦 Modules initialized');
    }

    // Set up global event listeners
    setupGlobalEvents() {
        // Online/offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Back online');
            this.showConnectionStatus('online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📡 Gone offline');
            this.showConnectionStatus('offline');
        });

        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleGlobalError(e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleGlobalError(e.reason);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        console.log('🎧 Global event listeners set up');
    }

    // Handle initial navigation
    handleInitialNavigation() {
        // Check URL hash for deep linking
        const hash = window.location.hash.substring(1);
        
        if (hash) {
            Navigation.handleDeepLink();
        } else {
            Navigation.showPage('home');
        }
    }

    // Show initialization error
    showInitializationError(error) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 3rem;">
                    <h2>🚫 Application Failed to Load</h2>
                    <p>We're sorry, but there was an error loading the Cocktail Wiki.</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    // Show connection status
    showConnectionStatus(status) {
        let existingStatus = document.getElementById('connection-status');
        
        if (existingStatus) {
            existingStatus.remove();
        }

        if (status === 'offline') {
            const statusBar = document.createElement('div');
            statusBar.id = 'connection-status';
            statusBar.innerHTML = '📡 You are offline. Some features may not work.';
            statusBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #f39c12;
                color: white;
                padding: 0.5rem;
                text-align: center;
                z-index: 10000;
                font-weight: 600;
            `;
            document.body.prepend(statusBar);
        }
    }

    // Handle global errors
    handleGlobalError(error) {
        console.error('Handling global error:', error);
        
        // Don't show error messages for network errors when offline
        if (!this.isOnline && error.message.includes('fetch')) {
            return;
        }

        // Show user-friendly error message
        UI.showToast('Something went wrong. Please try again.');
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            Navigation.showPage('search');
            setTimeout(() => {
                const searchInput = document.getElementById('cocktail-name');
                if (searchInput) searchInput.focus();
            }, 100);
        }

        // Escape to go back or close
        if (e.key === 'Escape') {
            if (Navigation.getCurrentPage() === 'detail') {
                Navigation.goBack();
            }
        }

        // Ctrl/Cmd + H for home
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            Navigation.showPage('home');
        }

        // Ctrl/Cmd + F for favorites
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            Navigation.showPage('favorites');
        }
    }

    // Add custom CSS animations
    addCustomCSS() {
        if (document.getElementById('custom-cocktail-styles')) return;

        const style = document.createElement('style');
        style.id = 'custom-cocktail-styles';
        style.textContent = `
            /* Toast animations */
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-20px); }
                20%, 80% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }

            /* Floating heart animation */
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

            /* Cocktail card hover effects */
            .cocktail-card {
                transition: all 0.3s ease;
            }

            .cocktail-card:hover {
                transform: translateY(-5px) scale(1.02);
            }

            /* Loading pulse animation */
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            /* Favorite button animation */
            .favorite-btn {
                transition: all 0.3s ease;
            }

            .favorite-btn:hover {
                transform: scale(1.2);
            }

            .favorite-btn.active {
                animation: heartBeat 0.6s ease-in-out;
            }

            @keyframes heartBeat {
                0%, 100% { transform: scale(1); }
                25% { transform: scale(1.1); }
                50% { transform: scale(1.2); }
                75% { transform: scale(1.1); }
            }

            /* Smooth page transitions */
            .page-section {
                transition: opacity 0.3s ease-in-out;
            }

            /* Search input focus effect */
            .search-group input:focus,
            .search-group select:focus {
                transform: translateY(-2px);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 8px rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(style);
    }

    // Get application status
    getStatus() {
        return {
            initialized: this.isInitialized,
            online: this.isOnline,
            currentPage: Navigation.getCurrentPage(),
            favoritesCount: Storage.getFavorites().length,
            searchResults: Search.getCurrentSearchState()
        };
    }

    // Refresh application data
    async refresh() {
        try {
            console.log('🔄 Refreshing application...');
            
            // Refresh current page content
            await Navigation.loadPageContent(Navigation.getCurrentPage());
            
            // Update favorites count
            Favorites.updateFavoritesCount();
            
            console.log('✅ Application refreshed');
            UI.showToast('Application refreshed');
            
        } catch (error) {
            console.error('Failed to refresh application:', error);
            UI.showToast('Failed to refresh application');
        }
    }

    // Clear all application data
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This will remove all favorites and search history.')) {
            Storage.clearFavorites();
            Storage.clearSearchHistory();
            
            // Refresh application
            this.refresh();
            
            UI.showToast('All data cleared');
        }
    }

    // Show application info
    showInfo() {
        const status = this.getStatus();
        const favStats = Favorites.getFavoritesStats();
        
        alert(`
🍸 Cocktail Wiki Info:

📊 Status: ${status.initialized ? 'Ready' : 'Initializing'}
🌐 Connection: ${status.online ? 'Online' : 'Offline'}
📄 Current Page: ${status.currentPage}
❤️ Favorites: ${status.favoritesCount}
🔍 Search Results: ${status.searchResults.totalResults}

📈 Your Stats:
• Most liked category: ${Object.keys(favStats.categories)[0] || 'None'}
• Preferred glass: ${Object.keys(favStats.glasses)[0] || 'None'}

⌨️ Keyboard Shortcuts:
• Ctrl/Cmd + K: Search
• Ctrl/Cmd + H: Home
• Ctrl/Cmd + F: Favorites
• Escape: Go back

Built with ❤️ using vanilla JavaScript
        `);
    }
}

// Initialize the application
const app = new CocktailApp();

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Make app globally available for debugging
window.CocktailApp = app;

// Add some debugging helpers
window.debugCocktailApp = {
    getStatus: () => app.getStatus(),
    refresh: () => app.refresh(),
    clearData: () => app.clearAllData(),
    showInfo: () => app.showInfo(),
    storage: Storage,
    api: API,
    ui: UI,
    navigation: Navigation,
    search: Search,
    favorites: Favorites
};

console.log('🍸 Cocktail Wiki loaded! Type "debugCocktailApp.showInfo()" in console for info.');