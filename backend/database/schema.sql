-- ============================================================
-- FanFinity Database Schema
-- Run this file once after creating the 'fanfinity' database:
--   psql -U postgres -d fanfinity -f schema.sql
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(256) NOT NULL,
    phone       VARCHAR(20)  DEFAULT '',
    address     TEXT         DEFAULT '',
    role        VARCHAR(20)  DEFAULT 'user',
    joined_on   DATE         DEFAULT CURRENT_DATE
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(300) NOT NULL,
    description  TEXT         DEFAULT '',
    price        INTEGER      NOT NULL,
    old_price    INTEGER      DEFAULT 0,
    rating       NUMERIC(3,1) DEFAULT 0,
    rating_count INTEGER      DEFAULT 0,
    image        VARCHAR(300) DEFAULT '',
    category     VARCHAR(50)  NOT NULL,
    stock        INTEGER      DEFAULT 0,
    is_new       BOOLEAN      DEFAULT FALSE,
    is_popular   BOOLEAN      DEFAULT FALSE,
    is_recommended BOOLEAN    DEFAULT FALSE
);

-- Cart
CREATE TABLE IF NOT EXISTS cart (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity    INTEGER DEFAULT 1,
    UNIQUE(user_id, product_id)
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id          SERIAL PRIMARY KEY,
    order_code  VARCHAR(20) UNIQUE NOT NULL,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total       INTEGER NOT NULL,
    status      VARCHAR(50) DEFAULT 'Pending',
    placed_on   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
    name        VARCHAR(300),
    image       VARCHAR(300),
    price       INTEGER,
    quantity    INTEGER
);
