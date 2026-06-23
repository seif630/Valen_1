USE angels_ecommerce;
GO

-- Add sale fields to products table if they don't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('products') AND name = 'sale_price')
BEGIN
    ALTER TABLE products ADD sale_price DECIMAL(10,2) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('products') AND name = 'is_on_sale')
BEGIN
    ALTER TABLE products ADD is_on_sale BIT DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('products') AND name = 'sale_percentage')
BEGIN
    ALTER TABLE products ADD sale_percentage DECIMAL(5,2) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('products') AND name = 'sale_start_date')
BEGIN
    ALTER TABLE products ADD sale_start_date DATETIME2 NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('products') AND name = 'sale_end_date')
BEGIN
    ALTER TABLE products ADD sale_end_date DATETIME2 NULL;
END

GO

-- Create product_images table for multiple product photos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'product_images')
BEGIN
    CREATE TABLE product_images (
        id INT IDENTITY(1,1) PRIMARY KEY,
        product_id INT NOT NULL,
        image_url NVARCHAR(500) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
END
GO
