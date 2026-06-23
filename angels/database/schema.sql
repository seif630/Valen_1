-- Create database
CREATE DATABASE angels_ecommerce;
GO

USE angels_ecommerce;
GO

-- Users table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    name NVARCHAR(255),
    role NVARCHAR(50) DEFAULT 'customer',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Categories table
CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Products table
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(1000),
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NULL, -- Sale price, NULL if not on sale
    is_on_sale BIT DEFAULT 0, -- 1 if product is on sale, 0 otherwise
    sale_percentage DECIMAL(5,2) NULL, -- Sale percentage discount (e.g., 20.00 for 20%)
    sale_start_date DATETIME2 NULL, -- When the sale starts
    sale_end_date DATETIME2 NULL, -- When the sale ends
    category_id INT,
    image_url NVARCHAR(500),
    video_url NVARCHAR(500) NULL, -- New column for product video URL
    stock_quantity INT DEFAULT 0,
    sizes NVARCHAR(500), -- JSON string for sizes
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Product videos table (for multiple videos per product)
CREATE TABLE product_videos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL,
    video_url NVARCHAR(500) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'pending',
    stripe_payment_id NVARCHAR(255),
    shipping_address NVARCHAR(500),
    customer_name NVARCHAR(255),
    customer_email NVARCHAR(255),
    customer_phone NVARCHAR(50),
    items NVARCHAR(MAX), -- JSON string for order items
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    size NVARCHAR(50),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Cart table (for persistent cart)
CREATE TABLE cart (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT NOT NULL,
    size NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
