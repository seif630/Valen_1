USE angels_ecommerce;
GO

-- Create product_images table for multiple images per product
CREATE TABLE product_images (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL,
    image_url NVARCHAR(500) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
GO
