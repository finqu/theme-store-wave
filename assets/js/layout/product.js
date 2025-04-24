import Swiper from 'swiper';
import { Navigation, Pagination, Thumbs, Mousewheel, FreeMode, Manipulation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/mousewheel';
import 'swiper/css/free-mode';
import 'swiper/css/manipulation';

export default function() {
    
    const containerEl = document.querySelector('.section-product');
    const dynamicPartialSelectors = [...containerEl.querySelectorAll('[data-dynamic-partial]')].map(el => '[data-dynamic-partial="'+el.dataset.dynamicPartial+'"]').join(', ');
    let productThumbMediaSwiper = null;
    let productMainMediaSwiper = null;

    const thumbHoverHandler = index => {
        productMainMediaSwiper?.slideTo(index, 0, true);
    };

    const initProductMedia = () => {

        const productThumbMediaSwiperEl = containerEl.querySelector('#product-thumb-media-swiper');
        let productMainMediaSwiperEl = containerEl.querySelector('#product-main-media-swiper');

        const productMainMediaSwiperOpts = {
            modules: [
                Navigation,
                Pagination,
                Thumbs,
                Manipulation
            ],
            allowTouchMove: true,
            speed: 0,
            pagination: {
                el: productMainMediaSwiperEl.querySelector('.swiper-pagination'),
                clickable: true
            },
            navigation: {
                nextEl: productMainMediaSwiperEl.querySelector('.swiper-button-next'),
                prevEl: productMainMediaSwiperEl.querySelector('.swiper-button-prev')
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
                    Mousewheel,
                    Manipulation
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
                    nextEl: productThumbMediaSwiperEl.querySelector('.swiper-button-next'),
                    prevEl: productThumbMediaSwiperEl.querySelector('.swiper-button-prev')
                }
            };

            if (productThumbMediaSwiperOpts.direction === 'vertical') {
                productThumbMediaSwiperEl.style.height = productMainMediaSwiperEl.getBoundingClientRect().height+'px';
            }

            productThumbMediaSwiper = new Swiper(productThumbMediaSwiperEl, productThumbMediaSwiperOpts);

            productMainMediaSwiperOpts.thumbs = {
                swiper: productThumbMediaSwiper
            };

            productThumbMediaSwiperEl.querySelectorAll('.swiper-slide').forEach((el, index) => { 
                el.addEventListener('mouseover', thumbHoverHandler.bind(null, index));
            });

            window.addEventListener('resize', theme.utils.debounce(() => {

                productMainMediaSwiperEl = containerEl.querySelector('#product-main-media-swiper');

                if (productThumbMediaSwiperOpts.direction === 'vertical') {
                    productThumbMediaSwiperEl.style.height = productMainMediaSwiperEl.getBoundingClientRect().height+'px';
                }

            }, 150));
        }

        productMainMediaSwiper = new Swiper(productMainMediaSwiperEl, productMainMediaSwiperOpts);

        const productImageEls = productMainMediaSwiperEl.querySelectorAll('.lazy');

        // Preload product images so those are available when customer clicks thumb
        if (productImageEls.length) {

            productImageEls.forEach(el => {
                theme.lazyLoad.load(el);
            });
        }
    };

    const initProductCustomizations = () => {

        const productId = containerEl.querySelector('form[name="product"] input[name="product"]').value;

        // If customization is visible show it
        containerEl.querySelectorAll('.product-customization[data-is-usable]').forEach(el => {

            if (el.offsetParent !== null) {
                el.removeAttribute('disabled');
            }
        });

        // Customizations product price total option
        containerEl.querySelectorAll('.product-customization.has-price, option.has-price').forEach(el => {

            if (el.nodeName === 'OPTION') {

                fetch('/api/products/'+productId+'/price?customizations['+el.value+']=true')
                    .then(res => res.json())
                    .then(data => {

                        const price = theme.store.taxFreeShopping ? data.net_price : data.price;

                        el.textContent += '('+theme.utils.formatCurrency({ value: price })+')';
                    });

            } else if (el.nodeName === 'INPUT' && ['checkbox', 'radio'].includes(el.type)) {

                fetch('/api/products/'+productId+'/price?customizations['+el.value+']=true')
                    .then(res => res.json())
                    .then(data => {

                        const labelEls = [...el.parentElement.children].filter(sibling => {
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

                fetch('/api/products/'+productId+'/price?customizations['+el.name+']=true')
                    .then(res => res.json())
                    .then(data => {

                        const labelEls = [...el.parentElement.children].filter(sibling => {
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

        containerEl.querySelectorAll('.product-customization').forEach(productCustomizationEl => {

            productCustomizationEl.addEventListener('change', () => {

                const productCustomizationContainerEl = productCustomizationEl.closest('.product-customization-container');
                let siblingEls = null;
                let productCustomizations = [];

                if (productCustomizationContainerEl) {

                    const productCustomizationContainerParentEl = productCustomizationContainerEl.parentElement;
                    const els = [...productCustomizationContainerParentEl.parentElement.children].filter(sibling => {
                        return sibling !== productCustomizationContainerParentEl && sibling.classList.contains('product-customization-child-group-container') && sibling.dataset.customization === productCustomizationEl.dataset.customization;
                    });

                    if (els.length) {
                        siblingEls = els;
                    }
                }

                if (siblingEls === null) {

                    const productCustomizationParentEl = productCustomizationEl.parentElement;
                    const els = [...productCustomizationParentEl.parentElement.children].filter(sibling => {
                        return sibling !== productCustomizationParentEl && sibling.classList.contains('product-customization-child-group-container') && sibling.dataset.customization === productCustomizationEl.dataset.customization;
                    });

                    if (els.length) {
                        siblingEls = els;
                    }
                }

                if (productCustomizationEl.nodeName === 'INPUT' && productCustomizationEl.type === 'checkbox') {

                    const productCustomizationContainerEl = productCustomizationEl.closest('.product-customization-container');
                    const productCustomizationContainerParentEl = productCustomizationContainerEl.parentElement;
                    const els = [...productCustomizationContainerParentEl.parentElement.children].filter(sibling => {
                        return sibling !== productCustomizationContainerParentEl && sibling.classList.contains('product-customization-child-group-container') && sibling.dataset.option === productCustomizationEl.value;
                    });

                    if (els.length) {

                        siblingEls = els;

                    } else {

                        const productCustomizationParentEl = productCustomizationEl.parentElement;
                        const els = [...productCustomizationParentEl.parentElement.children].filter(sibling => {
                            return sibling !== productCustomizationParentEl && sibling.classList.contains('product-customization-child-group-container') && sibling.dataset.option === productCustomizationEl.value;
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
                        
                        siblingEl.querySelectorAll('.product-customization').forEach(productCustomizationEl => {
                            productCustomizationEl.setAttribute('disabled', true);
                        });
                    });
                }

                // Reset customization child group if hidden
                containerEl.querySelectorAll('.product-customization-child-group-container').forEach(productCustomizationChildGroupContainerEl => {

                    if (productCustomizationChildGroupContainerEl.offsetParent === null) {
                        
                        productCustomizationChildGroupContainerEl.querySelectorAll('.product-customization').forEach(productCustomizationEl => {

                            if (productCustomizationEl.nodeName === 'INPUT' && ['checkbox', 'radio'].includes(productCustomizationEl.type)) {

                                productCustomizationEl.checked = false;

                            } else if (productCustomizationEl.nodeName === 'SELECT') {
                                    
                                productCustomizationEl.selectedIndex = 0;
                            }
                        });
                    }
                });

                // Change image on radio select
                if (productCustomizationEl.matches('[data-has-image]') && productMainMediaSwiper) {

                    const el = document.querySelector('#product-main-media-swiper .swiper-slide[data-product-customization-image="'+productCustomizationEl.value+'"]');
                    const index = [...el.parentElement.children].indexOf(el);

                    productMainMediaSwiper.slideTo(index, 0, true);
                }

                // Show customizations if active
                if (productCustomizationEl.nodeName === 'SELECT' && productCustomizationEl.value ||
                    (productCustomizationEl.nodeName === 'INPUT' && ['checkbox', 'radio'].includes(productCustomizationEl.type) && productCustomizationEl.checked) ||
                    (productCustomizationEl.nodeName === 'TEXTAREA' && productCustomizationEl.value)) {

                        containerEl.querySelectorAll('[data-option="'+productCustomizationEl.value+'"]').forEach(productCustomizationChildGroupContainerEl => {

                            productCustomizationChildGroupContainerEl.style.display = 'block';

                            productCustomizationChildGroupContainerEl.querySelectorAll('[data-is-usable]').forEach(optionEl => {
                                optionEl.removeAttribute('disabled');
                            });
                        });
                }

                // Get customizations prices
                containerEl.querySelectorAll('.product-customization').forEach(productCustomizationEl => {

                    if (productCustomizationEl.nodeName === 'SELECT' && productCustomizationEl.value) {

                        productCustomizations.push('customizations['+productCustomizationEl.value+']');

                    } else if (productCustomizationEl.nodeName === 'INPUT' && ['checkbox', 'radio'].includes(productCustomizationEl.type) && productCustomizationEl.checked) {

                        productCustomizations.push('customizations['+productCustomizationEl.value+']');

                    } else if (productCustomizationEl.nodeName === 'TEXTAREA' && productCustomizationEl.value) {

                        productCustomizations.push('customizations['+productCustomizationEl.name+']');
                    }
                });

                // Update prices
                fetch('/api/products/'+productId+'/price?'+productCustomizations.join('&')+'=true')
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

                        document.dispatchEvent(new CustomEvent('theme:product:price', {
                            detail: data
                        }));
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
        const productReviewsTabActionEl = containerEl.querySelector('[name="section-tab-action"][value="reviews"]');

        if (productReviewCreateEl) {

            productReviewCreateEl.addEventListener('click', e => {

                productReviewFormEl.classList.remove('d-none');
                e.target.classList.add('d-none');
            });
        }

        if (productReviewCancelEl) {

            productReviewCancelEl.addEventListener('click', () => {

                productReviewFormEl.classList.add('d-none');
                productReviewCreateEl.classList.remove('d-none');
            });
        }

        if (productShowReviewsEl) {

            productShowReviewsEl.addEventListener('click', () => {

                if (productReviewsAccordionHeaderEl) {

                    const productReviewsAccordionToggleEl = productReviewsAccordionHeaderEl.querySelector('[data-bs-target="#accordion-product-reviews"]');

                    if (productReviewsAccordionToggleEl && productReviewsAccordionToggleEl.ariaExpanded !== 'true') {
                        productReviewsAccordionToggleEl.click();
                    }

                    window.scrollTo({
                        top: productReviewsAccordionHeaderEl.getBoundingClientRect().top,
                        behavior: 'smooth'
                    });

                } else if (productReviewsTabActionEl) {
                        
                    productReviewsTabActionEl.click();

                    window.scrollTo({
                        top: productReviewsTabActionEl.getBoundingClientRect().top,
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

        productQuantityDecreaseEl.addEventListener('click', () => {

            const currentValue = parseInt(productQuantityInputEl.value, 10);

            if (currentValue !== parseInt(minQuantity, 10)) {
                productQuantityInputEl.value = currentValue - 1;
            }
        });

        productQuantityIncreaseEl.addEventListener('click', () => {

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

    const initProductVariants = () => {

        let productViewRequestController = null;
        let variantData = null;
        let options = [...containerEl.querySelectorAll('.product-option-value')].map((el) => {
            if (el.tagName === 'SELECT' || el.tagName === 'INPUT' && el.type === 'radio' && el.checked) {
                return el.value;
            }
        }).filter(Boolean);

        const getVariantData = () => {
            variantData = variantData || JSON.parse(containerEl.querySelector('#product-variant-data').textContent);
            return variantData;
        };

        const currentVariant = getVariantData().find(variant => {
            return !variant.options.map((option, index) => {
                return options[index] === option;
            }).includes(false);
        });

        if (!currentVariant) {
            return;
        }

        const updateProductView = (variant, isDifferentProduct = false) => {

            const url = new URL(window.location.origin+variant.url);

            url.searchParams.set('section', 'product-template');

            productViewRequestController = new AbortController();

            fetch(url, { signal: productViewRequestController.signal })
                .then((res) => res.text())
                .then((resText) => {

                    url.searchParams.delete('section');

                    const dom = new DOMParser().parseFromString(resText, 'text/html');

                    if (!dom) {
                        return;
                    }
                    
                    const bodyChildren = [...document.body.children];
                    const productQuestionModalEl = containerEl.querySelector('#product-question-modal');
                    const productAvailabilityNotificationModalEl = containerEl.querySelector('#availability-notification-modal');
                    const newProductAvailabilityNotificationModalEl = dom.querySelector('#availability-notification-modal');

                    if (bodyChildren.some(({classList}) => classList.contains('tooltip'))) {
                        bodyChildren.filter((el) => el.classList.contains('tooltip')).forEach((el) => el.remove());
                    }

                    if (theme.aos) {
                        document.body.classList.remove('animations-enabled');
                    }

                    if (isDifferentProduct) {

                        document.title = document.title.replace(document.querySelector('.product-name-text')?.innerText, dom.querySelector('.product-name-text')?.innerText);

                        const sectionHeaderEl = containerEl.querySelector('.section-inner > .section-header');
                        const newSectionHeaderEl = dom.querySelector('.section-inner > .section-header');

                        if (sectionHeaderEl && newSectionHeaderEl) {
                            sectionHeaderEl.replaceWith(newSectionHeaderEl);
                        }

                        containerEl.querySelectorAll(dynamicPartialSelectors).forEach(partialEl => {

                            const partialName = partialEl.dataset.dynamicPartial;
                            const newPartialEl = dom.querySelector('[data-dynamic-partial="'+partialName+'"]');
           
                            if (newPartialEl) {

                                if (partialName === 'media') {
                                    newPartialEl.querySelector('#product-main-media-swiper .lazy.featured-img')?.classList.add('lazy-disable-placeholder', 'lazy-disable-transition');
                                }

                                partialEl.replaceWith(newPartialEl);

                                if (partialName === 'media') {
                                    initProductMedia();
                                    theme.utils.initComponent('gallery', containerEl.querySelectorAll('.gallery'));
                                }

                            } else {

                                partialEl.innerHTML = '';
                            }
                        });
                        
                    } else {

                        const mediaPartialEl = containerEl.querySelector('[data-dynamic-partial="media"]');
                        const productMediaCollageItemsEl = containerEl.querySelector('#product-media-collage .product-media-collage-items');
                        const newInfoPartialEl = dom.querySelector('[data-dynamic-partial="info"]');
                        const newMediaPartialEl = dom.querySelector('[data-dynamic-partial="media"]');

                        if (newInfoPartialEl) {
                            containerEl.querySelector('[data-dynamic-partial="info"]').replaceWith(newInfoPartialEl);
                        }

                        if (newMediaPartialEl) {
                            newMediaPartialEl.querySelectorAll('.lazy').forEach((el) => el.classList.add('lazy-disable-placeholder', 'lazy-disable-transition'));
                            mediaPartialEl.querySelector('.product-badges')?.replaceWith(newMediaPartialEl.querySelector('.product-badges'));
                        }

                        if (!currentVariant.hasImage && variant.hasImage) {

                            productThumbMediaSwiper?.prependSlide(newMediaPartialEl.querySelectorAll('#product-thumb-media-swiper .swiper-slide')[0]);
                            productMainMediaSwiper?.prependSlide(newMediaPartialEl.querySelectorAll('#product-main-media-swiper .swiper-slide')[0]);

                            productThumbMediaSwiper?.update();
                            productMainMediaSwiper?.update();

                            productThumbMediaSwiper?.slideTo(0, 0, true);
                            productMainMediaSwiper?.slideTo(0, 0, true);

                            containerEl.querySelectorAll('#product-thumb-media-swiper .swiper-slide').forEach((el, index) => { 
                                el.removeEventListener('mouseover', thumbHoverHandler);
                                el.addEventListener('mouseover', thumbHoverHandler.bind(null, index));
                            });

                            productMediaCollageItemsEl?.prepend(newMediaPartialEl.querySelectorAll('.product-media-collage-item')[0]);

                            containerEl.querySelectorAll('.gallery').forEach(galleryEl => {
                                galleryEl?.gallery?.update();
                            });

                        } else if (currentVariant.hasImage && !variant.hasImage) {

                            if (productThumbMediaSwiper?.slides.length) {
                                productThumbMediaSwiper?.removeSlide(0);
                            } else if (productThumbMediaSwiper?.slidesEl?.querySelectorAll('.swiper-slide').length) {
                                productThumbMediaSwiper?.slidesEl?.querySelectorAll('.swiper-slide')[0].remove();
                            }

                            if (productMainMediaSwiper?.slides.length) {
                                productMainMediaSwiper?.removeSlide(0);
                            } else if (productMainMediaSwiper.slidesEl?.querySelectorAll('.swiper-slide').length) {
                                productMainMediaSwiper.slidesEl?.querySelectorAll('.swiper-slide')[0].remove();
                            }

                            productThumbMediaSwiper?.update();
                            productMainMediaSwiper?.update();

                            containerEl.querySelectorAll('#product-thumb-media-swiper .swiper-slide').forEach((el, index) => { 
                                el.removeEventListener('mouseover', thumbHoverHandler);
                                el.addEventListener('mouseover', thumbHoverHandler.bind(null, index));
                            });

                            productMediaCollageItemsEl?.querySelectorAll('.product-media-collage-item')[0].remove();

                            containerEl.querySelectorAll('.gallery').forEach(galleryEl => {
                                galleryEl?.gallery?.update();
                            });

                        } else if (currentVariant.hasImage && variant.hasImage) {
                            
                            const featuredImgEls = mediaPartialEl.querySelectorAll('.featured-img');
                            const newFeaturedImgEls = newMediaPartialEl.querySelectorAll('.featured-img');

                            featuredImgEls?.forEach((el, featuredIndex) => {
                                if (el.parentElement.nodeName === 'PICTURE') {

                                    const sourceEls = el.parentElement.querySelectorAll('source');
                                    const newSourceEls = newFeaturedImgEls[featuredIndex]?.parentElement?.querySelectorAll('source') || [];
                                    
                                    sourceEls?.forEach((el, sourceIndex) => {
                                        if (newSourceEls[sourceIndex]) {
                                            el.srcset = newSourceEls[sourceIndex].srcset;
                                            el.dataset.srcset = newSourceEls[sourceIndex].dataset.srcset;
                                        }
                                    });

                                    if (newFeaturedImgEls[featuredIndex]) {
                                        el.src = newFeaturedImgEls[featuredIndex].src;

                                        if (el.dataset.galleryImgSrc) {
                                            el.dataset.galleryImgSrc = newFeaturedImgEls[featuredIndex].dataset.galleryImgSrc;
                                        }
                                    }

                                } else if (newFeaturedImgEls[featuredIndex]) {

                                    el.src = newFeaturedImgEls[featuredIndex].dataset.src;
                                    el.srcset = newFeaturedImgEls[featuredIndex].dataset.srcset;
                                    el.dataset.src = newFeaturedImgEls[featuredIndex].dataset.src;
                                    el.dataset.srcset = newFeaturedImgEls[featuredIndex].dataset.srcset;
                                }
                            });

                            containerEl.querySelectorAll('.gallery').forEach(galleryEl => {
                                galleryEl?.gallery?.update();
                            });
                        }
                    }

                    if (newProductAvailabilityNotificationModalEl) {

                        if (productAvailabilityNotificationModalEl) {
                            productAvailabilityNotificationModalEl.replaceWith(newProductAvailabilityNotificationModalEl);
                        } else {
                            containerEl.appendChild(newProductAvailabilityNotificationModalEl);
                        }

                    } else {

                        productAvailabilityNotificationModalEl?.remove();
                    }

                    if (productQuestionModalEl) {

                        const subjectEl = productQuestionModalEl.querySelector('input[name="subject"]');

                        if (subjectEl) {
                            subjectEl.value = theme.utils.t('product.question.subject', {
                                product_name: `${document.querySelector('.product-name-text')?.innerText} ${variant.title}`
                            });
                        }
                    }

                    if (theme.aos) {
                        setTimeout(() => {
                            document.body.classList.add('animations-enabled');
                        }, 150);
                    }

                    history.replaceState({}, dom.title, url);

                    if (containerEl.querySelector('.product-reviews')) {
                        initProductReviews();
                    }
            
                    if (containerEl.querySelector('.product-customizations')) {
                        initProductCustomizations();
                    }
            
                    if (containerEl.querySelectorAll('.product-quantity, .product-inline-quantity').length) {
                        initProductQuantity();
                    }
            
                    if (containerEl.querySelector('.product-variants:not(.product-card-grid-item .product-variants)')) {
                        initProductVariants();
                    }

                    if (containerEl.querySelector('.product-combined')) {
                        initProductCombined();
                    }

                    productViewRequestController = null;
                })
                .catch(() => {
                    productViewRequestController = null;
                });
        };

        containerEl.querySelectorAll('.product-option-value').forEach(el => {
            el.addEventListener('change', () => {
                if (productViewRequestController !== null) {
                    productViewRequestController.abort();
                }
    
                options = [...containerEl.querySelectorAll('.product-option-value')].map((el) => {
                    if (el.tagName === 'SELECT' || el.tagName === 'INPUT' && el.type === 'radio' && el.checked) {
                        return el.value;
                    }
                }).filter(Boolean);
    
                let variant = getVariantData().find(variant => {
                    return !variant.options.map((option, index) => {
                        return options[index] === option;
                    }).includes(false);
                });
    
                if (!variant) {
                    variant = getVariantData().find(variant => {
                        return options[0] === variant.options[0];
                    });
                }
    
                if (!variant) {
                    return;
                }
    
                const variantUrl = new URL(window.location.origin+variant.url);
                const isDifferentProduct = window.location.pathname !== variantUrl.pathname ? true : false;
    
                updateProductView(variant, isDifferentProduct);
            });
        });
    };

    const initProductCombined = () => {

        let productViewRequestController = null;

        const updateProductView = (productPath) => {

            const url = new URL(window.location.origin+productPath);

            url.searchParams.set('section', 'product-template');

            productViewRequestController = new AbortController();

            fetch(url, { signal: productViewRequestController.signal })
                .then((res) => res.text())
                .then((resText) => {

                    url.searchParams.delete('section');

                    const dom = new DOMParser().parseFromString(resText, 'text/html');

                    if (!dom) {
                        return;
                    }

                    const bodyChildren = [...document.body.children];
                    const productQuestionModalEl = containerEl.querySelector('#product-question-modal');
                    const productAvailabilityNotificationModalEl = containerEl.querySelector('#availability-notification-modal');
                    const newProductAvailabilityNotificationModalEl = dom.querySelector('#availability-notification-modal');
                    const sectionHeaderEl = containerEl.querySelector('.section-inner > .section-header');
                    const newSectionHeaderEl = dom.querySelector('.section-inner > .section-header');

                    if (bodyChildren.some(({classList}) => classList.contains('tooltip'))) {
                        bodyChildren.filter((el) => el.classList.contains('tooltip')).forEach((el) => el.remove());
                    }

                    if (theme.aos) {
                        document.body.classList.remove('animations-enabled');
                    }

                    document.title = document.title.replace(document.querySelector('.product-name-text')?.innerText, dom.querySelector('.product-name-text')?.innerText);

                    if (sectionHeaderEl && newSectionHeaderEl) {
                        sectionHeaderEl.replaceWith(newSectionHeaderEl);
                    }

                    containerEl.querySelectorAll(dynamicPartialSelectors).forEach(partialEl => {

                        const partialName = partialEl.dataset.dynamicPartial;
                        const newPartialEl = dom.querySelector('[data-dynamic-partial="'+partialName+'"]');
        
                        if (newPartialEl) {

                            if (partialName === 'media') {
                                newPartialEl.querySelector('#product-main-media-swiper .lazy.featured-img')?.classList.add('lazy-disable-placeholder', 'lazy-disable-transition');
                            }

                            partialEl.innerHTML = newPartialEl.innerHTML;

                            if (partialName === 'media') {
                                initProductMedia();
                                theme.utils.initComponent('gallery', containerEl.querySelectorAll('.gallery'));
                            }

                        } else {

                            partialEl.innerHTML = '';
                        }
                    });

                    if (newProductAvailabilityNotificationModalEl) {

                        if (productAvailabilityNotificationModalEl) {
                            productAvailabilityNotificationModalEl.replaceWith(newProductAvailabilityNotificationModalEl);
                        } else {
                            containerEl.appendChild(newProductAvailabilityNotificationModalEl);
                        }

                    } else {

                        productAvailabilityNotificationModalEl?.remove();
                    }

                    if (productQuestionModalEl) {

                        const subjectEl = productQuestionModalEl.querySelector('input[name="subject"]');

                        if (subjectEl) {
                            subjectEl.value = theme.utils.t('product.question.subject', {
                                product_name: `${document.querySelector('.product-name-text')?.innerText}`
                            });
                        }
                    }

                    history.replaceState({}, dom.title, url);

                    theme.utils.initComponent('gallery', containerEl.querySelectorAll('.gallery'));

                    if (containerEl.querySelector('.product-reviews')) {
                        initProductReviews();
                    }
            
                    if (containerEl.querySelector('.product-customizations')) {
                        initProductCustomizations();
                    }
            
                    if (containerEl.querySelectorAll('.product-quantity, .product-inline-quantity').length) {
                        initProductQuantity();
                    }
            
                    if (containerEl.querySelector('.product-variants:not(.product-card-grid-item .product-variants)')) {
                        initProductVariants();
                    }

                    if (containerEl.querySelector('.product-combined')) {
                        initProductCombined();
                    }

                    if (theme.aos) {
                        setTimeout(() => {
                            document.body.classList.add('animations-enabled');
                            theme.aos.refresh();
                        }, 150);
                    }

                    productViewRequestController = null;
                })
                .catch((e) => {
                    productViewRequestController = null;
                });
        };

        containerEl.querySelectorAll('.product-combined-option-value').forEach(el => {
            el.addEventListener('change', () => {
                updateProductView(el.value);
            });
        });
    };

    if (containerEl.querySelector('.product-media-container')) {
        initProductMedia();
    }

    if (containerEl.querySelector('.product-reviews')) {
        initProductReviews();
    }

    if (containerEl.querySelector('.product-customizations')) {
        initProductCustomizations();
    }

    if (containerEl.querySelectorAll('.product-quantity, .product-inline-quantity').length) {
        initProductQuantity();
    }

    if (containerEl.querySelector('.product-variants:not(.product-card-grid-item .product-variants)')) {
        initProductVariants();
    }

    if (containerEl.querySelector('.product-combined')) {
        initProductCombined();
    }
}