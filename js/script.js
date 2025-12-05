// ============================================
// Vibe Tour - Основной JavaScript файл
// ============================================

// Глобальная переменная для хранения данных туров
let toursData = [];

// ============================================
// Загрузка данных туров из JSON файла
// ============================================
async function loadToursData() {
  try {
    const response = await fetch('data/tours.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    toursData = await response.json();
    return toursData;
  } catch (error) {
    console.error('Ошибка загрузки данных туров:', error);
    // Возвращаем пустой массив в случае ошибки
    return [];
  }
}

// ============================================
// Функция фильтрации туров
// ============================================
function filterTours(tours, filters) {
  let filtered = [...tours];

  // Фильтр по месяцу
  if (filters.month) {
    const month = parseInt(filters.month);
    filtered = filtered.filter(tour => {
      if (tour.months && Array.isArray(tour.months)) {
        return tour.months.includes(month);
      }
      return true;
    });
  }

  // Поиск по тексту
  if (filters.search && filters.search.trim() !== '') {
    const searchTerm = filters.search.toLowerCase().trim();
    filtered = filtered.filter(tour => {
      const title = (tour.title || '').toLowerCase();
      const description = (tour.description || '').toLowerCase();
      return title.includes(searchTerm) || description.includes(searchTerm);
    });
  }

  return filtered;
}

// ============================================
// Функция получения текущих фильтров
// ============================================
function getCurrentFilters() {
  const activeMonthBtn = document.querySelector('.month-btn.active');
  const currentMonth = new Date().getMonth() + 1;
  
  return {
    month: activeMonthBtn?.getAttribute('data-month') || currentMonth.toString(),
    search: document.getElementById('tourSearch')?.value || ''
  };
}

// ============================================
// Функция загрузки туров на страницу
// ============================================
async function loadTours(filters = null) {
  const tourList = document.getElementById('tour-list');
  
  if (!tourList) {
    console.warn('Элемент #tour-list не найден на странице');
    return;
  }

  // Показываем индикатор загрузки
  tourList.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Загрузка туров...</div>';

  // Загружаем данные из JSON
  const data = await loadToursData();
  
  if (data.length === 0) {
    tourList.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Туры временно недоступны</div>';
    return;
  }

  // Получаем текущие фильтры, если не переданы
  if (!filters) {
    filters = getCurrentFilters();
  }

  // Фильтруем туры
  const filteredTours = filterTours(data, filters);

  // Очищаем контейнер
  tourList.innerHTML = '';

  // Если туров не найдено
  if (filteredTours.length === 0) {
    tourList.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <p style="font-size: 1.2rem; margin-bottom: 12px; font-weight: 600;">Туры не найдены</p>
        <p style="font-size: 0.95rem; opacity: 0.8;">Попробуйте изменить параметры поиска или выбрать другой месяц</p>
      </div>
    `;
    return;
  }

  // Создаем карточки для каждого отфильтрованного тура
  filteredTours.forEach(tour => {
    const tourCard = createTourCard(tour);
    tourList.appendChild(tourCard);
  });

  // Обновляем анимации для новых карточек
  initScrollAnimations();
}

// ============================================
// Создание карточки тура
// ============================================
function createTourCard(tour) {
  const card = document.createElement('div');
  card.className = 'tour-card';
  
  // Получаем выбранный месяц
  const activeMonthBtn = document.querySelector('.month-btn.active');
  const selectedMonth = activeMonthBtn ? parseInt(activeMonthBtn.getAttribute('data-month')) : new Date().getMonth() + 1;
  
  // Получаем даты для тура
  const tourDates = getTourDates(selectedMonth);
  
  // Формируем URL для бронирования с параметром тура
  const bookingUrl = `booking.html?trip=${encodeURIComponent(tour.title)}`;

  // Проверяем наличие галереи
  const hasGallery = tour.gallery && tour.gallery.length > 0;
  const galleryImages = hasGallery ? tour.gallery : [tour.image];

  card.innerHTML = `
    <div class="tour-card__image-wrapper">
      <img src="${tour.image}" alt="${tour.title}" onerror="this.src='img/hero.jpg'" class="tour-card__main-image">
      ${hasGallery ? `
        <button class="tour-gallery-btn" data-tour-id="${tour.id}" aria-label="Открыть галерею">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
          </svg>
          <span>${galleryImages.length} фото</span>
        </button>
      ` : ''}
    </div>
    <div class="card-body">
      <h3>${tour.title}</h3>
      <p>${tour.description}</p>
      <div class="tour-dates">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>${tourDates.format}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
        <span style="color: var(--accent); font-weight: 600; font-size: 1.1rem;">${tour.price}</span>
        <span style="color: var(--text-secondary); font-size: 0.9rem;">${tour.duration}</span>
      </div>
      <div class="tour-actions" style="display: flex; gap: 12px; margin-top: 16px;">
        <button class="btn btn--primary tour-details-btn" data-tour-id="${tour.id}" style="flex: 1;">
          <span>Подробнее</span>
        </button>
        <a href="${bookingUrl}" class="btn btn--primary" style="flex: 1; text-align: center;">
          <span>Забронировать</span>
        </a>
      </div>
    </div>
  `;

  // Добавляем обработчик для кнопки "Подробнее"
  const detailsBtn = card.querySelector('.tour-details-btn');
  if (detailsBtn) {
    detailsBtn.addEventListener('click', () => {
      showTourDetails(tour);
    });
  }

  // Добавляем обработчик для кнопки галереи
  const galleryBtn = card.querySelector('.tour-gallery-btn');
  if (galleryBtn) {
    galleryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showTourGallery(tour.id);
    });
  }

  return card;
}

// ============================================
// Плавная прокрутка к секциям
// ============================================
function initSmoothScroll() {
  // Находим все ссылки с якорями
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Пропускаем пустые якоря
      if (href === '#') return;

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        
        // Плавная прокрутка
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ============================================
// Валидация формы контактов
// ============================================
function initContactForm() {
  const contactForm = document.querySelector('.contact__form');
  
  if (!contactForm) return;

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const inputs = this.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        input.style.borderColor = '#ff3860';
      } else {
        input.style.borderColor = '';
      }
    });

    if (isValid) {
      // Здесь можно добавить отправку формы
      alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
      this.reset();
    } else {
      alert('Пожалуйста, заполните все обязательные поля.');
    }
  });
}

// ============================================
// Анимация появления элементов при скролле
// ============================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Находим элементы для анимации
  const animatedElements = document.querySelectorAll(
    '.benefit-card, .tour-card, .review-card, .section-title'
  );

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ============================================
// Переключение темы
// ============================================
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  
  if (!themeToggle) return;

  // Проверяем сохраненную тему или системные настройки
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  // Применяем тему
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme, themeIcon, themeText);

  // Обработчик переключения
  themeToggle.addEventListener('click', function() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme, themeIcon, themeText);
  });
}

function updateThemeIcon(theme, icon, text) {
  if (!icon || !text) return;

  if (theme === 'dark') {
    // Иконка солнца для переключения на светлую
    icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    text.textContent = 'Светлая';
  } else {
    // Иконка луны для переключения на темную
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    text.textContent = 'Тёмная';
  }
}

// ============================================
// Получение названия месяца
// ============================================
function getMonthName(monthNumber) {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months[monthNumber - 1];
}

function getMonthShortName(monthNumber) {
  const months = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ];
  return months[monthNumber - 1];
}

// ============================================
// Получение дат для тура в зависимости от месяца
// ============================================
function getTourDates(month) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Если выбран текущий месяц, показываем ближайшие выходные
  if (month === currentMonth) {
    const today = now.getDate();
    const dayOfWeek = now.getDay(); // 0 = воскресенье, 6 = суббота
    
    // Находим ближайшую субботу
    let daysUntilSaturday = (6 - dayOfWeek) % 7;
    if (daysUntilSaturday === 0 && dayOfWeek !== 6) {
      daysUntilSaturday = 7;
    }
    
    const saturday = new Date(currentYear, currentMonth - 1, today + daysUntilSaturday);
    const sunday = new Date(currentYear, currentMonth - 1, today + daysUntilSaturday + 1);
    
    return {
      start: saturday,
      end: sunday,
      format: `${saturday.getDate()}-${sunday.getDate()} ${getMonthName(currentMonth)}`
    };
  } else {
    // Для будущих месяцев показываем первые выходные месяца
    const firstSaturday = new Date(currentYear, month - 1, 1);
    const dayOfWeek = firstSaturday.getDay();
    const daysToAdd = (6 - dayOfWeek) % 7;
    if (daysToAdd === 0 && dayOfWeek !== 6) {
      firstSaturday.setDate(8); // Следующая суббота
    } else {
      firstSaturday.setDate(1 + daysToAdd);
    }
    
    const firstSunday = new Date(firstSaturday);
    firstSunday.setDate(firstSaturday.getDate() + 1);
    
    return {
      start: firstSaturday,
      end: firstSunday,
      format: `${firstSaturday.getDate()}-${firstSunday.getDate()} ${getMonthName(month)}`
    };
  }
}

// ============================================
// Создание кнопок месяцев (текущий + 2 месяца вперед)
// ============================================
function createMonthButtons() {
  const monthFilter = document.getElementById('monthFilter');
  if (!monthFilter) return;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  
  // Вычисляем следующие 2 месяца
  const month1 = currentMonth;
  const month2 = currentMonth === 12 ? 1 : currentMonth + 1;
  const month3 = currentMonth >= 11 ? (currentMonth === 11 ? 1 : 2) : currentMonth + 2;

  // Очищаем контейнер
  monthFilter.innerHTML = '';

  // Текущий месяц (активный)
  const currentBtn = document.createElement('button');
  currentBtn.className = 'month-btn active';
  currentBtn.setAttribute('data-month', month1.toString());
  currentBtn.textContent = getMonthName(month1);
  monthFilter.appendChild(currentBtn);

  // Следующий месяц
  const nextBtn1 = document.createElement('button');
  nextBtn1.className = 'month-btn';
  nextBtn1.setAttribute('data-month', month2.toString());
  nextBtn1.textContent = getMonthName(month2);
  monthFilter.appendChild(nextBtn1);

  // Второй месяц вперед
  const nextBtn2 = document.createElement('button');
  nextBtn2.className = 'month-btn';
  nextBtn2.setAttribute('data-month', month3.toString());
  nextBtn2.textContent = getMonthName(month3);
  monthFilter.appendChild(nextBtn2);
}

// ============================================
// Инициализация всех фильтров
// ============================================
function initFilters() {
  // Создаем кнопки месяцев (только текущий и следующий)
  createMonthButtons();

  // Инициализация фильтра по месяцам
  const monthButtons = document.querySelectorAll('.month-btn');
  
  if (monthButtons.length > 0) {
    // Обработчик клика на кнопки месяцев
    monthButtons.forEach(button => {
      button.addEventListener('click', function() {
        monthButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        loadTours();
      });
    });
  }

  // Инициализация поиска
  const searchInput = document.getElementById('tourSearch');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      // Задержка для избежания слишком частых запросов
      searchTimeout = setTimeout(() => {
        loadTours();
      }, 300);
    });
  }

  // Загружаем туры при инициализации
  loadTours();
}


// ============================================
// Инициализация при загрузке страницы
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('Vibe Tour - сайт загружен');

  // Инициализируем переключение темы
  initThemeToggle();

  // Инициализируем все фильтры и поиск
  initFilters();

  // Инициализируем плавную прокрутку
  initSmoothScroll();

  // Инициализируем валидацию формы
  initContactForm();

  // Инициализируем анимации при скролле (будет вызвано после загрузки туров)
});

// ============================================
// Дополнительные утилиты
// ============================================

// Функция для форматирования цены
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// ============================================
// Показ детального описания тура
// ============================================
function showTourDetails(tour) {
  const modal = document.getElementById('tourModal');
  const modalContent = document.getElementById('tourModalContent');
  
  if (!modal || !modalContent) {
    console.error('Модальное окно не найдено на странице');
    return;
  }

  // Получаем выбранный месяц для дат
  const activeMonthBtn = document.querySelector('.month-btn.active');
  const selectedMonth = activeMonthBtn ? parseInt(activeMonthBtn.getAttribute('data-month')) : new Date().getMonth() + 1;
  const tourDates = getTourDates(selectedMonth);
  
  // Формируем URL для бронирования
  const bookingUrl = `booking.html?trip=${encodeURIComponent(tour.title)}`;

  // Создаем контент модального окна
  modalContent.innerHTML = `
    <div class="tour-details">
      <img src="${tour.image}" alt="${tour.title}" class="tour-details__image" onerror="this.src='img/hero.jpg'">
      
      <div class="tour-details__header">
        <h2 class="tour-details__title">${tour.title}</h2>
        <div class="tour-details__meta">
          <span class="tour-details__price">${tour.price}</span>
          <span>${tour.duration}</span>
          <span>Сложность: ${tour.difficulty || 'Не указана'}</span>
          <span>📅 ${tourDates.format}</span>
        </div>
      </div>

      <div class="tour-details__description">
        ${tour.fullDescription || tour.description}
      </div>

      ${tour.program ? `
      <div class="tour-details__section">
        <h3>Программа тура</h3>
        <ul class="tour-details__program">
          ${tour.program.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      ${tour.includes ? `
      <div class="tour-details__section">
        <h3>Что включено</h3>
        <div class="tour-details__includes">
          ${tour.includes.map(item => `<span>${item}</span>`).join('')}
        </div>
      </div>
      ` : ''}

      <div class="tour-details__actions">
        <a href="${bookingUrl}" class="btn btn--primary" style="flex: 1; text-align: center;">
          <span>Забронировать тур</span>
        </a>
      </div>
    </div>
  `;

  // Удаляем старые обработчики, если они есть
  const oldCloseBtn = modal.querySelector('.tour-modal__close');
  const oldOverlay = modal.querySelector('.tour-modal__overlay');
  
  // Создаем функцию закрытия
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Удаляем обработчик Escape
    document.removeEventListener('keydown', handleEscape);
  };

  // Обработчик Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  };

  // Удаляем старые обработчики перед добавлением новых
  if (oldCloseBtn) {
    const newCloseBtn = oldCloseBtn.cloneNode(true);
    oldCloseBtn.parentNode.replaceChild(newCloseBtn, oldCloseBtn);
    newCloseBtn.addEventListener('click', closeModal);
  }
  
  if (oldOverlay) {
    oldOverlay.addEventListener('click', closeModal);
  }

  // Показываем модальное окно
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Добавляем обработчик Escape
  document.addEventListener('keydown', handleEscape);
}

// ============================================
// Показ галереи тура
// ============================================
function showTourGallery(tourId) {
  // Находим тур по ID
  const tour = toursData.find(t => t.id === tourId);
  
  if (!tour || !tour.gallery || tour.gallery.length === 0) {
    console.warn('Галерея для тура не найдена');
    return;
  }

  // Пока что просто показываем alert, можно расширить до полноценной галереи
  console.log('Галерея тура:', tour.gallery);
  // TODO: Реализовать полноценную галерею изображений
}

// Экспорт функций для использования в других скриптах
window.VibeTour = {
  loadTours,
  loadToursData,
  createTourCard,
  formatPrice,
  showTourDetails,
  showTourGallery,
  getToursData: () => toursData
};

