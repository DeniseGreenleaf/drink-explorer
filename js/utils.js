// Utility Functions
const Utils = {
    // Debounce function for search input
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format ingredients and measurements
    formatIngredients(cocktail) {
        const ingredients = [];
        for (let i = 1; i <= 15; i++) {
            const ingredient = cocktail[`strIngredient${i}`];
            const measure = cocktail[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    name: ingredient.trim(),
                    measure: measure ? measure.trim() : ''
                });
            }
        }
        return ingredients;
    },

    // Clean and format instructions
    formatInstructions(instructions) {
        if (!instructions) return '';
        
        return instructions
            .replace(/\r\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    // Parse tags
    parseTags(tags) {
        if (!tags) return [];
        return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    },

    // Validate form inputs
    validateForm(formData) {
        const errors = [];
        
        // At least one field must be filled
        const hasValue = Object.values(formData).some(value => 
            value && value.toString().trim()
        );
        
        if (!hasValue) {
            errors.push('Please enter at least one search criteria');
        }

        // Validate cocktail name length
        if (formData.name && formData.name.length < 2) {
            errors.push('Cocktail name must be at least 2 characters long');
        }

        // Validate ingredient length
        if (formData.ingredient && formData.ingredient.length < 2) {
            errors.push('Ingredient name must be at least 2 characters long');
        }

        return errors;
    },

    // Show loading state
    showLoading(element, message = 'Loading...') {
        element.innerHTML = `
            <div class="loading-spinner">${message}</div>
        `;
        element.classList.add('loading');
    },

    // Hide loading state
    hideLoading(element) {
        element.classList.remove('loading');
    },

    // Show error message
    showError(element, message) {
        element.innerHTML = `
            <div class="error-message">
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
            </div>
        `;
    },

    // Show empty state
    showEmptyState(element, title, message) {
        element.innerHTML = `
            <div class="empty-state">
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    },

    // Truncate text
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Handle image loading errors
    handleImageError(img) {
        img.src = 'https://via.placeholder.com/300x300/667eea/white?text=No+Image';
        img.alt = 'No image available';
    }
};