import Slider from './slider';
import Masonry from 'masonry-layout';

export default {
    init() {
        document.addEventListener('finqu:section:load', (e) => {

            // Force load all remaining images because vanilla-lazyload's observer doesn't work in iframe
            theme.lazyLoad('loadAll');

            for (const el of e.target.querySelectorAll('.swiper.swiper-standalone')) {
                new Slider(el);
            }

            for (const el of e.target.querySelectorAll('.masonry')) {
                const settings = {
                    percentPosition: true,
                    ...(el.dataset || {})
                };
                new Masonry(el, settings);
            }
        });

        document.addEventListener('finqu:section:unload', (e) => {

            for (const el of e.target.querySelectorAll('.swiper.swiper-standalone')) {
                if (el && el.swiper) {
                    el.swiper.destroy();
                }
            }

            for (const el of e.target.querySelectorAll('.masonry')) {

                const masonry = Masonry.data(el);

                if (masonry) {
                    masonry.destroy();
                }
            }
        });

        document.addEventListener('finqu:block:load', () => {
            // Force load all remaining images because vanilla-lazyload's observer doesn't work in iframe
            theme.lazyLoad('loadAll');
        });

        document.addEventListener('finqu:block:edit', (e) => {

            const { settingsContainerEl } = e.detail;
            const radioLabelEls = settingsContainerEl.querySelectorAll('.radio-group label');

            for (const labelEl of radioLabelEls) {
                const matches = labelEl.innerHTML.match(/{# (.*?) #}/g) || [];

                if (matches.length > 0) {

                    for (const match of matches) {
                        const arr = [...match.matchAll(/{# icon.(.*?) #}/g)];

                        if (arr.length > 0 && arr[0].length >= 2) {

                            const key = arr[0][1];
                            labelEl.innerHTML = labelEl.innerHTML.replace(
                                match,
                                `<img width="15px" src="${theme.store.routes.assetUrl}/assets/icon/${key}.svg">`
                            );
                        }
                    }
                }
            }
        });

        document.addEventListener('finqu:section:edit', (e) => {

            const { settingsContainerEl } = e.detail;
            const radioLabelEls = settingsContainerEl.querySelectorAll('.radio-group label');

            for (const labelEl of radioLabelEls) {
                const matches = labelEl.innerHTML.match(/{# (.*?) #}/g) || [];

                if (matches.length > 0) {

                    for (const match of matches) {

                        const arr = [...match.matchAll(/{# icon.(.*?) #}/g)];

                        if (arr.length > 0 && arr[0].length >= 2) {

                            const key = arr[0][1];
                            
                            labelEl.innerHTML = labelEl.innerHTML.replace(
                                match,
                                `<img width="15px" src="${theme.store.routes.assetUrl}/assets/icon/${key}.svg">`
                            );
                        }
                    }
                }
            }
        });
    }
};
