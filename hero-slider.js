/* =========================================
   CheckerDiscount - Hero Slider JavaScript
   Auto-rotate + Manual Controls + Swipe
   ========================================= */

(function initHeroSlider() {
    'use strict';
    
    let currentSlide = 0;
    let autoRotateTimer = null;
    const AUTO_ROTATE_INTERVAL = 4000; // 4 seconds
    let slides = [];
    let dots = [];
    
    function init() {
        const slider = document.getElementById('cd-hero-slider');
        if (!slider) {
            console.warn('Hero slider not found');
            return;
        }
        
        slides = slider.querySelectorAll('.cd-hero-slide');
        dots = slider.querySelectorAll('.cd-hero-dot');
        
        if (slides.length === 0) {
            console.warn('No slides found');
            return;
        }
        
        activateSlide(0);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetAutoRotate();
            });
        });
        
        const prevBtn = slider.querySelector('.cd-hero-arrow-prev');
        const nextBtn = slider.querySelector('.cd-hero-arrow-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoRotate();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoRotate();
            });
        }
        
        slider.addEventListener('mouseenter', stopAutoRotate);
        slider.addEventListener('mouseleave', startAutoRotate);
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeDistance = touchEndX - touchStartX;
            const minSwipe = 50;
            
            if (swipeDistance < -minSwipe) {
                nextSlide();
                resetAutoRotate();
            } else if (swipeDistance > minSwipe) {
                prevSlide();
                resetAutoRotate();
            }
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                resetAutoRotate();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                resetAutoRotate();
            }
        });
        
        startAutoRotate();
    }
    
    function activateSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
    }
    
    function nextSlide() {
        activateSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        activateSlide(currentSlide - 1);
    }
    
    function goToSlide(index) {
        activateSlide(index);
    }
    
    function startAutoRotate() {
        stopAutoRotate();
        autoRotateTimer = setInterval(() => {
            nextSlide();
        }, AUTO_ROTATE_INTERVAL);
    }
    
    function stopAutoRotate() {
        if (autoRotateTimer) {
            clearInterval(autoRotateTimer);
            autoRotateTimer = null;
        }
    }
    
    function resetAutoRotate() {
        stopAutoRotate();
        startAutoRotate();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.cdHeroSlider = {
        next: nextSlide,
        prev: prevSlide,
        goTo: goToSlide,
        stop: stopAutoRotate,
        start: startAutoRotate
    };
    
})();
