/* =========================================
   CheckerDiscount - Amazon Style Hero Slider
   Infinite Loop + Auto-rotate + Slide + Swipe
   (Seamless infinite loop with cloning)
   ========================================= */

(function initHeroSlider() {
    'use strict';

    let currentSlide = 1; // start at 1 because slide 0 is the clone of the last
    let autoRotateTimer = null;
    const AUTO_ROTATE_INTERVAL = 4000;
    const ANIMATION_DURATION = 600; // matches CSS 0.6s
    let slider = null;
    let track = null;
    let slides = [];
    let dots = [];
    let realSlideCount = 0;
    let isTransitioning = false;

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

        const originalSlides = Array.from(slider.querySelectorAll('.cd-hero-slide'));
        if (originalSlides.length === 0) {
            console.warn('No slides found');
            return;
        }

        realSlideCount = originalSlides.length;

        // ✅ Clone last slide and prepend, clone first slide and append
        const firstClone = originalSlides[0].cloneNode(true);
        const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
        firstClone.classList.add('cd-hero-clone');
        lastClone.classList.add('cd-hero-clone');
        firstClone.setAttribute('aria-hidden', 'true');
        lastClone.setAttribute('aria-hidden', 'true');

        track.appendChild(firstClone);            // first clone goes at the end
        track.insertBefore(lastClone, track.firstChild); // last clone goes at the start

        slides = Array.from(track.querySelectorAll('.cd-hero-slide'));
        dots = slider.querySelectorAll('.cd-hero-dot');

        // Place track at the first "real" slide (index 1)
        setTransform(1, false);

        // Attach click listeners to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index + 1, true); // +1 to account for the prepended clone
            });
        });

        const prevBtn = slider.querySelector('.cd-hero-arrow-prev');
        const nextBtn = slider.querySelector('.cd-hero-arrow-next');

        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Handle transition end for infinite loop
        track.addEventListener('transitionend', handleTransitionEnd);

        // Pause on hover
        slider.addEventListener('mouseenter', stopAutoRotate);
        slider.addEventListener('mouseleave', startAutoRotate);

        // Touch swipe support
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
                if (touchEndX < touchStartX) nextSlide();
                else prevSlide();
            }
        }, { passive: true });

        // Keyboard arrows
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            else if (e.key === 'ArrowRight') nextSlide();
        });

        startAutoRotate();
    }

    function setTransform(index, animate) {
        if (!track) return;
        track.style.transition = animate === false
            ? 'none'
            : `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        track.style.transform = `translateX(-${index * 100}%)`;
    }

    function goToSlide(index, animate) {
        if (isTransitioning && animate) return;
        currentSlide = index;
        setTransform(index, animate);

        // Update dots
        let realIndex = index - 1;
        if (realIndex < 0) realIndex = realSlideCount - 1;
        if (realIndex >= realSlideCount) realIndex = 0;
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === realIndex);
        });
    }

    function handleTransitionEnd(e) {
        if (e.target !== track || e.propertyName !== 'transform') return;

        // If we are on the first clone (index 0), jump silently to the real last slide
        if (currentSlide === 0) {
            isTransitioning = true;
            setTransform(realSlideCount, false);
            currentSlide = realSlideCount;
            // Force reflow
            void track.offsetWidth;
            // Re-enable transition after a tiny delay
            setTimeout(() => {
                isTransitioning = false;
                setTransform(realSlideCount, true);
            }, 20);
        }

        // If we are on the last clone (index = realSlideCount + 1), jump silently to the real first slide
        if (currentSlide === realSlideCount + 1) {
            isTransitioning = true;
            setTransform(1, false);
            currentSlide = 1;
            void track.offsetWidth;
            setTimeout(() => {
                isTransitioning = false;
                setTransform(1, true);
            }, 20);
        }
    }

    function nextSlide() {
        if (isTransitioning) return;
        goToSlide(currentSlide + 1, true);
        resetAutoRotate();
    }

    function prevSlide() {
        if (isTransitioning) return;
        goToSlide(currentSlide - 1, true);
        resetAutoRotate();
    }

    function startAutoRotate() {
        stopAutoRotate();
        autoRotateTimer = setInterval(() => {
            if (!isTransitioning) goToSlide(currentSlide + 1, true);
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
        goTo: (i) => goToSlide(i + 1, true),
        stop: stopAutoRotate,
        start: startAutoRotate
    };

})();
