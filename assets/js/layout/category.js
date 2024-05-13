import Filters from '../components/filters';
import Swiper from 'swiper';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

export default function() {
    
    const containerEl = document.querySelector('.section-category');
    const categorySubcategoriesEl = containerEl.querySelector('.category-subcategories');

    if (categorySubcategoriesEl && categorySubcategoriesEl.classList.contains('category-tags')) {

        const baseSize = parseFloat(theme.utils.getCssVariable('font-size'), 10);
        const gutterWidth = parseFloat(theme.utils.getCssVariable('--style-grid-gutter-width'), 10);

        new Swiper(categorySubcategoriesEl.querySelector('.swiper'), {
            modules: [
                Navigation,
                FreeMode
            ],
            spaceBetween: Math.round(baseSize * gutterWidth),
            slidesPerView: 'auto',
            freeMode: {
                enabled: true,
                minimumVelocity: 0.2,
                momentum: false
            },
            watchSlidesProgress: true,
            navigation: {
                nextEl: categorySubcategoriesEl.querySelector('.swiper .swiper-button-next'),
                prevEl:  categorySubcategoriesEl.querySelector('.swiper .swiper-button-prev')
            }
        });

    } else if (categorySubcategoriesEl && categorySubcategoriesEl.classList.contains('category-images')) {

        const baseSize = parseFloat(theme.utils.getCssVariable('font-size'), 10);
        const gutterWidth = parseFloat(theme.utils.getCssVariable('--style-grid-gutter-width'), 10);
        const swiperOpts = {
            modules: [
                Navigation
            ],
            spaceBetween: Math.round(baseSize * gutterWidth),
            slidesPerView: 3,
            slidesPerGroup: 3,
            grabCursor: true,
            navigation: {
                nextEl:  categorySubcategoriesEl.querySelector('.swiper .swiper-button-next'),
                prevEl:  categorySubcategoriesEl.querySelector('.swiper .swiper-button-prev')
            },
            breakpoints: {}
        };

        swiperOpts.breakpoints[parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-sm'), 10)] = {
            slidesPerView: 4,
            slidesPerGroup: 4
        };

        swiperOpts.breakpoints[parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-md'), 10)] = {
            slidesPerView: 5,
            slidesPerGroup: 5
        };

        swiperOpts.breakpoints[parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-lg'), 10)] = {
            slidesPerView: 6,
            slidesPerGroup: 6
        };

        swiperOpts.breakpoints[parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-xl'), 10)] = {
            slidesPerView: 8,
            slidesPerGroup: 8
        };

        new Swiper(categorySubcategoriesEl.querySelector('.swiper'), swiperOpts);
    }

    const test = new Filters('category');

    console.log(test);
}