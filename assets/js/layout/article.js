export default function() {
    
    const containerEl = document.querySelector('.section-article');

    containerEl.querySelectorAll('[name="article-comment-form-show-action"]').forEach(el => { el.addEventListener('click', () => {

        const commentReplyContainerEl = containerEl.querySelector('#article-comment-form-'+el.value);

        commentReplyContainerEl.classList.remove('d-none')
        el.classList.add('d-none');
    })});

    containerEl.querySelectorAll('[name="article-comment-form-close-action"]').forEach(el => { el.addEventListener('click', () => {

        const commentReplyContainerEl = containerEl.querySelector('#article-comment-form-'+el.value);
        const replyEl = containerEl.querySelector('[name="article-comment-form-show-action"][value="'+el.value+'"]');

        commentReplyContainerEl.classList.add('d-none')
        replyEl.classList.remove('d-none');
    })});
}