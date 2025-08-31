// API Functions
const API = {
    // Base fetch function with error handling
    async fetchData(endpoint, params = {}) {
        try {
            const url = new URL(CONFIG.API.BASE_URL + endpoint);
            
            // Add parameters to URL
            Object.keys(params).forEach(key => {
                if (params[key]) {
                    url.searchParams.append(key, params[key]);
                }
            });

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    },

    // Get random cocktail
    async getRandomCocktail() {
        try {
            const data = await this.fetchData(CONFIG.API.ENDPOINTS.RANDOM);
            return data.drinks ? data.drinks[0] : null;
        } catch (error) {
            throw new Error('Failed to fetch random cocktail');
        }
    },

    // Get cocktail by ID
    async getCocktailById(id) {
        try {
            const data = await this.fetchData(CONFIG.API.ENDPOINTS.LOOKUP, { i: id });
            return data.drinks ? data.drinks[0] : null;
        } catch (error) {
            throw new Error(`Failed to fetch cocktail with ID: ${id}`);
        }
    },

    // Search cocktails by name
    async searchCocktailsByName(name) {
        if (!name || name.trim().length < 2) {
            throw new Error('Search term must be at least 2 characters long');
        }

        try {
            const data = await this.fetchData(CONFIG.API.ENDPOINTS.SEARCH_BY_NAME, { s: name.trim() });
            return data.drinks || [];
        } catch (error) {
            throw new Error('Failed to search cocktails by name');
        }
    },

    // Search cocktails by ingredient
    async searchCocktailsByIngredient(ingredient) {
        if (!ingredient || ingredient.trim().length < 2) {
            throw new Error('Ingredient name must be at least 2 characters long');
        }

        try {
            const data = await this.fetchData(CONFIG.API.ENDPOINTS.SEARCH_BY_INGREDIENT, { i: ingredient.trim() });
            return data.drinks || [];
        } catch (error) {
            throw new Error('Failed to search cocktails by ingredient');
        }
    },

    // Get categories list
    async getCategories() {
        try {
            const data = await this.fetchData(CONFIG.API.ENDPOINTS.LIST_CATEGORIES);
            return data.drinks ? data.drinks.map(item => item.strCategory) : [];
        } catch (error) {
            console.warn('Failed to fetch categories:', error);
            return [];
        }
    },

    // Get glasses list
    async getGlasses() {
        try {
            const data = await this.fetchData(CONFIG.API.ENDPOINTS.LIST_GLASSES);
            return data.drinks ? data.drinks.map(item => item.strGlass) : [];
        } catch (error) {
            console.warn('Failed to fetch glasses:', error);
            return [];
        }
    },

    // Get ingredients list
    async getIngredients() {
        try {
            const data = await this.fetchData(CONFIG.API.ENDPOINTS.LIST_INGREDIENTS);
            return data.drinks ? data.drinks.map(item => item.strIngredient1) : [];
        } catch (error) {
            console.warn('Failed to fetch ingredients:', error);
            return [];
        }
    },

    // Combined search function (VG requirement)
    async advancedSearch(searchParams) {
        const { name, ingredient, category, glass } = searchParams;
        let results = [];

        try {
            // If name is provided, search by name first
            if (name && name.trim()) {
                results = await this.searchCocktailsByName(name);
            }
            // If ingredient is provided and no name search, search by ingredient
            else if (ingredient && ingredient.trim()) {
                results = await this.searchCocktailsByIngredient(ingredient);
            }
            // If no name or ingredient, get random cocktails as base
            else {
                // Get multiple random cocktails for filtering
                const randomPromises = Array(20).fill().map(() => this.getRandomCocktail());
                const randomResults = await Promise.all(randomPromises);
                results = randomResults.filter(cocktail => cocktail !== null);
            }

            // Filter by category if provided
            if (category && category.trim()) {
                results = results.filter(cocktail => 
                    cocktail.strCategory && 
                    cocktail.strCategory.toLowerCase().includes(category.toLowerCase())
                );
            }

            // Filter by glass if provided
            if (glass && glass.trim()) {
                results = results.filter(cocktail => 
                    cocktail.strGlass && 
                    cocktail.strGlass.toLowerCase().includes(glass.toLowerCase())
                );
            }

            return results;
        } catch (error) {
            throw new Error('Advanced search failed');
        }
    }
};