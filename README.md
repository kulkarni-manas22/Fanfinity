# FanFinity

FanFinity is a full-stack e-commerce web application designed for buying and selling fan merchandise. The platform provides a seamless shopping experience for users while offering powerful management tools for administrators.

---

## Features

### User Features

- User Registration and Login
- Secure Authentication
- Product Browsing and Search
- Product Categories
- Product Details Page
- Shopping Cart
- Wishlist Management
- User Profile Management
- Order Placement
- Order History
- Responsive User Interface

### Admin Features

- Admin Dashboard
- Product Management (Add, Edit, Delete)
- Dynamic Product Image Uploads
- Order Management
- User Management
- Inventory Management
- Sales Monitoring

---

## Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Python
- Flask

### Database

- PostgreSQL

### Additional Tools

- pgAdmin
- Git
- GitHub

---

## Project Structure

```text

FanFinity/
│
├── ├── category/
│   ├── css/
│   ├── src/
│   ├── images/
|   |   ├── icons/
|   |   ├── Logos/
│   │   └── products/
│   │       └── admin_uploads/
│   ├── backend/
|   |    ├── database/
|   |    │
|   |    ├── app.py
|   |    ├── requirements.txt
|   |    ├── README.md
|   |    └── .gitignore
|   ├── Admin/
|
├── cart.html
├── home.html
├── fanfinity-info.html
├── loading.html
├── order.html
├── profile.html
├── wishlist.html
├── README.md

```

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/kulkarni-manas22/FanFinity.git
cd FanFinity
```

### 2. Create Virtual Environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Database

Create a PostgreSQL database and update the database configuration inside the application.

Example:

```python
DB_HOST = "localhost"
DB_NAME = "fanfinity"
DB_USER = "postgres"
DB_PASSWORD = "your_password"
```

### 5. Import Database

Restore the provided database backup into PostgreSQL.

Example:

```bash
psql -U postgres -d fanfinity -f fanfinity.sql
```

### 6. Run Application

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

---

## Product Image Uploads

The folder:

```text
static/images/products/admin_uploads/
```

is used for dynamically uploaded product images by administrators.

A `.gitkeep` file is included so the folder structure remains available even when no uploaded images exist.

---

## Security Features

The project implements security measures including:

- Password Hashing
- Session Management
- Input Validation
- Protection Against SQL Injection
- Secure Authentication Flow
- Access Control for Admin Routes

---

## Testing

The application has been tested for:

- User Authentication
- Product Management
- Cart Functionality
- Order Processing
- Database Operations
- Admin Operations

---

## Future Enhancements

- Payment Gateway Integration
- Email Notifications
- Product Reviews and Ratings
- Advanced Search and Filtering
- Coupon and Discount System
- Recommendation Engine
- Analytics Dashboard

---

## Software Development Model

The project follows an Iterative Development Approach, allowing continuous improvements and feature additions during development.

---

## Authors

Developed as a B.Sc. Computer Science Final Year Project.

---

## License

This project is intended for educational and academic purposes.