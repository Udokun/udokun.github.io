'use strict';

// Предотвращение ввода цифр
function preventNumbers(event) {
    if (/[0-9]/.test(event.key)) {
        event.preventDefault();
    }
}

// Функции для работы с ошибками формы
function showErrors(errors) {
    const errorContainer = document.querySelector('.form-errors');
    const errorList = errorContainer.querySelector('.error-list');
    
    // Очищаем список ошибок
    errorList.innerHTML = '';
    
    // Добавляем каждую ошибку в список
    errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        errorList.appendChild(li);
    });
    
    // Показываем контейнер с ошибками
    errorContainer.classList.add('show');
    
    // Прокручиваем к ошибкам
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideErrors() {
    const errorContainer = document.querySelector('.form-errors');
    errorContainer.classList.remove('show');
}

function hideError(field) {
    if (field) {
        field.classList.remove('error');
        const errorElement = field.querySelector('.form-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}

// Функция для мобильной заставки и навигационного меню
document.addEventListener('DOMContentLoaded', function() {
    const splashScreen = document.querySelector('.mobile-splash-screen');
    const splashContent = document.querySelector('.splash-content');
    const sideMenu = document.querySelector('.side-menu');
    const menuClose = document.querySelector('.menu-close');
    const body = document.body;
    
    if (!splashScreen) return;

    // Функция скрытия заставки
    function hideSplashScreen() {
        splashScreen.classList.add('hidden');
        setTimeout(() => {
            body.classList.add('content-visible');
        }, 500);
    }
    
    // Функция открытия бокового меню
    function openSideMenu() {
        sideMenu.classList.add('open');
    }
    
    // Функция закрытия бокового меню
    function closeSideMenu() {
        sideMenu.classList.remove('open');
    }

    // Обработчик клика для скрытия заставки
    splashScreen.addEventListener('click', hideSplashScreen);

    // Обработка свайпа вверх для скрытия заставки
    let touchStartY = null;
    let touchEndY = null;

    splashScreen.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    });

    splashScreen.addEventListener('touchmove', function(e) {
      if (e.touches.length === 1) {
        touchEndY = e.touches[0].clientY;
        if (!splashScreen.classList.contains('hidden')) {
          e.preventDefault(); // Блокируем скролл, пока заставка видна
        }
      }
    }, { passive: false });

    splashScreen.addEventListener('touchend', function() {
      if (touchStartY !== null && touchEndY !== null) {
        if (touchStartY - touchEndY > 50) { // свайп вверх
          hideSplashScreen();
        }
      }
      touchStartY = null;
      touchEndY = null;
    });

    // Обработчик открытия меню по бургеру
    const burgerBtn = document.querySelector('.burger-btn');
    if (burgerBtn) {
        burgerBtn.addEventListener('click', function() {
            openSideMenu();
            burgerBtn.style.display = 'none';
        });
    }

    // Обработчик закрытия меню
    if (menuClose) {
        menuClose.addEventListener('click', function() {
            closeSideMenu();
            if (burgerBtn) burgerBtn.style.display = '';
        });
    }
    
    // Закрытие меню при клике на пункт меню
    const menuLinks = document.querySelectorAll('.menu-nav a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeSideMenu();
            if (burgerBtn) burgerBtn.style.display = '';
        });
    });

    if (window.innerWidth > 768) {
        document.body.classList.add('content-visible');
    }
});

// Управление музыкой
document.addEventListener('DOMContentLoaded', function() {
    const musicToggle = document.getElementById('musicToggle');
    const backgroundMusic = document.getElementById('backgroundMusic');
    let isPlaying = false;
    let playTimeout = null;

    // --- Добавлено: схлопывание и скрытие текста ---
    const hideHint = () => {
      if (!musicToggle.classList.contains('hint-hidden')) {
        musicToggle.classList.add('hint-hidden');
      }
    };
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) hideHint();
    });
    musicToggle.addEventListener('click', hideHint);
    // --- конец добавленного ---

    if (!musicToggle || !backgroundMusic) {
        console.warn('Music controls not found');
        return;
    }

    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            backgroundMusic.pause();
            musicToggle.classList.remove('playing');
            if (playTimeout) {
                clearTimeout(playTimeout);
                playTimeout = null;
            }
        } else {
            backgroundMusic.play().catch(error => {
                console.error('Error playing audio:', error);
                musicToggle.classList.remove('playing');
                isPlaying = false;
            });
            if (playTimeout) clearTimeout(playTimeout);
            playTimeout = setTimeout(() => {
                musicToggle.classList.add('playing');
            }, 500); // 500мс = длительность схлопывания
        }
        isPlaying = !isPlaying;
    });

    // Инициализация обратного отсчёта
    const weddingDate = new Date('2026-09-05T15:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
});

