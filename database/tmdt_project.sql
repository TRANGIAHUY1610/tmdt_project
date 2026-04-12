-- MySQL all-in-one script for phpMyAdmin
-- One-time import file: schema + sample data

CREATE DATABASE IF NOT EXISTS gymstore
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gymstore;

SET NAMES utf8mb4;
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

-- =============================================
-- DU LIEU MAU
-- Mat khau mac dinh cho tat ca user: 123456
-- =============================================

INSERT INTO users (name, email, password, role, address, phone) VALUES
('Nguyen Van A', 'customer1@email.com', '$2a$10$HrlCHm8edkz2weHmlstcT.WhuGUcGahtICX4NWj0tRRq04bXYvtgO', 'customer', '12 Nguyen Hue, Quan 1, TP.HCM', '0901234567'),
('Tran Thi B', 'customer2@email.com', '$2a$10$HrlCHm8edkz2weHmlstcT.WhuGUcGahtICX4NWj0tRRq04bXYvtgO', 'customer', '45 Le Loi, Quan 1, TP.HCM', '0907654321'),
('Le Van C', 'customer3@email.com', '$2a$10$HrlCHm8edkz2weHmlstcT.WhuGUcGahtICX4NWj0tRRq04bXYvtgO', 'customer', '78 Hai Ba Trung, Quan 3, TP.HCM', '0912345678'),
('Pham Thi D', 'customer4@email.com', '$2a$10$HrlCHm8edkz2weHmlstcT.WhuGUcGahtICX4NWj0tRRq04bXYvtgO', 'customer', '99 Dien Bien Phu, Binh Thanh, TP.HCM', '0923456789');

INSERT INTO admins (user_id, name, email, password, phone, is_active, status, admin_code, granted_note)
VALUES (NULL, 'Admin GymStore', 'admin@gymstore.com', '$2a$10$HrlCHm8edkz2weHmlstcT.WhuGUcGahtICX4NWj0tRRq04bXYvtgO', '0900000001', 1, 'active', 'SUPERADMIN-001', 'Tai khoan quan tri mac dinh');

