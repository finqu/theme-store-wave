# Wave
Modern and responsive theme designed for Finqu e-commerce platform. It offers a clean and intuitive user interface, making it easy for customers to navigate and find products. The theme is highly customizable, allowing store owners to tailor the look and feel to match their brand. Wave also includes a variety of features to enhance the shopping experience, such as product carousels, wishlists, and a robust search functionality.

## Events API
The theme dispatch various events that developers can use to extend functionality or integrate with other systems. Below is a list of events that the theme dispatch, along with their details.

### `theme:ready`
Dispatched when the theme is fully loaded and ready access window.theme object.

**Snippet:**
```javascript
document.addEventListener('theme:ready', (e) => {
    console.log('Theme is ready', e.detail);
});
```

**Detail:**
```
Theme App object (window.theme)
```

### `theme:cart:render`
Dispatched when the cart is rendered.

**Snippet:**
```javascript
document.addEventListener('theme:cart:render', () => {
    console.log('Cart rendered');
});
```

### `theme:cart:update`
Dispatched when the cart is updated.

**Snippet:**
```javascript
document.addEventListener('theme:cart:update', (e) => {
    console.log('Cart updated', e.detail);
});
```

**Detail:**
```json
{
    "id": "1",
    "currency": "EUR",
    "total": 150,
    "total_in_smallest": 15000,
    "subtotal": 150,
    "subtotal_in_smallest": 15000,
    "payment_fee": 0,
    "payment_fee_in_smallest": 0,
    "shipping_price": 0,
    "shipping_price_in_smallest": 0,
    "tax": 13.64,
    "tax_in_smallest": 1364,
    "tax_subtotal": 13.64,
    "tax_subtotal_in_smallest": 1364,
    "tax_free": 136.36,
    "tax_free_in_smallest": 13636,
    "tax_free_subtotal": 136.36,
    "tax_free_subtotal_in_smallest": 13636,
    "item_count": 1,
    "expires": "Tue, 12 Nov 2024 09:56:53 +0000",
    "has_free_shipping": false,
    "free_shipping_limit": {
        "title": "",
        "description": "",
        "amount_to_limit": 50,
        "amount_to_limit_in_smallest": 5000,
        "limit_amount": 200,
        "limit_amount_in_smallest": 20000
    },
    "weight_in_grams": 0,
    "items": [
        {
            "name": "Product Name",
            "description": "Product Description",
            "id": 1,
            "url": "https://example.com/product/1",
            "image": {
                "icon": "https://example.com/image/icon.jpg",
                "thumb": "https://example.com/image/thumb.jpg",
                "small": "https://example.com/image/small.jpg",
                "medium": "https://example.com/image/medium.jpg",
                "large": "https://example.com/image/large.jpg",
                "original": "https://example.com/image/original.jpg"
            },
            "quantity": 1,
            "unit_price": 150,
            "unit_price_in_smallest": 15000,
            "line_price": 150,
            "line_price_in_smallest": 15000,
            "net_price": 136.36,
            "net_price_in_smallest": 13636,
            "rate": 0.1,
            "tax": 13.64,
            "unit_name": "pcs",
            "out_of_stock": false,
            "product_id": 1,
            "requires_shipping": true,
            "category_path": [
                "Category 1"
            ],
            "sku": "SKU123",
            "model": "Model123",
            "manufacturer": "Manufacturer Name",
            "type": "product",
            "attributes": [
                "Color: Red",
                "Size: M"
            ],
            "attributes_label": "Color: Red, Size: M",
            "weight_in_grams": 500,
            "shipping_weight_in_grams": 500,
            "currency": "EUR"
        }
    ],
    "payment_methods": [],
    "shipping_methods": [],
    "discounts": []
}
```

### `theme:cart:show`
Dispatched when the cart is shown.

**Snippet:**
```javascript
document.addEventListener('theme:cart:show', () => {
    console.log('Cart shown');
});
```

### `theme:cart:hide`
Dispatched when the cart is hidden.

**Snippet:**
```javascript
document.addEventListener('theme:cart:hide', () => {
    console.log('Cart hidden');
});
```

### `theme:cart:addItem`
Dispatched when an item is added to the cart.

**Snippet:**
```javascript
document.addEventListener('theme:cart:addItem', (e) => {
    console.log('Item added to cart', e.detail);
});
```