// Обработка формы RSVP
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('rsvpForm');
    if (!form) return;

    // --- Запрет на ввод цифр в текстовые поля ---
    form.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('keypress', preventNumbers);
    });

    const attendanceInputs = form.querySelectorAll('input[name="attendance"]');
    const guestInputs = form.querySelectorAll('input[name="guests"]');
    const attendingOnlyFields = form.querySelectorAll('.attending-only');
    const companionInput = form.querySelector('.companion-input');
    const companionDrinks = form.querySelector('.companion-drinks');
    const wineCheckboxes = form.querySelectorAll('.wine-checkbox');
    const wineInputs = form.querySelectorAll('.wine-input input, .companion-wine-input input');
    const formErrors = form.querySelector('.form-errors .error-list');

    // Показывать/скрывать attending-only
    attendanceInputs.forEach(input => {
        input.addEventListener('change', function() {
            const isAttending = this.value === 'Обязательно приду';
            attendingOnlyFields.forEach(field => {
                if (isAttending) field.style.display = 'block';
                // Не скрываем блок, если выбран другой вариант
            });
            // companion поля всегда скрываем при смене присутствия
            companionInput.style.display = 'none';
            companionDrinks.style.display = 'none';
        });
    });

    // companion поля показывать только если выбрано "Буду не один/одна"
    guestInputs.forEach(input => {
        input.addEventListener('change', function() {
            const isAttending = form.querySelector('input[name="attendance"]:checked')?.value === 'Обязательно приду';
            const hasCompanion = this.value === 'Буду не один/одна' && this.checked;
            if (isAttending && hasCompanion) {
                companionInput.style.display = 'block';
                companionDrinks.style.display = 'block';
            } else {
                companionInput.style.display = 'none';
                companionDrinks.style.display = 'none';
                companionInput.querySelector('input').value = '';
                companionDrinks.querySelectorAll('input').forEach(i => i.checked = false);
            }
        });
    });

    // Вино: показывать поле для ввода предпочтений
    wineCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const wineInput = this.closest('.radio-group').querySelector('.wine-input, .companion-wine-input');
            if (wineInput) {
                wineInput.style.display = this.checked ? 'block' : 'none';
                if (!this.checked) wineInput.querySelector('input').value = '';
            }
        });
    });

    // --- Взаимоисключающие чекбоксы для напитков ---
    function setupDrinkCheckboxLogic(group) {
        if (!group) return;
        const checkboxes = Array.from(group.querySelectorAll('input[type="checkbox"]'));
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const isNoAlcohol = this.value === 'Не буду пить алкоголь';
                const isWhatGiven = this.value === 'Что нальют';
                if ((isNoAlcohol || isWhatGiven) && this.checked) {
                    checkboxes.forEach(cb => {
                        if (cb !== this) {
                            cb.checked = false;
                            cb.disabled = true;
                        }
                    });
                } else if (!isNoAlcohol && !isWhatGiven && this.checked) {
                    checkboxes.forEach(cb => {
                        if (cb.value === 'Не буду пить алкоголь' || cb.value === 'Что нальют') {
                            cb.checked = false;
                            cb.disabled = true;
                        }
                    });
                } else if (!this.checked) {
                    // Если чекбокс сняли — если ни один из "особых" не выбран, всё снова доступно
                    const anySpecialChecked = checkboxes.some(cb => (cb.value === 'Не буду пить алкоголь' || cb.value === 'Что нальют') && cb.checked);
                    const anyOtherChecked = checkboxes.some(cb => !(cb.value === 'Не буду пить алкоголь' || cb.value === 'Что нальют') && cb.checked);
                    if (!anySpecialChecked && !anyOtherChecked) {
                        checkboxes.forEach(cb => cb.disabled = false);
                    }
                    // Если сняли "особый", но остался другой — не трогаем
                    // Если сняли обычный, но остался "особый" — не трогаем
                }
            });
        });
    }
    // Для основного гостя
    const mainDrinksGroup = form.querySelectorAll('.form-group.attending-only .radio-group');
    mainDrinksGroup.forEach(setupDrinkCheckboxLogic);
    // Для спутника
    const companionDrinksGroup = form.querySelectorAll('.companion-drinks .radio-group');
    companionDrinksGroup.forEach(setupDrinkCheckboxLogic);

    // После reset формы — все чекбоксы снова доступны
    form.addEventListener('reset', function() {
        setTimeout(() => {
            mainDrinksGroup.forEach(group => {
                group.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.disabled = false);
            });
            companionDrinksGroup.forEach(group => {
                group.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.disabled = false);
            });
        }, 0);
    });

    // Валидация и отправка
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        formErrors.innerHTML = '';
        const errors = [];

        const fullName = form.querySelector('input[name="fullName"]').value.trim();
        const attendance = form.querySelector('input[name="attendance"]:checked');
        if (!fullName) errors.push('Пожалуйста, укажите ваше имя и фамилию.');
        if (!attendance) errors.push('Пожалуйста, выберите, сможете ли вы присутствовать.');

        if (attendance && attendance.value === 'Обязательно приду') {
            const guests = form.querySelector('input[name="guests"]:checked');
            if (!guests) errors.push('Пожалуйста, выберите, с кем вы будете.');
            if (guests && guests.value === 'Буду не один/одна') {
                const companionName = companionInput.querySelector('input').value.trim();
                if (!companionName) errors.push('Пожалуйста, укажите имя спутника/цы.');
            }
            const transport = form.querySelector('input[name="transport"]:checked');
            if (!transport) errors.push('Пожалуйста, выберите, как будете добираться.');
            const drinks = form.querySelectorAll('input[name="drinks[]"]:checked');
            if (!drinks.length) errors.push('Пожалуйста, выберите, что будете пить.');
            const wineCheckbox = form.querySelector('input[name="drinks[]"][value="Вино"]');
            const wineSelect = form.querySelector('.wine-input select');
            if (wineCheckbox && wineCheckbox.checked && (!wineSelect || !wineSelect.value)) {
                errors.push('Пожалуйста, выберите вино.');
            }
            if (guests && guests.value === 'Буду не один/одна') {
                const cDrinks = form.querySelectorAll('input[name="companion_drinks[]"]:checked');
                if (!cDrinks.length) errors.push('Пожалуйста, выберите, что будет пить спутник/ца.');
                const cWineCheckbox = form.querySelector('input[name="companion_drinks[]"][value="Вино"]');
                const cWineSelect = form.querySelector('.companion-wine-input select');
                if (cWineCheckbox && cWineCheckbox.checked && (!cWineSelect || !cWineSelect.value)) {
                    errors.push('Пожалуйста, выберите вино для спутника/цы.');
                }
            }
        }

        if (errors.length) {
            errors.forEach(err => {
                const li = document.createElement('li');
                li.textContent = err;
                formErrors.appendChild(li);
            });
            formErrors.parentElement.classList.add('show');
            return;
        } else {
            formErrors.parentElement.classList.remove('show');
        }

        // Отправка
        const formData = new FormData(form);
        const data = {
            fullName: formData.get('fullName'),
            attendance: formData.get('attendance'),
            guests: formData.get('guests'),
            companionName: formData.get('companion_name'),
            transport: formData.get('transport'),
            drinks: formData.getAll('drinks[]').join(', '),
            wine: formData.get('wine'),
            companionDrinks: formData.getAll('companion_drinks[]').join(', '),
            companionWine: formData.get('companion_wine')
        };
        try {
            await fetch('https://script.google.com/macros/s/AKfycbxuZQTpkP-JeVcbtMdTaqoavqpR2Exb6fVpOFWrevmquhaCs8ysf6OVRT1-8qpA-Ia2-A/exec', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
                mode: 'no-cors'
            });
            // Модалка успеха
            const successModal = document.querySelector('.success-modal');
            if (successModal) {
                successModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
            form.reset();
            // attendingOnlyFields.forEach(field => field.style.display = 'none');
            // companionInput.style.display = 'none';
            // companionDrinks.style.display = 'none';
            setTimeout(() => {
                if (successModal) {
                    successModal.classList.remove('show');
                    document.body.style.overflow = '';
                }
            }, 3000);
        } catch (err) {
            formErrors.innerHTML = '<li>Ошибка отправки. Попробуйте позже.</li>';
            formErrors.parentElement.classList.add('show');
        }
    });
});

