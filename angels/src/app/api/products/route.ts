import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const pool = await getPool();
    // Select all products
    const productsResult = await pool.request().query(`SELECT * FROM products ORDER BY id`);

    // Fetch additional images for each product
    const productsWithImages = await Promise.all(productsResult.recordset.map(async (product) => {
      const imagesQuery = pool.request();
      imagesQuery.input('product_id', sql.Int, product.id);
      const imagesResult = await imagesQuery.query('SELECT image_url FROM product_images WHERE product_id = @product_id ORDER BY id');
      const additional_images = imagesResult.recordset.map(row => row.image_url);

      return { ...product, images: additional_images };
    }));

    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('GET products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, price, category_id, image_urls, video_urls, stock_quantity, sizes, is_on_sale, sale_price, sale_percentage, sale_start_date, sale_end_date } = await request.json();
    const pool = await getPool();

    // Insert product
    const productQuery = pool.request();
    productQuery.input('name', sql.NVarChar, name);
    productQuery.input('description', sql.NVarChar, description);
    productQuery.input('price', sql.Decimal(10, 2), price);
    productQuery.input('category_id', sql.Int, category_id);
    productQuery.input('image_url', sql.NVarChar, image_urls && image_urls.length > 0 && image_urls[0] && image_urls[0].trim() !== '' ? image_urls[0] : null); // Keep first image as main image_url for backward compatibility
    productQuery.input('video_url', sql.NVarChar, video_urls && video_urls.length > 0 ? video_urls[0] : null); // First video as main video_url
    productQuery.input('stock_quantity', sql.Int, stock_quantity);
    productQuery.input('sizes', sql.NVarChar, JSON.stringify(sizes));
    productQuery.input('is_on_sale', sql.Bit, is_on_sale || false);
    productQuery.input('sale_price', sql.Decimal(10, 2), sale_price || null);
    productQuery.input('sale_percentage', sql.Decimal(5, 2), sale_percentage || null);
    productQuery.input('sale_start_date', sql.DateTime2, sale_start_date || null);
    productQuery.input('sale_end_date', sql.DateTime2, sale_end_date || null);

    const productResult = await productQuery.query(`
      INSERT INTO products (name, description, price, category_id, image_url, video_url, stock_quantity, sizes, is_on_sale, sale_price, sale_percentage, sale_start_date, sale_end_date)
      OUTPUT INSERTED.id
      VALUES (@name, @description, @price, @category_id, @image_url, @video_url, @stock_quantity, @sizes, @is_on_sale, @sale_price, @sale_percentage, @sale_start_date, @sale_end_date)
    `);

    const productId = productResult.recordset[0].id;

    // Insert additional images
    if (image_urls && image_urls.length > 1) {
      for (let i = 1; i < image_urls.length; i++) {
        const imageQuery = pool.request();
        imageQuery.input('product_id', sql.Int, productId);
        imageQuery.input('image_url', sql.NVarChar, image_urls[i]);
        await imageQuery.query(`
          INSERT INTO product_images (product_id, image_url)
          VALUES (@product_id, @image_url)
        `);
      }
    }

    // Insert additional videos
    if (video_urls && video_urls.length > 1) {
      for (let i = 1; i < video_urls.length; i++) {
        const videoQuery = pool.request();
        videoQuery.input('product_id', sql.Int, productId);
        videoQuery.input('video_url', sql.NVarChar, video_urls[i]);
        await videoQuery.query(`
          INSERT INTO product_videos (product_id, video_url)
          VALUES (@product_id, @video_url)
        `);
      }
    }

    return NextResponse.json({ message: 'Product created', id: productId }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const { name, description, price, category_id, image_urls, video_urls, stock_quantity, sizes, is_on_sale, sale_price, sale_percentage, sale_start_date, sale_end_date } = await request.json();
    const pool = await getPool();

    // Update product
    const productQuery = pool.request();
    productQuery.input('id', sql.Int, id);
    productQuery.input('name', sql.NVarChar, name);
    productQuery.input('description', sql.NVarChar, description);
    productQuery.input('price', sql.Decimal(10, 2), price);
    productQuery.input('category_id', sql.Int, category_id);
    productQuery.input('image_url', sql.NVarChar, image_urls && image_urls.length > 0 && image_urls[0] && image_urls[0].trim() !== '' ? image_urls[0] : null);
    productQuery.input('video_url', sql.NVarChar, video_urls && video_urls.length > 0 ? video_urls[0] : null);
    productQuery.input('stock_quantity', sql.Int, stock_quantity);
    productQuery.input('sizes', sql.NVarChar, JSON.stringify(sizes));
    productQuery.input('is_on_sale', sql.Bit, is_on_sale || false);
    productQuery.input('sale_price', sql.Decimal(10, 2), sale_price || null);
    productQuery.input('sale_percentage', sql.Decimal(5, 2), sale_percentage || null);
    productQuery.input('sale_start_date', sql.DateTime2, sale_start_date || null);
    productQuery.input('sale_end_date', sql.DateTime2, sale_end_date || null);

    await productQuery.query(`
      UPDATE products
      SET name = @name, description = @description, price = @price, category_id = @category_id,
          image_url = @image_url, video_url = @video_url, stock_quantity = @stock_quantity,
          sizes = @sizes, is_on_sale = @is_on_sale, sale_price = @sale_price,
          sale_percentage = @sale_percentage, sale_start_date = @sale_start_date, sale_end_date = @sale_end_date
      WHERE id = @id
    `);

    // Delete existing additional images and insert new ones
    await pool.request().input('product_id', sql.Int, id).query('DELETE FROM product_images WHERE product_id = @product_id');
    if (image_urls && image_urls.length > 1) {
      for (let i = 1; i < image_urls.length; i++) {
        const imageQuery = pool.request();
        imageQuery.input('product_id', sql.Int, id);
        imageQuery.input('image_url', sql.NVarChar, image_urls[i]);
        await imageQuery.query(`
          INSERT INTO product_images (product_id, image_url)
          VALUES (@product_id, @image_url)
        `);
      }
    }

    // Delete existing additional videos and insert new ones
    await pool.request().input('product_id', sql.Int, id).query('DELETE FROM product_videos WHERE product_id = @product_id');
    if (video_urls && video_urls.length > 1) {
      for (let i = 1; i < video_urls.length; i++) {
        const videoQuery = pool.request();
        videoQuery.input('product_id', sql.Int, id);
        videoQuery.input('video_url', sql.NVarChar, video_urls[i]);
        await videoQuery.query(`
          INSERT INTO product_videos (product_id, video_url)
          VALUES (@product_id, @video_url)
        `);
      }
    }

    return NextResponse.json({ message: 'Product updated' });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
