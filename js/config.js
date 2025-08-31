// API Configuration
const CONFIG = {
    API: {
        BASE_URL: 'https://www.thecocktaildb.com/api/json/v1/1',
        ENDPOINTS: {
            RANDOM: '/random.php',
            LOOKUP: '/lookup.php',
            SEARCH_BY_NAME: '/search.php',
            SEARCH_BY_INGREDIENT: '/filter.php',
            LIST_CATEGORIES: '/list.php?c=list',
            LIST_GLASSES: '/list.php?g=list',
            LIST_INGREDIENTS: '/list.php?i=list'
        }
    },
    PAGINATION: {
        ITEMS_PER_PAGE: 10
    },
    STORAGE: {
        FAVORITES_KEY: 'cocktail_favorites',
        SEARCH_HISTORY_KEY: 'cocktail_search_history'
    },
    UI: {
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 500
    }
};