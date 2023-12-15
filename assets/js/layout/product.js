import Swiper from 'swiper';
import { Navigation, Pagination, Thumbs, Mousewheel, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/mousewheel';
import 'swiper/css/free-mode';
import LazyLoad from 'vanilla-lazyload';

export default function() {
    
    const containerEl = document.querySelector('.section-product');
    let productThumbMediaSwiper = null;
    let productMainMediaSwiper = null;

    const initProductMedia = () => {

        const productThumbMediaSwiperEl = containerEl.querySelector('#product-thumb-media-swiper');
        let productMainMediaSwiperEl = containerEl.querySelector('#product-main-media-swiper');

        const productMainMediaSwiperOpts = {
            modules: [
                Navigation,
                Pagination,
                Thumbs
            ],
            allowTouchMove: true,
            speed: 0,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            breakpoints: {}
        };

        productMainMediaSwiperOpts.breakpoints[parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-lg'), 10)] = {
            allowTouchMove: false
        };

        if (productThumbMediaSwiperEl) {

            const baseSize = parseFloat(theme.utils.getCssVariable('font-size'), 10);
            const gutterWidth = parseFloat(theme.utils.getCssVariable('--style-grid-gutter-width'), 10);

            const productThumbMediaSwiperOpts = {
                modules: [
                    Navigation,
                    FreeMode,
                    Thumbs,
                    Mousewheel
                ],
                direction: productThumbMediaSwiperEl.classList.contains('swiper-vertical') ? 'vertical' : 'horizontal',
                spaceBetween: Math.round(baseSize * gutterWidth),
                slidesPerView: productThumbMediaSwiperEl.classList.contains('swiper-vertical') ? 'auto' : 5,
                slidesPerGroup: productThumbMediaSwiperEl.classList.contains('swiper-vertical') ? 1 : 5,
                slidesPerGroupAuto: productThumbMediaSwiperEl.classList.contains('swiper-vertical') ? true : false, 
                freeMode: {
                    enabled: true,
                    minimumVelocity: 0.2,
                    momentum: false
                },
                watchSlidesProgress: true,
                mousewheel: {
                    releaseOnEdges: false
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev'
                }
            };

            if (productThumbMediaSwiperOpts.direction === 'vertical') {
                productThumbMediaSwiperEl.style.height = productMainMediaSwiperEl.getBoundingClientRect().height+'px';
            }

            productThumbMediaSwiper = new Swiper(productThumbMediaSwiperEl, productThumbMediaSwiperOpts);

            productMainMediaSwiperOpts.thumbs = {
                swiper: productThumbMediaSwiper
            };

            const productThumbEls = productThumbMediaSwiperEl.querySelectorAll('.swiper-slide');

            productThumbEls.forEach((el, index) => { el.addEventListener('mouseover', e => {
                productMainMediaSwiper.slideTo(index, 0, true);
            })});

            window.addEventListener('resize', theme.utils.debounce(() => {

                productMainMediaSwiperEl = containerEl.querySelector('#product-main-media-swiper');

                if (productThumbMediaSwiperOpts.direction === 'vertical') {
                    productThumbMediaSwiperEl.style.height = productMainMediaSwiperEl.getBoundingClientRect().height+'px';
                }

            }, 150, false));
        }

        productMainMediaSwiper = new Swiper(productMainMediaSwiperEl, productMainMediaSwiperOpts);

        const productImageEls = productMainMediaSwiperEl.querySelectorAll('.lazy');

        // Preload product images so those are available when customer clicks thumb
        if (productImageEls.length) {

            productImageEls.forEach((el, index) => {

                LazyLoad.load(el, {
                    show_while_loading: true
                });
            });
        }
    };

    const initProductAttributes = () => {

        const productId = containerEl.querySelector('[name="product_id"]').value;

        // If attribute is visible show it
        containerEl.querySelectorAll('.product-attribute[data-is-usable]').forEach(el => {

            if (el.offsetParent !== null) {
                el.removeAttribute('disabled');
            }
        });

        // Attributes product price total option
        containerEl.querySelectorAll('.product-attribute.has-price, option.has-price').forEach(el => {

            if (el.nodeName === 'OPTION') {

                fetch('/api/products/'+productId+'/price?attributes['+el.value+']=true')
                    .then(res => res.json())
                    .then(data => {

                        const price = theme.store.taxFreeShopping ? data.net_price : data.price;

                        el.textContent += '('+theme.utils.formatCurrency({ value: price })+')';
                    });

            } else if (['CHECKBOX', 'RADIO'].includes(el.nodeName)) {

                fetch('/api/products/'+productId+'/price?attributes['+el.value+']=true')
                    .then(res => res.json())
                    .then(data => {

                        const labelEls = Array.from(el.parentElement.children).filter(sibling => {
                            return sibling !== el && sibling.nodeName === 'LABEL';
                        });

                        if (labelEls.length) {

                            const price = theme.store.taxFreeShopping ? data.net_price : data.price;

                            labelEls.forEach(labelEl => {
                                labelEl.textContent += '('+theme.utils.formatCurrency({ value: price })+')';
                            });
                        }
                    });

            } else if (el.nodeName === 'TEXTAREA') {

                fetch('/api/products/'+productId+'/price?attributes['+el.name+']=true')
                    .then(res => res.json())
                    .then(data => {

                        const labelEls = Array.from(el.parentElement.children).filter(sibling => {
                            return sibling !== el && sibling.nodeName === 'LABEL';
                        });

                        if (labelEls.length) {

                            const price = theme.store.taxFreeShopping ? data.net_price : data.price;

                            labelEls.forEach(labelEl => {
                                labelEl.textContent += '('+theme.utils.formatCurrency({ value: price })+')';
                            });
                        }
                    });
            }
        });

        containerEl.querySelectorAll('.product-attribute').forEach(productAttributeEl => {

            productAttributeEl.addEventListener('change', () => {

                const productAttributeContainerEl = productAttributeEl.closest('.product-attribute-container');
                let siblingEls = null;
                let productAttributes = [];

                if (productAttributeContainerEl) {

                    const productAttributeContainerParentEl = productAttributeContainerEl.parentElement;
                    const els = Array.from(productAttributeContainerParentEl.parentElement.children).filter(sibling => {
                        return sibling !== productAttributeContainerParentEl && sibling.classList.contains('product-subattribute-container') && sibling.dataset.attribute === productAttributeEl.dataset.attribute;
                    });

                    if (els.length) {
                        siblingEls = els;
                    }
                }

                if (siblingEls === null) {

                    const productAttributeParentEl = productAttributeEl.parentElement;
                    const els = Array.from(productAttributeParentEl.parentElement.children).filter(sibling => {
                        return sibling !== productAttributeParentEl && sibling.classList.contains('product-subattribute-container') && sibling.dataset.attribute === productAttributeEl.dataset.attribute;
                    });

                    if (els.length) {
                        siblingEls = els;
                    }
                }

                if (productAttributeEl.nodeName === 'CHECKBOX') {

                    const productAttributeContainerEl = productAttributeEl.closest('.product-attribute-container');
                    const productAttributeContainerParentEl = productAttributeContainerEl.parentElement;
                    const els = Array.from(productAttributeContainerParentEl.parentElement.children).filter(sibling => {
                        return sibling !== productAttributeContainerParentEl && sibling.classList.contains('product-subattribute-container') && sibling.dataset.option === productAttributeEl.value;
                    });

                    if (els.length) {

                        siblingEls = els;

                    } else {

                        const productAttributeParentEl = productAttributeEl.parentElement;
                        const els = Array.from(productAttributeParentEl.parentElement.children).filter(sibling => {
                            return sibling !== productAttributeParentEl && sibling.classList.contains('product-subattribute-container') && sibling.dataset.option === productAttributeEl.value;
                        });

                        if (els.length) {
                            siblingEls = els;
                        }
                    }
                }

                if (siblingEls !== null) {

                    siblingEls.forEach(siblingEl => {

                        siblingEl.style.display = 'none';

                        siblingEl.querySelectorAll('textarea').forEach(textareaEl => {
                            textareaEl.value = '';
                        });
                        
                        siblingEl.querySelectorAll('.product-attribute').forEach(productAttributeEl => {
                            productAttributeEl.setAttribute('disabled', true);
                        });
                    });
                }

                // Reset subattributes if hidden
                containerEl.querySelectorAll('.product-subattribute-container').forEach(productSubattributeContainerEl => {

                    if (productSubattributeContainerEl.offsetParent !== null) {

                        productSubattributeContainerEl.querySelectorAll('.product-attribute').forEach(productAttributeEl => {

                            if (['CHECKBOX', 'RADIO'].includes(productAttributeEl.nodeName)) {

                                productAttributeEl.checked = false;

                            } else if (productAttributeEl.nodeName === 'SELECT') {
                                    
                                productAttributeEl.selectedIndex = 0;
                            }
                        });
                    }
                });

                // Change image on radio select
                if (productAttributeEl.hasAttribute('data-has-image') && productMainMediaSwiper) {

                    const el = document.querySelector('#product-main-media-swiper .swiper-slide[data-product-option-image="'+productAttributeEl.value+'"]');
                    const index = [...el.parentElement.children].indexOf(el);

                    productMainMediaSwiper.slideTo(index, 0, true);
                }

                // Show attributes if active
                if (productAttributeEl.nodeName === 'SELECT' &&
                    productAttributeEl.value ||
                    (['CHECKBOX', 'RADIO'].includes(productAttributeEl.nodeName) && productAttributeEl.checked) ||
                    (productAttributeEl.nodeName === 'TEXTAREA' && productAttributeEl.value)) {

                        containerEl.querySelectorAll('[data-option="'+productAttributeEl.value+'"]').forEach(productSubattributeContainerEl => {

                            productSubattributeContainerEl.style.display = 'block';

                            productSubattributeContainerEl.querySelectorAll('[data-is-usable]').forEach(optionEl => {
                                optionEl.removeAttribute('disabled');
                            });
                        });
                }

                // Get attributes prices
                containerEl.querySelectorAll('.product-attribute').forEach(productAttributeEl => {

                    if (productAttributeEl.nodeName === 'SELECT' && productAttributeEl.value) {

                        productAttributes.push('attributes['+productAttributeEl.value+']');

                    } else if (['CHECKBOX', 'RADIO'].includes(productAttributeEl.nodeName) && productAttributeEl.checked) {

                        productAttributes.push('attributes['+productAttributeEl.value+']');

                    } else if (productAttributeEl.nodeName === 'TEXTAREA' && productAttributeEl.value) {

                        productAttributes.push('attributes['+productAttributeEl.name+']');
                    }
                });

                // Update prices
                fetch('/api/products/'+productId+'/price?'+productAttributes.join('&')+'=true')
                    .then(res => res.json())
                    .then(data => {

                        const price = theme.store.taxFreeShopping ? data.net_price : data.price;
                        const originalPrice = theme.store.taxFreeShopping ? data.original_net_price : data.original_price;

                        containerEl.querySelectorAll('[data-product-price-dynamic]').forEach(productPriceDynamicEl => {
                            productPriceDynamicEl.innerHTML = theme.utils.formatCurrency({ value: price })
                        });

                        containerEl.querySelectorAll('[data-product-original-price-dynamic]').forEach(productOriginalPriceDynamicEl =>  {
                            productOriginalPriceDynamicEl.innerHTML = theme.utils.formatCurrency({ value: originalPrice })
                        });

                        if (theme.store.klarna.clientId && window.KlarnaOnsiteService) {

                            containerEl.querySelectorAll('klarna-placement[data-purchase-amount]').forEach(el => {
                                el.setAttribute('data-purchase-amount', price);
                            });
    
                            KlarnaOnsiteService.push({ eventName: 'refresh-placements' });
                        }
                    });
            });
        });
    };

    const initProductReviews = () => {

        const productReviewFormEl = containerEl.querySelector('.product-review-form');
        const productReviewCreateEl = containerEl.querySelector('#product-review-create');
        const productReviewCancelEl = containerEl.querySelector('#product-review-cancel');
        const productShowReviewsEl = containerEl.querySelector('#product-show-reviews');
        const productReviewsAccordionHeaderEl = containerEl.querySelector('#accordion-product-reviews-header');
        const productReviewsEl = containerEl.querySelector('.product-reviews');

        if (productReviewCreateEl) {

            productReviewCreateEl.addEventListener('click', e => {

                productReviewFormEl.classList.remove('d-none');
                e.target.classList.add('d-none');
            });
        }

        if (productReviewCancelEl) {

            productReviewCancelEl.addEventListener('click', e => {

                productReviewFormEl.classList.add('d-none');
                productReviewCreateEl.classList.remove('d-none');
            });
        }

        if (productShowReviewsEl) {

            productShowReviewsEl.addEventListener('click', e => {

                if (productReviewsAccordionHeaderEl) {

                    const productReviewsAccordionToggleEl = productReviewsAccordionHeaderEl.querySelector('[data-bs-target="#accordion-product-reviews"]');

                    if (productReviewsAccordionToggleEl && productReviewsAccordionToggleEl.ariaExpanded !== 'true') {
                        productReviewsAccordionToggleEl.click();
                    }

                    window.scrollTo({
                        top: productReviewsAccordionHeaderEl.getBoundingClientRect().top,
                        behavior: 'smooth'
                    });

                } else if (productReviewsEl) {

                    window.scrollTo({
                        top: productReviewsEl.getBoundingClientRect().top,
                        behavior: 'smooth'
                    });
                }
            });
        }
    };

    const initProductQuantity = () => {

        const productQuantityInputEl = containerEl.querySelector('.product-quantity-input');
        const productQuantityDecreaseEl = containerEl.querySelector('.product-quantity-decrease');
        const productQuantityIncreaseEl = containerEl.querySelector('.product-quantity-increase');
        const minQuantity = productQuantityInputEl.getAttribute('min');
        const maxQuantity = productQuantityInputEl.getAttribute('max');

        productQuantityDecreaseEl.addEventListener('click', (e) => {

            const currentValue = parseInt(productQuantityInputEl.value, 10);

            if (currentValue !== parseInt(minQuantity, 10)) {
                productQuantityInputEl.value = currentValue - 1;
            }
        });

        productQuantityIncreaseEl.addEventListener('click', (e) => {

            const currentValue = parseInt(productQuantityInputEl.value, 10);

            if (maxQuantity === null || (maxQuantity && currentValue !== parseInt(maxQuantity, 10))) {
                productQuantityInputEl.value = currentValue + 1;
            }
        });

        theme.utils.filterInput(productQuantityInputEl, function (value) {

            if (minQuantity && maxQuantity) {

                return (
                    value != 0 &&
                    value >= parseInt(minQuantity, 10) &&
                    value <= parseInt(maxQuantity, 10) &&
                    /^\d+$/.test(value)
                );

            } else if (minQuantity) {

                return (
                    value != 0 &&
                    value >= parseInt(minQuantity, 10) &&
                    /^\d+$/.test(value)
                );

            } else if (maxQuantity) { 

                return (
                    value != 0 &&
                    value <= parseInt(maxQuantity, 10) &&
                    /^\d+$/.test(value)
                );

            } else {

                return (
                    value != 0 &&
                    /^\d+$/.test(value)
                );
            }
        });
    };

    if (containerEl.querySelector('.product-media-container')) {
        initProductMedia();
    }

    if (containerEl.querySelector('.product-reviews')) {
        initProductReviews();
    }

    if (containerEl.querySelector('.product-attributes')) {
        initProductAttributes();
    }

    if (containerEl.querySelector('.product-quantity, .product-inline-quantity')) {
        initProductQuantity();
    }
}