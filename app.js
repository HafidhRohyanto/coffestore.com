// app.js - VERSI DENGAN FITUR REVIEW & KOMPATIBILITAS DATA LAMA

// ------------------ GLOBAL ------------------
const API_BASE = ''; // jika ada API, bisa ditaruh di sini
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
let isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;

// ------------------ DOM ELEMENTS ------------------
const loginLink = document.getElementById('login-link');
const logoutBtn = document.getElementById('logout-btn');
const cartItemsContainer = document.getElementById('cart-items');
const checkoutBtn = document.getElementById('checkout-btn');
const emptyCartDiv = document.getElementById('empty-cart');
const ordersList = document.getElementById('orders-list');
const noOrdersDiv = document.getElementById('no-orders');
const reviewsList = document.getElementById('reviews-list');
const noReviewsDiv = document.getElementById('no-reviews');

// Review Modal Elements
const reviewModal = document.getElementById('reviewModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelReviewBtn = document.getElementById('cancelReview');
const reviewForm = document.getElementById('reviewForm');

// ------------------ AUTH ------------------
function updateNav() {
  if (isLoggedIn) {
    loginLink?.classList.add('hidden');
    logoutBtn?.classList.remove('hidden');
  } else {
    loginLink?.classList.remove('hidden');
    logoutBtn?.classList.add('hidden');
  }
}

logoutBtn?.addEventListener('click', () => {
  isLoggedIn = false;
  localStorage.setItem('isLoggedIn', false);
  updateNav();
  alert('Logged out successfully');
});

// ------------------ CART ------------------
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  alert(`${product.name} masuk ke keranjang!`);
  renderCart();
}

function renderCart() {
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = '';
  if (cart.length === 0) {
    emptyCartDiv?.classList.remove('hidden');
    checkoutBtn?.classList.add('hidden');
    return;
  }

  emptyCartDiv?.classList.add('hidden');
  checkoutBtn?.classList.remove('hidden');

  cart.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('flex', 'justify-between', 'items-center', 'mb-4');
    div.innerHTML = `
      <div class="flex items-center gap-4">
        <img src="${item.image}" class="w-16 h-16 object-cover rounded-lg">
        <div>
          <p class="font-semibold">${item.name}</p>
          <p class="text-gray-600">Rp ${item.price.toLocaleString()}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-1 bg-gray-200 rounded" onclick="decreaseQty(${item.id})">-</button>
        <span>${item.qty}</span>
        <button class="px-3 py-1 bg-gray-200 rounded" onclick="increaseQty(${item.id})">+</button>
        <button class="px-3 py-1 bg-red-500 text-white rounded" onclick="removeItem(${item.id})">x</button>
      </div>
    `;
    cartItemsContainer.appendChild(div);
  });
}

function increaseQty(id) {
  const item = cart.find(p => p.id === id);
  if (item) item.qty += 1;
  saveCart();
  renderCart();
}

function decreaseQty(id) {
  const item = cart.find(p => p.id === id);
  if (item && item.qty > 1) item.qty -= 1;
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(p => p.id !== id);
  saveCart();
  renderCart();
}

checkoutBtn?.addEventListener('click', () => {
  if (!isLoggedIn) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
  }
  if (cart.length === 0) return;

  const orderDate = new Date().toLocaleString();
  const orderId = 'ORD' + Date.now();
  
  // Buat order baru dalam format yang kompatibel
  const newOrders = cart.map(item => ({ 
    ...item, 
    date: orderDate,
    orderId: orderId,
    status: 'completed'
  }));
  
  orders.push(...newOrders);
  localStorage.setItem('orders', JSON.stringify(orders));
  cart = [];
  saveCart();
  renderCart();
  alert('Checkout successful!');
  
  // Refresh tampilan orders jika di halaman orders
  if (ordersList) {
    renderOrders();
  }
});

// ------------------ ORDERS ------------------
function renderOrders() {
  if (!ordersList) return;
  
  // Jika tidak ada order, tampilkan pesan
  if (orders.length === 0) {
    ordersList.innerHTML = '';
    noOrdersDiv?.classList.remove('hidden');
    return;
  }
  
  noOrdersDiv?.classList.add('hidden');
  
  // DETEKSI FORMAT DATA LAMA
  // Cek apakah data dalam format lama (tanpa orderId)
  const hasOldFormat = orders.some(order => !order.orderId);
  
  if (hasOldFormat) {
    // RENDER FORMAT DATA LAMA
    renderOldFormatOrders();
  } else {
    // RENDER FORMAT DATA BARU (dengan orderId)
    renderNewFormatOrders();
  }
}

