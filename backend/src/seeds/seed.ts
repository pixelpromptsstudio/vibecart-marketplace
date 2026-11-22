import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Brand } from '../models/Brand';
import { Seller } from '../models/Seller';
import { Product } from '../models/Product';
import { Banner } from '../models/Banner';
import { Reel } from '../models/Reel';
import { Coupon } from '../models/Coupon';
import { Order } from '../models/Order';
import { Review } from '../models/Review';

dotenv.config();

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    console.log('Seeding VibeCart database with realistic production-ready data...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Brand.deleteMany({}),
      Seller.deleteMany({}),
      Product.deleteMany({}),
      Banner.deleteMany({}),
      Reel.deleteMany({}),
      Coupon.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
    ]);

    console.log('Cleaned existing collections.');

    // 1. Create Users
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const sellerPasswordHash = await bcrypt.hash('Seller@123', 10);
    const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

    const superAdmin = await User.create({
      name: 'Super Administrator',
      email: 'superadmin@vibecart.com',
      phone: '+91 9876543210',
      passwordHash,
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      addresses: [
        {
          fullName: 'Super Admin',
          phone: '+91 9876543210',
          street: '100 Cyber City, Phase 2',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
          isDefault: true,
        },
      ],
    });

    const admin = await User.create({
      name: 'Vibe Admin',
      email: 'admin@vibecart.com',
      phone: '+91 9876543211',
      passwordHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    const manager = await User.create({
      name: 'Operations Manager',
      email: 'manager@vibecart.com',
      phone: '+91 9876543212',
      passwordHash,
      role: 'MANAGER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    });

    const sellerUser = await User.create({
      name: 'Aman Sharma',
      email: 'seller@vibecart.com',
      phone: '+91 9876543213',
      passwordHash: sellerPasswordHash,
      role: 'SELLER',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    });

    const customerUser = await User.create({
      name: 'Dhruv',
      email: 'dhruv@vibecart.com',
      phone: '+91 9876543214',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      addresses: [
        {
          fullName: 'Dhruv Sharma',
          phone: '+91 9876543214',
          street: 'Flat 402, Royal Palms, Arera Colony',
          city: 'Bhopal',
          state: 'Madhya Pradesh',
          postalCode: '462001',
          country: 'India',
          isDefault: true,
        },
      ],
    });

    console.log('Created Users (SuperAdmin, Admin, Manager, Seller, Customer).');

    // 2. Create Seller Profiles
    const seller = await Seller.create({
      userId: sellerUser._id,
      businessName: 'ElectroVibe Retail Ltd.',
      storeName: 'ElectroVibe Official',
      slug: 'electrovibe-official',
      storeLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
      description: 'Authorized retailer for top electronics, gadgets, audio gear, and wearables.',
      businessAddress: 'Plot 45, Tech Zone IV, Noida, UP, 201306',
      phone: '+91 9876543213',
      verificationStatus: 'APPROVED',
      bankDetails: {
        accountNumber: '918282829101',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'ElectroVibe Retail Ltd',
        bankName: 'HDFC Bank',
      },
      rating: 4.8,
      reviewCount: 320,
    });

    // 3. Create Categories (matching design reference exactly!)
    const categoriesData = [
      { name: 'Mobiles', slug: 'mobiles', icon: 'smartphone', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', bgColor: '#EFF6FF', order: 1 },
      { name: 'Electronics', slug: 'electronics', icon: 'headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', bgColor: '#EEF2FF', order: 2 },
      { name: 'Fashion', slug: 'fashion', icon: 'shirt', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300', bgColor: '#EDE9FE', order: 3 },
      { name: 'Home & Living', slug: 'home-living', icon: 'armchair', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300', bgColor: '#ECFDF5', order: 4 },
      { name: 'Beauty', slug: 'beauty', icon: 'sparkles', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300', bgColor: '#FFF1F2', order: 5 },
      { name: 'Sports', slug: 'sports', icon: 'trophy', image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=300', bgColor: '#F0FDF4', order: 6 },
      { name: 'Books', slug: 'books', icon: 'book-open', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300', bgColor: '#F0F9FF', order: 7 },
      { name: 'Grocery', slug: 'grocery', icon: 'shopping-basket', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300', bgColor: '#FEF3C7', order: 8 },
      { name: 'Toys & Kids', slug: 'toys-kids', icon: 'smile', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300', bgColor: '#FFF7ED', order: 9 },
      { name: 'Automotive', slug: 'automotive', icon: 'car', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300', bgColor: '#E0F2FE', order: 10 },
    ];

    const categoryDocs: Record<string, any> = {};
    for (const cat of categoriesData) {
      categoryDocs[cat.slug] = await Category.create(cat);
    }

    console.log('Created 10 Categories.');

    // 4. Create Top Brands (matching design reference!)
    const brandsData = [
      { name: 'Apple', slug: 'apple', logo: 'https://cdn.simpleicons.org/apple/111827', productCount: 42, featured: true },
      { name: 'Samsung', slug: 'samsung', logo: 'https://cdn.simpleicons.org/samsung/1428A0', productCount: 56, featured: true },
      { name: 'Nike', slug: 'nike', logo: 'https://cdn.simpleicons.org/nike/111827', productCount: 88, featured: true },
      { name: 'Adidas', slug: 'adidas', logo: 'https://cdn.simpleicons.org/adidas/111827', productCount: 64, featured: true },
      { name: 'boAt', slug: 'boat', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100', productCount: 35, featured: true },
      {
        name: 'realme',
        slug: 'realme',
        logo: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23FFC915'/%3E%3Ctext x='32' y='41' text-anchor='middle' font-family='Arial,sans-serif' font-size='28' font-weight='900' fill='%23111827'%3ER%3C/text%3E%3C/svg%3E",
        productCount: 29,
        featured: true,
      },
      { name: 'OnePlus', slug: 'oneplus', logo: 'https://cdn.simpleicons.org/oneplus/F5010C', productCount: 22, featured: true },
      { name: 'Sony', slug: 'sony', logo: 'https://cdn.simpleicons.org/sony/111827', productCount: 48, featured: true },
      { name: 'Zebronics', slug: 'zebronics', logo: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100', productCount: 19, featured: true },
    ];

    for (const b of brandsData) {
      await Brand.create(b);
    }

    console.log('Created Top Brands.');

    // 5. Create Realistic Products (matches reference products in screenshot!)
    const productsData = [
      {
        name: 'iPhone 15 (128GB) - Blue',
        slug: 'iphone-15-128gb-blue',
        description: 'Dynamic Island, 48MP main camera with 2x Telephoto, durable color-infused glass and aluminum design, USB-C connectivity.',
        brand: 'Apple',
        category: categoryDocs['mobiles']._id,
        subcategory: 'Smartphones',
        price: 59900,
        originalPrice: 79900,
        discount: 25,
        images: [
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600',
        ],
        variants: [
          { color: 'Blue', size: '128GB', stock: 15, price: 59900 },
          { color: 'Black', size: '256GB', stock: 8, price: 69900 },
        ],
        sku: 'IPH-15-BLU-128',
        stock: 23,
        specifications: [
          { label: 'Display', value: '6.1-inch Super Retina XDR OLED' },
          { label: 'Processor', value: 'A16 Bionic chip' },
          { label: 'Camera', value: '48MP Main + 12MP Ultra Wide' },
          { label: 'Battery', value: 'Up to 20 hours video playback' },
        ],
        sellerId: seller._id,
        rating: 4.6,
        reviewCount: 1240,
        tags: ['apple', 'iphone', '5g', 'smartphone', 'flagship'],
        featured: true,
        trending: true,
        deliveryInfo: 'Free delivery by Tomorrow',
      },
      {
        name: 'boAt Rockerz 550 Over-Ear Wireless Headphones',
        slug: 'boat-rockerz-550-wireless-headphones',
        description: 'Up to 20 hours playback, 50mm dynamic drivers, physical noise isolation, ergonomic plush ear cushions, and instant Bluetooth 5.0.',
        brand: 'boAt',
        category: categoryDocs['electronics']._id,
        subcategory: 'Audio',
        price: 1999,
        originalPrice: 4999,
        discount: 60,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600',
        ],
        variants: [
          { color: 'Matte Black', size: 'Standard', stock: 40, price: 1999 },
          { color: 'Army Green', size: 'Standard', stock: 25, price: 1999 },
        ],
        sku: 'BOAT-RCK-550',
        stock: 65,
        specifications: [
          { label: 'Driver Size', value: '50mm Neodymium' },
          { label: 'Playtime', value: 'Up to 20 Hours' },
          { label: 'Charging', value: 'Type-C Fast Charge' },
          { label: 'Microphone', value: 'Dual mic with ENC' },
        ],
        sellerId: seller._id,
        rating: 4.4,
        reviewCount: 8200,
        tags: ['boat', 'headphones', 'audio', 'wireless', 'bluetooth'],
        featured: true,
        trending: true,
        deliveryInfo: 'Free 2-day delivery',
      },
      {
        name: 'Nike Air Max 270 React Running Shoes',
        slug: 'nike-air-max-270-react-shoes',
        description: 'The Nike Air Max 270 delivers unrivaled, all-day comfort with Nike React foam technology and a large Max Air unit in the heel.',
        brand: 'Nike',
        category: categoryDocs['fashion']._id,
        subcategory: 'Footwear',
        price: 3999,
        originalPrice: 7999,
        discount: 50,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600',
        ],
        variants: [
          { color: 'Pure White', size: 'UK 8', stock: 12, price: 3999 },
          { color: 'Pure White', size: 'UK 9', stock: 10, price: 3999 },
          { color: 'Pure White', size: 'UK 10', stock: 5, price: 3999 },
        ],
        sku: 'NIKE-AM270-WHT',
        stock: 27,
        specifications: [
          { label: 'Sole Material', value: 'Air Max Cushion + React Foam' },
          { label: 'Upper', value: 'Breathable Engineered Mesh' },
          { label: 'Closure', value: 'Lace-Up' },
        ],
        sellerId: seller._id,
        rating: 4.5,
        reviewCount: 5600,
        tags: ['nike', 'shoes', 'running', 'airmax', 'sneakers'],
        featured: true,
        trending: true,
        deliveryInfo: 'Free delivery by Monday',
      },
      {
        name: 'Fastrack Reflex Beat+ Smartwatch',
        slug: 'fastrack-reflex-beat-plus-smartwatch',
        description: '1.69" UltraVU Display, 60+ Sports Modes, Continuous 24/7 Heart Rate & SpO2 Monitor, IP68 Water Resistance, Sleep Tracking.',
        brand: 'Fastrack',
        category: categoryDocs['electronics']._id,
        subcategory: 'Wearables',
        price: 2499,
        originalPrice: 4999,
        discount: 50,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
        ],
        variants: [
          { color: 'Midnight Black', size: 'One Size', stock: 30, price: 2499 },
          { color: 'Slate Grey', size: 'One Size', stock: 15, price: 2499 },
        ],
        sku: 'FT-RFLX-BEAT',
        stock: 45,
        specifications: [
          { label: 'Display', value: '1.69 inch HD Curved Touchscreen' },
          { label: 'Battery Life', value: 'Up to 7 Days' },
          { label: 'Sensors', value: 'SpO2, Heart Rate, Accelerometer' },
          { label: 'Waterproof', value: 'IP68 certified' },
        ],
        sellerId: seller._id,
        rating: 4.3,
        reviewCount: 4100,
        tags: ['fastrack', 'smartwatch', 'fitness', 'wearables'],
        featured: true,
        trending: true,
        deliveryInfo: 'Free next day delivery',
      },
      {
        name: 'Samsung Crystal 4K Vivid Pro 55 Inch Smart TV',
        slug: 'samsung-crystal-4k-55-inch-tv',
        description: 'PurColor, 4K Upscaling, Crystal Processor 4K, Smart Hub, Q-Symphony Audio, HDR10+, Ultra-slim 3-side bezel-less design.',
        brand: 'Samsung',
        category: categoryDocs['electronics']._id,
        subcategory: 'Television',
        price: 24999,
        originalPrice: 39999,
        discount: 37,
        images: [
          'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600',
          'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600',
        ],
        variants: [
          { color: 'Titan Gray', size: '55 Inch', stock: 8, price: 24999 },
          { color: 'Titan Gray', size: '65 Inch', stock: 4, price: 34999 },
        ],
        sku: 'SAM-CRYSTAL-55',
        stock: 12,
        specifications: [
          { label: 'Resolution', value: '4K Ultra HD (3840 x 2160)' },
          { label: 'Refresh Rate', value: '60 Hertz' },
          { label: 'Sound', value: '20 Watts Output | Dolby Digital Plus' },
          { label: 'OS', value: 'Tizen Smart TV' },
        ],
        sellerId: seller._id,
        rating: 4.6,
        reviewCount: 2300,
        tags: ['samsung', 'tv', '4k', 'smart-tv', 'home-theater'],
        featured: true,
        trending: true,
        deliveryInfo: 'Free scheduled delivery & installation',
      },
      {
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        slug: 'sony-wh-1000xm5-wireless-headphones',
        description: 'Industry-leading noise canceling with two processors and eight microphones, extraordinary sound quality with 30mm driver unit, 30hr battery.',
        brand: 'Sony',
        category: categoryDocs['electronics']._id,
        subcategory: 'Audio',
        price: 29990,
        originalPrice: 34990,
        discount: 14,
        images: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
        ],
        variants: [
          { color: 'Silver White', size: 'Over-Ear', stock: 10, price: 29990 },
          { color: 'Black', size: 'Over-Ear', stock: 14, price: 29990 },
        ],
        sku: 'SONY-WH-XM5',
        stock: 24,
        specifications: [
          { label: 'Noise Cancellation', value: 'Auto NC Optimizer with V1 + QN1 chip' },
          { label: 'Battery', value: '30 hours (3 min charge = 3 hours playback)' },
          { label: 'Weight', value: '250g' },
        ],
        sellerId: seller._id,
        rating: 4.8,
        reviewCount: 1840,
        tags: ['sony', 'headphones', 'anc', 'audiophile', 'wireless'],
        featured: true,
        trending: true,
        deliveryInfo: 'Express delivery available',
      },
      {
        name: 'Urban Minimalist Oversized Hoodie',
        slug: 'urban-minimalist-oversized-hoodie',
        description: 'Crafted with 420 GSM heavy fleece cotton, dropped shoulders, relaxed fit, kangaroo pocket, and durable ribbed trims.',
        brand: 'Adidas',
        category: categoryDocs['fashion']._id,
        subcategory: 'Streetwear',
        price: 1499,
        originalPrice: 2999,
        discount: 50,
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
          'https://images.unsplash.com/photo-1578768079052-aa76e520028b?w=600',
        ],
        variants: [
          { color: 'Washed Charcoal', size: 'M', stock: 20, price: 1499 },
          { color: 'Washed Charcoal', size: 'L', stock: 25, price: 1499 },
          { color: 'Desert Sage', size: 'L', stock: 15, price: 1499 },
        ],
        sku: 'URB-OVR-HD-01',
        stock: 60,
        specifications: [
          { label: 'Fabric', value: '100% Organic Heavyweight Cotton (420 GSM)' },
          { label: 'Fit', value: 'Oversized Boxy Silhouette' },
          { label: 'Care', value: 'Machine wash cold' },
        ],
        sellerId: seller._id,
        rating: 4.7,
        reviewCount: 890,
        tags: ['fashion', 'hoodie', 'streetwear', 'cotton', 'oversized'],
        featured: true,
        trending: false,
        deliveryInfo: 'Free 3-day delivery',
      },
      {
        name: 'Scandinavian Ergonomic Accent Lounge Chair',
        slug: 'scandinavian-accent-lounge-chair',
        description: 'Mid-century modern design with plush boucle upholstery, solid ash wood frame, and high-density supportive foam seating.',
        brand: 'HomeStyle',
        category: categoryDocs['home-living']._id,
        subcategory: 'Furniture',
        price: 8499,
        originalPrice: 14999,
        discount: 43,
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600',
        ],
        variants: [
          { color: 'Cream Boucle', size: 'Standard', stock: 6, price: 8499 },
          { color: 'Forest Green', size: 'Standard', stock: 4, price: 8499 },
        ],
        sku: 'SCAN-CHR-001',
        stock: 10,
        specifications: [
          { label: 'Frame', value: 'Kiln-dried solid ash hardwood' },
          { label: 'Upholstery', value: 'Premium textured Boucle' },
          { label: 'Dimensions', value: '31"W x 33"D x 30"H' },
        ],
        sellerId: seller._id,
        rating: 4.9,
        reviewCount: 310,
        tags: ['home', 'furniture', 'chair', 'interior', 'scandinavian'],
        featured: true,
        trending: false,
        deliveryInfo: 'Free doorstep delivery',
      },
    ];

    const createdProducts = [];
    for (const prod of productsData) {
      const created = await Product.create(prod);
      createdProducts.push(created);
    }

    console.log(`Created ${createdProducts.length} Products.`);

    // 6. Create Hero & Deal Banners
    await Banner.create([
      {
        title: 'Upgrade Your Everyday Vibe.',
        subtitle: 'Top brands. Best prices. Hassle-free shopping.',
        badge: 'New Launch',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        ctaText: 'Shop Now',
        ctaLink: '/search',
        position: 'HERO',
        sortOrder: 1,
        bgColor: '#F0FDF4',
        accentColor: '#00E575',
      },
      {
        title: "Today's Top Deals",
        subtitle: 'Limited stock flash offer on flagship devices.',
        badge: 'Flash Sale',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        ctaText: 'Grab Now',
        ctaLink: '/product/fastrack-reflex-beat-plus-smartwatch',
        position: 'DEAL',
        sortOrder: 1,
      },
      {
        title: 'Smartphones',
        subtitle: 'Latest. Fastest. Yours.',
        badge: 'Trending',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        ctaText: 'Shop Now',
        ctaLink: '/category/mobiles',
        position: 'PROMO',
        sortOrder: 1,
      },
      {
        title: 'Fashion Forward',
        subtitle: 'Styles for Every You.',
        badge: 'New Arrivals',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500',
        ctaText: 'Explore',
        ctaLink: '/category/fashion',
        position: 'PROMO',
        sortOrder: 2,
      },
      {
        title: 'Home Essentials',
        subtitle: 'Make Home a Happier Place.',
        badge: 'Best Sellers',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        ctaText: 'Shop Now',
        ctaLink: '/category/home-living',
        position: 'PROMO',
        sortOrder: 3,
      },
      {
        title: 'Gadget Zone',
        subtitle: 'Tech that moves you.',
        badge: 'Hot Gear',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
        ctaText: 'Explore',
        ctaLink: '/category/electronics',
        position: 'PROMO',
        sortOrder: 4,
      },
    ]);

    console.log('Created Hero, Deal, and Promotional Banners.');

    // 7. Create Vibe Reels with Real High Quality Demo Videos!
    await Reel.create([
      {
        title: 'Unboxing the Next-Gen Audio Experience 🎧',
        description: 'Hear every bass detail with boAt Rockerz 550. Available now on VibeCart!',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-listening-to-music-with-headphones-41443-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        product: createdProducts[1]._id,
        seller: seller._id,
        likesCount: 1420,
        viewsCount: 8900,
        sharesCount: 340,
        sortOrder: 1,
      },
      {
        title: 'Run with Cloud Comfort 👟 Nike Air Max 270',
        description: 'Style meets peak performance. Watch the fit check and grab 50% OFF.',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-running-in-the-city-42654-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        product: createdProducts[2]._id,
        seller: seller._id,
        likesCount: 2310,
        viewsCount: 15400,
        sharesCount: 520,
        sortOrder: 2,
      },
      {
        title: 'Sleek Aesthetic Smartwatch ⌚ Fastrack Reflex',
        description: 'Stay connected on the move with full touch screen and heart rate monitor.',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-green-screen-42994-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        product: createdProducts[3]._id,
        seller: seller._id,
        likesCount: 980,
        viewsCount: 6400,
        sharesCount: 180,
        sortOrder: 3,
      },
    ]);

    console.log('Created Vibe Reels.');

    // 8. Create Realistic Coupons
    await Coupon.create([
      {
        code: 'VIBE50',
        description: '50% off on all trending products up to ₹500',
        discountType: 'PERCENTAGE',
        discountAmount: 50,
        minOrderValue: 499,
        maxDiscount: 500,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 10000,
      },
      {
        code: 'WELCOME100',
        description: 'Flat ₹100 instant discount on your first order',
        discountType: 'FIXED',
        discountAmount: 100,
        minOrderValue: 499,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        usageLimit: 5000,
      },
      {
        code: 'SUPERVIBE',
        description: '20% off on orders above ₹1499 up to ₹1000',
        discountType: 'PERCENTAGE',
        discountAmount: 20,
        minOrderValue: 1499,
        maxDiscount: 1000,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 2000,
      },
    ]);

    console.log('Created Coupons.');

    // 9. Create Sample Reviews for products
    await Review.create([
      {
        productId: createdProducts[0]._id,
        userId: customerUser._id,
        rating: 5,
        title: 'Amazing performance & battery life!',
        comment: 'Upgraded from iPhone 11 and the difference is night and day. The camera captures unbelievable detail.',
        verifiedPurchase: true,
      },
      {
        productId: createdProducts[1]._id,
        userId: customerUser._id,
        rating: 5,
        title: 'Best bass for this price point',
        comment: 'Battery lasts for days. Extremely comfortable cushions even during long study sessions.',
        verifiedPurchase: true,
      },
    ]);

    console.log('Created sample verified Reviews.');

    // 10. Create Sample Order for Customer
    await Order.create({
      orderNumber: 'VB-202609-108291',
      customerId: customerUser._id,
      items: [
        {
          product: createdProducts[1]._id,
          seller: seller._id,
          name: createdProducts[1].name,
          image: createdProducts[1].images[0],
          variant: 'Matte Black',
          price: 1999,
          quantity: 1,
          subtotal: 1999,
        },
      ],
      shippingAddress: customerUser.addresses[0],
      paymentInfo: {
        method: 'COD',
        status: 'PENDING',
        transactionId: 'TXN-COD-91028',
      },
      subtotal: 1999,
      shippingFee: 0,
      discount: 100,
      totalAmount: 1899,
      couponCode: 'WELCOME100',
      status: 'CONFIRMED',
      timeline: [
        { status: 'CONFIRMED', timestamp: new Date(Date.now() - 3600000), note: 'Order placed & confirmed.' },
        { status: 'PROCESSING', timestamp: new Date(), note: 'Seller is preparing your package.' },
      ],
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });

    console.log('Database seeding successfully finished! All models ready.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
}
