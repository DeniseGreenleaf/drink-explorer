// Search Functionality
const Search = {
    currentResults: [],
    currentPage: 1,
    isSearching: false,

    // Initialize search functionality
    init() {
        this.bindEvents();
        this.clearResults();
    },

    // Bind search events
    bindEvents() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('cocktail-name');
        
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
        }

        // Debounced search on input for cocktail name
        if (searchInput) {
            const debouncedSearch = Utils.debounce(() => {
                const value = searchInput.value.trim();
                if (value.length >= 2) {
                    this.handleQuickSearch(value);
                } else if (value.length === 0) {
                    this.clearResults();
                }
            }, CONFIG.UI.DEBOUNCE_DELAY);

            searchInput.addEventListener('input', debouncedSearch);
        }
    },

    // Handle main search form submission
    async handleSearch() {
        if (this.isSearching) return;
        
        const formData = this.getFormData();
        const errors = Utils.validateForm(formData);

        if (errors.length > 0) {
            this.showErrors(errors);
            return;
        }

        try {
            this.isSearching = true;
            this.showSearching();
            
            // Add to search history
            if (formData.name) {
                Storage.addToSearchHistory(formData.name);
            }

            // Perform search
            const results = await this.performSearch(formData);
            
            this.currentResults = results;
            this.currentPage = 1;
            
            this.displayResults(results);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError(error.message);
        } finally {
            this.isSearching = false;
        }
    },

    // Handle quick search (debounced input)
    async handleQuickSearch(searchTerm) {
        try {
            const results = await API.searchCocktailsByName(searchTerm);
            this.currentResults = results;
            this.currentPage = 1;
            this.displayResults(results);
        } catch (error) {
            console.warn('Quick search error:', error);
            // Don't show error for quick search, just clear results
            this.clearResults();
        }
    },

    // Get form data
    getFormData() {
        const form = document.getElementById('search-form');
        const formData = new FormData(form);
        
        return {
            name: formData.get('name')?.trim() || '',
            category: formData.get('category')?.trim() || '',
            ingredient: formData.get('ingredient')?.trim() || '',
            glass: formData.get('glass')?.trim() || ''
        };
    },

    // Perform search based on form data
    async performSearch(searchData) {
        const { name, category, ingredient, glass } = searchData;

        // If only name is provided, use simple name search
        if (name && !category && !ingredient && !glass) {
            return await API.searchCocktailsByName(name);
        }

        // If only ingredient is provided, use simple ingredient search
        if (ingredient && !name && !category && !glass) {
            return await API.searchCocktailsByIngredient(ingredient);
        }

        // Use advanced search for multiple criteria
        return await API.advancedSearch(searchData);
    },

    // Display search results
    displayResults(results) {
        const resultsContainer = document.getElementById('search-results');
        
        if (!results || results.length === 0) {
            Utils.showEmptyState(
                resultsContainer,
                'No cocktails found',
                'Try different search terms or check your spelling'
            );
            this.clearPagination();
            return;
        }

        UI.renderSearchResults(results, resultsContainer, this.currentPage);
    },

    // Handle pagination
    handlePagination(page, cocktails) {
        if (page < 1 || page > Math.ceil(cocktails.length / CONFIG.PAGINATION.ITEMS_PER_PAGE)) {
            return;
        }

        this.currentPage = page;
        this.currentResults = cocktails;
        
        const resultsContainer = document.getElementById('search-results');
        UI.renderSearchResults(cocktails, resultsContainer, page);
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // Show searching state
    showSearching() {
        const resultsContainer = document.getElementById('search-results');
        Utils.showLoading(resultsContainer, 'Searching for cocktails...');
        this.clearPagination();
    },

    // Show search errors
    showErrors(errors) {
        const resultsContainer = document.getElementById('search-results');
        const errorHtml = `
            <div class="error-message">
                <h3>Please correct the following errors:</h3>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;
        resultsContainer.innerHTML = errorHtml;
        this.clearPagination();
    },

    // Show search error
    showError(message) {
        const resultsContainer = document.getElementById('search-results');
        Utils.showError(resultsContainer, message);
        this.clearPagination();
    },

    // Clear search results
    clearResults() {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';
        this.clearPagination();
        this.currentResults = [];
        this.currentPage = 1;
    },

    // Clear pagination
    clearPagination() {
        const paginationContainer = document.getElementById('pagination');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
    },

    // Reset search form
    resetForm() {
        const form = document.getElementById('search-form');
        if (form) {
            form.reset();
            this.clearResults();
        }
    },

    // Get search suggestions (based on search history)
    getSearchSuggestions(query) {
        const history = Storage.getSearchHistory();
        const suggestions = history
            .filter(item => item.term.includes(query.toLowerCase()))
            .slice(0, 5)
            .map(item => item.term);
        
        return suggestions;
    },

    // Export search results (bonus feature)
    exportResults(format = 'json') {
        if (this.currentResults.length === 0) {
            UI.showToast('No results to export');
            return;
        }

        const data = this.currentResults.map(cocktail => ({
            name: cocktail.strDrink,
            category: cocktail.strCategory,
            glass: cocktail.strGlass,
            image: cocktail.strDrinkThumb,
            id: cocktail.idDrink
        }));

        if (format === 'json') {
            this.downloadAsJson(data);
        } else if (format === 'csv') {
            this.downloadAsCsv(data);
        }
    },

    // Download results as JSON
    downloadAsJson(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cocktail-search-results-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Download results as CSV
    downloadAsCsv(data) {
        const headers = ['Name', 'Category', 'Glass', 'Image URL', 'ID'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                `"${row.name}"`,
                `"${row.category || ''}"`,
                `"${row.glass || ''}"`,
                `"${row.image || ''}"`,
                row.id
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cocktail-search-results-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Get current search state
    getCurrentSearchState() {
        return {
            results: this.currentResults,
            page: this.currentPage,
            totalResults: this.currentResults.length,
            totalPages: Math.ceil(this.currentResults.length / CONFIG.PAGINATION.ITEMS_PER_PAGE),
            isSearching: this.isSearching
        };
    }
};