**Detail:**
```json
{
    "name": "Product Name",
    "description": "Product Description",
    "id": 1,
    "url": "https://example.com/product/product-name",
    "image": {
        "icon": "https://example.com/image/icon.jpg",
        "thumb": "https://example.com/image/thumb.jpg",
        "small": "https://example.com/image/small.jpg",
        "medium": "https://example.com/image/medium.jpg",
        "large": "https://example.com/image/large.jpg",
        "original": "https://example.com/image/original.jpg"
    },
    "quantity": 1,
    "unit_price": 40.45,
    "unit_price_in_smallest": 4045,
    "line_price": 40.45,
    "line_price_in_smallest": 4045,
    "net_price": 32.62,
    "net_price_in_smallest": 3262,
    "rate": 0.24,
    "tax": 7.83,
    "unit_name": "pcs",
    "out_of_stock": false,
    "product_id": 1,
    "requires_shipping": true,
    "category_path": [
        "Category 1",
        "Category 2"
    ],
    "sku": "SKU123",
    "model": "Model123",
    "manufacturer": "Manufacturer Name",
    "type": "product",
    "attributes": false,
    "attributes_label": false,
    "weight_in_grams": 1800,
    "shipping_weight_in_grams": 0,
    "currency": "EUR"
}
```

### `theme:cart:updateItem`
Dispatched when an item in the cart is updated.

**Snippet:**
```javascript
document.addEventListener('theme:cart:updateItem', (e) => {
    console.log('Cart item updated', e.detail);
});
```

**Detail:**
```json
{
    "name": "Product Name",
    "description": "Product Description",
    "id": 1,
    "url": "https://example.com/product/product-name",
    "image": {
        "icon": "https://example.com/image/icon.jpg",
        "thumb": "https://example.com/image/thumb.jpg",
        "small": "https://example.com/image/small.jpg",
        "medium": "https://example.com/image/medium.jpg",
        "large": "https://example.com/image/large.jpg",
        "original": "https://example.com/image/original.jpg"
    },
    "quantity": 2,
    "unit_price": 40.45,
    "unit_price_in_smallest": 4045,
    "line_price": 80.9,
    "line_price_in_smallest": 8090,
    "net_price": 32.62,
    "net_price_in_smallest": 3262,
    "rate": 0.24,
    "tax": 48.28,
    "unit_name": "pcs",
    "out_of_stock": false,
    "product_id": 1,
    "requires_shipping": true,
    "category_path": [
        "Category 1",
        "Category 2"
    ],
    "sku": "SKU123",
    "model": "Model123",
    "manufacturer": "Manufacturer Name",
    "type": "product",
    "attributes": false,
    "attributes_label": false,
    "weight_in_grams": 1800,
    "shipping_weight_in_grams": 0,
    "currency": "EUR"
}
```

### `theme:cart:removeItem`
Dispatched when an item is removed from the cart.

**Snippet:**
```javascript
document.addEventListener('theme:cart:removeItem', (e) => {
    console.log('Item removed from cart', e.detail);
});
```

**Detail:**
```json
{
    "name": "Product Name",
    "description": "Product Description",
    "id": 1,
    "url": "https://example.com/product/product-name",
    "image": {
        "icon": "https://example.com/image/icon.jpg",
        "thumb": "https://example.com/image/thumb.jpg",
        "small": "https://example.com/image/small.jpg",
        "medium": "https://example.com/image/medium.jpg",
        "large": "https://example.com/image/large.jpg",
        "original": "https://example.com/image/original.jpg"
    },
    "quantity": 2,
    "unit_price": 40.45,
    "unit_price_in_smallest": 4045,
    "line_price": 80.9,
    "line_price_in_smallest": 8090,
    "net_price": 32.62,
    "net_price_in_smallest": 3262,
    "rate": 0.24,
    "tax": 48.28,
    "unit_name": "pcs",
    "out_of_stock": false,
    "product_id": 1,
    "requires_shipping": true,
    "category_path": [
        "Category 1",
        "Category 2"
    ],
    "sku": "SKU123",
    "model": "Model123",
    "manufacturer": "Manufacturer Name",
    "type": "product",
    "attributes": false,
    "attributes_label": false,
    "weight_in_grams": 1800,
    "shipping_weight_in_grams": 0,
    "currency": "EUR"
}
```

### `theme:cart:clear`
Dispatched when the cart is cleared.

**Snippet:**
```javascript
document.addEventListener('theme:cart:clear', (e) => {
    console.log('Cart cleared', e.detail);
});
```

