// Данные чат-бота
const chatData = {
    questions: [
        {
            id: 1,
            text: "Какой климат вы предпочитаете?",
            options: [
                { text: "Жаркий", value: "hot" },
                { text: "Умеренный", value: "moderate" },
                { text: "Холодный", value: "cold" },
                { text: "Любой", value: "any" }
            ],
            field: "preferredClimate"
        },
        {
            id: 2,
            text: "Какой у вас бюджет?",
            options: [
                { text: "Низкий", value: "low" },
                { text: "Средний", value: "medium" },
                { text: "Высокий", value: "high" }
            ],
            field: "budgetLevel"
        },
        {
            id: 3,
            text: "Какой тип отдыха вам интересен?",
            options: [
                { text: "Пляжный", value: "beach" },
                { text: "Городской", value: "city" },
                { text: "Горный", value: "mountains" },
                { text: "Культурный", value: "culture" }
            ],
            field: "travelType"
        },
        {
            id: 4,
            text: "На сколько дней планируете поездку?",
            options: [
                { text: "3-5 дней", value: 5 },
                { text: "7-10 дней", value: 10 },
                { text: "2 недели", value: 14 },
                { text: "Месяц", value: 30 }
            ],
            field: "tripDuration"
        },
        {
            id: 5,
            text: "Выберите ваши интересы (можно несколько):",
            options: [
                { text: "История", value: "history" },
                { text: "Природа", value: "nature" },
                { text: "Шопинг", value: "shopping" },
                { text: "Активный отдых", value: "active" },
                { text: "Гастрономия", value: "food" },
                { text: "Музеи", value: "museums" },
                { text: "Архитектура", value: "architecture" }
            ],
            field: "interests",
            multiple: true
        }
    ],
    
    currentStep: 0,
    userProfile: {
        preferredClimate: '',
        budgetLevel: '',
        travelType: '',
        tripDuration: 7,
        interests: []
    },
    selectedInterests: []
};

// DOM элементы
const chatMessages = document.getElementById('chat-messages');
const chatOptions = document.getElementById('chat-options');
const progressFill = document.getElementById('progress-fill');

// Добавить сообщение
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex space-x-3 ${isUser ? 'flex-row-reverse' : ''}`;
    
    messageDiv.innerHTML = `
        <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow
            ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}">
            ${isUser ? 'Вы' : 'Бот'}
        </div>
        <div class="${isUser ? 'bg-blue-600 text-white rounded-2xl rounded-br-none p-4 max-w-[80%]' : 'bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 max-w-[80%]'}">
            <p>${text}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Показать варианты
function showOptions() {
    const question = chatData.questions[chatData.currentStep];
    chatOptions.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200';
        button.textContent = option.text;
        
        button.onclick = () => handleAnswer(question, option);
        chatOptions.appendChild(button);
    });
}

// Обработка ответа
function handleAnswer(question, option) {
    addMessage(option.text, true);
    
    if (question.multiple) {
        const index = chatData.selectedInterests.indexOf(option.value);
        if (index === -1) {
            chatData.selectedInterests.push(option.value);
        } else {
            chatData.selectedInterests.splice(index, 1);
        }
        
        updateFinishButton();
    } else {
        chatData.userProfile[question.field] = option.value;
        nextQuestion();
    }
}

// Кнопка завершения для множественного выбора
function updateFinishButton() {
    const question = chatData.questions[chatData.currentStep];
    chatOptions.innerHTML = '';
    
    if (chatData.selectedInterests.length > 0) {
        const finishBtn = document.createElement('button');
        finishBtn.className = 'w-full py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors';
        finishBtn.textContent = `Завершить выбор (${chatData.selectedInterests.length})`;
        
        finishBtn.onclick = () => {
            chatData.userProfile[question.field] = [...chatData.selectedInterests];
            chatData.selectedInterests = [];
            nextQuestion();
        };
        
        chatOptions.appendChild(finishBtn);
    }
    
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'space-y-3 mt-4';
    chatData.questions[chatData.currentStep].options.forEach(option => {
        const isSelected = chatData.selectedInterests.includes(option.value);
        const button = document.createElement('button');
        button.className = `w-full text-left p-3 rounded-lg border transition-all duration-200
                          ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`;
        button.textContent = option.text;
        button.onclick = () => handleAnswer(chatData.questions[chatData.currentStep], option);
        optionsDiv.appendChild(button);
    });
    
    chatOptions.appendChild(optionsDiv);
}

// Следующий вопрос
function nextQuestion() {
    chatData.currentStep++;
    
    if (chatData.currentStep < chatData.questions.length) {
        setTimeout(() => {
            const question = chatData.questions[chatData.currentStep];
            addMessage(question.text);
            showOptions();
            updateProgress();
        }, 800);
    } else {
        setTimeout(() => {
            addMessage("Собираю ваши предпочтения...");
            showFinalButton();
        }, 1000);
    }
}

// Финальная кнопка
function showFinalButton() {
    setTimeout(() => {
        chatOptions.innerHTML = '';
        
        const button = document.createElement('button');
        button.className = 'w-full py-5 text-lg bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors';
        button.textContent = 'Найти рекомендации';
        
        button.onclick = async () => {
            await saveProfileAndRedirect();
        };
        
        chatOptions.appendChild(button);
    }, 1500);
}

// Обновить прогресс
function updateProgress() {
    const progress = ((chatData.currentStep + 1) / chatData.questions.length) * 100;
    progressFill.style.width = `${progress}%`;
}

// Сохранить и перейти
async function saveProfileAndRedirect() {
    try {
        localStorage.setItem('userProfile', JSON.stringify(chatData.userProfile));
        
        const response = await fetch('http://localhost:3000/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatData.userProfile)
        });
        
        if (response.ok) {
            const recommendations = await response.json();
            localStorage.setItem('recommendations', JSON.stringify(recommendations));
            window.location.href = 'recommendations.html';
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage("Ошибка. Попробуйте ещё раз.");
    }
}

// Инициализация
function initChatBot() {
    setTimeout(() => {
        const firstQuestion = chatData.questions[0];
        addMessage(firstQuestion.text);
        showOptions();
        updateProgress();
    }, 500);
}

// Запуск
document.addEventListener('DOMContentLoaded', initChatBot);