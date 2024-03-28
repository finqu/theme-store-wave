import editor from './editor';
import Slider from './slider';
import Gallery from './gallery';
import Masonry from 'masonry-layout';
import accountLayout from '../layout/account';
import articleLayout from '../layout/article';
import catalogLayout from '../layout/catalog';
import categoryLayout from '../layout/category';
import headerLayout from '../layout/header';
import passwordLayout from '../layout/password';
import productLayout from '../layout/product';
import registerLayout from '../layout/register';

export default {
	init: function() {

        this.initSection();

        if (theme.store.designMode === 'edit') {

        	editor.init();

        } else {

            for (const el of document.querySelectorAll('.swiper.swiper-standalone')) { 
                new Slider(el);
            }

            document.addEventListener('theme:slider:init', e => {
                new Slider(e.detail.el);
            });

            for (const el of document.querySelectorAll('.gallery')) { 
                new Gallery(el);
            }

            document.addEventListener('theme:gallery:init', e => {
                new Gallery(e.detail.el);
            });

            for (const el of document.querySelectorAll('.masonry')) {

                const settings = Object.assign({
                    percentPosition: true
                }, el.dataset || {});

                new Masonry(el, settings);
            }

            document.addEventListener('theme:masonry:init', e => {

                const settings = Object.assign({
                    percentPosition: true
                }, e.detail.el.dataset || {});

                new Masonry(e.detail.el, settings);
            });
        }

        if (theme.store.template !== 'password') {
            theme.cart.init();
            headerLayout();
            this.initCartMini();
            this.initLocalization();
            this.initCookiePolicy();
            this.initAccessibility();
            this.initMarketing();
        }

        switch (theme.store.template) {
            case 'password':
                passwordLayout();
                break;
            case 'customers-account':
                accountLayout();
                break;
            case 'category':
                categoryLayout();
                break;
            case 'catalog':
                catalogLayout();
                break;
            case 'customers-register':
                registerLayout();
                break;
            case 'article':
                articleLayout();
                break;
            case 'product':
                productLayout();
                break;
        }
	},
    initCartMini: function() {

        document.addEventListener('theme:cart:render', () => {

            const cartMiniEls = document.querySelectorAll('.cart-mini');

            cartMiniEls.forEach(el => {

                const cartItemsEl = el.querySelector('.cart-items');

                if (cartItemsEl) {

                    if (cartItemsEl.scrollHeight > cartItemsEl.clientHeight) {
                        el.classList.add('cart-mini-items-hint-bottom');
                    } else {
                        el.classList.remove('cart-mini-items-hint-bottom');
                        el.classList.remove('cart-mini-items-hint-top');
                    }

                    cartItemsEl.addEventListener('scroll', scrollEvent => {

                        const height = scrollEvent.target.clientHeight;
                        const offset = scrollEvent.target.scrollTop + height;
                        const minHeight = height;
                        const maxHeight = scrollEvent.target.scrollHeight;

                        if (offset === minHeight) {

                            el.classList.add('cart-mini-items-hint-bottom');

                        } else if (el.classList.contains('cart-mini-items-hint-bottom')) {

                            el.classList.remove('cart-mini-items-hint-bottom');
                        }

                        if (offset === maxHeight) {

                            el.classList.add('cart-mini-items-hint-top');

                        } else if (el.classList.contains('cart-mini-items-hint-top')) {

                            el.classList.remove('cart-mini-items-hint-top');
                        }
                    });
                }
            });
        });
    },
    initCookiePolicy: function() {

        const cookiePolicyEl = document.querySelector('.cookie-policy');

        if (!cookiePolicyEl) {
            return;
        }

        const cookiePolicyCloseEl = cookiePolicyEl.querySelector('[data-cookie-policy-close]');
        const cookiePolicyOpenEls = document.querySelectorAll('[data-cookie-policy-open]');
        const cookiePolicySubmitEls = cookiePolicyEl.querySelectorAll('[data-cookie-policy-submit]');
        const cookiePolicyFormEl = cookiePolicyEl.querySelector('#cookie-policy-form');
        const cookiePolicyInputEl = cookiePolicyFormEl.querySelector('[name="cookie_policy"]');

        if (cookiePolicyCloseEl) {

            cookiePolicyCloseEl.addEventListener('click', (e) => {

                document.body.classList.remove('cookie-policy-visible');
                cookiePolicyEl.classList.add('d-none');

                if (theme.store.cookiePolicy.position === 'middle') {
                    document.body.classList.remove('disable-scroll');
                }
            });
        }

        if (cookiePolicyOpenEls.length) {

            cookiePolicyOpenEls.forEach(el => { el.addEventListener('click', () => {

                if (document.body.classList.contains('cookie-policy-visible')) {
                    return;
                }

                cookiePolicyEl.classList.remove('d-none');
                document.body.classList.add('cookie-policy-visible');

                if (theme.store.cookiePolicy.position === 'middle') {
                    document.body.classList.remove('disable-scroll');
                }
            })});
        }

        if (cookiePolicySubmitEls.length) {

            cookiePolicySubmitEls.forEach(el => { el.addEventListener('click', () => {

               cookiePolicyInputEl.setAttribute('value', el.value);
               cookiePolicyFormEl.submit();
            })});
        }
    },
    initAccessibility: function() {

        const initBackToTopButton = () => {

            const containerEl = document.body;
            const scrollingEl = document.scrollingElement;
            let windowHeight = window.innerHeight;

            containerEl.insertAdjacentHTML('beforeend', theme.renderer.render('back-to-top-btn'));

            const backToTopBtnEL = containerEl.querySelector('#back-to-top-btn');

            if (backToTopBtnEL) {

                document.addEventListener('scroll', () => {

                    if (document.activeElement !== containerEl && window.innerHeight === windowHeight) {

                        document.activeElement.blur();

                    } else {

                        windowHeight = window.innerHeight;
                    }

                    if (scrollingEl.scrollTop >= 250 && backToTopBtnEL.classList.contains('d-none')) {

                        backToTopBtnEL.classList.remove('d-none');

                        theme.utils.animate(backToTopBtnEL, 'fadeIn');

                    } else if (scrollingEl.scrollTop < 250 && !backToTopBtnEL.classList.contains('d-none')) {

                        theme.utils.animate(backToTopBtnEL, 'fadeOut').then(() => {
                            backToTopBtnEL.classList.add('d-none');
                        });
                    }
                });

                backToTopBtnEL.addEventListener('click', () => {

                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            }
        };

        const initWishlist = () => {

            const isWishlistTemplate = document.querySelector('body').classList.contains('template-customers-wishlist');

            const add = (el) => {
                const iconEl = el.querySelector('.svg-icon');
                const id = el.getAttribute('data-wishlist-add');
                const itemCountEls = document.querySelectorAll('[data-wishlist-item-count]');
                const itemCountWithTextEls = document.querySelectorAll('[data-wishlist-item-count-with-text]');

                if (!id) {
                    return;
                }

                fetch('/api/wishlist/products/'+id, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(() => {
                    
                    itemCountEls.forEach(el => {

                        const value = (parseInt(el.innerText) || 0) + 1;

                        if (wishlistCount > 0 && !el.parentNode.classList.contains('has-items')) {
                            el.parentNode.classList.add('has-items');
                        }

                        theme.utils.animate(el.parentNode, 'bounce');

                        el.innerHTML = value;
                    });

                    itemCountWithTextEls.forEach(el => {

                        const value = (parseInt(el.innerText) || 0) + 1;

                        if (value === 1) {

                            el.innerHTML = theme.utils.t('wishlist.item_count', {
                                amount: value
                            });

                        } else {

                            el.innerHTML = theme.utils.t('wishlist.item_count_plural', {
                                amount: value
                            });
                        }
                    });

                    if (iconEl) {
                        theme.utils.animate(iconEl, 'pulse');
                    }

                    document.dispatchEvent(new CustomEvent('theme:wishlist:addItem', {
                        detail: {
                            id: id
                        }
                    }));
                });
            };

            const remove = (el) => {
                const iconEl = el.querySelector('.svg-icon');
                const id = el.getAttribute('data-wishlist-remove');
                const itemEl = document.querySelector('[data-wishlist-item="'+id+'"]');
                const itemCountEls = document.querySelectorAll('[data-wishlist-item-count]');
                const itemCountWithTextEls = document.querySelectorAll('[data-wishlist-item-count-with-text]');

                if (!id) {
                    return;
                }

                fetch('/api/wishlist/products/'+id, {
                    method: 'DELETE'
                }).then(() => {

                    itemCountEls.forEach(el => {
        
                        const value = (parseInt(el.innerText) || 0) - 1;

                        if (value < 1 && el.parentNode.classList.contains('has-items')) {
                            el.parentNode.classList.remove('has-items');
                        }

                        theme.utils.animate(el.parentNode, 'bounce');

                        el.innerHTML = value;
                    });

                    itemCountWithTextEls.forEach(el => {

                        const value = (parseInt(el.innerText) || 0) - 1;

                        if (value === 1) {

                            el.innerHTML = theme.utils.t('wishlist.item_count', {
                                amount: value
                            });

                        } else {

                            el.innerHTML = theme.utils.t('wishlist.item_count_plural', {
                                amount: value
                            });
                        }
                    });

                    if (iconEl) {
                        theme.utils.animate(iconEl, 'pulse');
                    }

                    if (itemEl) {

                        if (isWishlistTemplate && document.querySelectorAll('[data-wishlist-item]').length === 1) {
                            location.reload();
                            return;
                        }

                        itemEl.remove();
                    }

                    document.dispatchEvent(new CustomEvent('theme:wishlist:removeItem', {
                        detail: {
                            id: id
                        }
                    }));
                });
            };

            const toggle = (el) => {
                const textEl = el.querySelector('.text');
                const iconEl = el.querySelector('.svg-icon');
                const id = el.getAttribute('data-wishlist-toggle');
                const itemEl = document.querySelector('[data-wishlist-item="'+id+'"]');
                const isAdded = el.getAttribute('aria-pressed') === 'true';
                const itemCountEls = document.querySelectorAll('[data-wishlist-item-count]');
                const itemCountWithTextEls = document.querySelectorAll('[data-wishlist-item-count-with-text]');

                if (!id) {
                    return;
                }

                if (isAdded) {

                    fetch('/api/wishlist/products/'+id, {
                        method: 'DELETE'
                    }).then(() => {

                        if (itemEl) {
        
                            if (isWishlistTemplate && document.querySelectorAll('[data-wishlist-item]').length === 1) {
                                location.reload();
                                return;
                            }

                            itemEl.remove();
                        }

                        itemCountEls.forEach(el => {

                            const value = (parseInt(el.innerText) || 0) - 1;

                            if (value < 1 && el.parentNode.classList.contains('has-items')) {
                                el.parentNode.classList.remove('has-items');
                            }

                            theme.utils.animate(el.parentNode, 'bounce');

                            el.innerHTML = value;
                        });

                        itemCountWithTextEls.forEach(el => {

                            const value = (parseInt(el.innerText) || 0) - 1;
    
                            if (value === 1) {
    
                                el.innerHTML = theme.utils.t('wishlist.item_count', {
                                    amount: value
                                });
    
                            } else {
    
                                el.innerHTML = theme.utils.t('wishlist.item_count_plural', {
                                    amount: value
                                });
                            }
                        });

                        if (iconEl) {
                            theme.utils.animate(iconEl, 'pulse');
                        }

                        if (textEl) {
                            textEl.textContent = theme.utils.t('wishlist.add');
                        }

                        el.setAttribute('aria-pressed', false);

                        document.dispatchEvent(new CustomEvent('theme:wishlist:removeItem', {
                            detail: {
                                id: id
                            }
                        }));
                    });

                } else {

                    fetch('/api/wishlist/products/'+id, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then(() => {

                        itemCountEls.forEach(el => {

                            const value = (parseInt(el.innerText) || 0) + 1;

                            if (value > 0 && !el.parentNode.classList.contains('has-items')) {
                                el.parentNode.classList.add('has-items');
                            }

                            theme.utils.animate(el.parentNode, 'bounce');

                            el.innerHTML = value;
                        });

                        itemCountWithTextEls.forEach(el => {

                            const value = (parseInt(el.innerText) || 0) + 1;
    
                            if (value === 1) {
    
                                el.innerHTML = theme.utils.t('wishlist.item_count', {
                                    amount: value
                                });
    
                            } else {
    
                                el.innerHTML = theme.utils.t('wishlist.item_count_plural', {
                                    amount: value
                                });
                            }
                        });

                        if (iconEl) {
                            theme.utils.animate(iconEl, 'pulse');
                        }

                        if (textEl) {
                            textEl.textContent = theme.utils.t('wishlist.remove');
                        }

                        el.setAttribute('aria-pressed', true);

                        document.dispatchEvent(new CustomEvent('theme:wishlist:addItem', {
                            detail: {
                                id: id
                            }
                        }));
                    });
                }
            };

            document.addEventListener('click', (e) => {

                if (e.target.hasAttribute('data-wishlist-add')) {
                    return add(e.target);
                }
    
                if (e.target.hasAttribute('data-wishlist-remove')) {
                    return remove(e.target);
                }
    
                if (e.target.hasAttribute('data-wishlist-toggle')) {
                    return toggle(e.target);
                }
            });
        }

        if (theme.store.accessibility.showBackToTopButton) {
            initBackToTopButton();
        }

        if (theme.store.accessibility.showWishlist) {
            initWishlist();
        }
        
    },
    initLocalization: function() {

        document.querySelectorAll('form[name="localization"]').forEach(localizationFormEl => {

            const localeSelectEl = localizationFormEl.querySelector('.site-localization-locale-select');
            const currencySelectEl = localizationFormEl.querySelector('.site-localization-currency-select');

            if (localeSelectEl) {

                localeSelectEl.addEventListener('change', () => {
                    localizationFormEl.submit();
                });
            }

            if (currencySelectEl) {

                currencySelectEl.addEventListener('change', () => {
                    localizationFormEl.submit();
                });
            }
        });
    },
    initSection: function() {

        document.querySelectorAll('[class*="row-scroll-cols"]').forEach(el => {

            let initialized = false;
            let matchMedia = null;
            let pos = {
                top: 0,
                left: 0,
                x: 0,
                y: 0
            };
        
            const mouseDownHandler = function (e) {
                el.style.cursor = 'grabbing';
                el.style.userSelect = 'none';
        
                pos = {
                    left: el.scrollLeft,
                    top: el.scrollTop,
                    x: e.clientX,
                    y: e.clientY
                };
        
                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            };
        
            const mouseMoveHandler = function (e) {

                const dx = e.clientX - pos.x;
                const dy = e.clientY - pos.y;

                el.scrollTop = pos.top - dy;
                el.scrollLeft = pos.left - dx;
            };
        
            const mouseUpHandler = function () {
                el.style.cursor = 'grab';
                el.style.removeProperty('user-select');
        
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            };

            if (el.classList.contains('row-scroll-cols-xxl')) {
                matchMedia = window.matchMedia(`(min-width: ${theme.utils.getCssVariable('--style-grid-breakpoint-xxl')})`);
            } else if (el.classList.contains('row-scroll-cols-xl')) {
                matchMedia = window.matchMedia(`(max-width: ${parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-xxl'), 10) - 0.1})px`);
            } else if (el.classList.contains('row-scroll-cols-lg')) {
                matchMedia = window.matchMedia(`(max-width: ${parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-xl'), 10) - 0.1})px`);
            } else if (el.classList.contains('row-scroll-cols-md')) {
                matchMedia = window.matchMedia(`(max-width: ${parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-lg'), 10) - 0.1})px`);
            } else if (el.classList.contains('row-scroll-cols-sm')) {
                matchMedia = window.matchMedia(`(max-width: ${parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-md'), 10) - 0.1})px`);
            } else if (el.classList.contains('row-scroll-cols')) {
                matchMedia = window.matchMedia(`(max-width: ${parseInt(theme.utils.getCssVariable('--style-grid-breakpoint-sm'), 10) - 0.1})px`);
            } else {
                return;
            }

            if (matchMedia.matches) {
                el.addEventListener('mousedown', mouseDownHandler);
                initialized = true;
            }

            matchMedia.addEventListener('change', (e) => {
                
                if (e.matches) {

                    if (initialized) {
                        el.removeEventListener('mousedown', mouseDownHandler);
                        el.style.cursor = null;
                    } else {
                        initialized = true;
                    }

                    el.addEventListener('mousedown', mouseDownHandler);

                } else {

                    if (initialized) {
                        el.removeEventListener('mousedown', mouseDownHandler);
                        el.style.cursor = null;
                    }
                }
            });
        });

        document.querySelectorAll('.form-control').forEach(formControlEl => {

            formControlEl.addEventListener('focus', () => {

                if (!formControlEl.classList.contains('disabled') && !formControlEl.disabled && !formControlEl.readOnly) {

                    const inputGroupEl = formControlEl.closest('.input-group');

                    if (inputGroupEl && !inputGroupEl.classList.contains('input-group-focus')) {
                        inputGroupEl.classList.add('input-group-focus');
                    }
                }
            });

            formControlEl.addEventListener('blur', theme.utils.debounce(() => {

                if (!formControlEl.classList.contains('disabled') && !formControlEl.disabled && !formControlEl.readOnly) {

                    const inputGroupEl = formControlEl.closest('.input-group');

                    if (inputGroupEl && inputGroupEl.classList.contains('input-group-focus')) {
                        inputGroupEl.classList.remove('input-group-focus');
                    }
                }
            }, 100));
        });

        document.querySelectorAll('[name="section-tab-action"]').forEach(sectionTabActionEl => {
            
            sectionTabActionEl.addEventListener('click', e => {

                const sectionTabEl = sectionTabActionEl.closest('.section-tab');
                const sectionTabsEl = sectionTabEl.closest('.section-tabs');
                const sectionTabEls = sectionTabsEl.querySelectorAll('.section-tab');
                const sectionTabIndex = [...sectionTabEl.parentNode.children].indexOf(sectionTabEl);
                const sectionInnerEl = sectionTabsEl.closest('.section-inner');
                const sectionContentEl = sectionTabsEl.nextElementSibling;
                const sectionTabContentEls = sectionContentEl.querySelectorAll('.section-tab-content');
                const sectionTabContentEl = sectionTabContentEls[sectionTabIndex];

                sectionTabEls.forEach(el => {
                    el.classList.remove('section-tab-active');
                });

                sectionTabContentEls.forEach(el => {
                    el.classList.remove('section-tab-content-active');
                });
                
                if (!sectionInnerEl.classList.contains('section-tabs-has-active-tab')) {
                    sectionInnerEl.classList.add('section-tabs-has-active-tab');
                }

                sectionTabEl.classList.add('section-tab-active');
                sectionTabContentEl.classList.add('section-tab-content-active');
            });
        });

        document.querySelectorAll('.section-header .description-collapse').forEach(descriptionCollapseEl => {
            
            const collapseToggleEl = descriptionCollapseEl.parentElement.querySelector('[data-bs-toggle="collapse"]');

            if (collapseToggleEl) {

                collapseToggleEl.addEventListener('click', () => {

                    if (collapseToggleEl.ariaExpanded === 'true') {
                        collapseToggleEl.textContent = theme.utils.t('general.collapse_show_less');
                    } else {
                        collapseToggleEl.textContent = theme.utils.t('general.collapse_show_more');
                    }
                });
            }
        });

        document.querySelectorAll('.product-card-grid-item input[name="product-variant-img"]').forEach(productVariantImgEl => theme.utils.productGridItemVariantImgSwapper(productVariantImgEl));
    },
    initMarketing: function() {

        const initNewsletterPopup = () => {

            if (theme.store.cookiePolicy.status !== null
                && !theme.utils.cookies.get('themeNewsletterPopup')
                && !(theme.store.customer.loggedIn && theme.store.customer.acceptsMarketing)) {

                setTimeout(() => {

                    document.body.insertAdjacentHTML('beforeend', theme.renderer.render('newsletter-popup'));

                    theme.bs.Modal.getOrCreateInstance('#newsletter-popup-modal')?.show();

                    document.getElementById('newsletter-popup-modal').addEventListener('hide.bs.modal', () => {

                        theme.utils.cookies.set(
                            'themeNewsletterPopup',
                            true,
                            Math.floor(theme.store.marketing.newsletterPopup.cookieDuration / 86400)
                        );
                    });

                }, theme.store.marketing.newsletterPopup.delay);
            }
        };

        if (theme.store.marketing.newsletterPopup.status && theme.store.designMode !== 'edit') {
            initNewsletterPopup();
        }
    }
}