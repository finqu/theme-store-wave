import Handlebars from 'handlebars';

Handlebars.registerHelper('t', function(key, options) {
    return new Handlebars.SafeString(theme.utils.t(key, options.hash));
});

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

Handlebars.registerHelper('join', function(array, separator) {

    if (typeof array === 'string') {
        return array;
    }

    if (!Array.isArray(array)) {
        return '';
    }

    if (typeof separator === 'string' && separator && separator.length !== 0) {
        separator = separator;
    } else {
        separator = ', ';
    }

    return new Handlebars.SafeString(array.join(separator));
});

Handlebars.registerHelper('formatCurrency', function(value, defaultValue, minimumFractionDigits, maximumFractionDigits) {

    const opts = {};

    if (!isNaN(value)) {
        opts.value = value;
    } if (!isNaN(defaultValue)) {
        opts.value = defaultValue;
    }

    if (!isNaN(minimumFractionDigits)) {
        opts.minimumFractionDigits = minimumFractionDigits;
    }

    if (!isNaN(maximumFractionDigits)) {
        opts.maximumFractionDigits = maximumFractionDigits;
    }

    return new Handlebars.SafeString(theme.utils.formatCurrency(opts));
});

Handlebars.registerPartial('icon', function(data) {
    return theme.utils.icon(data);
});

Handlebars.registerPartial('placeholder_svg', function(data) {
    return theme.utils.placeholderSvg(data);
});

Handlebars.registerPartial('image', function(data) {
    return theme.utils.image(data);
});

Handlebars.registerHelper('assign', function (key, val, options) {

    if (!options.data.root) {
        options.data.root = {};
    }

    options.data.root[key] = val;
});

Handlebars.registerHelper('add', function(firstValue, secondValue) {
    return new Handlebars.SafeString(firstValue+secondValue);
});

Handlebars.registerHelper('add', function(firstValue, secondValue) {
    return new Handlebars.SafeString(firstValue+secondValue);
});

document.querySelectorAll('.renderer-partial[type="text/template"]').forEach(el => {
    Handlebars.registerPartial(el.id.replace('renderer-', ''), el.innerHTML);
});

class Renderer {

    constructor() {
        this.cache = {};
    }

    render(context = null, data = {}) {

        if (!context) {
            throw new Error('Renderer: Missing context');
        }

        if (!this.cache[context]) {

            const el = document.getElementById(`renderer-${context}`);

            if (!el) {

                console.warn(`Renderer: Context ${context} could not be rendered, check that context exists in DOM.`);

                return '';
            }
            
            this.cache[context] = Handlebars.compile(el.innerHTML);
        }

        return this.cache[context](data);
    }
}

export default Renderer;