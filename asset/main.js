const ASSET_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyl_Z6pzMfKeg-upTey3kZWzvaxvWHaZMFQ51xB5gUyfaQ8rgXSIV08sQ_seNYb1bAt/exec';

async function loadComponent(elementId, filePath) {
    const el = document.getElementById(elementId);
    if (!el) return;
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Failed to load ' + filePath);
        const html = await response.text();
        el.innerHTML = html;
    } catch (err) {
        console.error(err);
    }
}

async function initPage() {
    await loadComponent('header-placeholder', 'header.html');
    await loadComponent('footer-placeholder', 'footer.html');

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) link.classList.add('active');
    });

    initMobileMenu();
    initLanguageToggle();
    initSlider();
    initFaq();
    initScrollAnimations();
    initRequestModal();
}

function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    if (!mobileToggle || !navMenu) return;

    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });
}

function initLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    if (!langToggle) return;
    const langBtns = langToggle.querySelectorAll('.lang-btn');
    const body = document.body;

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            body.classList.remove('lang-bn', 'lang-en');
            body.classList.add('lang-' + lang);
            try { localStorage.setItem('preferredLang', lang); } catch(e) {}
            document.documentElement.lang = lang;
            updateFormLanguage();
        });
    });

    let savedLang = 'bn';
    try { savedLang = localStorage.getItem('preferredLang') || 'bn'; } catch(e) {}
    body.classList.remove('lang-bn', 'lang-en');
    body.classList.add('lang-' + savedLang);
    langBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.lang === savedLang);
    });
}

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;

    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const slider = document.querySelector('.hero-slider');
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(index) {
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
        currentSlide = index;
    }

    function nextSlide() { goToSlide((currentSlide + 1) % slides.length); }
    function prevSlide() { goToSlide((currentSlide - 1 + slides.length) % slides.length); }

    function startAutoPlay() {
        stopAutoPlay();
        slideInterval = setInterval(nextSlide, 6000);
    }
    function stopAutoPlay() {
        if (slideInterval) clearInterval(slideInterval);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            goToSlide(parseInt(dot.dataset.slide));
            startAutoPlay();
        });
    });

    if (slider) {
        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);

        let touchStartX = 0;
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        slider.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
                startAutoPlay();
            }
        }, { passive: true });
    }

    startAutoPlay();
}

function initFaq() {
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

function updateFormLanguage() {
    const isBn = document.body.classList.contains('lang-bn');
    document.querySelectorAll('[data-placeholder-bn]').forEach(el => {
        el.placeholder = isBn ? el.dataset.placeholderBn : el.dataset.placeholderEn;
    });
    document.querySelectorAll('.error-msg[data-error-bn]').forEach(el => {
        el.textContent = isBn ? el.dataset.errorBn : el.dataset.errorEn;
    });
    document.querySelectorAll('select option[data-bn]').forEach(opt => {
        if (opt.value !== '') {
            opt.textContent = isBn ? opt.dataset.bn : opt.dataset.en;
        }
    });
}

function initRequestModal() {
    const modal = document.getElementById('requestModal');
    if (!modal) return;

    const formView = document.getElementById('formView');
    const successView = document.getElementById('successView');
    const selectedUnitName = document.getElementById('selectedUnitName');
    const unitNameInput = document.getElementById('unitNameInput');
    const phoneInput = document.getElementById('phone');
    const memberInput = document.getElementById('memberCount');
    const requestForm = document.getElementById('requestForm');

    window.openRequestModal = function(unitBn, unitEn) {
        const isBn = document.body.classList.contains('lang-bn');
        if (selectedUnitName) selectedUnitName.textContent = isBn ? unitBn : unitEn;
        if (unitNameInput) unitNameInput.value = unitBn + ' / ' + unitEn;

        if (formView) formView.style.display = 'block';
        if (successView) successView.classList.remove('show');

        if (requestForm) requestForm.reset();
        document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-group input, .form-group textarea, .form-group select').forEach(el => el.classList.remove('error'));

        updateFormLanguage();

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeRequestModal = function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (formView) formView.style.display = 'block';
            if (successView) successView.classList.remove('show');
            if (requestForm) requestForm.reset();
        }, 350);
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal) window.closeRequestModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            window.closeRequestModal();
        }
    });

    const bdPhonePattern = /^01[3-9]\d{8}$/;

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
        });
    }

    if (memberInput) {
        memberInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 2);
        });
    }

    if (requestForm) {
        requestForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isValid = true;
            const nameInput = document.getElementById('fullName');
            const occupationSelect = document.getElementById('occupation');
            const phoneError = document.getElementById('phoneError');
            const nameError = document.getElementById('nameError');
            const occupationError = document.getElementById('occupationError');
            const memberError = document.getElementById('memberError');

            [phoneError, nameError, occupationError, memberError].forEach(el => {
                if (el) el.classList.remove('show');
            });
            [phoneInput, nameInput, occupationSelect, memberInput].forEach(el => {
                if (el) el.classList.remove('error');
            });

            if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
                nameError.classList.add('show');
                nameInput.classList.add('error');
                isValid = false;
            }

            const phoneVal = phoneInput.value.trim();
            if (!bdPhonePattern.test(phoneVal)) {
                phoneError.classList.add('show');
                phoneInput.classList.add('error');
                isValid = false;
            }

            const memberVal = memberInput.value.trim();
            if (!memberVal || parseInt(memberVal) < 1) {
                memberError.classList.add('show');
                memberInput.classList.add('error');
                isValid = false;
            }

            if (!occupationSelect.value) {
                occupationError.classList.add('show');
                occupationSelect.classList.add('error');
                isValid = false;
            }

            if (!isValid) {
                const firstError = document.querySelector('.form-group input.error, .form-group select.error');
                if (firstError) firstError.focus();
                return;
            }

            const submitBtn = document.getElementById('submitBtn');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            const formData = {
                name: nameInput.value.trim(),
                phone: phoneVal,
                members: memberVal,
                occupation: occupationSelect.value,
                unit: unitNameInput.value,
                email: document.getElementById('email').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            try {
                await fetch(ASSET_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });

                if (formView) formView.style.display = 'none';
                if (successView) successView.classList.add('show');
            } catch (err) {
                if (formView) formView.style.display = 'none';
                if (successView) successView.classList.add('show');
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