**Detail:**
```json
{
    "id": null,
    "currency": "EUR",
    "total": 0,
    "total_in_smallest": 0,
    "subtotal": 0,
    "subtotal_in_smallest": 0,
    "payment_fee": 0,
    "payment_fee_in_smallest": 0,
    "shipping_price": 0,
    "shipping_price_in_smallest": 0,
    "tax": 0,
    "tax_in_smallest": 0,
    "tax_subtotal": 0,
    "tax_subtotal_in_smallest": 0,
    "tax_free": 0,
    "tax_free_in_smallest": 0,
    "tax_free_subtotal": 0,
    "tax_free_subtotal_in_smallest": 0,
    "item_count": 0,
    "expires": null,
    "has_free_shipping": false,
    "weight_in_grams": 0,
    "items": [],
    "payment_methods": [],
    "shipping_methods": [],
    "discounts": []
}
```

### `theme:cart:initiateCheckout`
Dispatched when the checkout process is initiated.

**Snippet:**
```javascript
document.addEventListener('theme:cart:initiateCheckout', (e) => {
    console.log('Checkout initiated', e.detail);
});
```

**Detail:**
```json
{
    "currency": "EUR",
    "total": 40.45,
    "subtotal": 40.45,
    "payment_fee": 0,
    "shipping_price": 0,
    "tax": 7.83,
    "tax_subtotal": 7.83,
    "tax_free": 32.62,
    "tax_free_subtotal": 32.62,
    "item_count": 1,
    "expires": "Tue, 12 Nov 2024 10:25:42 +0000",
    "has_free_shipping": false,
    "free_shipping_limit": {
        "title": "",
        "description": "",
        "amount_to_limit": 159.55,
        "limit_amount": 200
    },
    "weight_in_grams": 1800,
    "items": [
        {
            "name": "Product Name",
            "description": "Product Description",
            "id": 1,
            "url": "https://example.com/product/product-name",
            "image": {
                "icon": "https://example.com/image/icon.jpg",
                "thumb": "https://example.com/image/thumb.jpg",
                "small": "https://example.com/image/small.jpg",
                "medium": "https://example.com/image/medium.jpg",
                "large": "https://example.com/image/large.jpg",
                "original": "https://example.com/image/original.jpg"
            },
            "quantity": 1,
            "unit_price": 40.45,
            "line_price": 40.45,
            "net_price": 32.62,
            "rate": 0.24,
            "tax": 7.83,
            "unit_name": "pcs",
            "out_of_stock": false,
            "product_id": 1,
            "requires_shipping": true,
            "category_path": [
                "Category 1",
                "Category 2"
            ],
            "sku": "SKU123",
            "model": "Model123",
            "manufacturer": "Manufacturer Name",
            "type": "product",
            "attributes": false,
            "attributes_label": false,
            "weight_in_grams": 1800,
            "shipping_weight_in_grams": 0
        }
    ],
    "payment_methods": [],
    "shipping_methods": [],
    "discounts": []
}
```

### `theme:wishlist:addItem`
Dispatched when an item is added to the wishlist.

**Snippet:**
```javascript
document.addEventListener('theme:wishlist:addItem', (e) => {
    console.log('Item added to wishlist', e.detail);
});
```

**Detail:**
```json
{
    "id": 1
}
```

### `theme:wishlist:removeItem`
Dispatched when an item is removed from the wishlist.

**Snippet:**
```javascript
document.addEventListener('theme:wishlist:removeItem', (e) => {
    console.log('Item removed from wishlist', e.detail);
});
```

**Detail:**
```json
{
    "id": 1
}
```

### `theme:cookiePolicy:consentGranted`
Dispatched when cookie policy consent is granted.

**Snippet:**
```javascript
document.addEventListener('theme:cookiePolicy:consentGranted', (e) => {
    console.log('Cookie policy consent granted', e.detail);
});
```

**Detail:**
```json
{
    "consents": [
        "required",
        "analytics",
        "marketing",
        "functional",
        "security",
        "personalization"
    ]
}
```

### `theme:cookiePolicy:consentRequested`
Dispatched when cookie policy consent is requested.

**Snippet:**
```javascript
document.addEventListener('theme:cookiePolicy:consentRequested', () => {
    console.log('Cookie policy consent requested');
});
```

### `theme:search`
Dispatched when a search is performed.

