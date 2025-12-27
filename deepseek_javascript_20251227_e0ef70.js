// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Константы
const COMMISSION_RATE = 0.05; // 5% комиссия

// Состояние приложения
let appState = {
    user: null,
    balance: 1000,
    currentCase: null,
    cases: [],
    transactions: [],
    userStats: {
        opened: 0,
        won: 0,
        added: 0
    }
};

// Инициализация приложения
function initApp() {
    // Раскрываем приложение на весь экран
    tg.expand();
    
    // Получаем данные пользователя
    const userData = tg.initDataUnsafe?.user;
    if (userData) {
        appState.user = {
            id: userData.id,
            firstName: userData.first_name || 'Пользователь',
            lastName: userData.last_name || '',
            username: userData.username || '',
            photoUrl: userData.photo_url
        };
        
        // Обновляем профиль
        updateProfileInfo();
    }
    
    // Загружаем данные
    loadData();
    
    // Настраиваем тему
    setupTheme();
    
    // Настраиваем кнопки Telegram
    setupTelegramButtons();
    
    // Загружаем кейсы
    loadCases();
    
    // Загружаем транзакции
    loadTransactions();
}

// Настройка темы
function setupTheme() {
    const isDark = tg.colorScheme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    
    tg.setHeaderColor(isDark ? 'secondary_bg_color' : 'bg_color');
    tg.setBackgroundColor(isDark ? '#0f172a' : '#ffffff');
}

// Настройка кнопок Telegram
function setupTelegramButtons() {
    tg.MainButton.setParams({
        text_color: '#ffffff',
        color: tg.themeParams.button_color || '#6366f1'
    });
    
    tg.BackButton.onClick(() => {
        if (document.getElementById('open-section').style.display !== 'none') {
            closeCaseView();
        } else if (document.getElementById('result-section').style.display !== 'none') {
            closeResultView();
        } else if (document.getElementById('add-gift-section').style.display !== 'none') {
            closeAddGift();
        }
    });
}

// Загрузка данных
function loadData() {
    // Загружаем из localStorage или используем дефолтные значения
    const savedData = localStorage.getItem('giftbox_app_data');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        appState.balance = parsed.balance || 1000;
        appState.cases = parsed.cases || getDefaultCases();
        appState.transactions = parsed.transactions || [];
        appState.userStats = parsed.userStats || { opened: 0, won: 0, added: 0 };
    } else {
        appState.cases = getDefaultCases();
    }
    
    updateUI();
}

