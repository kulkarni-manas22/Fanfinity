-- ============================================================
-- FanFinity  |  Final Merged Database Schema
-- Created by merging our schema.sql + friend's database schema
-- Best of both combined for this project
--
-- Run this file once after creating the 'fanfinity' database:
--   psql -U postgres -d fanfinity -f fanfinity_final_schema.sql
--
-- TABLE ORDER (must follow this order due to FK references):
--   1. categories
--   2. users
--   3. products
--   4. cart
--   5. wishlist
--   6. orders
--   7. order_items
--   8. payments
--   9. order_tracking
-- ============================================================


-- ============================================================
-- TABLE 1: categories
-- ============================================================
-- Only in friend's schema (we didn't have this at all)
-- Why needed  : Instead of storing category as plain text in
--               products, we now have a proper categories table.
--               parent_category_id supports sub-categories:
--               Music → Kpop, Music → Pop
-- Pages using : All category pages, Admin dashboard
-- Created FIRST because products table references it
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    category_id         SERIAL PRIMARY KEY,
    category_name       VARCHAR(100) NOT NULL,
    parent_category_id  INTEGER REFERENCES categories(category_id) ON DELETE SET NULL
);

-- Pre-fill all categories matching FanFinity's structure
INSERT INTO categories (category_name, parent_category_id) VALUES
    ('Anime',            NULL),
    ('Games',            NULL),
    ('Music',            NULL),
    ('Movies',           NULL),
    ('Series',           NULL),
    ('Kpop',             3),
    ('Pop',              3),
    ('Movies & Series',  NULL)
ON CONFLICT DO NOTHING;


-- ============================================================
-- TABLE 2: users
-- ============================================================
-- From friend's schema : username, phone_no, city, state,
--                        country, pincode (separate fields)
-- From our schema      : role (user/admin), joined_on
-- Why merged           : profile.html edit form has separate
--                        inputs for address, city, state,
--                        country, pincode.
--                        Admin panel needs role field.
--                        Username is shown on profile page.
-- Pages using          : profile.html, login/signup modal,
--                        Admin/user-info.html
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    user_id     SERIAL PRIMARY KEY,
    username    VARCHAR(50)   UNIQUE NOT NULL,
    email       VARCHAR(100)  UNIQUE NOT NULL,
    password    VARCHAR(255)  NOT NULL,
    phone_no    VARCHAR(15)   DEFAULT '',
    address     TEXT          DEFAULT '',
    city        VARCHAR(50)   DEFAULT '',
    state       VARCHAR(50)   DEFAULT '',
    country     VARCHAR(50)   DEFAULT 'India',
    pincode     VARCHAR(10)   DEFAULT '',
    role        VARCHAR(20)   DEFAULT 'user',
    joined_on   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 3: products
-- ============================================================
-- From friend's schema : category_id (proper FK to categories),
--                        key_words, specifications, ideal_for,
--                        mrp, discount, reviews, image_link,
--                        created_at, price as NUMERIC(10,2)
-- From our schema      : is_new, is_popular, is_recommended
--                        (controls the 3 home page sections)
-- Added by us          : show_on_home — controls whether a
--                        product appears in the "Explore More"
--                        pinterest masonry grid on home.html
-- Why merged           : Product modal needs name, price, mrp,
--                        discount, specs, description, ideal_for,
--                        rating. The 4 booleans control:
--                        - is_new          → Newly Released section
--                        - is_popular      → Popular section
--                        - is_recommended  → Recommendations section
--                        - show_on_home    → Explore More grid
-- Pages using          : home.html (all 4 sections), all category
--                        pages, product modal, Admin/product-info.html
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    product_id      SERIAL PRIMARY KEY,
    product_name    VARCHAR(255)   NOT NULL,
    category_id     INTEGER        NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    key_words       TEXT           DEFAULT '',
    description     TEXT           DEFAULT '',
    specifications  TEXT           DEFAULT '',
    ideal_for       TEXT           DEFAULT '',
    price           NUMERIC(10,2)  NOT NULL,
    mrp             NUMERIC(10,2)  DEFAULT 0,
    discount        INTEGER        DEFAULT 0,
    rating          NUMERIC(2,1)   DEFAULT 0,
    reviews         INTEGER        DEFAULT 0,
    image_link      TEXT           DEFAULT '',
    stock           INTEGER        DEFAULT 0,
    is_new          BOOLEAN        DEFAULT FALSE,
    is_popular      BOOLEAN        DEFAULT FALSE,
    is_recommended  BOOLEAN        DEFAULT FALSE,
    show_on_home    BOOLEAN        DEFAULT FALSE,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 4: cart