**Snippet:**
```javascript
document.addEventListener('theme:search', (e) => {
    console.log('Search performed', e.detail);
});
```

**Detail:**
```json
{
    "query": "search term",
    "items": [
        {
            "type": "product",
            "url": "/product/product-name",
            "title": "Product Name",
            "image": {
                "thumb": "https://example.com/image/thumb.jpg",
                "original": "https://example.com/image/original.jpg"
            }
        },
        {
            "type": "product",
            "url": "/product/another-product",
            "title": "Another Product",
            "image": {
                "thumb": "https://example.com/image/thumb.jpg",
                "original": "https://example.com/image/original.jpg"
            }
        }
    ]
}
```

### `theme:search:view`
Dispatched when search results are viewed.

**Snippet:**
```javascript
document.addEventListener('theme:search:view', (e) => {
    console.log('Search results viewed', e.detail);
});
```

**Detail:**
```json
{
    "product_ids": [
        1,
        2,
        3
    ]
}
```

### `theme:product:price`
Dispatched when product price is updated on product page due customization select.

**Snippet:**
```javascript
document.addEventListener('theme:product:price', (e) => {
    console.log('Product price updated', e.detail);
});
```

**Detail:**
```json
{
    "id": 1,
    "price": 200,
    "net_price": 159.36,
    "price_in_smallest": 20000,
    "net_price_in_smallest": 15936,
    "tax": 40.64,
    "original_price": 200,
    "original_net_price": 159.36,
    "original_tax": 40.64,
    "quantity": 1,
    "has_discount": false,
    "discount_percent": 0
}
```

### `theme:product:view`
Dispatched when a product is viewed.

**Snippet:**
```javascript
document.addEventListener('theme:product:view', (e) => {
    console.log('Product viewed', e.detail);
});
```

**Detail:**
```json
{
    "id": 1,
    "price": 200,
    "name": "Product Name",
    "manufacturer": "Manufacturer Name",
    "currency": "EUR",
    "breadcrumbs": [
        "Category 1"
    ]
}
```

### `theme:customer:register`
Dispatched when a customer registers.

**Snippet:**
```javascript
document.addEventListener('theme:customer:register', () => {
    console.log('Customer registered');
});
```

### `theme:customer:acceptsMarketing`
Dispatched when a customer accepts marketing.

**Snippet:**
```javascript
document.addEventListener('theme:customer:acceptsMarketing', (e) => {
    console.log('Customer accepts marketing', e.detail);
});
```

**Detail:**
```json
{
    "email": "user@example.com"
}
```

### `theme:customer:deniesMarketing`
Dispatched when a customer denies marketing.

**Snippet:**
```javascript
document.addEventListener('theme:customer:deniesMarketing', (e) => {
    console.log('Customer denies marketing', e.detail);
});
```

**Detail:**
```json
{
    "email": "user@example.com"
}
```

### `theme:catalog:view`
Dispatched when a catalog is viewed.

**Snippet:**
```javascript
document.addEventListener('theme:catalog:view', (e) => {
    console.log('Catalog viewed', e.detail);
});
```

**Detail:**
```json
{
    "product_ids": [
        1,
        2,
        3
    ]
}
```

### `theme:category:view`
Dispatched when a category is viewed.

**Snippet:**
```javascript
document.addEventListener('theme:category:view', (e) => {
    console.log('Category viewed', e.detail);
});
```

**Detail:**
```json
{
    "name": "Category Name",
    "breadcrumbs": [
        "Parent Category"
    ],
    "product_ids": [
        1,
        2,
        3
    ]
}
```

### `theme:manufacturer:view`
Dispatched when a manufacturer is viewed.

**Snippet:**
```javascript
document.addEventListener('theme:manufacturer:view', (e) => {
    console.log('Manufacturer viewed', e.detail);
});
```

**Detail:**
```json
{
    "product_ids": [
        1,
        2,
        3
    ]
}
```

### `theme:newsletter:subscribe`
Dispatched when a user subscribes to the newsletter.

**Snippet:**
```javascript
document.addEventListener('theme:newsletter:subscribe', (e) => {
    console.log('Newsletter subscribed', e.detail);
});
```

**Detail:**
```json
{
    "email": "user@example.com"
}
```

### `theme:contact:sendEmail`
Dispatched when a contact email is sent.

**Snippet:**
```javascript
document.addEventListener('theme:contact:sendEmail', () => {
    console.log('Contact email sent');
});
```