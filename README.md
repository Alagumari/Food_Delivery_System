# 🍔 FoodRush - Complete Online Food Delivery System

A production-ready, industry-level food delivery platform built with React + Django REST Framework.

## 🏗️ System Architecture

```
FoodRush Platform
├── Frontend (React + Vite + Tailwind)
│   ├── Customer Portal
│   ├── Restaurant Dashboard
│   ├── Delivery Partner App
│   └── Admin Panel
└── Backend (Django REST Framework)
    ├── Authentication (JWT)
    ├── Restaurant Management
    ├── Menu & Orders API
    ├── Real-time Tracking
    └── Payment Integration
```

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Customer** | Browse restaurants, place orders, track delivery, review |
| **Restaurant Owner** | Manage menu, accept/reject orders, view analytics |
| **Delivery Partner** | Accept deliveries, update status, earnings dashboard |
| **Admin** | Full platform control, analytics, user management |

## 🚀 Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router DOM v6
- Axios (HTTP client)
- Redux Toolkit (state management)
- Framer Motion (animations)
- React Icons

### Backend
- Python 3.11+
- Django 4.2+
- Django REST Framework
- Simple JWT
- Django CORS Headers
- SQLite (dev) / PostgreSQL (production)

---

## ⚡ Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py create_sample_data  # Populate demo data
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@foodrush.com | admin123 |
| Customer | customer@test.com | test123 |
| Restaurant | owner@pizza.com | test123 |
| Delivery | driver@test.com | test123 |

---

## 📁 Project Structure

```
foodrush/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── foodrush/          # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── apps/
│       ├── accounts/      # User auth & profiles
│       ├── restaurants/   # Restaurant management
│       ├── menu/          # Menu items & categories
│       ├── orders/        # Order lifecycle
│       ├── delivery/      # Delivery partner management
│       └── reviews/       # Ratings & reviews
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Route pages
    │   ├── store/         # Redux store
    │   ├── hooks/         # Custom hooks
    │   ├── services/      # API services
    │   └── utils/         # Helper functions
    └── public/
```

---

## 🔐 API Endpoints

### Authentication
```
POST /api/auth/register/          - Register new user
POST /api/auth/login/             - Login (returns JWT tokens)
POST /api/auth/token/refresh/     - Refresh JWT token
GET  /api/auth/profile/           - Get user profile
PUT  /api/auth/profile/update/    - Update profile
```

### Restaurants
```
GET  /api/restaurants/            - List all restaurants
GET  /api/restaurants/{id}/       - Restaurant detail
POST /api/restaurants/create/     - Create restaurant (owner)
PUT  /api/restaurants/{id}/update/- Update restaurant
GET  /api/restaurants/my/         - Owner's restaurant
```

### Menu
```
GET  /api/menu/{restaurant_id}/   - Get menu items
POST /api/menu/items/create/      - Add menu item
PUT  /api/menu/items/{id}/update/ - Update item
DEL  /api/menu/items/{id}/delete/ - Delete item
```

### Orders
```
POST /api/orders/create/          - Place new order
GET  /api/orders/my/              - Customer's orders
GET  /api/orders/{id}/            - Order detail
PUT  /api/orders/{id}/status/     - Update order status
GET  /api/orders/restaurant/      - Restaurant orders
GET  /api/orders/delivery/        - Delivery partner orders
```

### Reviews
```
POST /api/reviews/create/         - Submit review
GET  /api/reviews/{restaurant_id}/- Restaurant reviews
```

---

## 🎨 Features

### Customer Features
- 🔍 Search & filter restaurants by cuisine, rating, price
- 🛒 Cart management with real-time total calculation
- 📍 Address management with map integration
- 📱 Real-time order tracking
- ⭐ Rate and review restaurants
- 📜 Order history and reorder

### Restaurant Owner Features  
- 📊 Analytics dashboard (revenue, orders, ratings)
- 🍕 Menu management (add/edit/delete items)
- ✅ Accept/reject incoming orders
- 🔔 Real-time order notifications
- 📅 Business hours management
- 🖼️ Photo uploads for menu items

### Delivery Partner Features
- 📦 View available deliveries
- 🗺️ Navigation integration
- 💰 Earnings dashboard
- 📈 Performance metrics

### Admin Features
- 👥 Complete user management
- 🏪 Restaurant approval system
- 📊 Platform-wide analytics
- 💳 Payment management
- 🔧 System configuration

---

## 🔒 Security Features

- JWT Authentication with refresh tokens
- Password hashing (bcrypt)
- CORS protection
- Rate limiting
- Input validation & sanitization
- SQL injection prevention (Django ORM)
- XSS protection

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Touch-friendly interactions
- Progressive Web App (PWA) ready
