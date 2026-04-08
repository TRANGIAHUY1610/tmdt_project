-- MySQL all-in-one script for phpMyAdmin
-- One-time import file: schema + sample data

CREATE DATABASE IF NOT EXISTS gymstore
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gymstore;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  address TEXT,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL UNIQUE,
  name VARCHAR(100),
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('active', 'revoked') NOT NULL DEFAULT 'active',
  admin_code VARCHAR(50) UNIQUE,
  granted_by INT,
  granted_note VARCHAR(255),
  granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admins_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_admins_granted_by FOREIGN KEY (granted_by)
    REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id INT NULL,
  description TEXT,
  image_url VARCHAR(500),
  stock_quantity INT NOT NULL DEFAULT 0,
  isbn VARCHAR(20),
  publisher VARCHAR(100),
  published_date DATE,
  pages INT,
  language VARCHAR(50) DEFAULT 'Tieng Viet',
  weight_kg DECIMAL(5,2),
  dimensions VARCHAR(50),
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_bestseller TINYINT(1) NOT NULL DEFAULT 0,
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method ENUM('cod', 'credit_card', 'paypal', 'bank_transfer') NOT NULL DEFAULT 'cod',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  customer_note TEXT,
  admin_note TEXT,
  estimated_delivery DATE,
  delivered_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating INT NOT NULL,
  title VARCHAR(200),
  comment TEXT,
  is_approved TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_reviews_user_product UNIQUE (user_id, product_id)
) ENGINE=InnoDB;

CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_carts_product FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_carts_user_product UNIQUE (user_id, product_id)
) ENGINE=InnoDB;

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_bestseller ON products(is_bestseller);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_carts_user ON carts(user_id);

-- Sample data
-- Default password for all users below: 123456
-- Valid bcrypt hash generated for backend auth
INSERT INTO users (name, email, password, role, address, phone) VALUES
('Admin', 'admin@gymstore.com', '$2a$10$HrlCHm8edkz2weHmlstcT.WhuGUcGahtICX4NWj0tRRq04bXYvtgO', 'customer', 'HCM City', '0900000001'),
('Nguyen Van A', 'customer1@email.com', '$2a$10$HrlCHm8edkz2weHmlstcT.WhuGUcGahtICX4NWj0tRRq04bXYvtgO', 'customer', 'HCM City', '0900000002'),
('Tran Thi B', 'customer2@email.com', '$2a$10$HrlCHm8edkz2weHmlstcT.WhuGUcGahtICX4NWj0tRRq04bXYvtgO', 'customer', 'HCM City', '0900000003');

INSERT INTO admins (user_id, name, email, password, phone, is_active, status, admin_code, granted_note)
VALUES (NULL, 'Admin', 'admin@gymstore.com', '$2a$10$HrlCHm8edkz2weHmlstcT.WhuGUcGahtICX4NWj0tRRq04bXYvtgO', '0900000001', 1, 'active', 'SUPERADMIN-001', 'Tai khoan quan tri mac dinh');

DELETE FROM users WHERE email = 'admin@gymstore.com';

INSERT INTO categories (name, description) VALUES
('Ta dumbbell', 'Ta don, ta tay va ta dieudinh cho tap gym tai nha'),
('May va phu kien tap', 'May chay bo, xe dap tap, day khang luc va phu kien gym'),
('Thuc pham bo sung', 'Whey protein, pre-workout va cac san pham ho tro tap luyen');

INSERT INTO products (title, author, price, original_price, category_id, description, image_url, stock_quantity, is_featured, is_bestseller) VALUES
('Bo ta dumbbell dieu chinh 20kg', 'GymPro', 790000, 950000, 1, 'Bo ta dumbbell dieu chinh phu hop tap toan than tai nha', '/images/gym/dumbbell-20kg.jpg', 50, 1, 1),
('Day khang luc 5 muc do', 'StrongFit', 180000, 240000, 2, 'Bo day khang luc cho bai tap mong, bung va vai', '/images/gym/resistance-band.jpg', 80, 1, 1),
('Whey Protein Isolate 2lbs', 'MuscleFuel', 1250000, 1490000, 3, 'Bo sung dam nhanh ho tro phuc hoi sau tap', '/images/gym/whey-2lbs.jpg', 30, 1, 0),
('Tham tap yoga TPE cao cap', 'FlexiMove', 320000, 420000, 2, 'Tham tap chong truot, do dan hoi cao cho yoga va gym', '/images/gym/yoga-mat.jpg', 45, 0, 1);

INSERT INTO reviews (user_id, product_id, rating, title, comment) VALUES
(2, 1, 5, 'Ta cam chac tay', 'Bo ta chac chan, de thay doi muc ta va tap rat on dinh'),
(3, 2, 5, 'Day khang luc rat tot', 'Dan hoi tot, dung cho nhieu bai tap toan than');

UPDATE products b
LEFT JOIN (
  SELECT product_id, ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS cnt
  FROM reviews
  WHERE is_approved = 1
  GROUP BY product_id
) r ON r.product_id = b.id
SET b.rating_avg = COALESCE(r.avg_rating, 0),
    b.rating_count = COALESCE(r.cnt, 0);

INSERT INTO orders (user_id, order_number, total_amount, status, shipping_address, shipping_fee, payment_method, payment_status, customer_note, admin_note, created_at) VALUES
(2, 'ORD-20260401-0001', 2040000, 'delivered', '12 Nguyen Hue, Quan 1, TP.HCM', 15000, 'cod', 'paid', 'Giao gio hanh chinh', 'Da giao thanh cong', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 'ORD-20260403-0002', 1570000, 'shipped', '45 Le Loi, Quan 1, TP.HCM', 15000, 'bank_transfer', 'paid', 'Dong goi ky tranh va chong va dap', 'Dang van chuyen', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 'ORD-20260405-0003', 805000, 'pending', '12 Nguyen Hue, Quan 1, TP.HCM', 15000, 'cod', 'pending', 'Lien he truoc khi giao', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(1, 1, 1, 790000, 790000),
(1, 3, 1, 1250000, 1250000),
(2, 3, 1, 1250000, 1250000),
(2, 4, 1, 320000, 320000),
(3, 2, 1, 180000, 180000);

INSERT INTO carts (user_id, product_id, quantity) VALUES
(2, 4, 1),
(3, 1, 2)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

