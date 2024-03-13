
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, FreeMode, EffectFade, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/free-mode';
import 'swiper/css/effect-fade';
import 'swiper/css/parallax';

export default class Slider {

    constructor(el) {

        this.el = el;
        this.opts = this.el.dataset;

        const sectionEl = this.el.closest('.section');
        const slidesPerView = this.opts.swiperSlidesPerView !== 'auto' ? parseInt(this.opts.swiperSlidesPerView || 4, 10) : 'auto';
        let windowWidth = window.innerWidth;
        let baseSize = parseFloat(theme.utils.getCssVariable('font-size'), 10);
        let gutterWidth = parseFloat(theme.utils.getCssVariable('--style-grid-gutter-width'), 10);
        let slidesGap = Math.round(baseSize * gutterWidth);

        if (sectionEl) {

            if (this.opts.swiperSlidesGap) {
                slidesGap = parseInt(this.opts.swiperSlidesGap, 10);
            } else {
                slidesGap = Math.round(baseSize * parseFloat(theme.utils.getCssVariable('--style-grid-gutter-width', sectionEl), 10));
            }
        }

        if (this.el.classList.contains('swiper-highlight-active-slide')) {
            slidesGap = 0;
        }

        this.settings = {
            modules: [
                Navigation,
                Pagination,
                Autoplay,
                FreeMode
            ],
            spaceBetween: slidesGap,
            slidesPerView: slidesPerView !== 'auto' && slidesPerView > 1 && this.opts.swiperCenteredSlides !== 'true'  ? 2 : 'auto',
            slidesPerGroup: slidesPerView !== 'auto' && slidesPerView > 1 && this.opts.swiperCenteredSlides !== 'true' ? 2 : 1,
            grabCursor: this.opts.swiperNoSwiping !== 'true' ? true : false,
            allowTouchMove: this.opts.swiperNoSwiping !== 'true' ? true : false,
            autoplay: false,
            speed: parseInt(this.opts.swiperSpeed || 300, 10),
            loop: this.opts.swiperLoop === 'true' ? true : false,
            pagination: {
                el: el.querySelector('.swiper-pagination'),
                clickable: this.opts.swiperNoSwiping !== 'true' ? true : false
            },
            navigation: {
                nextEl: el.querySelector('.swiper-button-next'),
                prevEl: el.querySelector('.swiper-button-prev')
            },
            freeMode: {
                enabled: false
            },
            breakpoints: {}
        };

        this.settings.breakpoints[parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-sm'), 10)] = {
            slidesPerView: slidesPerView !== 'auto' && slidesPerView > 1 ? 3 : 'auto',
            slidesPerGroup: slidesPerView !== 'auto' && slidesPerView > 1 && this.opts.swiperCenteredSlides !== 'true' ? 3 : 1,
            spaceBetween: slidesGap
        };

        this.settings.breakpoints[parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-lg'), 10)] = {
            slidesPerView: slidesPerView !== 'auto' && slidesPerView > 1 ? slidesPerView : 'auto',
            slidesPerGroup: slidesPerView !== 'auto' && slidesPerView > 1 && this.opts.swiperCenteredSlides !== 'true' ? slidesPerView : 1,
            spaceBetween: slidesGap
        };

        if (this.opts.swiperEffect === 'fade') {

            this.settings.effect = 'fade';
            this.settings.parallax = false;
            this.settings.modules.push(EffectFade);

        } else if (this.opts.swiperEffect === 'parallax') {

            this.settings.effect = 'parallax';
            this.settings.parallax = true;
            this.settings.modules.push(Parallax);
        }

        if (['fade', 'parallax'].includes(this.opts.swiperEffect)) {

            this.settings.on = {
                init: function() {

                    if (this.params.parallax) {

                        for (const slideEl of this.slides) {
       
                            const titleEl = slideEl.querySelector('.slide-title');
                            const descriptionEl = slideEl.querySelector('.slide-description');
                            const actionEl = slideEl.querySelector('.slide-action');

                            if (titleEl) {
                                titleEl.setAttribute('data-swiper-parallax', 0.75 * this.width);
                            }

                            if (descriptionEl) {
                                descriptionEl.setAttribute('data-swiper-parallax', 0.65 * this.width);
                            }

                            if (actionEl) {
                                actionEl.setAttribute('data-swiper-parallax', 0.6 * this.width);
                            }
                        }
                    }
                },
                activeIndexChange: function() {

                    if (this.params.effect === 'fade') {

                        const slideEl = this.slides[this.activeIndex];

                        if (slideEl) {
                            theme.utils.animate(slideEl.querySelector('.swiper-slide-inner'), 'fadeIn', '1s', 'slow');
                        }
                    }
                }
            }
        }

        if (this.opts.swiperCenteredSlides === 'true') {
            this.settings.centeredSlides = true;

            if (this.opts.swiperCenteredSlidesBounds === 'true') {
                this.settings.centeredSlidesBounds = true;
            }
        }

        if (this.opts.swiperCenterInsufficientSlides === 'true') {
            this.settings.centerInsufficientSlides = true;
        }

        if (this.opts.swiperAutoplay === 'true') {
            this.settings.autoplay = {
                delay: this.opts.swiperAutoplaySpeed ? parseInt(this.opts.swiperAutoplaySpeed, 10) * 1000 : 3000,
                pauseOnMouseEnter: true,
                disableOnInteraction: false
            };
        }

        if (this.opts.swiperFreemode === 'true') {
            this.settings.watchSlidesProgress = true;
            this.settings.freeMode = {
                enabled: true,
                momentum: true,
                momentumBounce: true,
                minimumVelocity: 0.2,
                momentumBounceRatio: 1,
                momentumRatio: 1,
                momentumVelocityRatio: 1,
                sticky: true
            }
        }

        this.swiper = new Swiper(this.el, this.settings);

        window.addEventListener('resize', theme.utils.debounce(() => {

            // IOS fix, browser topbar resize on scroll down triggers resize event.
            if (window.innerWidth != windowWidth) {

                this.swiper.destroy();
                this.swiper = new Swiper(this.el, this.settings);

                windowWidth = window.innerWidth;
            }
        }, 150, false));

        document.addEventListener('finqu:section:unload', theme.utils.debounce(e => {
            if (this.el === e.target) {
                this.swiper.destroy();
            }
        }, 250, false));
    }
}