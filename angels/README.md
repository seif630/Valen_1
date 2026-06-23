# Angel's E-commerce Website

A professional, responsive e-commerce website for Angel's clothing brand built with Next.js, TypeScript, and SQL Server.

## Features

- 🛍️ Product catalog with categories and filters
- 🛒 Shopping cart functionality
- 💳 Stripe payment integration (placeholder)
- 👤 User authentication (NextAuth.js setup)
- 📱 Mobile-first responsive design
- 🎨 Modern UI with Tailwind CSS
- 📊 Admin dashboard for product management
- 🔍 Search and filtering capabilities
- 📏 Size charts and product options

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQL Server
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+
- SQL Server Management Studio 20
- Stripe account (for payments)
- Git

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd angels
npm install
```

### 2. Database Setup

1. Open SQL Server Management Studio
2. Create a new database named `angels_ecommerce`
3. Run the SQL scripts in the `database/` folder:
   - `schema.sql` - Creates all tables
   - `sample_data.sql` - Inserts sample products and data

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DB_SERVER=localhost
DB_USER=your_sql_server_username
DB_PASSWORD=your_sql_server_password
DB_DATABASE=angels_ecommerce

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# JWT
JWT_SECRET=your_jwt_secret
```

### 4. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Add webhook endpoints for payment processing
4. Update the webhook secret in your environment variables

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
angels/
├── database/
│   ├── schema.sql
│   └── sample_data.sql
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── about/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── contact/
│   │   ├── product/
│   │   ├── shop/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── lib/
│       └── db.ts
├── .env.local
├── package.json
└── README.md
```

## API Routes

- `GET /api/products` - Fetch all products
- `POST /api/products` - Create a new product
- `GET /api/products/[id]` - Fetch single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database for Production

For production, consider using:
- Azure SQL Database
- AWS RDS for SQL Server
- Google Cloud SQL

Update your database connection string accordingly.

## Adding Product Photos

### Method 1: Upload via Admin Panel
1. Go to `/admin` in your browser
2. Select a product image (JPG, PNG, WebP)
3. Click "Upload Image"
4. Copy the generated URL
5. Use this URL when adding products to the database

### Method 2: Manual Upload
1. Add image files directly to `public/images/` folder
2. Name them descriptively (e.g., `white-tshirt.jpg`)
3. Reference them in database as `/images/filename.jpg`

### Method 3: Cloud Storage (Recommended for Production)
- Use services like Cloudinary, AWS S3, or Vercel Blob
- Upload images to cloud storage
- Store the cloud URLs in the database

## Features to Implement

- [x] Basic image upload functionality
- [ ] User authentication with NextAuth.js
- [ ] Admin dashboard for product management
- [ ] Order history and tracking
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Email notifications
- [ ] Inventory management
- [ ] Multiple payment methods

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email hello@angels.com or create an issue in the repository.
