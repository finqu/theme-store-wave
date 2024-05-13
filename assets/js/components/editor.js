export default {
    init() {
        document.addEventListener('finqu:section:load', (e) => {

            // Force load all remaining images because vanilla-lazyload's observer doesn't work in iframe
            theme.lazyLoad.call('loadAll');

            const componentsToInit = [
				{
					name: 'tooltip',
					selector: e.target.querySelectorAll('[data-bs-toggle="tooltip"]')
				},
				{
					name: 'popover',
					selector: e.target.querySelectorAll('[data-bs-toggle="popover"]')
				},
				{
					name: 'slider',
					selector: e.target.querySelectorAll('.swiper.swiper-standalone')
				},
				{ 
					name: 'gallery',
					selector: e.target.querySelectorAll('.gallery')
				},
				{
					name: 'masonry',
					selector: e.target.querySelectorAll('.masonry') 
				}
			];

			componentsToInit.forEach((component) => {
				if (component.selector.length) {
					theme.utils.initComponent(component.name, component.selector);
				}
			});
        });

        document.addEventListener('finqu:section:unload', (e) => {

            for (const el of e.target.querySelectorAll('.swiper.swiper-standalone')) {
                if (el && el.swiper) {
                    el.swiper.destroy();
                }
            }

            for (const el of e.target.querySelectorAll('.masonry')) {

                const masonry = theme.masonry.data(el);

                if (masonry) {
                    masonry.destroy();
                }
            }
        });

        document.addEventListener('finqu:block:load', () => {
            // Force load all remaining images because vanilla-lazyload's observer doesn't work in iframe
            theme.lazyLoad.call('loadAll');
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
