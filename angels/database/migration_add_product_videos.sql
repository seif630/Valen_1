USE angels_ecommerce;
GO

-- Add video_url column to products table
ALTER TABLE products ADD video_url NVARCHAR(500) NULL;
GO

-- Create product_videos table for multiple videos per product
CREATE TABLE product_videos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL,
    video_url NVARCHAR(500) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_product_videos_product_id ON product_videos(product_id);
GO
