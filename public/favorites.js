// DOM элементы
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const favoritesContent = document.getElementById('favorites-content');
const favoritesGrid = document.getElementById('favorites-grid');
const favoritesCount = document.getElementById('favorites-count');
const countriesCount = document.getElementById('countries-count');
const climatesCount = document.getElementById('climates-count');
const budgetsCount = document.getElementById('budgets-count');

// Загрузить избранное
async function loadFavorites() {
    try {
        const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (favoriteIds.length === 0) {
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        const response = await fetch('http://localhost:3000/api/destinations');
        const allDestinations = await response.json();
        const favoriteDestinations = allDestinations.filter(dest => favoriteIds.includes(dest.id));
        
        displayFavorites(favoriteDestinations);
        updateStatistics(favoriteDestinations);
        
        loadingState.classList.add('hidden');
        favoritesContent.classList.remove('hidden');
        
    } catch (error) {
        console.error('Ошибка:', error);
        loadingState.innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-600 mb-4">Ошибка загрузки</p>
                <button onclick="loadFavorites()" class="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Попробовать снова
                </button>
            </div>
        `;
    }
}

// Показать избранное
function displayFavorites(destinations) {
    favoritesCount.textContent = destinations.length;
    
    favoritesGrid.innerHTML = destinations.map(dest => `
        <div class="bg-white rounded-xl shadow p-4">
            <div class="flex justify-between items-start mb-3">
                <h3 class="font-bold text-gray-800">${dest.name}</h3>
                <button onclick="removeFromFavorites(${dest.id})" class="text-gray-400 hover:text-red-500">
                    ×
                </button>
            </div>
            
            <p class="text-gray-600 text-sm mb-3">${dest.country}</p>
            
            <div class="space-y-2 mb-3">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Климат:</span>
                    <span class="font-medium">${getClimateText(dest.climate)}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Бюджет:</span>
                    <span class="font-medium">${getBudgetText(dest.budgetLevel)}</span>
                </div>
            </div>
            
            <p class="text-gray-700 text-sm mb-4">${dest.description}</p>
            
            <div class="flex gap-2">
                <button onclick="showDestinationDetails(${dest.id})" class="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    Подробнее
                </button>
            </div>
        </div>
    `).join('');
}

// Обновить статистику
function updateStatistics(destinations) {
    const countries = [...new Set(destinations.map(dest => dest.country))];
    const climates = [...new Set(destinations.map(dest => dest.climate))];
    const budgets = [...new Set(destinations.map(dest => dest.budgetLevel))];
    
    countriesCount.textContent = countries.length;
    climatesCount.textContent = climates.length;
    budgetsCount.textContent = budgets.length;
}

// Удалить из избранного
function removeFromFavorites(destinationId) {
    try {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites = favorites.filter(id => id !== destinationId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites();
        showNotification('Удалено из избранного');
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Показать детали
async function showDestinationDetails(destinationId) {
    try {
        const response = await fetch('http://localhost:3000/api/destinations');
        const destinations = await response.json();
        const destination = destinations.find(dest => dest.id === destinationId);
        
        if (!destination) return;
        
        const modalBody = document.getElementById('modal-body');
        const modalTitle = document.getElementById('modal-title');
        
        modalTitle.textContent = destination.name;
        modalBody.innerHTML = `
            <div class="space-y-4">
                <div>
                    <p class="text-sm text-gray-500">Страна</p>
                    <p class="font-medium">${destination.country}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Климат</p>
                    <p class="font-medium">${getClimateText(destination.climate)}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Бюджет</p>
                    <p class="font-medium">${getBudgetText(destination.budgetLevel)}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Типы отдыха</p>
                    <div class="flex flex-wrap gap-2 mt-1">
                        ${destination.travelTypes.map(type => 
                            `<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">${getTravelTypeText(type)}</span>`
                        ).join('')}
                    </div>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Описание</p>
                    <p class="text-gray-700">${destination.description}</p>
                </div>
            </div>
        `;
        
        document.getElementById('details-modal').style.display = 'flex';
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Закрыть модальное окно
function closeModal() {
    document.getElementById('details-modal').style.display = 'none';
}

// Экспорт
function exportFavorites() {
    alert('Экспорт списка (в разработке)');
}

// Очистить всё
function clearAllFavorites() {
    if (confirm('Удалить всё избранное?')) {
        localStorage.removeItem('favorites');
        loadFavorites();
    }
}

// Вспомогательные функции
function getClimateText(climate) {
    const map = { hot: 'Жаркий', moderate: 'Умеренный', cold: 'Холодный' };
    return map[climate] || climate;
}

function getBudgetText(budget) {
    const map = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
    return map[budget] || budget;
}

function getTravelTypeText(type) {
    const map = { beach: 'Пляжный', city: 'Городской', mountains: 'Горный', culture: 'Культурный' };
    return map[type] || type;
}

// Уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-6 right-6 z-50 max-w-sm rounded-lg shadow-lg border-l-4 border-blue-500 p-4 bg-white';
    notification.innerHTML = `
        <div class="flex items-start">
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Инициализация
document.addEventListener('DOMContentLoaded', loadFavorites);