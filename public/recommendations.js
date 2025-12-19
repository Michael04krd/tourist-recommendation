const profileDetails = document.getElementById('profile-details');
const recommendationsList = document.getElementById('recommendations-list');
let relevanceChart = null;

// Загрузить профиль
function loadUserProfile() {
    const profileJSON = localStorage.getItem('userProfile');
    if (!profileJSON) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(profileJSON);
}

// Показать профиль
function displayUserProfile(profile) {
    const climateMap = { hot: 'Жаркий', moderate: 'Умеренный', cold: 'Холодный', any: 'Любой' };
    const budgetMap = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
    const travelMap = { beach: 'Пляжный', city: 'Городской', mountains: 'Горный', culture: 'Культурный' };
    
    profileDetails.innerHTML = `
        <div class="space-y-3">
            <div class="flex justify-between">
                <span class="text-gray-600">Климат:</span>
                <span class="font-medium">${climateMap[profile.preferredClimate] || 'Не выбран'}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Бюджет:</span>
                <span class="font-medium">${budgetMap[profile.budgetLevel] || 'Не выбран'}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Тип отдыха:</span>
                <span class="font-medium">${travelMap[profile.travelType] || 'Не выбран'}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Длительность:</span>
                <span class="font-medium">${profile.tripDuration} дней</span>
            </div>
        </div>
    `;
}

// Загрузить рекомендации
async function loadRecommendations() {
    try {
        const profile = loadUserProfile();
        if (!profile) return;
        
        recommendationsList.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gray-600">Поиск направлений...</p>
            </div>
        `;
        
        const response = await fetch('http://localhost:3000/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });
        
        const recommendations = await response.json();
        localStorage.setItem('recommendations', JSON.stringify(recommendations));
        displayRecommendations(recommendations);
        createChart(recommendations);
        
    } catch (error) {
        console.error('Ошибка:', error);
        recommendationsList.innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-600">Ошибка загрузки</p>
                <button onclick="loadRecommendations()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Попробовать снова
                </button>
            </div>
        `;
    }
}

// Показать рекомендации
function displayRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
        recommendationsList.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-800 mb-2">Подходящих направлений не найдено</p>
                <button onclick="window.location.href='index.html'" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Изменить профиль
                </button>
            </div>
        `;
        return;
    }
    
    recommendationsList.innerHTML = recommendations.map((dest, index) => `
        <div class="bg-white rounded-xl shadow p-6 mb-4">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="font-bold text-lg text-gray-800">${dest.name}</h3>
                    <p class="text-gray-600">${dest.country}</p>
                </div>
                <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    #${index + 1}
                </span>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-sm text-gray-500">Климат</p>
                    <p class="font-medium">${getClimateText(dest.climate)}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Бюджет</p>
                    <p class="font-medium">${getBudgetText(dest.budgetLevel)}</p>
                </div>
            </div>
            
            <p class="text-gray-700 mb-4">${dest.description}</p>
            
            <div class="mb-4">
                <p class="text-sm text-gray-500 mb-1">Типы отдыха</p>
                <div class="flex flex-wrap gap-2">
                    ${dest.travelTypes.map(type => 
                        `<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">${getTravelTypeText(type)}</span>`
                    ).join('')}
                </div>
            </div>
            
            <div class="mb-6">
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">Релевантность</span>
                    <span class="font-bold">${dest.relevanceScore || 0}%</span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-600" style="width: ${dest.relevanceScore || 0}%"></div>
                </div>
            </div>
            
            <div class="flex gap-3">
                <button onclick="addToFavorites(${dest.id})" class="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    В избранное
                </button>
                <button onclick="showDetails(${dest.id})" class="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Подробнее
                </button>
            </div>
        </div>
    `).join('');
}

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

function createChart(recommendations) {
    const ctx = document.getElementById('relevanceChart')?.getContext('2d');
    if (!ctx) return;
    
    if (relevanceChart) relevanceChart.destroy();
    
    const labels = recommendations.map(dest => dest.name);
    const scores = recommendations.map(dest => dest.relevanceScore || 0);
    
    relevanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Релевантность, %',
                data: scores,
                backgroundColor: '#3b82f6',
                borderColor: '#1d4ed8',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function addToFavorites(destinationId) {
    try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (!favorites.includes(destinationId)) {
            favorites.push(destinationId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            showNotification('Добавлено в избранное');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

function showDetails(destinationId) {
    alert('Детальная информация (в разработке)');
}

function clearProfile() {
    if (confirm('Очистить профиль?')) {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('recommendations');
        window.location.href = 'index.html';
    }
}

// Уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-6 right-6 z-50 max-w-sm rounded-lg shadow-lg border-l-4 border-green-500 p-4 bg-white';
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
document.addEventListener('DOMContentLoaded', function() {
    const profile = loadUserProfile();
    if (profile) {
        displayUserProfile(profile);
        loadRecommendations();
    }
});
