
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
    await loadComponent('header-placeholder', 'asset/header.html');
    await loadComponent('footer-placeholder', 'asset/footer.html');

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
