import noUiSlider from 'nouislider';

class Filters {

    constructor(prefix) {
        this.prefix = prefix;
        this.containerEl = document.querySelector(`.section-${prefix}`);
        this.rangeSliderEls = this.containerEl.querySelectorAll('.range-slider');
        this.mobileNavigationContainerEl = this.containerEl.querySelector('.filters-mobile-navigation-container');
        this.mobileNavigationCtaEl = this.containerEl.querySelector('.filters-mobile-navigation-footer-inner-cta');
        this.filtersFormSelector = null;
        this.filtersFormEl = null;
        this.filterInputEls = [];
        this.facetResultCountEls = [];
        this.dynamicContentEl = null;
        this.resetFiltersEls = [];
        this.paginateItemPreviousEl = null;
        this.paginateItemNextEl = null;
        this.sortByActionEls = [];
        this.removeFilterEls = [];
        this.processing = false;
        this.mobileView = null;
        this.pageUrl = new URL(window.location.href);
        this.pageUrl.searchParams.set('section', `${this.prefix}-template`);

        this.initSelectors();

        if (this.rangeSliderEls.length) {
            this.initSliders();
        }

        if (this.filtersFormEl) {
            this.bindEvents();
        }
    }

    isProcessing() {
        return this.processing;
    }
    
    isMobileView(update = false) {

        if (this.mobileView === null || update === true) {
            this.mobileView = window.matchMedia(`(min-width: ${theme.utils.getCssVariable('--style-grid-breakpoint-lg')})`).matches ? false : true;
        }

        return this.mobileView;
    }

    initSelectors() {
        this.filtersFormSelector = this.isMobileView() ? `#${this.prefix}-filters-mobile-form` : `#${this.prefix}-filters-form`;
        this.filtersFormEl = this.containerEl.querySelector(this.filtersFormSelector);
        this.filterInputEls = this.filtersFormEl ? this.filtersFormEl.querySelectorAll('input') : [];
        this.facetResultCountEls = this.filtersFormEl ? this.filtersFormEl.querySelectorAll('[data-facet-result-count]') : [];
        this.dynamicContentEl = this.containerEl.querySelector(`.${this.prefix}-dynamic-content`);
        this.resetFiltersEls = this.dynamicContentEl ? this.dynamicContentEl.querySelectorAll('.reset-filters') : null;
        this.paginateItemPreviousEl = this.dynamicContentEl ? this.dynamicContentEl.querySelector('.paginate-item-previous') : null;
        this.paginateItemNextEl = this.dynamicContentEl ? this.dynamicContentEl.querySelector('.paginate-item-next') : null;
        this.sortByActionEls = this.dynamicContentEl ? this.dynamicContentEl.querySelectorAll('.sort-by-action') : null;
        this.removeFilterEls =  this.dynamicContentEl ? this.dynamicContentEl.querySelectorAll('.remove-filter') : null;
    }

    initSliders() {

        this.rangeSliderEls.forEach(el => {

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

            }, 300));

