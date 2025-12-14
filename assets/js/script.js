// Cart Management
const Cart = {
    items: [],

    init() {
        const stored = localStorage.getItem('foodie_cart');
        if (stored) {
            this.items = JSON.parse(stored);
        }
        this.updateUI();
    },

    add(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.qty++;
        } else {
            this.items.push({ ...product, qty: 1 });
        }
        this.save();
        alert("Item added to cart!");
    },

    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    },

    updateQty(id, qty) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.qty = qty;
            if (item.qty <= 0) this.remove(id);
            else this.save();
        }
    },

    clear() {
        this.items = [];
        this.save();
    },

    save() {
        localStorage.setItem('foodie_cart', JSON.stringify(this.items));
        this.updateUI();
    },

    updateUI() {
        const count = this.items.reduce((sum, item) => sum + item.qty, 0);
        const badge = document.querySelector('#cart-count');
        if (badge) badge.textContent = count;

        // Dispatch event for other components to react
        document.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.items }));
    }
};

/* Product Data */
const products = [
    // Chinese
    { id: 1, name: "Momos (Steamed)", category: "chinese", price: 15, image: "https://images.pexels.com/photos/18803177/pexels-photo-18803177/free-photo-of-plate-with-greasy-momos-dumplings.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 2, name: "Noodles", category: "chinese", price: 80, image: "https://media.istockphoto.com/id/1144505561/photo/chicken-hakka-schezwan-noodles-served-in-a-bowl-with-chopsticks-selective-focus.jpg?s=1024x1024&w=is&k=20&c=nVH1LkkpS9DF_b43GxIYWfEikiaQoHUz7s6QwlFfni4=" },
    { id: 3, name: "Pasta", category: "chinese", price: 80, image: "https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 4, name: "Spring Rolls", category: "chinese", price: 50, image: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=600" },
    // Indian
    { id: 5, name: "Naan", category: "indian", price: 40, image: "https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 6, name: "Matar Paneer", category: "indian", price: 180, image: "https://t3.ftcdn.net/jpg/06/94/29/48/240_F_694294860_p9yhvDJjP1iwezZxwGITd9WJLL4Yd5Vt.jpg" },
    { id: 7, name: "Chole Bhature", category: "indian", price: 60, image: "https://imgs.search.brave.com/3oNr8_7kAXQDamRmNtPPzG6JTg_DS56Oc5KP8Xxcvec/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c3BpY2V1cHRoZWN1/cnJ5LmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvMjAxNS8wMy9j/aG9sZS1iaGF0dXJl/LTIuanBn" },
    // Snacks
    { id: 8, name: "Lays", category: "snacks", price: 20, image: "images/snack1.jpg" },
    { id: 9, name: "Cool Drinks", category: "snacks", price: 25, image: "images/snack2.jpg" },
    { id: 10, name: "Biscuits", category: "snacks", price: 15, image: "images/snack3.jpg" }
];

/* DOM Utilities */
const App = {
    initProductsPage() {
        const container = document.getElementById('product-grid');
        if (!container) return;

        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');

        let filtered = products;
        if (category && category !== 'all') {
            filtered = products.filter(p => p.category === category);
            // Update active filter UI if needed
            document.querySelectorAll('.list-group-item').forEach(el => {
                el.classList.remove('active');
                if (el.dataset.category === category) el.classList.add('active');
            });
        }

        this.renderProducts(filtered, container);
        this.setupFilters(container);
    },

    renderProducts(items, container) {
        container.innerHTML = items.map(product => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm border-0">
                    <div style="height: 200px; overflow: hidden;">
                         <img src="${product.image}" class="card-img-top w-100 h-100" style="object-fit: cover;" alt="${product.name}">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-primary fw-bold">₹${product.price}</p>
                        <a href="product-details.html?id=${product.id}" class="stretched-link"></a>
                        <button onclick="event.preventDefault(); event.stopPropagation(); Cart.add({id: ${product.id}, name: '${product.name}', price: ${product.price}, image: '${product.image}'})" class="btn btn-outline-primary mt-auto w-100 position-relative z-2">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    setupFilters(container) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                let filtered = products;
                if (category !== 'all') {
                    filtered = products.filter(p => p.category === category);
                }
                this.renderProducts(filtered, container);
            });
        });
    },

    initCartPage() {
        const container = document.getElementById('cart-items-container');
        if (!container) return;

        this.renderCartItems(Cart.items, container);

        document.addEventListener('cartUpdated', (e) => {
            this.renderCartItems(e.detail, container);
        });
    },

    renderCartItems(items, container) {
        if (items.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="text-center py-4">Your cart is empty. <a href="products.html">Start Shopping</a></td></tr>';
            const totalEl = document.getElementById('cart-total');
            if (totalEl) totalEl.textContent = '0';
            return;
        }

        let total = 0;
        container.innerHTML = items.map(item => {
            let itemTotal = item.price * item.qty;
            total += itemTotal;
            return `
                <tr>
                    <td class="align-middle">
                        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;" class="rounded me-2">
                        ${item.name}
                    </td>
                    <td class="align-middle">₹${item.price}</td>
                    <td class="align-middle">
                        <div class="input-group input-group-sm" style="width: 100px;">
                            <button class="btn btn-outline-secondary" onclick="Cart.updateQty(${item.id}, ${item.qty - 1})">-</button>
                            <input type="text" class="form-control text-center" value="${item.qty}" readonly>
                            <button class="btn btn-outline-secondary" onclick="Cart.updateQty(${item.id}, ${item.qty + 1})">+</button>
                        </div>
                    </td>
                    <td class="align-middle">₹${itemTotal}</td>
                    <td class="align-middle">
                        <button class="btn btn-sm btn-danger" onclick="Cart.remove(${item.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.textContent = total;
    },

    initCheckoutPage() {
        const form = document.getElementById('checkout-form');
        if (!form) return;

        // Populate summary
        const summaryItems = document.getElementById('checkout-summary-items');
        const summaryTotal = document.getElementById('checkout-total');

        let total = 0;
        summaryItems.innerHTML = Cart.items.map(item => {
            total += item.price * item.qty;
            return `
                <li class="list-group-item d-flex justify-content-between lh-sm">
                    <div>
                        <h6 class="my-0">${item.name}</h6>
                        <small class="text-muted">Qty: ${item.qty}</small>
                    </div>
                    <span class="text-muted">₹${item.price * item.qty}</span>
                </li>
            `;
        }).join('');
        summaryTotal.textContent = total;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (form.checkValidity()) {
                alert('Order Placed Successfully! Thank you for shopping with FOODIE.');
                Cart.clear();
                window.location.href = 'index.html';
            }
            form.classList.add('was-validated');
        });
    },

    initProductDetailsPage() {
        const container = document.getElementById('product-details-container');
        if (!container) return;

        const urlParams = new URLSearchParams(window.location.search);
        const id = parseInt(urlParams.get('id'));
        const product = products.find(p => p.id === id);

        if (!product) {
            container.innerHTML = '<div class="text-center"><h3>Product not found</h3><a href="products.html" class="btn btn-primary mt-3">Back to Menu</a></div>';
            return;
        }

        // Render Product
        container.innerHTML = `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <img src="${product.image}" class="img-fluid rounded shadow-sm w-100" alt="${product.name}" style="max-height: 500px; object-fit: cover;">
                </div>
                <div class="col-md-6">
                    <h1 class="display-5 fw-bold">${product.name}</h1>
                    <p class="fs-4 text-primary fw-bold mb-4">₹${product.price}</p>
                    <p class="lead">Delicious and fresh ${product.name}, prepared with the finest ingredients. Perfect for any meal!</p>
                    
                    <div class="d-flex align-items-center mb-4">
                        <input type="number" id="qty-input" class="form-control text-center me-3" value="1" min="1" style="width: 80px;">
                        <button onclick="App.addToCartFromDetails(${product.id})" class="btn btn-primary btn-lg flex-grow-1">Add to Cart</button>
                    </div>
                    
                    <div class="card bg-light border-0">
                        <div class="card-body">
                            <ul class="list-unstyled mb-0">
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Freshly Prepared</li>
                                <li class="mb-2"><i class="fas fa-truck text-primary me-2"></i> Fast Delivery</li>
                                <li><i class="fas fa-shield-alt text-warning me-2"></i> Quality Assurance</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render Related (Same Category)
        const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
        const relatedContainer = document.getElementById('related-products');
        if (relatedContainer) {
            this.renderProducts(related, relatedContainer);
        }
    },

    addToCartFromDetails(id) {
        const qty = parseInt(document.getElementById('qty-input').value) || 1;
        const product = products.find(p => p.id === id);
        if (product) {
            // Check if exists
            const existing = Cart.items.find(item => item.id === id);
            if (existing) {
                Cart.updateQty(id, existing.qty + qty);
            } else {
                Cart.items.push({ ...product, qty: qty });
                Cart.save();
            }
            alert(`${product.name} (x${qty}) added to cart!`);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
    App.initProductsPage();
    App.initCartPage();
    App.initProductDetailsPage();
});