-- =============================================
-- DANH MUC SAN PHAM (6 danh muc)
-- =============================================
INSERT INTO categories (name, description, image_url) VALUES
('Ta va thiet bi nang', 'Ta don, ta doi, ta dieuchinh, xa ta va thiet bi nang ta chuyen dung', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('May tap va phu kien', 'May chay bo, xe dap tap, day khang luc, bao tay va phu kien gym da nang', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400'),
('Thuc pham bo sung', 'Whey protein, BCAA, creatine, pre-workout va cac san pham dinh duong the thao', 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400'),
('Quan ao the thao', 'Ao the thao, quan tap, quan doi, do bo gym cho nam va nu', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400'),
('Giay tap gym', 'Giay tap ta, giay chay bo, giay the thao da nang chuyen dung cho gym', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
('Phuc hoi va massage', 'Con lan foam, sung massage, bang ho tro, dung cu gian co va phuc hoi sau tap', 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=400');

-- =============================================
-- SAN PHAM MAU (24 san pham)
-- =============================================
INSERT INTO products (title, author, price, original_price, category_id, description, image_url, stock_quantity, is_featured, is_bestseller) VALUES
-- DANH MUC 1: THIET BI TAP NANG
('Máy chạy bộ điện đa năng', 'PowerTrack', 15000000, 18000000, 1, 'Máy chạy bộ gia đình cao cấp với màn hình LCD hiển thị nhịp tim, calo, quãng đường. Động cơ 3.0HP siêu êm.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', 10, 1, 1),
('Tạ đơn 20kg gang đúc', 'IronTitan', 1200000, 1500000, 1, 'Bộ tạ đơn 20kg chất liệu gang đúc nguyên khối chống gỉ sét. Tay cầm bọc cao su chống trượt.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', 50, 1, 0),
('Ghế tập tạ đa năng', 'GymMaster', 3500000, 4200000, 1, 'Ghế điều chỉnh góc độ, khung thép dày 2mm chịu tải 300kg. Nệm da xịn dễ vệ sinh.', 'https://images.unsplash.com/photo-1534438097544-e2213d80d249?w=600', 20, 0, 1),
('Khung gánh tạ squat', 'SteelRack', 8900000, 10500000, 1, 'Khung rack đa năng cho squat, bench press. Có các chốt an toàn inox.', 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600', 5, 1, 0),

-- DANH MUC 2: MAY TAP VA PHU KIEN
('Dây ngũ sắc tập gym', 'FlexBand', 250000, 350000, 2, 'Bộ 5 dây đàn hồi ngũ sắc chính hãng, tập toàn thân tại nhà hiệu quả.', 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600', 300, 1, 1),
('Con lăn tập bụng', 'AbsCore', 190000, 280000, 2, 'Con lăn 4 bánh cân bằng tốt, tặng kèm thảm lót gối.', 'https://images.unsplash.com/photo-1550259979-ed79b48d2a30?w=600', 150, 0, 1),
('Bao cát boxing 1m2', 'KnockOut', 850000, 1100000, 2, 'Bao cát nhồi sẵn vải lộn siêu chắc, vỏ bọc da PU chịu lực tốt. Kèm xích treo.', 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600', 30, 1, 0),
('Thảm tập yoga TPE', 'ZenYoga', 220000, 300000, 2, 'Thảm 2 lớp TPE 8mm siêu bám sàn, không mùi hóa chất, an toàn cho da.', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600', 200, 0, 1),

-- DANH MUC 3: THUC PHAM BO SUNG
('Whey Protein Isolate 5lbs', 'OptimumNutri', 1850000, 2100000, 3, '100% Whey Isolate hấp thu nhanh chóng, hỗ trợ phục hồi và phát triển cơ bắp.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600', 80, 1, 1),
('BCAA phục hồi cơ 30 ser', 'Xtend', 650000, 780000, 3, 'BCAA với tỉ lệ 2:1:1 tối ưu, bổ sung điện giải, chống dị hóa cơ.', 'https://images.unsplash.com/photo-1591196724072-4d57c244793b?w=600', 100, 0, 1),
('Pre-workout tăng sức mạnh', 'C4', 720000, 850000, 3, 'Sản phẩm tăng sức mạnh trước tập, giúp bùng nổ năng lượng, tập trung cực độ.', 'https://images.unsplash.com/photo-1579722820308-d74e50cd3e44?w=600', 60, 1, 0),
('Sữa tăng cân Mass Gainer 3kg chocolate', 'BulkUp', 990000, 1200000, 3, 'Mass gainer chuyên biệt cho người khó tăng cân. Hàm lượng calo cao, vị chocolate hảo hạng.', 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600', 30, 0, 0),

-- DANH MUC 4: QUAN AO THE THAO
('Quần Jogger nam – Silver logo', 'GymLab', 290000, 390000, 4, 'Quần Jogger nam thể thao, chất liệu co giãn 4 chiều, thiết kế trẻ trung.', 'https://gymlab.vn/wp-content/uploads/2023/12/Quan-jogger-the-thao-Gymlab-10.png', 100, 1, 1),
('Quần Jogger Túi Hộp Thể Thao Unisex', 'GymLab', 320000, 450000, 4, 'Quần Jogger Túi Hộp phong cách mạnh mẽ, tiện dụng đi tập hoặc dạo phố.', 'https://gymlab.vn/wp-content/uploads/2024/07/Quan-jogger-tui-hop-Gymlab-1.png', 80, 1, 1),
('Quần Ống Rộng Form Unisex ActiveLab', 'GymLab', 250000, 350000, 4, 'Quần ống rộng thoáng mát, form unisex phù hợp cho bài tập chạy bộ hoặc cardio.', 'https://gymlab.vn/wp-content/uploads/2025/03/187.png', 150, 0, 1),
('Quần short tập gym nam 2 lớp', 'GymLab', 180000, 250000, 4, 'Quần short tập gym chất gió 2 lớp thoáng khí cho nam giới.', 'https://gymlab.vn/wp-content/uploads/2023/10/Quan_2_lop_nam_xam_1.png', 200, 1, 0),
('ÁO TANK SÁT NÁCH NAM – ĐEN', 'GymLab', 150000, 200000, 4, 'Áo tank mát, thấm hút mồ hôi, thiết kế thoáng mát thoải mái cho các bài Gym cường độ cao.', 'https://gymlab.vn/wp-content/uploads/2023/03/Ao-tank-sat-nach-nam-1.png', 100, 1, 1),
('ÁO TẬP CÓ TAY NAM – XANH ĐEN', 'GymLab', 180000, 250000, 4, 'Áo tập form tay ngắn thể thao màu xanh đen cực mát và đứng form.', 'https://gymlab.vn/wp-content/uploads/2023/03/ao-tap-ngan-tay-nam-form-fit-2.png', 200, 0, 1),
('ÁO TẬP CÓ TAY NAM – ĐỎ ĐÔ', 'GymLab', 180000, 250000, 4, 'Áo tập tay ngắn màu đỏ đô tôn dáng ngực và tay cho nam giới thể hình.', 'https://gymlab.vn/wp-content/uploads/2023/03/SON01490.jpg', 120, 1, 1),
('Áo Tập Gym Thể Thao – Trắng', 'GymLab', 180000, 250000, 4, 'Áo thể thao cơ bản màu trắng đơn giản phù hợp mọi dáng người.', 'https://gymlab.vn/wp-content/uploads/2023/08/ao-tap-ngan-tay-nam-trang.png', 250, 1, 1),

-- DANH MUC 5: GIAY TAP GYM
('Giày tập tạ chuyên dụng nam', 'LiftShoe', 1190000, 1490000, 5, 'Giày tập tạ chuyên dụng đế trợ phẵng siêu cứng, giúp ổn định tối đa khi nâng tạ. Chất liệu da PU thoáng khí.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 50, 1, 1),
('Giày chạy bộ êm ái', 'RunCloud', 1590000, 1990000, 5, 'Giày chạy bộ công nghệ đế mây siêu nhẹ, bảo vệ khớp gối, thoáng khí.', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600', 80, 0, 1),
('Giày training đa năng nữ', 'LadyFit', 950000, 1200000, 5, 'Giày tập gym nữ màu hồng/trắng nhẹ nhàng, linh hoạt 360 độ.', 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600', 60, 1, 0),
('Găng tay bảo vệ tay chân', 'GripPro', 150000, 200000, 5, 'Găng tay thông minh, bảo vệ chống vết chai tay, thoáng mồ hôi cho nam và nữ.', 'https://images.unsplash.com/photo-1591504770103-7f174033ec58?w=600', 200, 0, 1),

-- DANH MUC 6: PHUC HOI VA MASSAGE
('Súng massage cơ bắp', 'TriggerTech', 1450000, 1850000, 6, 'Súng massage với 30 tốc độ, 6 đầu thay thế. Giải cơ hiệu quả sau các buổi tập tạ.', 'https://images.unsplash.com/photo-1620188467120-5042ed1ce2bc?w=600', 40, 1, 1),
('Ống lăn foam roller', 'RollRelax', 180000, 250000, 6, 'Con lăn eva mật độ cao, giúp giãn cơ giãn mạc chuyên sâu.', 'https://images.unsplash.com/photo-1601481596700-f925fadb13b8?w=600', 120, 0, 1),
('Bóng massage tĩnh', 'DotSpike', 80000, 120000, 6, 'Bóng lăn massage gai, giải phóng điểm kích hoạt cơ, an toàn tuyệt đối.', 'https://images.unsplash.com/photo-1536922246289-88c42f957773?w=600', 300, 1, 0),
('Miếng dán giữ nhiệt/Cơ', 'CoolPatch', 45000, 60000, 6, 'Miếng dán lạnh giúp giảm đau, làm dịu chấn thương nhẹ tức thì.', 'https://images.unsplash.com/photo-1598440494830-ec7d0c986bc5?w=600', 500, 0, 1);

-- =============================================
-- DANH GIA SAN PHAM
-- =============================================
INSERT INTO reviews (user_id, product_id, rating, title, comment) VALUES
(1, 1, 5, 'Ta chat luong cao', 'Bo ta dau ra tot lam, chat lieu gang duc chac chan, khong ri set sau 3 thang su dung. Rat hai long!'),
(2, 1, 4, 'Hang tot, giao nhanh', 'San pham dung nhu mo ta, ta dieuchinh rat tien. Chi tru 1 sao vi hop kha kho mo.'),
(3, 2, 5, 'Day khang luc rat tot', 'Dan hoi tot, dung cho nhieu bai tap toan than. Da mua 2 bo, se mua them!'),
(4, 2, 5, 'Gia tot chat luong on', 'Bo 5 day muc do rat tien cho nguoi moi bat dau. Kem bao dung chat.'),
(1, 13, 5, 'Whey chinh hang, uong ngon', 'Whey tan nhanh, mui vi chocolate rat ngon, khong lo dat bung. Tang co ro rang sau 1 thang.'),
(2, 13, 4, 'Hieu qua sau 4 tuan', 'Uong sau tap thay phuc hoi nhanh hon. Mui vi vanilla kha on, khong qua ngot.'),
(3, 18, 5, 'Ao giu form sau nhieu lan giat', 'Ao Dri-Fit giu form tot, thoat mo hoi nhanh, khong buc bo sau buoi tap dai.'),
(4, 21, 5, 'Giay tap ta tot nhat tu truoc den nay', 'De giay cung va phang giup on dinh khi squat va deadlift. Rat hai long voi san pham nay.'),
(1, 17, 4, 'Pre-workout hieu qua manh', 'Tang nang luong ro ret, dung suc cao trong ca buoi tap. Nen bat dau voi nua lieu truoc.'),
(2, 8, 5, 'Tham yoga ban lam yeu thich', 'Day du, chong truot tot ca hai mat, cuon gon de mang di. Mau sac dep.');

-- Cap nhat rating trung binh
UPDATE products b
LEFT JOIN (
  SELECT product_id, ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS cnt
  FROM reviews
  WHERE is_approved = 1
  GROUP BY product_id
) r ON r.product_id = b.id
SET b.rating_avg = COALESCE(r.avg_rating, 0),
    b.rating_count = COALESCE(r.cnt, 0);

-- =============================================
-- DON HANG MAU
-- =============================================
INSERT INTO orders (user_id, order_number, total_amount, status, shipping_address, shipping_fee, payment_method, payment_status, customer_note, admin_note, created_at) VALUES
(1, 'ORD-20260401-0001', 2040000, 'delivered', '12 Nguyen Hue, Quan 1, TP.HCM', 30000, 'cod', 'paid', 'Giao gio hanh chinh', 'Da giao thanh cong', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'ORD-20260403-0002', 1570000, 'shipped', '45 Le Loi, Quan 1, TP.HCM', 30000, 'bank_transfer', 'paid', 'Dong goi ky tranh va cham', 'Dang van chuyen', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'ORD-20260405-0003', 370000, 'pending', '12 Nguyen Hue, Quan 1, TP.HCM', 30000, 'cod', 'pending', 'Lien he truoc khi giao', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'ORD-20260406-0004', 1500000, 'confirmed', '78 Hai Ba Trung, Quan 3, TP.HCM', 30000, 'bank_transfer', 'paid', NULL, 'Da xac nhan don hang', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'ORD-20260407-0005', 2700000, 'pending', '99 Dien Bien Phu, Binh Thanh, TP.HCM', 0, 'cod', 'pending', NULL, NULL, DATE_SUB(NOW(), INTERVAL 12 HOUR));

INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
(1, 1, 1, 790000, 790000),
(1, 13, 1, 1250000, 1250000),
(2, 13, 1, 1250000, 1250000),
(2, 8, 1, 320000, 320000),
(3, 7, 1, 180000, 180000),
(3, 10, 2, 95000, 190000),
(4, 22, 1, 1190000, 1190000),
(4, 8, 1, 320000, 320000),
(5, 3, 1, 1850000, 1850000),
(5, 18, 3, 280000, 840000);

-- Gio hang mau
INSERT INTO carts (user_id, product_id, quantity) VALUES
(1, 8, 1),
(1, 24, 1),
(2, 1, 2),
(3, 15, 1),
(4, 18, 2)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);
