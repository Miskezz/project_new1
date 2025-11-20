// Завантаження продуктів з JSON
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Завантаження продуктів при завантаженні сторінки
async function loadProducts() {
    try {
        const response = await fetch('../data/products.json');
        products = await response.json();
        updateCartCount();
    } catch (error) {
        console.error('Помилка завантаження продуктів:', error);
    }
}

// Додавання товару в кошик
function addToCart(productId, productName, productPrice) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`${productName} додано в кошик!`);
}

// Видалення товару з кошика
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    displayCart();
}

// Зміна кількості товару
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            displayCart();
        }
    }
}

// Збереження кошика в localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Оновлення лічильника кошика
function updateCartCount() {
    const cartIcon = document.querySelector('.icons span:nth-child(2)');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        cartIcon.textContent = `🛒(${totalItems})`;
    } else {
        cartIcon.textContent = '🛒';
    }
}

// Відображення кошика
function displayCart() {
    const modal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 20px;">Кошик порожній</p>';
        totalElement.textContent = '0.00';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)">+</button>
                    <button onclick="removeFromCart('${item.id}')" class="remove-btn">×</button>
                </div>
                <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
            </div>
        `;
    }).join('');
    
    totalElement.textContent = total.toFixed(2);
}

// Показати/сховати кошик
function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    if (modal.style.display === 'block') {
        displayCart();
    }
}

// Очистити кошик
function clearCart() {
    if (confirm('Ви впевнені, що хочете очистити кошик?')) {
        cart = [];
        saveCart();
        updateCartCount();
        displayCart();
    }
}

// Оформити замовлення
function checkout() {
    if (cart.length === 0) {
        alert('Кошик порожній!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Замовлення на суму $${total.toFixed(2)} оформлено!\nДякуємо за покупку!`);
    
    cart = [];
    saveCart();
    updateCartCount();
    toggleCart();
}

// Показати сповіщення
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Плавна прокрутка
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

// Пошук товарів
function searchProducts() {
    const searchTerm = prompt('Що ви шукаєте?');
    if (searchTerm) {
        alert(`Пошук: ${searchTerm}\n(Функція буде реалізована пізніше)`);
    }
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    
    // Додати обробники подій для іконок
    const searchIcon = document.querySelector('.icons span:first-child');
    const cartIcon = document.querySelector('.icons span:nth-child(2)');
    
    if (searchIcon) {
        searchIcon.style.cursor = 'pointer';
        searchIcon.addEventListener('click', searchProducts);
    }
    
    if (cartIcon) {
        cartIcon.style.cursor = 'pointer';
        cartIcon.addEventListener('click', toggleCart);
    }
    
    // Додати обробники для кнопок "buy"
    document.querySelectorAll('.mini-button').forEach(button => {
        button.addEventListener('click', function(e) {
            const productElement = this.closest('.mini-product');
            const name = productElement.querySelector('.mini-name').textContent;
            const priceText = productElement.querySelector('.mini-price').textContent;
            const price = parseFloat(priceText.replace('$', '').replace(',', ''));
            const id = name.toLowerCase().replace(/\s+/g, '-');
            
            addToCart(id, name, price);
        });
    });
    
    // Обробник для кнопки Explore
    const exploreBtn = document.querySelector('.hero-button');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => smoothScroll('.section'));
    }
});