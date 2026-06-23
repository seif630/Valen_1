USE angels_ecommerce;
GO

-- Insert categories
INSERT INTO categories (name, description) VALUES
('T-Shirts', 'Comfortable cotton t-shirts'),
('Jeans', 'Classic denim jeans'),
('Dresses', 'Elegant dresses for all occasions'),
('Jackets', 'Stylish jackets and coats'),
('Shoes', 'Comfortable and fashionable footwear');

-- Insert products
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, sizes) VALUES
('Classic White T-Shirt', 'A timeless white t-shirt made from 100% cotton', 19.99, 1, '/images/white-tshirt.jpg', 50, '["S","M","L","XL"]'),
('Blue Denim Jeans', 'Comfortable blue jeans with a perfect fit', 49.99, 2, '/images/blue-jeans.jpg', 30, '["28","30","32","34","36"]'),
('Summer Dress', 'Light and airy summer dress perfect for warm days', 39.99, 3, '/images/summer-dress.jpg', 20, '["XS","S","M","L"]'),
('Leather Jacket', 'Stylish black leather jacket', 99.99, 4, '/images/leather-jacket.jpg', 15, '["S","M","L","XL"]'),
('Sneakers', 'Comfortable sneakers for everyday wear', 59.99, 5, '/images/sneakers.jpg', 40, '["7","8","9","10","11"]'),
('Graphic Tee', 'Fun graphic t-shirt with unique design', 24.99, 1, '/images/graphic-tee.jpg', 25, '["S","M","L","XL"]'),
('Skinny Jeans', 'Slim fit jeans for a modern look', 54.99, 2, '/images/skinny-jeans.jpg', 35, '["26","28","30","32"]'),
('Evening Gown', 'Elegant evening gown for special occasions', 89.99, 3, '/images/evening-gown.jpg', 10, '["XS","S","M","L","XL"]'),
('Bomber Jacket', 'Trendy bomber jacket with zipper', 69.99, 4, '/images/bomber-jacket.jpg', 20, '["S","M","L","XL"]'),
('Boots', 'Stylish boots for colder weather', 79.99, 5, '/images/boots.jpg', 25, '["7","8","9","10","11"]');

-- Insert a sample user (password is 'password' hashed with bcrypt)
INSERT INTO users (email, password, name, role) VALUES
('admin@angels.com', '$2a$10$example.hash.here', 'Admin User', 'admin'),
('customer@example.com', '$2a$10$example.hash.here', 'John Doe', 'customer');

-- Insert sample orders
INSERT INTO orders (user_id, total_amount, status, shipping_address, customer_name, customer_email, customer_phone, items) VALUES
(2, 59.99, 'pending', 'John Doe
123 Main Street
Cairo, 12345
Egypt', 'John Doe', 'customer@example.com', '01234567890', '[{"id": 5, "name": "Sneakers", "price": 59.99, "quantity": 1, "size": "9", "image_url": "/images/sneakers.jpg"}]'),
(2, 149.98, 'processing', 'John Doe
456 Oak Avenue
Alexandria, 67890
Egypt', 'John Doe', 'customer@example.com', '01123456789', '[{"id": 1, "name": "Classic White T-Shirt", "price": 19.99, "quantity": 1, "size": "M", "image_url": "/images/white-tshirt.jpg"}, {"id": 2, "name": "Blue Denim Jeans", "price": 49.99, "quantity": 2, "size": "32", "image_url": "/images/blue-jeans.jpg"}]'),
(2, 89.99, 'shipped', 'John Doe
789 Pine Road
Giza, 54321
Egypt', 'John Doe', 'customer@example.com', '01012345678', '[{"id": 3, "name": "Summer Dress", "price": 39.99, "quantity": 1, "size": "S", "image_url": "/images/summer-dress.jpg"}, {"id": 6, "name": "Graphic Tee", "price": 24.99, "quantity": 2, "size": "L", "image_url": "/images/graphic-tee.jpg"}]');

-- Insert order items for the sample orders
INSERT INTO order_items (order_id, product_id, quantity, price, size) VALUES
(1, 5, 1, 59.99, '9'),
(2, 1, 1, 19.99, 'M'),
(2, 2, 2, 49.99, '32'),
(3, 3, 1, 39.99, 'S'),
(3, 6, 2, 24.99, 'L');
