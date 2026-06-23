import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const pool = await getPool();
    const query = pool.request();
    const resolvedParams = await params;
    query.input('id', sql.Int, parseInt(resolvedParams.id));
    const result = await query.query('SELECT * FROM products WHERE id = @id');

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = result.recordset[0];

    // Fetch additional images
    const imagesQuery = pool.request();
    imagesQuery.input('product_id', sql.Int, product.id);
    const imagesResult = await imagesQuery.query('SELECT image_url FROM product_images WHERE product_id = @product_id ORDER BY id');
    const additional_images = imagesResult.recordset.map(row => row.image_url);

    // Fetch additional videos
    const videosQuery = pool.request();
    videosQuery.input('product_id', sql.Int, product.id);
    const videosResult = await videosQuery.query('SELECT video_url FROM product_videos WHERE product_id = @product_id ORDER BY id');
    const additional_videos = videosResult.recordset.map(row => row.video_url);

    return NextResponse.json({ ...product, additional_images, additional_videos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, price, category_id, image_urls, video_urls, stock_quantity, sizes, is_on_sale, sale_price, sale_percentage, sale_start_date, sale_end_date } = await request.json();
    const pool = await getPool();
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);

    // Update product
    const query = pool.request();
    query.input('id', sql.Int, productId);
    query.input('name', sql.NVarChar, name);
    query.input('description', sql.NVarChar, description);
    query.input('price', sql.Decimal(10, 2), price);
    query.input('category_id', sql.Int, category_id);
    query.input('image_url', sql.NVarChar, image_urls && image_urls.length > 0 && image_urls[0] && image_urls[0].trim() !== '' ? image_urls[0] : null);
    query.input('stock_quantity', sql.Int, stock_quantity);
    query.input('sizes', sql.NVarChar, JSON.stringify(sizes));
    query.input('is_on_sale', sql.Bit, is_on_sale || false);
    query.input('sale_price', sql.Decimal(10, 2), sale_price || null);
    query.input('sale_percentage', sql.Decimal(5, 2), sale_percentage || null);
    query.input('sale_start_date', sql.DateTime2, sale_start_date || null);
    query.input('sale_end_date', sql.DateTime2, sale_end_date || null);

    await query.query(`
      UPDATE products
      SET name = @name, description = @description, price = @price,
          category_id = @category_id, image_url = @image_url,
          stock_quantity = @stock_quantity, sizes = @sizes,
          is_on_sale = @is_on_sale, sale_price = @sale_price,
          sale_percentage = @sale_percentage, sale_start_date = @sale_start_date,
          sale_end_date = @sale_end_date, updated_at = GETDATE()
      WHERE id = @id
    `);

    // Delete existing additional images
    const deleteImagesQuery = pool.request();
    deleteImagesQuery.input('product_id', sql.Int, productId);
    await deleteImagesQuery.query('DELETE FROM product_images WHERE product_id = @product_id');

    // Insert new additional images
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

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getPool();
    const query = pool.request();
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    query.input('id', sql.Int, productId);

    // Check if product exists
    const checkResult = await query.query('SELECT id FROM products WHERE id = @id');
    if (checkResult.recordset.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Set product_id to NULL in order_items to preserve orders
    const updateOrdersQuery = pool.request();
    updateOrdersQuery.input('product_id', sql.Int, productId);
    await updateOrdersQuery.query('UPDATE order_items SET product_id = NULL WHERE product_id = @product_id');

    // Delete related cart items
    const deleteCartQuery = pool.request();
    deleteCartQuery.input('product_id', sql.Int, productId);
    await deleteCartQuery.query('DELETE FROM cart WHERE product_id = @product_id');

    // Delete the product (CASCADE will handle product_images and product_videos)
    await query.query('DELETE FROM products WHERE id = @id');

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}