-- ============================================================
-- From friend's schema : added_at timestamp
-- From our schema      : UNIQUE(user_id, product_id) so same
--                        product can't be added twice —
--                        quantity just gets updated instead
-- Pages using          : cart.html (shows products, qty +/-,
--                        delete button), profile.html (cart
--                        preview card)
-- ============================================================

CREATE TABLE IF NOT EXISTS cart (
    cart_id     SERIAL PRIMARY KEY,
    user_id     INTEGER        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_id  INTEGER        NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    quantity    INTEGER        NOT NULL DEFAULT 1,
    added_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);


-- ============================================================
-- TABLE 5: wishlist
-- ============================================================
-- From friend's schema : created_at timestamp
-- From our schema      : UNIQUE(user_id, product_id) so same
--                        product can't be wishlisted twice
-- Pages using          : wishlist.html (hearted products list),
--                        profile.html (wishlist preview card),
--                        product modal (heart toggle button)
-- ============================================================

CREATE TABLE IF NOT EXISTS wishlist (
    wishlist_id  SERIAL PRIMARY KEY,
    user_id      INTEGER    NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_id   INTEGER    NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    created_at   TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);


-- ============================================================
-- TABLE 6: orders
-- ============================================================
-- From friend's schema : total_amount as NUMERIC(10,2),
--                        order_status, payment_method,
--                        created_at
-- From our schema      : order_code (readable ID like FF1001)
-- Added by us          : gst_amount — cart.html shows GST (18%)
--                        as a separate line item so it must
--                        be stored separately in the DB
-- Pages using          : order.html ("Yet to be Delivered" and
--                        "Previously Delivered" sections driven
--                        by order_status), profile.html (orders
--                        preview card), Admin/user-info.html
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
    order_id        SERIAL PRIMARY KEY,
    order_code      VARCHAR(20)    UNIQUE NOT NULL,
    user_id         INTEGER        REFERENCES users(user_id) ON DELETE SET NULL,
    total_amount    NUMERIC(10,2)  NOT NULL,
    gst_amount      NUMERIC(10,2)  DEFAULT 0,
    order_status    VARCHAR(50)    DEFAULT 'Pending',
    payment_method  VARCHAR(20)    DEFAULT '',
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 7: order_items
-- ============================================================
-- From friend's schema : order_item_id, order_id, product_id,
--                        quantity, price
-- From our schema      : product_name, image_link
--                        (snapshot at time of purchase — so
--                        order history is preserved even if
--                        a product is deleted from DB later)
-- Pages using          : order.html (product name + image in
--                        order cards), profile.html (orders
--                        preview), Admin/user-info.html
--                        (Product purchased column)
-- ============================================================

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id  SERIAL PRIMARY KEY,
    order_id       INTEGER        NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id     INTEGER        REFERENCES products(product_id) ON DELETE SET NULL,
    product_name   VARCHAR(255)   NOT NULL,
    image_link     TEXT           DEFAULT '',
    price          NUMERIC(10,2)  NOT NULL,
    quantity       INTEGER        NOT NULL
);


-- ============================================================
-- TABLE 8: payments
-- ============================================================
-- Only in friend's schema (we didn't have this at all)
-- Why needed   : cart.html has UPI (GPay, Razorpay, Paytm)
--                and Cash on Delivery options. This table
--                records every payment attempt with status
--                (PENDING / SUCCESS / FAILED) and
--                transaction_ref (the UPI reference number
--                the user gets after paying).
-- Pages using  : cart.html (payment method selection and
--                confirmation), order.html (payment status)
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
    payment_id      SERIAL PRIMARY KEY,
    order_id        INTEGER        NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    user_id         INTEGER        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    payment_method  VARCHAR(20)    NOT NULL,
    payment_status  VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    amount          NUMERIC(10,2)  NOT NULL,
    transaction_ref VARCHAR(100)   DEFAULT '',
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABLE 9: order_tracking
-- ============================================================
-- Only in friend's schema (we didn't have this at all)
-- Why needed   : order.html shows "Yet to be Delivered" and
--                "Previously Delivered". This table records
--                every status step of an order as a new row
--                so the full journey is preserved:
--                Placed → Packed → Shipped →
--                Out for Delivery → Delivered
--                Each step has a status_message for detail
--                e.g. "Your order is arriving by Mar 12"
-- Pages using  : order.html (order status tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS order_tracking (
    tracking_id     SERIAL PRIMARY KEY,
    order_id        INTEGER     NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    status          VARCHAR(50) NOT NULL,
    status_message  TEXT        DEFAULT '',
    updated_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);
