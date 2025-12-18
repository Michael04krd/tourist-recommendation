const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS для разработки
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// API: все направления
app.get('/api/destinations', async (req, res) => {
    try {
        const data = await fs.readFile('destinations.json', 'utf8');
        const destinations = JSON.parse(data);
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки направлений' });
    }
});

app.post('/api/recommendations', async (req, res) => {
    try {
        const userProfile = req.body;
        const data = await fs.readFile('destinations.json', 'utf8');
        const destinations = JSON.parse(data);
        
        const recommendations = destinations.map(destination => {
            let score = 0;
            
            // Климат (30 баллов)
            if (userProfile.preferredClimate === 'any' || userProfile.preferredClimate === destination.climate) {
                score += 30;
            }
            
            // Бюджет (25 баллов)
            if (userProfile.budgetLevel === destination.budgetLevel) {
                score += 25;
            }
            
            // Тип отдыха (25 баллов)
            if (destination.travelTypes.includes(userProfile.travelType)) {
                score += 25;
            }
            
            // Интересы (20 баллов) - если есть совпадения
            if (userProfile.interests && userProfile.interests.length > 0) {
                // Простая логика: если есть хоть какие-то интересы, даём базовые баллы
                score += 10;
                
                // Дополнительные баллы за культурные интересы для культурных направлений
                if (userProfile.interests.includes('history') && destination.travelTypes.includes('culture')) {
                    score += 10;
                }
            }
            
            return {
                ...destination,
                relevanceScore: Math.min(100, score)
            };
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5); // Теперь показываем топ-5 вместо топ-3
        
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка формирования рекомендаций' });
    }
});

// Запуск
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});