function renderOldFormatOrders() {
  // Render data lama (format asli)
  ordersList.innerHTML = orders.map(order => {
    // Handle both old and new format
    const orderDate = order.date || 'No date';
    const orderId = order.orderId || 'N/A';
    const status = order.status || 'completed';
    const itemName = order.name || order.productName || 'Product';
    const itemPrice = order.price || 0;
    const itemQty = order.qty || 1;
    const itemImage = order.image || 'https://via.placeholder.com/100';
    
    // Check if this item has been reviewed
    const existingReview = reviews.find(review => 
      review.productId == order.id && 
      (!review.orderId || review.orderId === orderId)
    );
    
    return `
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-800">Order #${orderId}</h3>
              <p class="text-gray-600">${orderDate}</p>
            </div>
            <div class="mt-2 sm:mt-0">
              <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                Completed
              </span>
            </div>
          </div>
          
          <div class="border-t border-gray-200 pt-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center mb-3 sm:mb-0">
                <img src="${itemImage}" alt="${itemName}" class="w-16 h-16 rounded-lg object-cover mr-4">
                <div>
                  <h4 class="font-semibold text-gray-800">${itemName}</h4>
                  <p class="text-gray-600">${itemQty} x Rp ${itemPrice.toLocaleString()}</p>
                  ${existingReview ? `
                    <div class="mt-2">
                      <div class="text-amber-500">
                        ${'★'.repeat(existingReview.rating)}${'☆'.repeat(5 - existingReview.rating)}
                      </div>
                      <p class="text-sm text-gray-600 mt-1">"${existingReview.comment.substring(0, 50)}${existingReview.comment.length > 50 ? '...' : ''}"</p>
                    </div>
                  ` : ''}
                </div>
              </div>
              ${!existingReview ? `
                <button onclick="openReviewModal('${orderId}', ${order.id}, '${itemName.replace(/'/g, "\\'")}')" 
                        class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition duration-300 whitespace-nowrap">
                  <i class="fas fa-star mr-2"></i>Write Review
                </button>
              ` : `
                <button onclick="editReview('${orderId}', ${order.id})" 
                        class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition duration-300 whitespace-nowrap">
                  <i class="fas fa-edit mr-2"></i>Edit Review
                </button>
              `}
            </div>
          </div>
          
          <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div>
              <p class="text-gray-600">Total Amount</p>
              <p class="text-2xl font-bold text-amber-700">Rp ${(itemPrice * itemQty).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderNewFormatOrders() {
  // Grupkan order berdasarkan orderId
  const ordersByGroup = {};
  orders.forEach(order => {
    if (!ordersByGroup[order.orderId]) {
      ordersByGroup[order.orderId] = {
        id: order.orderId,
        date: order.date,
        status: order.status || 'completed',
        items: []
      };
    }
    ordersByGroup[order.orderId].items.push(order);
  });
  
  // Render setiap grup order
  ordersList.innerHTML = Object.values(ordersByGroup).map(orderGroup => {
    const total = orderGroup.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    return `
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
        <div class="p-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-800">Order #${orderGroup.id}</h3>
              <p class="text-gray-600">${orderGroup.date}</p>
            </div>
            <div class="mt-2 sm:mt-0">
              <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold
                         ${orderGroup.status === 'completed' ? 'bg-green-100 text-green-800' : 
                           orderGroup.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                           'bg-red-100 text-red-800'}">
                ${orderGroup.status.charAt(0).toUpperCase() + orderGroup.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div class="border-t border-gray-200 pt-4">
            ${orderGroup.items.map(item => {
              const existingReview = reviews.find(review => 
                review.productId == item.id && 
                review.orderId === orderGroup.id
              );
              
              return `
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg mb-2 last:mb-0">
                  <div class="flex items-center mb-3 sm:mb-0">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover mr-4">
                    <div>
                      <h4 class="font-semibold text-gray-800">${item.name}</h4>
                      <p class="text-gray-600">${item.qty} x Rp ${item.price.toLocaleString()}</p>
                      ${existingReview ? `
                        <div class="mt-2">
                          <div class="text-amber-500">
                            ${'★'.repeat(existingReview.rating)}${'☆'.repeat(5 - existingReview.rating)}
                          </div>
                          <p class="text-sm text-gray-600 mt-1">"${existingReview.comment.substring(0, 50)}${existingReview.comment.length > 50 ? '...' : ''}"</p>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                  ${!existingReview && orderGroup.status === 'completed' ? `
                    <button onclick="openReviewModal('${orderGroup.id}', ${item.id}, '${item.name.replace(/'/g, "\\'")}')" 
                            class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition duration-300 whitespace-nowrap">
                      <i class="fas fa-star mr-2"></i>Write Review
                    </button>
                  ` : existingReview ? `
                    <button onclick="editReview('${orderGroup.id}', ${item.id})" 
                            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition duration-300 whitespace-nowrap">
                      <i class="fas fa-edit mr-2"></i>Edit Review
                    </button>
                  ` : `
                    <span class="text-gray-500 text-sm">Review not available</span>
                  `}
                </div>
              `;
            }).join('')}
          </div>
          
          <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div>
              <p class="text-gray-600">Total Amount</p>
              <p class="text-2xl font-bold text-amber-700">Rp ${total.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ------------------ REVIEW SYSTEM ------------------
// Inisialisasi modal review jika ada di halaman
if (reviewModal) {
  closeModalBtn?.addEventListener('click', closeReviewModal);
  cancelReviewBtn?.addEventListener('click', closeReviewModal);
  
  reviewModal.addEventListener('click', function(e) {
    if (e.target === reviewModal) {
      closeReviewModal();
    }
  });
  
  reviewForm?.addEventListener('submit', submitReview);
}

function openReviewModal(orderId, productId, productName) {
  if (!reviewModal) return;
  
  const modal = document.getElementById('reviewModal');
  const productInfo = document.getElementById('modalProductInfo');
  const reviewProductId = document.getElementById('reviewProductId');
  const reviewOrderId = document.getElementById('reviewOrderId');
  
  // Set product info
  if (productInfo) {
    productInfo.innerHTML = `
      <div class="flex items-center">
        <div class="w-12 h-12 bg-amber-200 rounded-lg flex items-center justify-center mr-4">
          <i class="fas fa-coffee text-amber-700 text-xl"></i>
        </div>
        <div>
          <h4 class="font-bold text-gray-800">${productName}</h4>
          <p class="text-gray-600 text-sm">Order #${orderId}</p>
        </div>
      </div>
    `;
  }
  
  // Set hidden inputs
  if (reviewProductId) reviewProductId.value = productId;
  if (reviewOrderId) reviewOrderId.value = orderId;
  
  // Reset form
  if (reviewForm) {
    reviewForm.reset();
    document.querySelectorAll('.star-rating input')?.forEach(input => input.checked = false);
  }
  
  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeReviewModal() {
  if (!reviewModal) return;
  
  const modal = document.getElementById('reviewModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function submitReview(e) {
  e.preventDefault();
  
  const productId = document.getElementById('reviewProductId')?.value;
  const orderId = document.getElementById('reviewOrderId')?.value;
  const rating = document.querySelector('input[name="rating"]:checked');
  const comment = document.getElementById('reviewText')?.value.trim();
  
  if (!rating || !comment) {
    alert('Please fill all fields');
    return;
  }
  
  const review = {
    id: 'REV' + Date.now(),
    productId: productId,
    orderId: orderId,
    rating: parseInt(rating.value),
    comment: comment,
    date: new Date().toISOString(),
    userId: 'user1', // Ini bisa diambil dari user login
    userName: 'Guest'
  };
  
  // Simpan review
  reviews.push(review);
  localStorage.setItem('reviews', JSON.stringify(reviews));
  
  alert('Thank you for your review!');
  closeReviewModal();
  
  // Refresh tampilan
  if (ordersList) renderOrders();
  if (reviewsList) renderReviews();
}

function editReview(orderId, productId) {
  const existingReview = reviews.find(review => 
    review.productId == productId && 
    review.orderId === orderId
  );
  
  if (existingReview) {
    openReviewModal(orderId, productId, 'Edit Review');
    
    setTimeout(() => {
      const ratingInput = document.querySelector(`input[name="rating"][value="${existingReview.rating}"]`);
      const commentInput = document.getElementById('reviewText');
      
      if (ratingInput) ratingInput.checked = true;
      if (commentInput) commentInput.value = existingReview.comment;
    }, 100);
  }
}

// ------------------ REVIEWS PAGE ------------------
function renderReviews() {
  if (!reviewsList) return;
  
  // Jika tidak ada review, tampilkan pesan
  if (reviews.length === 0) {
    reviewsList.innerHTML = '';
    noReviewsDiv?.classList.remove('hidden');
    updateReviewStats();
    return;
  }
  
  noReviewsDiv?.classList.add('hidden');
  
  // Sort by date, newest first
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Render reviews
  reviewsList.innerHTML = sortedReviews.map(review => {
    // Cari nama produk dari orders
    const product = orders.find(order => order.id == review.productId);
    const productName = product ? product.name : 'Product';
    
    return `
      <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div class="flex items-center mb-3 sm:mb-0">
            <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
              <i class="fas fa-user text-amber-600 text-xl"></i>
            </div>
            <div>
              <h4 class="font-bold text-gray-800">${review.userName}</h4>
              <p class="text-gray-600 text-sm">${new Date(review.date).toLocaleDateString('id-ID')}</p>
              <p class="text-sm text-amber-700">${productName}</p>
            </div>
          </div>
          <div class="text-2xl text-amber-500">
            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
          </div>
        </div>
        
        <p class="text-gray-700 mb-4 leading-relaxed">${review.comment}</p>
        
        <div class="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200">
          <div class="flex items-center text-gray-600 text-sm">
            <i class="fas fa-shopping-bag mr-2"></i>
            <span>Order #${review.orderId}</span>
          </div>
          ${review.userId === 'user1' ? `
            <button onclick="editReview('${review.orderId}', '${review.productId}')" 
                    class="text-amber-600 hover:text-amber-800 text-sm font-medium">
              <i class="fas fa-edit mr-1"></i>Edit Review
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  updateReviewStats();
}

function updateReviewStats() {
  // Update statistik review jika elemen ada
  const totalReviewsEl = document.getElementById('total-reviews');
  const averageRatingEl = document.getElementById('average-rating');
  const fiveStarCountEl = document.getElementById('five-star-count');
  const yourReviewsEl = document.getElementById('your-reviews');
  
  if (totalReviewsEl) totalReviewsEl.textContent = reviews.length;
  
  if (averageRatingEl && reviews.length > 0) {
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    averageRatingEl.textContent = average.toFixed(1);
  }
  
  if (fiveStarCountEl) {
    const fiveStarCount = reviews.filter(review => review.rating === 5).length;
    fiveStarCountEl.textContent = fiveStarCount;
  }
  
  if (yourReviewsEl) {
    const userReviewsCount = reviews.filter(review => review.userId === 'user1').length;
    yourReviewsEl.textContent = userReviewsCount;
  }
}

// ------------------ MIGRATE OLD DATA ------------------
function migrateOldOrders() {
  // Cek apakah ada data order lama tanpa orderId
  const needsMigration = orders.some(order => !order.orderId);
  
  if (needsMigration) {
    console.log('Migrating old orders data...');
    
    // Tambahkan orderId ke order lama
    orders = orders.map((order, index) => {
      if (!order.orderId) {
        return {
          ...order,
          orderId: `ORD${Date.now()}${index}`,
          status: 'completed'
        };
      }
      return order;
    });
    
    // Simpan kembali ke localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
    console.log('Migration completed');
  }
}

// ------------------ PRODUCT FILTER ------------------
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;
    const cards = document.querySelectorAll('.grid .bg-white');
    cards.forEach(card => {
      if (category === 'all') {
        card.style.display = 'block';
      } else {
        if (card.textContent.toLowerCase().includes(category.toLowerCase())) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      }
    });
  });
});

// ------------------ INIT ------------------
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  renderCart();
  
  // Migrasi data lama jika diperlukan
  migrateOldOrders();
  
  // Cek halaman mana yang sedang aktif
  if (ordersList) {
    renderOrders();
  }
  
  if (reviewsList) {
    renderReviews();
  }
  
  // Inisialisasi sample data jika kosong (untuk demo)
  initializeSampleData();
});

// Fungsi untuk membuat data contoh jika tidak ada data
function initializeSampleData() {
  // Sample orders jika tidak ada
  if (orders.length === 0) {
    orders = [
      {
        id: 1,
        name: "Espresso",
        price: 25000,
        qty: 2,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200",
        date: "2025-12-15",
        orderId: "ORD001",
        status: "completed"
      },
      {
        id: 2,
        name: "Cappuccino",
        price: 30000,
        qty: 1,
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w-200",
        date: "2025-12-15",
        orderId: "ORD001",
        status: "completed"
      },
      {
        id: 3,
        name: "Latte",
        price: 35000,
        qty: 1,
        image: "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=200",
        date: "2025-12-10",
        orderId: "ORD002",
        status: "completed"
      }
    ];
    localStorage.setItem('orders', JSON.stringify(orders));
  }
  
  // Sample reviews jika tidak ada
  if (reviews.length === 0) {
    reviews = [
      {
        id: "REV001",
        productId: 1,
        orderId: "ORD001",
        rating: 5,
        comment: "Espresso yang sangat nikmat, aroma kopinya kuat!",
        date: "2025-12-16T10:30:00Z",
        userId: "user1",
        userName: "Guest"
      },
      {
        id: "REV002",
        productId: 2,
        orderId: "ORD001",
        rating: 4,
        comment: "Cappuccino yang creamy, susunya pas tidak terlalu manis.",
        date: "2025-12-16T09:15:00Z",
        userId: "user1",
        userName: "Guest"
      }
    ];
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }
}

// Export fungsi ke global scope
window.addToCart = addToCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.removeItem = removeItem;
window.openReviewModal = openReviewModal;
window.editReview = editReview;
window.closeReviewModal = closeReviewModal;