// UI Components and Rendering
const UI = {
    // Render cocktail card for home page
    renderCocktailCard(cocktail, container) {
        if (!cocktail) {
            container.innerHTML = '<div class="error-message">No cocktail data available</div>';
            return;
        }

        const isFavorite = Storage.isFavorite(cocktail.idDrink);
        
        container.innerHTML = `
            <div class="cocktail-card" data-cocktail-id="${cocktail.idDrink}">
                <img class="cocktail-image" 
                     src="${cocktail.strDrinkThumb}" 
                     alt="${cocktail.strDrink}"
                     onerror="Utils.handleImageError(this)">
                <h3 class="cocktail-name">${cocktail.strDrink}</h3>
                <p class="cocktail-category">${cocktail.strCategory || 'Unknown Category'}</p>
                
                <div class="card-actions">
                    <button class="btn btn-primary see-more-btn" data-cocktail-id="${cocktail.idDrink}">
                        See More
                    </button>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            data-cocktail-id="${cocktail.idDrink}" 
                            title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        const seeMoreBtn = container.querySelector('.see-more-btn');
        const favoriteBtn = container.querySelector('.favorite-btn');

        seeMoreBtn?.addEventListener('click', () => {
            Navigation.showCocktailDetail(cocktail.idDrink);
        });

        favoriteBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleFavorite(cocktail, favoriteBtn);
        });
    },

    // Render cocktail detail page
    async renderCocktailDetail(cocktailId, container) {
        try {
            Utils.showLoading(container, 'Loading cocktail details...');
            
            const cocktail = await API.getCocktailById(cocktailId);
            
            if (!cocktail) {
                Utils.showError(container, 'Cocktail not found');
                return;
            }

            const ingredients = Utils.formatIngredients(cocktail);
            const instructions = Utils.formatInstructions(cocktail.strInstructions);
            const tags = Utils.parseTags(cocktail.strTags);
            const isFavorite = Storage.isFavorite(cocktail.idDrink);

            container.innerHTML = `
                <div class="cocktail-detail">
                    <div class="detail-image-section">
                        <img class="detail-image" 
                             src="${cocktail.strDrinkThumb}" 
                             alt="${cocktail.strDrink}"
                             onerror="Utils.handleImageError(this)">
                    </div>
                    
                    <div class="detail-info">
                        <div class="detail-header">
                            <h1>${cocktail.strDrink}</h1>
                            <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                                    data-cocktail-id="${cocktail.idDrink}"
                                    title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                                ${isFavorite ? '❤️' : '🤍'}
                            </button>
                        </div>
                        
                        <div class="category">
                            ${cocktail.strCategory || 'Unknown Category'}
                        </div>
                        
                        ${tags.length > 0 ? `
                            <div class="tags">
                                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        <div class="glass-info">
                            <h3>🥃 Served in</h3>
                            <p>${cocktail.strGlass || 'Any glass'}</p>
                        </div>
                        
                        <div class="ingredients">
                            <h3>🍋 Ingredients</h3>
                            <ul>
                                ${ingredients.map(ing => `
                                    <li>
                                        <span class="ingredient-name">${ing.name}</span>
                                        <span class="ingredient-measure">${ing.measure}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="instructions">
                            <h3>📝 Instructions</h3>
                            <p>${instructions}</p>
                        </div>
                    </div>
                </div>
            `;

            // Add favorite toggle functionality
            const favoriteBtn = container.querySelector('.favorite-btn');
            favoriteBtn?.addEventListener('click', () => {
                this.toggleFavorite(cocktail, favoriteBtn);
            });

        } catch (error) {
            Utils.showError(container, error.message);
        }
    },

    // Render search results
    renderSearchResults(cocktails, container, currentPage = 1) {
        if (!cocktails || cocktails.length === 0) {
            Utils.showEmptyState(container, 'No cocktails found', 'Try adjusting your search criteria');
            return;
        }

        const itemsPerPage = CONFIG.PAGINATION.ITEMS_PER_PAGE;
        const totalPages = Math.ceil(cocktails.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageResults = cocktails.slice(startIndex, endIndex);

        const resultsHtml = pageResults.map(cocktail => {
            const isFavorite = Storage.isFavorite(cocktail.idDrink);
            return `
                <div class="cocktail-item" data-cocktail-id="${cocktail.idDrink}">
                    <img src="${cocktail.strDrinkThumb}" 
                         alt="${cocktail.strDrink}"
                         onerror="Utils.handleImageError(this)">
                    <h3>${cocktail.strDrink}</h3>
                    <p>${cocktail.strCategory || 'Unknown Category'}</p>
                    <div class="item-actions">
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                                data-cocktail-id="${cocktail.idDrink}">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <h3>Found ${cocktails.length} cocktail${cocktails.length !== 1 ? 's' : ''}</h3>
            <div class="cocktails-grid">
                ${resultsHtml}
            </div>
        `;

        // Render pagination
        this.renderPagination(totalPages, currentPage, cocktails);

        // Add click handlers for cocktail items
        container.querySelectorAll('.cocktail-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('favorite-btn')) return;
                const cocktailId = item.dataset.cocktailId;
                Navigation.showCocktailDetail(cocktailId);
            });
        });

        // Add favorite toggle handlers
        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cocktailId = btn.dataset.cocktailId;
                const cocktail = cocktails.find(c => c.idDrink === cocktailId);
                if (cocktail) {
                    this.toggleFavorite(cocktail, btn);
                }
            });
        });
    },

    // Render pagination
    renderPagination(totalPages, currentPage, cocktails) {
        const paginationContainer = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHtml = '';
        
        // Previous button
        paginationHtml += `
            <button ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="Search.handlePagination(${currentPage - 1}, ${JSON.stringify(cocktails).replace(/"/g, '&quot;')})">
                Previous
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHtml += `<button class="active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHtml += `
                    <button onclick="Search.handlePagination(${i}, ${JSON.stringify(cocktails).replace(/"/g, '&quot;')})">
                        ${i}
                    </button>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHtml += '<span>...</span>';
            }
        }

        // Next button
        paginationHtml += `
            <button ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="Search.handlePagination(${currentPage + 1}, ${JSON.stringify(cocktails).replace(/"/g, '&quot;')})">
                Next
            </button>
        `;

        paginationContainer.innerHTML = paginationHtml;
    },

    // Render favorites page
    renderFavorites(container) {
        const favorites = Storage.getFavorites();
        
        if (favorites.length === 0) {
            Utils.showEmptyState(
                container, 
                'No favorites yet', 
                'Start exploring cocktails and add them to your favorites!'
            );
            return;
        }

        const favoritesHtml = favorites.map(cocktail => `
            <div class="cocktail-item" data-cocktail-id="${cocktail.idDrink}">
                <img src="${cocktail.strDrinkThumb}" 
                     alt="${cocktail.strDrink}"
                     onerror="Utils.handleImageError(this)">
                <h3>${cocktail.strDrink}</h3>
                <p>${cocktail.strCategory || 'Unknown Category'}</p>
                <p class="date-added">Added: ${new Date(cocktail.dateAdded).toLocaleDateString()}</p>
                <div class="item-actions">
                    <button class="favorite-btn active" data-cocktail-id="${cocktail.idDrink}">
                        ❤️
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="favorites-header">
                <h3>Your ${favorites.length} Favorite Cocktail${favorites.length !== 1 ? 's' : ''}</h3>
                <button class="btn btn-secondary" id="clear-favorites-btn">Clear All Favorites</button>
            </div>
            <div class="cocktails-grid">
                ${favoritesHtml}
            </div>
        `;

        // Add event listeners
        container.querySelectorAll('.cocktail-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('favorite-btn')) return;
                const cocktailId = item.dataset.cocktailId;
                Navigation.showCocktailDetail(cocktailId);
            });
        });

        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cocktailId = btn.dataset.cocktailId;
                const cocktail = favorites.find(c => c.idDrink === cocktailId);
                if (cocktail) {
                    this.toggleFavorite(cocktail, btn);
                    // Refresh favorites page
                    setTimeout(() => this.renderFavorites(container), 100);
                }
            });
        });

        // Clear all favorites button
        const clearBtn = container.querySelector('#clear-favorites-btn');
        clearBtn?.addEventListener('click', () => {
            if (confirm('Are you sure you want to remove all favorites?')) {
                Storage.clearFavorites();
                this.renderFavorites(container);
            }
        });
    },

    // Toggle favorite status
    toggleFavorite(cocktail, button) {
        const cocktailId = cocktail.idDrink;
        const isCurrentlyFavorite = Storage.isFavorite(cocktailId);

        if (isCurrentlyFavorite) {
            if (Storage.removeFromFavorites(cocktailId)) {
                button.classList.remove('active');
                button.innerHTML = '🤍';
                button.title = 'Add to favorites';
                this.showToast('Removed from favorites');
            }
        } else {
            if (Storage.addToFavorites(cocktail)) {
                button.classList.add('active');
                button.innerHTML = '❤️';
                button.title = 'Remove from favorites';
                this.showToast('Added to favorites');
            }
        }
    },

    // Show toast notification
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out;
        `;

        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    },

    // Populate select dropdowns for advanced search
    async populateSelects() {
        try {
            // Populate categories
            const categories = await API.getCategories();
            const categorySelect = document.getElementById('category');
            if (categorySelect && categories.length > 0) {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            }

            // Populate glasses
            const glasses = await API.getGlasses();
            const glassSelect = document.getElementById('glass');
            if (glassSelect && glasses.length > 0) {
                glasses.forEach(glass => {
                    const option = document.createElement('option');
                    option.value = glass;
                    option.textContent = glass;
                    glassSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.warn('Could not populate select options:', error);
        }
    }
};