// Плавная прокрутка к секциям
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Генерация календаря
document.addEventListener('DOMContentLoaded', function() {
    const calendarDays = document.querySelector('.calendar-days');
    if (!calendarDays) return;

    const weddingYear = 2026;
    const weddingMonth = 8; // сентябрь (0-based)
    const weddingDay = 5;
    const weddingDate = new Date(weddingYear, weddingMonth, weddingDay);
    const firstDay = new Date(weddingYear, weddingMonth, 1);
    const lastDay = new Date(weddingYear, weddingMonth + 1, 0);

    calendarDays.innerHTML = '';

    // Неделя с понедельника: 0 пустых = пн, 1 = вт, …
    const startOffset = (firstDay.getDay() + 6) % 7;

    for (let i = 0; i < startOffset; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        if (day === weddingDay) {
            dayElement.classList.add('selected');
        }
        dayElement.textContent = day;
        calendarDays.appendChild(dayElement);
    }
});

const DRESS_CODE_WOMEN_IMAGES = [
    '1.JPG', '2.JPG', '3.JPG', '4.JPG', '5.JPG', '6.JPG', '7.JPG'
];

const DRESS_CODE_MEN_IMAGES = [
    '8.PNG', '9.PNG', '10.PNG', '11.JPG', '12.JPG', '13.JPG', '14.JPG'
];

