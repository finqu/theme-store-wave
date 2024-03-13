import Swiper from 'swiper';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import noUiSlider from 'nouislider';

export default function() {
    
    const containerEl = document.querySelector('.section-category');
    const categorySubcategoriesEl = containerEl.querySelector('.category-subcategories');
    const matchMedia = window.matchMedia(`(min-width: ${theme.utils.getCssVariable('--style-grid-breakpoint-lg')})`);
    let categoryFiltersFormEl = null;

    if (matchMedia.matches) {

        const el = containerEl.querySelector('#category-filters-form');
        categoryFiltersFormEl = el ? el : false;

    } else {

        const el = containerEl.querySelector('#category-filters-mobile-form');
        categoryFiltersFormEl = el ? el : false;
    }
    
    const categoryFilterInputEls = categoryFiltersFormEl ? categoryFiltersFormEl.querySelectorAll('input') : [];
    const categoryRangeSliderEls = categoryFiltersFormEl ? categoryFiltersFormEl.querySelectorAll('.range-slider') : [];
    const facetResultCountEls = categoryFiltersFormEl ? categoryFiltersFormEl.querySelectorAll('[data-facet-result-count]') : [];
    const filtersMobileNavigationCtaEl = categoryFiltersFormEl ? containerEl.querySelector('.filters-mobile-navigation-container .filters-mobile-navigation-footer-inner-cta') : null;
    
    let categoryDynamicContentEl = containerEl.querySelector('.category-dynamic-content');
    let categoryResetFiltersEls = categoryDynamicContentEl.querySelectorAll('.category-reset-filters');
    let categoryPaginateItemPreviousEl = categoryDynamicContentEl.querySelector('.paginate-item-previous');
    let categoryPaginateItemNextEl = categoryDynamicContentEl.querySelector('.paginate-item-next');
    let categorySortByActionEls = categoryDynamicContentEl.querySelectorAll('.sort-by-action');
    let categoryRemoveFilterEls = categoryDynamicContentEl.querySelectorAll('.category-remove-filter');

    let isProcessing = false;

    const renderDynamicContent = (url, scrollTop = false) => {

        const xhr = new XMLHttpRequest();

        categoryResetFiltersEls = categoryDynamicContentEl.querySelectorAll('.category-reset-filters');
        categoryPaginateItemPreviousEl = categoryDynamicContentEl.querySelector('.paginate-item-previous');
        categoryPaginateItemNextEl = categoryDynamicContentEl.querySelector('.paginate-item-next');
        categorySortByActionEls = categoryDynamicContentEl.querySelectorAll('.sort-by-action');
        categoryRemoveFilterEls = categoryDynamicContentEl.querySelectorAll('.category-remove-filter');
        isProcessing = true;

        categoryDynamicContentEl.classList.add('category-dynamic-content-loading');

        if (categoryRangeSliderEls.length) {
            categoryRangeSliderEls.forEach(el => {
                el.setAttribute('disabled', true);
            });
        }

        if (categoryFilterInputEls.length) {
            categoryFilterInputEls.forEach(el => {
                el.disabled = true;
            });
        }

        if (categoryRemoveFilterEls.length) {
            categoryRemoveFilterEls.forEach(el => {
                el.disabled = true;
            });
        }

        if (categoryResetFiltersEls.length) {
            categoryResetFiltersEls.forEach(el => {
                el.disabled = true;
            });
        }

        if (categorySortByActionEls.length) {
            categorySortByActionEls.forEach(el => {
                el.disabled = true;
            });
        }

        if (categoryPaginateItemPreviousEl) {
            categoryPaginateItemPreviousEl.disabled = true;
        }

        if (categoryPaginateItemNextEl) {
            categoryPaginateItemNextEl.disabled = true;
        }

        xhr.open('GET', url, true);
        xhr.onreadystatechange = () => {

            if (xhr.readyState === 4) {

                const dom = new DOMParser().parseFromString(xhr.responseText, 'text/html');
                const newCategoryDynamicContent = dom.querySelector('.section-category .category-dynamic-content');
                const itemCountEl = dom.querySelector('[data-category-items-count]');
                
                if (facetResultCountEls.length) {

                    facetResultCountEls.forEach(el => {
                        el.innerText = dom.querySelector('[data-facet-result-count="'+el.dataset.facetResultCount+'"]').innerText;
                    });
                }

                if (filtersMobileNavigationCtaEl) {

                    const itemCount = itemCountEl ? itemCountEl.getAttribute('data-category-items-count') : '0';

                    if (itemCount == 1) {

                        filtersMobileNavigationCtaEl.innerText = theme.utils.t('filters.show_result', {
                            amount: itemCount
                        });

                    } else {

                        filtersMobileNavigationCtaEl.innerText = theme.utils.t('filters.show_result_plural', {
                            amount: itemCount
                        });
                    }
                }

                categoryDynamicContentEl.replaceWith(newCategoryDynamicContent);
                categoryDynamicContentEl = newCategoryDynamicContent;
                categoryResetFiltersEls = categoryDynamicContentEl.querySelectorAll('.category-reset-filters');
                categoryPaginateItemPreviousEl = categoryDynamicContentEl.querySelector('.paginate-item-previous');
                categoryPaginateItemNextEl = categoryDynamicContentEl.querySelector('.paginate-item-next');
                categorySortByActionEls = categoryDynamicContentEl.querySelectorAll('.sort-by-action');
                categoryRemoveFilterEls = categoryDynamicContentEl.querySelectorAll('.category-remove-filter');

                if (history.pushState) {
                    window.history.pushState({path:url},'',url);
                }

                isProcessing = false;
                categoryDynamicContentEl.classList.remove('category-dynamic-content-loading');

                if (categoryRangeSliderEls.length) {
                    categoryRangeSliderEls.forEach(el => {
                        el.removeAttribute('disabled');
                    });
                }
        
                if (categoryFilterInputEls.length) {
                    categoryFilterInputEls.forEach(el => {
                        el.disabled = false;
                    });
                }
        
                if (categoryRemoveFilterEls.length) {
                    categoryRemoveFilterEls.forEach(el => {
                        el.disabled = false;
                    });
                }

                if (categoryResetFiltersEls.length) {
                    categoryResetFiltersEls.forEach(el => {
                        el.disabled = false;
                    });
                }

                if (categorySortByActionEls.length) {
                    categorySortByActionEls.forEach(el => {
                        el.disabled = false;
                    });
                }
        
                if (categoryPaginateItemPreviousEl) {
                    categoryPaginateItemPreviousEl.disabled = false;
                }
        
                if (categoryPaginateItemNextEl) {
                    categoryPaginateItemNextEl.disabled = false;
                }

                if (scrollTop) {
                    document.body.scrollTop = containerEl.offsetTop;
                    document.documentElement.scrollTop = containerEl.offsetTop;
                }

                bindEvents();
            }
        };

        xhr.send();
    };

    const bindEvents = () => {

        if (categorySortByActionEls.length) {

            categorySortByActionEls.forEach(el => { el.addEventListener('click', e => {

                if (isProcessing) {
                    return;
                }

                const url = new URL(window.location);

                url.searchParams.set('sort-by', e.target.value);

                renderDynamicContent(url.href);
            })});
        }

        if (categoryPaginateItemPreviousEl) {

            categoryPaginateItemPreviousEl.addEventListener('click', e => {

                if (isProcessing) {
                    return;
                }

                e.preventDefault();

                if (e.target.hasAttribute('href')) {
                    renderDynamicContent(e.target.getAttribute('href'), true);
                }
            });
        }

        if (categoryPaginateItemNextEl) {

            categoryPaginateItemNextEl.addEventListener('click', e => {

                if (isProcessing) {
                    return;
                }

                e.preventDefault();

                if (e.target.hasAttribute('href')) {
                    renderDynamicContent(e.target.getAttribute('href'), true);
                }
            });
        }

        if (categoryRemoveFilterEls.length) {

            categoryRemoveFilterEls.forEach(el => { el.addEventListener('click', () => {

                if (isProcessing) {
                    return;
                }

                categoryFiltersFormEl.querySelectorAll('.input-'+el.value).forEach(el => {

                    if (el.type === 'checkbox' || el.type ==='radio') {

                        el.checked = false;

                    } else if (el.type === 'number') {

                        el.value = '';

                    } else if (el.hasAttribute('data-is-range-filter')) {

                        const sliderEl = el.parentNode.querySelector('.range-slider');

                        el.value = '';

                        if (sliderEl && sliderEl.noUiSlider) {

                            const opts = sliderEl.dataset;
                            const rangeSliderMinTextEl = sliderEl.closest('.range-filter').querySelector('[ data-range-slider-min-text]');
                            const rangeSliderMaxTextEl = sliderEl.closest('.range-filter').querySelector('[ data-range-slider-max-text]');

                            sliderEl.noUiSlider.set([
                                parseInt(opts.rangeSliderMinDefault, 10),
                                parseInt(opts.rangeSliderMaxDefault, 10)
                            ]);

                            if (opts.rangeSliderFormat === 'currency') {

                                rangeSliderMinTextEl.innerHTML = theme.utils.formatCurrency({
                                    value: opts.rangeSliderMinDefault
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatCurrency({
                                    value: opts.rangeSliderMaxDefault
                                });
    
                            } else if (opts.rangeSliderFormat === 'decimal') {
    
                                rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                    value: opts.rangeSliderMinDefault
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                    value: opts.rangeSliderMaxDefault
                                });
    
                            } else if (opts.rangeSliderFormat === 'percent') {
    
                                rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'percent',
                                    value: opts.rangeSliderMinDefault
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'percent',
                                    value: opts.rangeSliderMaxDefault
                                });
    
                            } else if (opts.rangeSliderFormat === 'unit') {
    
                                rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'unit',
                                    value: opts.rangeSliderMinDefault,
                                    unit: opts.rangeSliderFormatUnit || '',
                                    unitDisplay: opts.rangeSliderFormatUnitDisplay || 'short'
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'unit',
                                    value: opts.rangeSliderMaxDefault,
                                    unit: opts.rangeSliderFormatUnit || '',
                                    unitDisplay: opts.rangeSliderFormatUnitDisplay || 'short'
                                });
    
                            } else {
    
                                rangeSliderMinTextEl.innerHTML = opts.rangeSliderMinDefault;
                                rangeSliderMaxTextEl.innerHTML = opts.rangeSliderMaxDefault;
                            }
                        }
                    }
                });

                categoryFiltersFormEl.querySelectorAll('.input-mobile-'+el.value).forEach(el => {

                    if (el.type === 'checkbox' || el.type ==='radio') {

                        el.checked = false;

                    } else if (el.type === 'number') {

                        el.value = '';

                    } else if (el.hasAttribute('data-is-range-filter')) {

                        const sliderEl = el.parentNode.querySelector('.range-slider');

                        el.value = '';

                        if (sliderEl && sliderEl.noUiSlider) {

                            const opts = sliderEl.dataset;
                            const rangeSliderMinTextEl = sliderEl.closest('.range-filter').querySelector('[ data-range-slider-min-text]');
                            const rangeSliderMaxTextEl = sliderEl.closest('.range-filter').querySelector('[ data-range-slider-max-text]');

                            sliderEl.noUiSlider.set([
                                parseInt(opts.rangeSliderMinDefault, 10),
                                parseInt(opts.rangeSliderMaxDefault, 10)
                            ]);

                            if (opts.rangeSliderFormat === 'currency') {

                                rangeSliderMinTextEl.innerHTML = theme.utils.formatCurrency({
                                    value: opts.rangeSliderMinDefault
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatCurrency({
                                    value: opts.rangeSliderMinDefault
                                });
    
                            } else if (opts.rangeSliderFormat === 'decimal') {
    
                                rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                    value: opts.rangeSliderMinDefault
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                    value: opts.rangeSliderMaxDefault
                                });
    
                            } else if (opts.rangeSliderFormat === 'percent') {
    
                                rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'percent',
                                    value: opts.rangeSliderMinDefault
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'percent',
                                    value: opts.rangeSliderMaxDefault
                                });
    
                            } else if (opts.rangeSliderFormat === 'unit') {
    
                                rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'unit',
                                    value: opts.rangeSliderMinDefault,
                                    unit: opts.rangeSliderFormatUnit || '',
                                    unitDisplay: opts.rangeSliderFormatUnitDisplay || 'short'
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'unit',
                                    value: opts.rangeSliderMaxDefault,
                                    unit: opts.rangeSliderFormatUnit || '',
                                    unitDisplay: opts.rangeSliderFormatUnitDisplay || 'short'
                                });
    
                            } else {
    
                                rangeSliderMinTextEl.innerHTML = opts.rangeSliderMinDefault;
                                rangeSliderMaxTextEl.innerHTML = opts.rangeSliderMaxDefault;
                            }
                        }
                    }
                });

                categoryFiltersFormEl.dispatchEvent(new Event('submit'));
            })});
        }

        if (categoryResetFiltersEls.length) {

            categoryResetFiltersEls.forEach(el => { el.addEventListener('click', () => {

                if (isProcessing) {
                    return;
                }

                categoryFilterInputEls.forEach(el => {

                    if (el.type === 'checkbox' || el.type ==='radio') {

                        el.checked = false;

                    } else if (el.type === 'number') {

                        el.value = '';

                    } else if (el.hasAttribute('data-is-range-filter')) {

                        const sliderEl = el.parentNode.querySelector('.range-slider');

                        el.value = '';

                        if (sliderEl && sliderEl.noUiSlider) {

                            const opts = sliderEl.dataset;
                            const rangeSliderMinTextEl = sliderEl.closest('.range-filter').querySelector('[ data-range-slider-min-text]');
                            const rangeSliderMaxTextEl = sliderEl.closest('.range-filter').querySelector('[ data-range-slider-max-text]');

                            sliderEl.noUiSlider.set([
                                parseInt(opts.rangeSliderMinDefault, 10),
                                parseInt(opts.rangeSliderMaxDefault, 10)
                            ]);

                            if (opts.rangeSliderFormat === 'currency') {

                                rangeSliderMinTextEl.innerHTML = theme.utils.formatCurrency({
                                    value: opts.rangeSliderMinDefault
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatCurrency({
                                    value: opts.rangeSliderMaxDefault
                                });
    
                            } else if (opts.rangeSliderFormat === 'decimal') {
    
                                rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                    value: opts.rangeSliderMinDefault
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                    value: opts.rangeSliderMaxDefault
                                });
    
                            } else if (opts.rangeSliderFormat === 'percent') {
    
                                rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'percent',
                                    value: opts.rangeSliderMinDefault
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'percent',
                                    value: opts.rangeSliderMaxDefault
                                });
    
                            } else if (opts.rangeSliderFormat === 'unit') {
    
                                rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'unit',
                                    value: opts.rangeSliderMinDefault,
                                    unit: opts.rangeSliderFormatUnit || '',
                                    unitDisplay: opts.rangeSliderFormatUnitDisplay || 'short'
                                });

                                rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                    style: 'unit',
                                    value: opts.rangeSliderMaxDefault,
                                    unit: opts.rangeSliderFormatUnit || '',
                                    unitDisplay: opts.rangeSliderFormatUnitDisplay || 'short'
                                });
    
                            } else {
    
                                rangeSliderMinTextEl.innerHTML = opts.rangeSliderMinDefault;
                                rangeSliderMaxTextEl.innerHTML = opts.rangeSliderMaxDefault;
                            }
                        }
                    }
                });

                categoryFiltersFormEl.dispatchEvent(new Event('submit'));
            })});
        }

        categoryDynamicContentEl.querySelectorAll('[name="filters-mobile-navigation-show"]').forEach(el => { el.addEventListener('click', e => {

            if (isProcessing) {
                return;
            }

            containerEl.dispatchEvent(new Event('theme:filters:show'));
        })});
    };

    if (categoryFiltersFormEl) {

        categoryRangeSliderEls.forEach(el => {

            const opts = el.dataset;
            const rangeSliderContainerEl = el.parentNode;
            const rangeFilterEl = rangeSliderContainerEl.parentNode;
            const rangeSliderMinTextEl = rangeFilterEl.querySelector('[data-range-slider-min-text]');
            const rangeSliderMaxTextEl = rangeFilterEl.querySelector('[data-range-slider-max-text]');
            const rangeSliderMinInputEl = rangeSliderContainerEl.querySelector('input[name="'+opts.rangeSliderMinName+'"]');
            const rangeSliderMaxInputEl = rangeSliderContainerEl.querySelector('input[name="'+opts.rangeSliderMaxName+'"]');
            const rangeSlider = noUiSlider.create(el, {
                start: [
                    parseInt(opts.rangeSliderMinDefault, 10),
                    parseInt(opts.rangeSliderMaxDefault, 10)
                ],
                connect: true,
                range: {
                    'min': parseInt(opts.rangeSliderMinValue, 10),
                    'max': parseInt(opts.rangeSliderMaxValue, 10)
                },
                pips: {
                    mode: 'steps',
                    density: 3
                }
            });

            let initialized = false;

            rangeSlider.on('update', theme.utils.debounce((values, handle) => {

                if (initialized) {

                    const value = parseInt(values[handle], 10);

                    if (handle === 0) {

                        rangeSliderMinInputEl.value = parseInt(opts.rangeSliderMinValue, 10) !== value ? value : '';

                        if (opts.rangeSliderFormat === 'currency') {

                            rangeSliderMinTextEl.innerHTML = theme.utils.formatCurrency({
                                value: value
                            });

                        } else if (opts.rangeSliderFormat === 'decimal') {

                            rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                value: value
                            });

                        } else if (opts.rangeSliderFormat === 'percent') {

                            rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                style: 'percent',
                                value: value
                            });

                        } else if (opts.rangeSliderFormat === 'unit') {

                            rangeSliderMinTextEl.innerHTML = theme.utils.formatNumber({
                                style: 'unit',
                                value: value,
                                unit: opts.rangeSliderFormatUnit || '',
                                unitDisplay: opts.rangeSliderFormatUnitDisplay || 'short'
                            });

                        } else {

                            rangeSliderMinTextEl.innerHTML = value;
                        }

                        rangeSliderMinInputEl.dispatchEvent(new Event('input', { bubbles:true }));

                    } else {

                        rangeSliderMaxInputEl.value = parseInt(opts.rangeSliderMaxValue, 10) !== value ? value : '';

                        if (opts.rangeSliderFormat === 'currency') {

                            rangeSliderMaxTextEl.innerHTML = theme.utils.formatCurrency({
                                value: value
                            });

                        } else if (opts.rangeSliderFormat === 'decimal') {

                            rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                value: value
                            });

                        } else if (opts.rangeSliderFormat === 'percent') {

                            rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                style: 'percent',
                                value: value
                            });

                        } else if (opts.rangeSliderFormat === 'unit') {

                            rangeSliderMaxTextEl.innerHTML = theme.utils.formatNumber({
                                style: 'unit',
                                value: value,
                                unit: opts.rangeSliderFormatUnit || '',
                                unitDisplay: opts.rangeSliderFormatUnitDisplay || 'short'
                            });

                        } else {

                            rangeSliderMaxTextEl.innerHTML = value;
                        }

                        rangeSliderMaxInputEl.dispatchEvent(new Event('input', { bubbles:true }));
                    }

                } else {

                    initialized = true;
                }

            }, 500, false));

            rangeSliderContainerEl.classList.add('has-pips');
        });

        categoryFilterInputEls.forEach(el => { el.addEventListener('input', () => {

            if (isProcessing) {
                return;
            }

            categoryFiltersFormEl.dispatchEvent(new Event('submit'));
        })});

        categoryFiltersFormEl.addEventListener('submit', e => {

            e.preventDefault();

            const pageUrl = new URL(window.location);
            const pageId = pageUrl.searchParams.get('page');
            const sortBy = pageUrl.searchParams.get('sort-by');
            const formData = new FormData(categoryFiltersFormEl);
            let searchParams = new URLSearchParams(formData)

            if (pageId) {
                searchParams.append('page', pageId);
            }

            if (sortBy) {
                searchParams.append('sort-by', sortBy);
            }

            const url = `${window.location.pathname}?${searchParams.toString()}`;

            renderDynamicContent(url);
        });

        categoryFiltersFormEl.querySelectorAll('.dropdown-menu').forEach(el => { el.addEventListener('click', e => {
            e.stopPropagation();
        })});

        // Mobile filters menu
        const filtersMobileNavigationContainerEl = containerEl.querySelector('.filters-mobile-navigation-container');

        containerEl.addEventListener('theme:filters:show', () => {
            
            filtersMobileNavigationContainerEl.classList.add('filters-mobile-navigation-visible');
            filtersMobileNavigationContainerEl.classList.add('filters-mobile-navigation-active');

            document.body.classList.add('disable-scroll');
        });

        containerEl.addEventListener('theme:filters:hide', () => {
            
            filtersMobileNavigationContainerEl.classList.remove('filters-mobile-navigation-active');

            document.body.classList.remove('disable-scroll');
        });

        containerEl.querySelectorAll('[name="filters-mobile-navigation-show"]').forEach(el => { el.addEventListener('click', (e) => containerEl.dispatchEvent(new Event('theme:filters:show')))});
        containerEl.querySelectorAll('[name="filters-mobile-navigation-hide"]').forEach(el => { el.addEventListener('click', (e) => containerEl.dispatchEvent(new Event('theme:filters:hide')))});

        filtersMobileNavigationContainerEl.addEventListener('transitionend', e => {

            e.preventDefault();

            if (!filtersMobileNavigationContainerEl.classList.contains('filters-mobile-navigation-active')) {
                filtersMobileNavigationContainerEl.classList.remove('filters-mobile-navigation-visible');
            }
        });
    }

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

    bindEvents();
}