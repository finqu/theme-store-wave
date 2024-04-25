import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

export default class Gallery {
	
	constructor(el) {
		this.pswp = null;
		this.el = el;
		this.imgPreload = true;
		this.opts = {
			bgOpacity: 0.85,
			allowPanToNext: false,
			returnFocus: false,
			loop: false,
			showHideAnimationType: 'none',
			dataSource: [],
			mouseMovePan: true,
			initialZoomLevel: 'fit',
			secondaryZoomLevel: 1.5,
			maxZoomLevel: 1,
			pswpModule: () => import('photoswipe')
		};

		el.gallery = this;

		this.initialize();
	}

	initHandler = (el) => {
		let galleryItemEl = el.closest('.gallery-item');
		let parentEl = galleryItemEl.parentElement;

		if (!parentEl && el.parentElement.classList.contains('gallery-item')) {
			galleryItemEl = el.parentElement;
			parentEl = galleryItemEl.parentElement;
		}

		const parentElIndex = [...parentEl.children].indexOf(galleryItemEl);

		this.init(parentElIndex);
	};

	initialize = async () => {
		await this.addDomItems();

		if (this.opts.dataSource.length) {
			this.opts.dataSource.sort((a, b) => a.index - b.index);

			this.el.querySelectorAll('[data-gallery-init]').forEach((galleryItemContainerEl) => {
				galleryItemContainerEl.addEventListener('click', this.initHandler);
			});
		}
	};

	addDomItems = async () => {
		const galleryItemEls = this.el.querySelectorAll('.gallery-item');
		const maxLoadIndex = galleryItemEls.length;
		let itemsToLoad = maxLoadIndex;
		let loadIndex = 0;

		if (galleryItemEls.length) {

			await Promise.all([...galleryItemEls].map(async (galleryItemEl, i) => {

				const galleryImgSrcEl = galleryItemEl.querySelector('[data-gallery-img-src]');
				const galleryIframeSrcEl = galleryItemEl.querySelector('[data-gallery-iframe-src]');
				const galleryVideoSrcEl = galleryItemEl.querySelector('[data-gallery-video-src]');

				if (this.imgPreload && galleryImgSrcEl) {

					const src = galleryImgSrcEl.dataset.galleryImgSrc;
					const img = new Image();

					await new Promise((resolve) => {
						img.onload = () => {
							itemsToLoad--;
							loadIndex++;

							this.opts.dataSource.push({
								index: i,
								src: src,
								width: img.width,
								height: img.height
							});

							if (itemsToLoad === 0) {
								resolve();
							}
						};

						img.src = src;
					});

				} else if (galleryImgSrcEl) {

					itemsToLoad--;
					loadIndex++;

					this.opts.dataSource.push({
						index: i,
						src: galleryImgSrcEl.dataset.galleryImgSrc,
						width: galleryImgSrcEl.dataset.galleryImgWidth,
						height: galleryImgSrcEl.dataset.galleryImgHeight
					});

					if (itemsToLoad === 0) {
						resolve();
					}

				} else if (galleryIframeSrcEl) {

					itemsToLoad--;
					loadIndex++;

					this.opts.dataSource.push({
						index: i,
						html: `
							<div class="pswp__iframe-container">
								<div class="pswp__iframe-aspect-ratio-container">
									<iframe class="pswp__iframe"
										src="${galleryIframeSrcEl.dataset.galleryIframeSrc}"
										width="960"
										height="640"
										frameborder="0"
										webkitallowfullscreen
										mozallowfullscreen
										allowfullscreen></iframe>
								</div>
							</div>
						`
					});

					if (itemsToLoad === 0) {
						resolve();
					}

				} else if (galleryVideoSrcEl) {

					itemsToLoad--;
					loadIndex++;

					this.opts.dataSource.push({
						index: i,
						html: `
							<div class="pswp__video-container">
								<div class="pswp__video-aspect-ratio-container">
									<video class="pswp__video"
										src="${galleryVideoSrcEl.dataset.galleryVideoSrc}"
										width="960"
										height="640"
										controls>
									</div>
								</div>
							`
					});

					if (itemsToLoad === 0) {
						resolve();
					}
				}
			}));
		}
	};

	prev() {
		this.pswp.prev();
	}

	next() {
		this.pswp.next();
	}

	close() {
		this.pswp.close();
	}

	init(index) {
		this.pswp = new PhotoSwipeLightbox(this.opts);
		this.pswp.init();
		this.pswp.loadAndOpen(index);
	}

	update() {
		this.el.querySelectorAll('[data-gallery-init]').forEach((galleryItemContainerEl) => {
			galleryItemContainerEl.removeEventListener('click', this.initHandler);
		});

		this.opts.dataSource = [];

		this.initialize();
	}
}