            rangeSliderContainerEl.classList.add('has-pips');
        });
    }

    disableFilters() {

        if (this.isProcessing()) {
            return;
        }

        if (this.rangeSliderEls.length) {
            this.rangeSliderEls.forEach(el => {
                el.setAttribute('disabled', true);
            });
        }

        if (this.filterInputEls.length) {
            this.filterInputEls.forEach(el => {
                el.disabled = true;
            });
        }

        if (this.removeFilterEls.length) {
            this.removeFilterEls.forEach(el => {
                el.disabled = true;
            });
        }

        if (this.resetFiltersEls.length) {
            this.resetFiltersEls.forEach(el => {
                el.disabled = true;
            });
        }

        if (this.sortByActionEls.length) {
            this.sortByActionEls.forEach(el => {
                el.disabled = true;
            });
        }

        if (this.paginateItemPreviousEl) {
            this.paginateItemPreviousEl.disabled = true;
        }

        if (this.paginateItemNextEl) {
            this.paginateItemNextEl.disabled = true;
        }
    }
    
    enableFilters() {

        if (this.isProcessing()) {
            return;
        }

        if (this.rangeSliderEls.length) {
            this.rangeSliderEls.forEach(el => {
                el.removeAttribute('disabled');
            });
        }

        if (this.filterInputEls.length) {
            this.filterInputEls.forEach(el => {
                el.disabled = false;
            });
        }

        if (this.removeFilterEls.length) {
            this.removeFilterEls.forEach(el => {
                el.disabled = false;
            });
        }

        if (this.resetFiltersEls.length) {
            this.resetFiltersEls.forEach(el => {
                el.disabled = false;
            });
        }

        if (this.sortByActionEls.length) {
            this.sortByActionEls.forEach(el => {
                el.disabled = false;
            });
        }

        if (this.paginateItemPreviousEl) {
            this.paginateItemPreviousEl.disabled = false;
        }

        if (this.paginateItemNextEl) {
            this.paginateItemNextEl.disabled = false;
        }
    }

    render(scrollTop = false) {

        this.processing = true;
        this.dynamicContentEl.classList.add(`${this.prefix}-dynamic-content-loading`);

        this.disableFilters();

        fetch(this.pageUrl)
            .then((res) => res.text())
            .then((resText) => {

                this.pageUrl.searchParams.delete('section');

                history.pushState({}, '', this.pageUrl);

                const dom = new DOMParser().parseFromString(resText, 'text/html');
                const newDynamicContent = dom.querySelector(`.${this.prefix}-dynamic-content`);
                const itemCountEl = dom.querySelector(`[data-${this.prefix}-items-count]`);

                if (this.facetResultCountEls.length) {
                    this.facetResultCountEls.forEach(el => {
                        el.innerText = dom.querySelector(`[data-facet-result-count="${el.dataset.facetResultCount}"]`).innerText;
                    });
                }

                if (this.mobileNavigationCtaEl) {

                    const itemCount = itemCountEl ? itemCountEl.getAttribute(`data-${this.prefix}-items-count`) : '0';

                    if (itemCount == 1) {
                        this.mobileNavigationCtaEl.innerText = theme.utils.t('filters.show_result', {
                            amount: itemCount
                        });
                    } else {
                        this.mobileNavigationCtaEl.innerText = theme.utils.t('filters.show_result_plural', {
                            amount: itemCount
                        });
                    }
                }

                this.dynamicContentEl.replaceWith(newDynamicContent);

                this.initSelectors();

                this.processing = false;

                this.dynamicContentEl.classList.remove(`${this.prefix}-dynamic-content-loading`);

                this.enableFilters();

                if (scrollTop) {
                    document.body.scrollTop = this.containerEl.offsetTop;
                    document.documentElement.scrollTop = this.containerEl.offsetTop;
                }
            });
    }

    sortBy(type) {

        if (this.isProcessing()) {
            return;
        }

        this.pageUrl.searchParams.set('sort-by', type);
        this.render();
    }

    navigate(url) {
        
        if (this.isProcessing() || !url) {
            return;
        }

        this.pageUrl = new URL(url);
        this.render(true);
    }

    remove(id) {

        if (this.isProcessing()) {
            return;
        }

        this.containerEl.querySelectorAll(`.input-${id}`).forEach(el => {

            if (el.type === 'checkbox' || el.type === 'radio') {

                el.checked = false;

            } else if (el.type === 'number') {

                el.value = '';

            } else if (el.matches('[data-is-range-filter]')) {

                const sliderEl = el.parentNode.querySelector('.range-slider');

                el.value = '';

                if (sliderEl && sliderEl.noUiSlider) {
                    
                    const opts = sliderEl.dataset;
                    const rangeSliderMinTextEl = sliderEl.closest('.range-filter').querySelector('[data-range-slider-min-text]');
                    const rangeSliderMaxTextEl = sliderEl.closest('.range-filter').querySelector('[data-range-slider-max-text]');

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

        this.containerEl.querySelectorAll(`.input-mobile-${id}`).forEach(el => {

            if (el.type === 'checkbox' || el.type === 'radio') {

                el.checked = false;

            } else if (el.type === 'number') {

                el.value = '';

            } else if (el.matches('[data-is-range-filter]')) {

                const sliderEl = el.parentNode.querySelector('.range-slider');

                el.value = '';

                if (sliderEl && sliderEl.noUiSlider) {

                    const opts = sliderEl.dataset;
                    const rangeSliderMinTextEl = sliderEl.closest('.range-filter').querySelector('[data-range-slider-min-text]');
                    const rangeSliderMaxTextEl = sliderEl.closest('.range-filter').querySelector('[data-range-slider-max-text]');

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

        this.apply();
    }

    reset() {
        
        if (this.isProcessing()) {
            return;
        }

        this.filterInputEls.forEach(el => {

            if (el.type === 'checkbox' || el.type === 'radio') {

                el.checked = false;

            } else if (el.type === 'number') {

                el.value = '';

            } else if (el.matches('[data-is-range-filter]')) {

                const sliderEl = el.parentNode.querySelector('.range-slider');

                el.value = '';

                if (sliderEl && sliderEl.noUiSlider) {

                    const opts = sliderEl.dataset;
                    const rangeSliderMinTextEl = sliderEl.closest('.range-filter').querySelector('[data-range-slider-min-text]');
                    const rangeSliderMaxTextEl = sliderEl.closest('.range-filter').querySelector('[data-range-slider-max-text]');

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

        this.apply();
    }

    apply() {

        if (this.isProcessing()) {
            return;
        }

        const query = this.pageUrl.searchParams.get('q');
        const pageId = this.pageUrl.searchParams.get('page');
        const sortBy = this.pageUrl.searchParams.get('sort-by');
        const formData = new FormData(this.filtersFormEl);
        const searchParams = new URLSearchParams(formData);

        if (query) {
            searchParams.append('q', query);
        }

        if (pageId) {
            searchParams.append('page', pageId);
        }

        if (sortBy) {
            searchParams.append('sort-by', sortBy);
        }

        this.pageUrl.search = searchParams.toString();

        this.render();
    }

    show() {

        if (this.isMobileView()) {

            this.containerEl.querySelector('.section-inner').style.zIndex = 10;

            this.mobileNavigationContainerEl.classList.add('filters-mobile-navigation-visible');
            this.mobileNavigationContainerEl.classList.add('filters-mobile-navigation-active');

            document.body.classList.add('disable-scroll');
        }
    }

    hide() {

        if (this.isMobileView()) {

            this.mobileNavigationContainerEl.classList.remove('filters-mobile-navigation-active');
            
            document.body.classList.remove('disable-scroll');

            this.containerEl.querySelector('.section-inner').style.zIndex = null;
        }
    }

    bindEvents() {

        let isMobileViewPreviousValue = this.isMobileView();

        const getTargetEl = (selector, e) => {
            return e.target.matches(selector) ? e.target : e.target.closest(selector);
        };

        const actionHandler = (e) => {

            if (getTargetEl(`.${this.prefix}-filter-dropdown`, e)) {
                e.stopPropagation();
            }

            const sortByActionEl = getTargetEl('.sort-by-action', e);

            if (sortByActionEl) {
                return this.sortBy(sortByActionEl.value);
            }

            const paginateItemPreviousEl = getTargetEl('.paginate-item-previous', e);

            if (paginateItemPreviousEl) {

                e.preventDefault();
                
                return this.navigate(paginateItemPreviousEl.getAttribute('href'));
            }

            const paginateItemNextEl = getTargetEl('.paginate-item-next', e);

            if (paginateItemNextEl) {

                e.preventDefault();
                
                return this.navigate(paginateItemNextEl.getAttribute('href'));
            }

            const removeFilterEl = getTargetEl(`.${this.prefix}-remove-filter`, e);

            if (removeFilterEl) {
                return this.remove(removeFilterEl.value);
            }

            if (getTargetEl(`.${this.prefix}-reset-filters`, e)) {
                return this.reset();
            }

            if (getTargetEl('[name="filters-mobile-navigation-show"]', e)) {
                return this.show();
            }

            if (getTargetEl('[name="filters-mobile-navigation-hide"]', e)) {
                return this.hide();
            }
        };

        document.addEventListener('theme:filters:apply', this.apply.bind(this));

        document.addEventListener('theme:filters:reset', this.reset.bind(this));

        document.addEventListener('theme:filters:remove', e => this.remove(e.detail.value).bind(this));

        document.addEventListener('theme:filters:sortBy', e => this.sortBy(e.detail.value).bind(this));

        document.addEventListener('theme:filters:show', this.show.bind(this));

        document.addEventListener('theme:filters:hide', this.hide.bind(this));

        document.addEventListener('theme:filters:disableFilters', this.disableFilters.bind(this));

        document.addEventListener('theme:filters:enableFilters', this.enableFilters.bind(this));

        document.addEventListener('click', actionHandler);

        document.addEventListener('input', e => {

            if (this.filterInputEls.length && [...this.filterInputEls].some(el => el === e.target)) {

                e.preventDefault();

                return this.apply();
            }
        });

        this.mobileNavigationContainerEl.addEventListener('transitionend', e => {

            e.preventDefault();

            if (!this.mobileNavigationContainerEl.classList.contains('filters-mobile-navigation-active')) {
                this.mobileNavigationContainerEl.classList.remove('filters-mobile-navigation-visible');
            }
        });

        window.addEventListener('resize', () => {

            requestAnimationFrame(theme.utils.debounce(() => {

                if (this.isMobileView(true) !== isMobileViewPreviousValue) {
                    this.initSelectors();
                }

                isMobileViewPreviousValue = this.isMobileView();

            }, 300));
        });
    }
}

export default Filters;