// Сохранение данных
function saveData() {
    const data = {
        balance: appState.balance,
        cases: appState.cases,
        transactions: appState.transactions,
        userStats: appState.userStats,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('giftbox_app_data', JSON.stringify(data));
}

// Получение дефолтных кейсов
function getDefaultCases() {
    return [
        {
            id: 1,
            name: "🎮 Игровой кейс",
            description: "Кейс с игровыми подарками и техникой",
            price: 100,
            color: "#ff6b6b",
            participants: 15,
            gifts: [
                { id: 1, name: "PlayStation 5", value: 500, description: "Игровая консоль", donor: "Иван И.", donorId: 123 },
                { id: 2, name: "Nintendo Switch", value: 300, description: "Портативная консоль", donor: "Анна С.", donorId: 456 },
                { id: 3, name: "Игровая мышь", value: 50, description: "Профессиональная игровая мышь", donor: "Петр К.", donorId: 789 }
            ]
        },
        {
            id: 2,
            name: "📱 Техника",
            description: "Кейс с современной техникой",
            price: 250,
            color: "#4ecdc4",
            participants: 8,
            gifts: [
                { id: 4, name: "AirPods Pro", value: 200, description: "Беспроводные наушники", donor: "Мария Л.", donorId: 321 },
                { id: 5, name: "Умные часы", value: 150, description: "Смарт-часы с функциями", donor: "Алексей В.", donorId: 654 }
            ]
        },
        {
            id: 3,
            name: "💎 Премиум",
            description: "Эксклюзивные дорогие подарки",
            price: 500,
            color: "#45b7d1",
            participants: 5,
            gifts: [
                { id: 6, name: "MacBook Air", value: 1000, description: "Ноутбук Apple", donor: "Сергей М.", donorId: 987 },
                { id: 7, name: "Фотоаппарат", value: 800, description: "Зеркальная камера", donor: "Ольга П.", donorId: 246 }
            ]
        }
    ];
}

// Обновление UI
function updateUI() {
    // Обновляем баланс
    document.getElementById('user-balance').textContent = `${appState.balance} ₽`;
    document.getElementById('profile-balance').textContent = `${appState.balance} ₽`;
    
    // Обновляем статистику
    document.getElementById('stats-opened').textContent = appState.userStats.opened;
    document.getElementById('stats-won').textContent = appState.userStats.won;
    document.getElementById('stats-added').textContent = appState.userStats.added;
    
    document.getElementById('profile-opened').textContent = `${appState.userStats.opened} кейсов`;
    document.getElementById('profile-won').textContent = `${appState.userStats.won} подарков`;
    document.getElementById('profile-added').textContent = `${appState.userStats.added} подарков`;
}

// Обновление профиля
function updateProfileInfo() {
    if (appState.user) {
        const profileName = document.getElementById('profile-name');
        const profileAvatar = document.getElementById('profile-avatar');
        
        const fullName = `${appState.user.firstName} ${appState.user.lastName}`.trim();
        profileName.textContent = fullName || 'Пользователь Telegram';
        
        // Создаём аватар с инициалами
        const initials = (appState.user.firstName[0] || '') + (appState.user.lastName[0] || '');
        profileAvatar.textContent = initials || 'TG';
        
        if (appState.user.photoUrl) {
            profileAvatar.style.backgroundImage = `url(${appState.user.photoUrl})`;
            profileAvatar.style.backgroundSize = 'cover';
            profileAvatar.style.backgroundPosition = 'center';
        }
    }
}

// Загрузка кейсов
function loadCases() {
    const container = document.getElementById('cases-container');
    container.innerHTML = '';
    
    appState.cases.forEach(caseItem => {
        const caseElement = document.createElement('div');
        caseElement.className = 'case-card';
        caseElement.style.setProperty('--case-color', caseItem.color);
        caseElement.onclick = () => openCaseView(caseItem);
        
        caseElement.innerHTML = `
            <div class="case-header">
                <h3 class="case-name">${caseItem.name}</h3>
                <div class="case-price">${caseItem.price} ₽</div>
            </div>
            <p class="case-description">${caseItem.description}</p>
            <div class="case-stats">
                <span><i class="fas fa-users"></i> ${caseItem.participants} участников</span>
                <span><i class="fas fa-gifts"></i> ${caseItem.gifts.length} подарков</span>
            </div>
        `;
        
        container.appendChild(caseElement);
    });
}

// Просмотр кейса
function openCaseView(caseItem) {
    appState.currentCase = caseItem;
    
    // Скрываем список кейсов
    document.querySelector('.cases-section').style.display = 'none';
    
    // Показываем детали кейса
    const openSection = document.getElementById('open-section');
    openSection.style.display = 'block';
    
    // Заполняем информацию
    document.getElementById('case-title').textContent = caseItem.name;
    document.getElementById('case-description').textContent = caseItem.description;
    document.getElementById('case-price').textContent = `${caseItem.price} ₽`;
    document.getElementById('open-price').textContent = caseItem.price;
    document.getElementById('case-participants').textContent = caseItem.participants;
    document.getElementById('case-gifts-count').textContent = caseItem.gifts.length;
    
    // Устанавливаем цвет
    const caseImage = document.getElementById('case-image');
    caseImage.style.background = `linear-gradient(135deg, ${caseItem.color}, ${adjustColor(caseItem.color, -20)})`;
    
    // Загружаем подарки
    loadCaseGifts(caseItem);
    
    // Показываем кнопку назад в Telegram
    tg.BackButton.show();
}

// Закрыть просмотр кейса
function closeCaseView() {
    document.querySelector('.cases-section').style.display = 'block';
    document.getElementById('open-section').style.display = 'none';
    appState.currentCase = null;
    tg.BackButton.hide();
}

// Загрузка подарков кейса
function loadCaseGifts(caseItem) {
    const container = document.getElementById('case-gifts');
    container.innerHTML = '';
    
    caseItem.gifts.forEach(gift => {
        const giftElement = document.createElement('div');
        giftElement.className = 'gift-item';
        
        giftElement.innerHTML = `
            <div class="gift-header">
                <h4 class="gift-name">${gift.name}</h4>
                <div class="gift-value">${gift.value} ₽</div>
            </div>
            <p class="gift-description">${gift.description}</p>
            <div class="gift-donor">
                <i class="fas fa-user-circle"></i> ${gift.donor}
            </div>
        `;
        
        container.appendChild(giftElement);
    });
}

// Открытие кейса (розыгрыш)
function openCase() {
    const caseItem = appState.currentCase;
    if (!caseItem) return;
    
    // Проверяем баланс
    if (appState.balance < caseItem.price) {
        showNotification('Недостаточно средств!', 'error');
        return;
    }
    
    // Проверяем, есть ли подарки
    if (caseItem.gifts.length === 0) {
        showNotification('В кейсе нет подарков!', 'error');
        return;
    }
    
    // Спишем средства
    const commission = Math.round(caseItem.price * COMMISSION_RATE);
    const totalCost = caseItem.price + commission;
    
    appState.balance -= totalCost;
    updateUI();
    
    // Добавляем транзакцию
    addTransaction('Открытие кейса', -totalCost, `Кейс: ${caseItem.name}`);
    
    // Обновляем статистику
    appState.userStats.opened++;
    updateUI();
    
    // Скрываем кейс
    document.getElementById('open-section').style.display = 'none';
    
    // Показываем анимацию
    showResultAnimation(caseItem);
    
    saveData();
}

// Показать анимацию результата
function showResultAnimation(caseItem) {
    const resultSection = document.getElementById('result-section');
    const spinner = document.getElementById('spinner');
    const prizeResult = document.getElementById('prize-result');
    
    resultSection.style.display = 'block';
    spinner.style.display = 'block';
    prizeResult.style.display = 'none';
    
    // Запускаем анимацию
    setTimeout(() => {
        // Выбираем случайный подарок
        const randomIndex = Math.floor(Math.random() * caseItem.gifts.length);
        const prize = caseItem.gifts[randomIndex];
        
        // Скрываем спиннер, показываем результат
        spinner.style.display = 'none';
        prizeResult.style.display = 'block';
        
        // Обновляем информацию о призе
        document.getElementById('prize-name').textContent = prize.name;
        document.getElementById('prize-value').textContent = `${prize.value} ₽`;
        document.getElementById('prize-donor').textContent = `Добавил: ${prize.donor}`;
        
        // Проверяем, является ли приз пользователя своим собственным подарком
        const isOwnGift = prize.donorId === appState.user?.id;
        
        if (isOwnGift) {
            // Пользователь выиграл свой подарок
            document.getElementById('claim-btn').innerHTML = '<i class="fas fa-check-circle"></i> Забрать свой подарок обратно';
            document.getElementById('claim-btn').onclick = () => claimOwnPrize(prize);
        } else {
            // Пользователь выиграл чужой подарок
            document.getElementById('claim-btn').innerHTML = '<i class="fas fa-check-circle"></i> Забрать приз';
            document.getElementById('claim-btn').onclick = () => claimPrize(prize, caseItem);
            
            // Вычитаем стоимость у дарителя (если он в системе)
            deductFromDonor(prize);
        }
        
        // Обновляем статистику
        if (!isOwnGift) {
            appState.userStats.won++;
        }
        updateUI();
        
        tg.BackButton.show();
    }, 3000); // 3 секунды анимации
}

// Забрать приз
function claimPrize(prize, caseItem) {
    // Добавляем стоимость приза к балансу
    appState.balance += prize.value;
    
    // Добавляем транзакцию
    addTransaction('Выигрыш подарка', prize.value, prize.name);
    
    // Удаляем подарок из кейса
    const caseIndex = appState.cases.findIndex(c => c.id === caseItem.id);
    if (caseIndex !== -1) {
        const giftIndex = appState.cases[caseIndex].gifts.findIndex(g => g.id === prize.id);
        if (giftIndex !== -1) {
            appState.cases[caseIndex].gifts.splice(giftIndex, 1);
        }
    }
    
    showNotification(`Поздравляем! Вы выиграли ${prize.name}`, 'success');
    closeResultView();
    saveData();
}

// Забрать свой подарок обратно
function claimOwnPrize(prize) {
    showNotification('Вы забрали свой подарок обратно', 'info');
    closeResultView();
}

// Вычет у дарителя
function deductFromDonor(prize) {
    // В реальном приложении здесь был бы запрос к серверу
    // Для демо просто показываем уведомление
    showNotification(`У пользователя ${prize.donor} списано ${prize.value} ₽`, 'info');
}

// Закрыть результат
function closeResultView() {
    document.getElementById('result-section').style.display = 'none';
    document.querySelector('.cases-section').style.display = 'block';
    tg.BackButton.hide();
}

// Попробовать ещё раз
function tryAgain() {
    closeResultView();
    if (appState.currentCase) {
        openCaseView(appState.currentCase);
    }
}

// Показать секцию добавления подарка
function addGiftToCase() {
    document.getElementById('open-section').style.display = 'none';
    document.getElementById('add-gift-section').style.display = 'block';
    
    // Сбрасываем форму
    document.getElementById('gift-name').value = '';
    document.getElementById('gift-value').value = '';
    document.getElementById('gift-description').value = '';
    updateGiftCalculation();
    
    tg.BackButton.show();
}

// Обновление расчета подарка
function updateGiftCalculation() {
    const giftValue = parseFloat(document.getElementById('gift-value').value) || 0;
    const commission = Math.round(giftValue * COMMISSION_RATE);
    const total = giftValue + commission;
    
    document.getElementById('display-gift-value').textContent = `${giftValue} ₽`;
    document.getElementById('display-commission').textContent = `${commission} ₽`;
    document.getElementById('display-total').textContent = `${total} ₽`;
    document.getElementById('add-gift-total').textContent = total;
}

// Добавить подарок
function addGift() {
    const name = document.getElementById('gift-name').value.trim();
    const value = parseFloat(document.getElementById('gift-value').value);
    const description = document.getElementById('gift-description').value.trim();
    
    // Валидация
    if (!name) {
        showNotification('Введите название подарка', 'error');
        return;
    }
    
    if (!value || value < 10) {
        showNotification('Минимальная стоимость 10 ₽', 'error');
        return;
    }
    
    if (!description) {
        showNotification('Введите описание подарка', 'error');
        return;
    }
    
    // Расчет комиссии
    const commission = Math.round(value * COMMISSION_RATE);
    const totalCost = value + commission;
    
    // Проверка баланса
    if (appState.balance < totalCost) {
        showNotification('Недостаточно средств!', 'error');
        return;
    }
    
    // Создаем подарок
    const newGift = {
        id: Date.now(),
        name,
        value,
        description,
        donor: appState.user ? `${appState.user.firstName} ${appState.user.lastName[0]}.` : 'Аноним',
        donorId: appState.user?.id || 0
    };
    
    // Добавляем подарок в текущий кейс
    if (appState.currentCase) {
        appState.currentCase.gifts.push(newGift);
        appState.cases = appState.cases.map(c => 
            c.id === appState.currentCase.id ? appState.currentCase : c
        );
    }
    
    // Списываем средства
    appState.balance -= totalCost;
    
    // Добавляем транзакцию
    addTransaction('Добавление подарка', -totalCost, name);
    
    // Обновляем статистику
    appState.userStats.added++;
    
    // Обновляем UI и сохраняем
    updateUI();
    saveData();
    
    showNotification('Подарок успешно добавлен!', 'success');
    closeAddGift();
}

// Закрыть секцию добавления подарка
function closeAddGift() {
    document.getElementById('add-gift-section').style.display = 'none';
    if (appState.currentCase) {
        openCaseView(appState.currentCase);
    } else {
        document.querySelector('.cases-section').style.display = 'block';
        tg.BackButton.hide();
    }
}

// Добавление транзакции
function addTransaction(type, amount, description) {
    const transaction = {
        id: Date.now(),
        type,
        amount,
        description,
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    appState.transactions.unshift(transaction);
    
    // Ограничиваем историю последними 50 транзакциями
    if (appState.transactions.length > 50) {
        appState.transactions = appState.transactions.slice(0, 50);
    }
    
    updateUI();
}

// Показать транзакции
function showTransactions() {
    const modal = document.getElementById('transactions-modal');
    const list = document.getElementById('transactions-list');
    
    list.innerHTML = '';
    
    if (appState.transactions.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Транзакций пока нет</p>';
    } else {
        appState.transactions.forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = 'transaction-item';
            
            const amountClass = transaction.amount > 0 ? 'positive' : 'negative';
            const date = new Date(transaction.date).toLocaleDateString('ru-RU');
            
            transactionElement.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-type">${transaction.type}</div>
                    <div class="transaction-date">${date} • ${transaction.description}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${transaction.amount > 0 ? '+' : ''}${transaction.amount} ₽
                </div>
            `;
            
            list.appendChild(transactionElement);
        });
    }
    
    modal.style.display = 'flex';
}

// Создать новый кейс
function createNewCase() {
    const modal = document.getElementById('create-case-modal');
    modal.style.display = 'flex';
    
    // Сброс формы
    document.getElementById('new-case-name').value = '';
    document.getElementById('new-case-price').value = '100';
    document.getElementById('new-case-description').value = '';
    document.getElementById('selected-color').value = '#ff6b6b';
    
    // Сброс выбора цвета
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector('.color-option').classList.add('selected');
}

// Выбор цвета
function selectColor(color) {
    document.getElementById('selected-color').value = color;
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.style.background === color) {
            option.classList.add('selected');
        }
    });
}

// Создание кейса
function createCase() {
    const name = document.getElementById('new-case-name').value.trim();
    const price = parseInt(document.getElementById('new-case-price').value);
    const description = document.getElementById('new-case-description').value.trim();
    const color = document.getElementById('selected-color').value;
    
    if (!name) {
        showNotification('Введите название кейса', 'error');
        return;
    }
    
    if (!price || price < 10) {
        showNotification('Минимальная цена 10 ₽', 'error');
        return;
    }
    
    const newCase = {
        id: Date.now(),
        name,
        description: description || 'Новый кейс с подарками',
        price,
        color,
        participants: 0,
        gifts: []
    };
    
    appState.cases.push(newCase);
    saveData();
    loadCases();
    
    showNotification('Кейс успешно создан!', 'success');
    closeModal('create-case-modal');
}

// Показать правила
function showRules() {
    document.getElementById('rules-modal').style.display = 'flex';
}

// Показать профиль
function showProfile() {
    document.getElementById('profile-modal').style.display = 'flex';
}

// Закрыть модальное окно
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Пополнение баланса
function depositFunds() {
    const amount = 500; // В реальном приложении здесь будет интеграция с платежной системой
    
    tg.showPopup({
        title: 'Пополнение баланса',
        message: `Пополнить баланс на ${amount} ₽?`,
        buttons: [
            { type: 'default', text: 'Отмена' },
            { type: 'ok', text: 'Пополнить' }
        ]
    }, (buttonId) => {
        if (buttonId === 'ok') {
            appState.balance += amount;
            addTransaction('Пополнение баланса', amount, 'Пополнение через Telegram');
            updateUI();
            saveData();
            showNotification('Баланс пополнен!', 'success');
        }
    });
}

// Показать уведомление
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notification-icon');
    const text = document.getElementById('notification-text');
    
    // Устанавливаем иконку в зависимости от типа
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            notification.style.background = 'var(--success-color)';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            notification.style.background = 'var(--danger-color)';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            notification.style.background = 'var(--warning-color)';
            break;
        default:
            icon.className = 'fas fa-info-circle';
            notification.style.background = 'var(--primary-color)';
    }
    
    text.textContent = message;
    notification.style.display = 'flex';
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Вспомогательная функция для изменения цвета
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Слушатели событий для динамического расчета
document.getElementById('gift-value').addEventListener('input', updateGiftCalculation);
document.getElementById('gift-value').addEventListener('change', updateGiftCalculation);

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);