const initDressCodeCarousel = (carousel, images, altPrefix) => {
    const track = carousel.querySelector('.dress-carousel__track');
    const prevBtn = carousel.querySelector('.dress-carousel__btn--prev');
    const nextBtn = carousel.querySelector('.dress-carousel__btn--next');
    const currentEl = carousel.querySelector('.dress-carousel__current');
    const totalEl = carousel.querySelector('.dress-carousel__total');

    if (!track) return;

    images.forEach((filename, index) => {
        const slide = document.createElement('figure');
        slide.className = 'dress-carousel__slide';
        slide.innerHTML = `<img src="img/dress-code/${filename}" alt="${altPrefix} ${index + 1}" loading="lazy" decoding="async">`;
        track.appendChild(slide);
    });

    const total = images.length;
    if (totalEl) totalEl.textContent = String(total);
    if (!total) return;

    let currentIndex = 0;
    let touchStartX = null;

    const getSlidesPerView = () => {
        const value = getComputedStyle(carousel)
            .getPropertyValue('--slides-per-view')
            .trim();
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    };

    const getMaxIndex = () => Math.max(0, total - getSlidesPerView());

    const getSlideStep = () => {
        const slide = track.querySelector('.dress-carousel__slide');
        if (!slide) return 0;
        const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
        return slide.offsetWidth + gap;
    };

    const updateCarousel = () => {
        const slidesPerView = getSlidesPerView();
        const maxIndex = getMaxIndex();
        const step = getSlideStep();
        track.style.transform = `translateX(-${currentIndex * step}px)`;

        if (currentEl) {
            const firstVisible = currentIndex + 1;
            const lastVisible = Math.min(currentIndex + slidesPerView, total);
            currentEl.textContent =
                firstVisible === lastVisible
                    ? String(firstVisible)
                    : `${firstVisible}–${lastVisible}`;
        }

        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    };

    const goToSlide = (index) => {
        currentIndex = Math.max(0, Math.min(getMaxIndex(), index));
        updateCarousel();
    };

    const handlePrev = () => goToSlide(currentIndex - 1);
    const handleNext = () => goToSlide(currentIndex + 1);

    if (prevBtn) prevBtn.addEventListener('click', handlePrev);
    if (nextBtn) nextBtn.addEventListener('click', handleNext);

    carousel.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            handlePrev();
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            handleNext();
        }
    });

    carousel.addEventListener('touchstart', (event) => {
        if (event.touches.length !== 1) return;
        touchStartX = event.touches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', (event) => {
        if (touchStartX === null || !event.changedTouches.length) return;
        const deltaX = event.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(deltaX) < 50) return;
        if (deltaX < 0) handleNext();
        else handlePrev();
    }, { passive: true });

    window.addEventListener('resize', updateCarousel);
    updateCarousel();
};

const initDressCodeCarousels = () => {
    const womenCarousel = document.querySelector('[data-dress-carousel="women"]');
    const menCarousel = document.querySelector('[data-dress-carousel="men"]');

    if (womenCarousel) {
        initDressCodeCarousel(womenCarousel, DRESS_CODE_WOMEN_IMAGES, 'Пример образа для девушек');
    }
    if (menCarousel) {
        initDressCodeCarousel(menCarousel, DRESS_CODE_MEN_IMAGES, 'Пример образа для мужчин');
    }
};

document.addEventListener('DOMContentLoaded', initDressCodeCarousels);

