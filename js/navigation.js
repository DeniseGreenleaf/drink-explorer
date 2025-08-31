// Navigation Management
const Navigation = {
    currentPage: 'home',
    previousPage: null,

    // Initialize navigation
    init() {
        this.bindEvents();
        this.showPage('home');
    },

    // Bind navigation events
    bindEvents() {
        // Navigation links
        document.getElementById('home-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('home');
        });

        document.getElementById('search-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('search');
        });

        document.getElementById('favorites-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('favorites');
        });

        // Back button in detail view
        document.getElementById('back-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.goBack();
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.showPage(e.state.page, false);
            } else {
                this.showPage('home', false);
            }
        });
    },

    // Show specific page
    showPage(pageName, pushState = true) {
        // Hide all sections
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${pageName}-section`);
        const targetLink = document.getElementById(`${pageName}-link`);

        if (targetSection) {
            targetSection.classList.add('active');
        }

        if (targetLink) {
            targetLink.classList.add('active');
        }

        // Update page state
        this.previousPage = this.currentPage;
        this.currentPage = pageName;

        // Update browser history
        if (pushState) {
            history.pushState(
                { page: pageName }, 
                `Cocktail Wiki - ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`, 
                `#${pageName}`
            );
        }

        // Load page-specific content
        this.loadPageContent(pageName);
    },

    // Load content for specific page
    async loadPageContent(pageName) {
        switch (pageName) {
            case 'home':
                await this.loadHomePage();
                break;
            case 'search':
                await this.loadSearchPage();
                break;
            case 'favorites':
                this.loadFavoritesPage();
                break;
            case 'detail':
                // Detail page content is loaded separately
                break;
        }
    },

    // Load home page content
    async loadHomePage() {
        const randomCocktailContainer = document.getElementById('random-cocktail');
        const newRandomBtn = document.getElementById('new-random-btn');

        try {
            // Load initial random cocktail
            await this.loadRandomCocktail();

            // Bind new random button
            newRandomBtn?.addEventListener('click', async () => {
                await this.loadRandomCocktail();
            });

        } catch (error) {
            console.error('Error loading home page:', error);
            Utils.showError(randomCocktailContainer, 'Failed to load random cocktail');
        }
    },

    // Load random cocktail
    async loadRandomCocktail() {
        const container = document.getElementById('random-cocktail');
        
        try {
            Utils.showLoading(container, 'Finding your perfect cocktail...');
            const randomCocktail = await API.getRandomCocktail();
            
            if (randomCocktail) {
                UI.renderCocktailCard(randomCocktail, container);
            } else {
                Utils.showError(container, 'No random cocktail found');
            }
        } catch (error) {
            console.error('Error loading random cocktail:', error);
            Utils.showError(container, error.message);
        }
    },

    // Load search page content
    async loadSearchPage() {
        try {
            // Populate select dropdowns for advanced search
            await UI.populateSelects();
            
            // Initialize search functionality
            Search.init();
        } catch (error) {
            console.error('Error loading search page:', error);
        }
    },

    // Load favorites page content
    loadFavoritesPage() {
        const favoritesContainer = document.getElementById('favorites-list');
        UI.renderFavorites(favoritesContainer);
    },

    // Show cocktail detail page
    async showCocktailDetail(cocktailId) {
        // Show detail section
        this.showPage('detail');
        
        const detailContainer = document.getElementById('cocktail-detail');
        
        try {
            await UI.renderCocktailDetail(cocktailId, detailContainer);
        } catch (error) {
            console.error('Error showing cocktail detail:', error);
            Utils.showError(detailContainer, 'Failed to load cocktail details');
        }
    },

    // Go back to previous page
    goBack() {
        if (this.previousPage && this.previousPage !== 'detail') {
            this.showPage(this.previousPage);
        } else {
            this.showPage('home');
        }
    },

    // Get current page
    getCurrentPage() {
        return this.currentPage;
    },

    // Check if on specific page
    isOnPage(pageName) {
        return this.currentPage === pageName;
    },

    // Show loading state for current page
    showPageLoading(message = 'Loading...') {
        const currentSection = document.getElementById(`${this.currentPage}-section`);
        if (currentSection) {
            Utils.showLoading(currentSection, message);
        }
    },

    // Handle deep linking (if needed)
    handleDeepLink() {
        const hash = window.location.hash.substring(1);
        const validPages = ['home', 'search', 'favorites'];
        
        if (validPages.includes(hash)) {
            this.showPage(hash, false);
        } else {
            this.showPage('home', false);
        }
    }
};