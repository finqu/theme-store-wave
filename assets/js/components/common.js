import accountLayout from '../layout/account';
import articleLayout from '../layout/article';
import categoryLayout from '../layout/category';
import catalogLayout from '../layout/catalog';
import manufacturerLayout from '../layout/manufacturer';
import searchLayout from '../layout/search';
import headerLayout from '../layout/header';
import passwordLayout from '../layout/password';
import productLayout from '../layout/product';
import registerLayout from '../layout/register';

export default {
	init() {

        this.initSection();

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
            case 'manufacturer':
                manufacturerLayout();
                break;
            case 'search':
                searchLayout();
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
    initCartMini() {

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
    initCookiePolicy() {

        const cookiePolicyEl = document.querySelector('.cookie-policy');

        let cookiePolicyFormEl = null;
        let cookiePolicyInputEl = null;

        const setDefaultStateForCookiePolicy = () => {

            if (document.body.classList.contains('cookie-policy-visible')) {
                document.body.classList.remove('cookie-policy-visible');
            }

            if (theme.store.cookiePolicy.position === 'middle') {
                document.body.classList.remove('disable-scroll');
            }

            if (cookiePolicyFormEl && cookiePolicyInputEl) {

                cookiePolicyInputEl.value = 'required';
   
                fetch(cookiePolicyFormEl.action, {
                    method: cookiePolicyFormEl.method,
                    body: new FormData(cookiePolicyFormEl)
                });
            }

            theme.store.cookiePolicy.status = 'required';

            this.initMarketing();
        };

        if (!cookiePolicyEl) {

            if (theme.store.cookiePolicy.status === null) {
                setDefaultStateForCookiePolicy();
            }

            return;
        }

        const cookiePolicyCloseEl = cookiePolicyEl.querySelector('[data-cookie-policy-close]');
        const cookiePolicyOpenEls = document.querySelectorAll('[data-cookie-policy-open]');
        const cookiePolicySubmitEls = cookiePolicyEl.querySelectorAll('[data-cookie-policy-submit]');

        let cookiePolicyStateCheckInterval = null;

        const cookiePolicyStateCheck = () => {

            if ((!cookiePolicyEl || !theme.utils.checkVisibility(cookiePolicyEl)) && theme.store.cookiePolicy.status === null) {

                if (cookiePolicyStateCheckInterval !== null) {
                    clearInterval(cookiePolicyStateCheckInterval);
                }
                
                setDefaultStateForCookiePolicy();

                return;
            }

            if (cookiePolicyStateCheckInterval === null) {
                cookiePolicyStateCheckInterval = setInterval(cookiePolicyStateCheck, 1000);
            };
        };

        cookiePolicyFormEl = cookiePolicyEl.querySelector('#cookie-policy-form');
        cookiePolicyInputEl = cookiePolicyFormEl.querySelector('[name="cookie_policy"]');

        if (theme.store.cookiePolicy.status === null) {
            cookiePolicyStateCheck();
        }

        if (cookiePolicyCloseEl) {

            cookiePolicyCloseEl.addEventListener('click', () => {

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
    initAccessibility() {

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

            const isWishlistTemplate = document.body.classList.contains('template-customers-wishlist');

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
                        el.setAttribute('aria-label', theme.utils.t('wishlist.add'));

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
                        el.setAttribute('aria-label', theme.utils.t('wishlist.remove'));

                        document.dispatchEvent(new CustomEvent('theme:wishlist:addItem', {
                            detail: {
                                id: id
                            }
                        }));
                    });
                }
            };

            document.addEventListener('click', (e) => {

                if (e.target.matches('[data-wishlist-add]')) {
                    return add(e.target);
                }
    
                if (e.target.matches('[data-wishlist-remove]')) {
                    return remove(e.target);
                }
    
                if (e.target.matches('[data-wishlist-toggle]')) {
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
    initLocalization() {

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
    initSection() {

        document.addEventListener('click', (e) => {
            if (e.target.matches('[name="section-tab-action"]')) {
                const sectionTabActionEl = e.target;
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
            }
        });

        document.querySelectorAll('[class*="row-scroll-cols"]').forEach(el => {

            let initialized = false;
            let matchMedia = null;
            let pos = {
                top: 0,
                left: 0,
                x: 0,
                y: 0
            };
        
            const mouseDownHandler = (e) => {
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
        
            const mouseMoveHandler = (e) => {
                const dx = e.clientX - pos.x;
                const dy = e.clientY - pos.y;

                el.scrollTop = pos.top - dy;
                el.scrollLeft = pos.left - dx;
            };
        
            const mouseUpHandler = () => {
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

        document.querySelectorAll('.section-header .description-collapse').forEach(el => {
            el.style.setProperty('--collapse-height', el.clientHeight+'px');
        });

        let windowWidth = window.innerWidth;

        window.addEventListener('resize', theme.utils.debounce(() => {

            if (window.innerWidth != windowWidth) {

                document.querySelectorAll('.section-header .description-collapse').forEach(el => {

                    el.style.removeProperty('--collapse-height');

                    setTimeout(() => {
                        el.style.setProperty('--collapse-height', el.clientHeight+'px');
                    }, 150);

                    windowWidth = window.innerWidth;
                });
            }
        }, 150));
    },
    initMarketing() {

        const initNewsletterPopup = () => {

            if (theme.store.cookiePolicy.status !== null
                && !theme.utils.cookies.get('themeNewsletterPopup')
                && !(theme.store.customer.loggedIn && theme.store.customer.acceptsMarketing)) {

                setTimeout(() => {

                    document.body.insertAdjacentHTML('beforeend', theme.renderer.render('newsletter-popup'));

                    const showModal = () => {

                        theme.bs.Modal.getOrCreateInstance('#newsletter-popup-modal')?.show();

                        document.getElementById('newsletter-popup-modal').addEventListener('hide.bs.modal', () => {

                            theme.utils.cookies.set(
                                'themeNewsletterPopup',
                                true,
                                Math.floor(theme.store.marketing.newsletterPopup.cookieDuration / 86400)
                            );
                        });
                    };

                    const newsletterImgContainerEl = document.querySelector('#newsletter-popup-modal-img-container');

                    if (newsletterImgContainerEl) {

                        theme.lazyLoad.load(newsletterImgContainerEl.querySelector('.lazy', {
                            callback_finish: () => {
                                showModal();
                            }
                        }));
                    }

                }, theme.store.marketing.newsletterPopup.delay * 1000);
            }
        };

        if (theme.store.marketing.newsletterPopup.status && theme.store.designMode !== 'edit') {
            initNewsletterPopup();
        }
    }
}