/* =========================================
   CheckerDiscount - Amazon Style Hero Slider
   Auto-rotate + Slide Effect + Swipe
   ========================================= */

(function initHeroSlider() {
    'use strict';
    
    let currentSlide = 0;
    let autoRotateTimer = null;
    const AUTO_ROTATE_INTERVAL = 4000;
    let slider = null;
    let track = null;
    let slides = [];
    let dots = [];
    
    function init() {
        slider = document.getElementById('cd-hero-slider');
        if (!slider) {
            console.warn('Hero slider not found');
            return;
        }
        
        track = slider.querySelector('.cd-hero-track');
        if (!track) {
            console.warn('Hero track not found');
            return;
        }
        
        slides = slider.querySelectorAll('.cd-hero-slide');
        dots = slider.querySelectorAll('.cd-hero-dot');
        
        if (slides.length === 0) {
            console.warn('No slides found');
            return;
        }
        
        goToSlide(0, false);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index, true);
            });
        });
        
        const prevBtn = slider.querySelector('.cd-hero-arrow-prev');
        const nextBtn = slider.querySelector('.cd-hero-arrow-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
            });
        }
        
        slider.addEventListener('mouseenter', stopAutoRotate);
        slider.addEventListener('mouseleave', startAutoRotate);
        
        let touchStartX = 0;
        let touchStartY = 0;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        slider.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            
            const diffX = Math.abs(touchEndX - touchStartX);
            const diffY = Math.abs(touchEndY - touchStartY);
            
            if (diffX > diffY && diffX > 50) {
                if (touchEndX < touchStartX) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }, { passive: true });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            else if (e.key === 'ArrowRight') nextSlide();
        });
        
        startAutoRotate();
    }
    
    function goToSlide(index, animate) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        currentSlide = index;
        
        if (track) {
            track.style.transition = animate === false 
                ? 'none' 
                : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            track.style.transform = `translateX(-${index * 100}%)`;
        }
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1, true);
        resetAutoRotate();
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1, true);
        resetAutoRotate();
    }
    
    function startAutoRotate() {
        stopAutoRotate();
        autoRotateTimer = setInterval(() => {
            goToSlide(currentSlide + 1, true);
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
        goTo: (i) => goToSlide(i, true),
        stop: stopAutoRotate,
        start: startAutoRotate
    };
    
})();
