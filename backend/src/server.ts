import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorHandler';
import {
  securityHeaders,
  createRateLimiter,
  isAllowedOrigin,
} from './middleware/security';

// Route imports
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import brandRoutes from './routes/brandRoutes';
import cartRoutes from './routes/cartRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import orderRoutes from './routes/orderRoutes';
import sellerRoutes from './routes/sellerRoutes';
import reviewRoutes from './routes/reviewRoutes';
import reelRoutes from './routes/reelRoutes';
import couponRoutes from './routes/couponRoutes';
import bannerRoutes from './routes/bannerRoutes';
import adminRoutes from './routes/adminRoutes';
import mediaRoutes from './routes/mediaRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

const bootstrapDatabase = async () => {
  await connectDB();
  if (process.env.SKIP_AUTO_SEED === 'true') return;
  try {
    const { Product } = await import('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Detected empty product catalog. Auto-running VibeCart seed script...');
      const { seedDatabase } = await import('./seeds/seed');
      await seedDatabase();
    }
  } catch (err) {
    console.error('Auto-seed check notice:', err);
  }
};

// Middleware
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS policy'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global API rate guard (generous for storefront traffic, protects from floods)
app.use(
  '/api',
  createRateLimiter({
    windowMs: 60 * 1000,
    max: 300,
    keyPrefix: 'api-global',
  })
);

// Static uploads serving with browser caching
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'public', 'uploads'), {
    maxAge: '7d',
    etag: true,
  })
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);

// Health check (verifies DB readiness for load balancers & orchestrators)
app.get('/api/health', (_req: Request, res: Response) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'healthy' : 'degraded',
    database: dbConnected ? 'connected' : 'connecting',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    service: 'VibeCart API Server',
    version: '1.0.0',
  });
});

// Central Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  bootstrapDatabase()
    .then(() => {
      const server = app.listen(PORT, () => {
        console.log(`🚀 VibeCart Backend running on http://localhost:${PORT}`);
      });

      const gracefulShutdown = async (signal: string) => {
        console.log(`\n${signal} received. Closing VibeCart server cleanly...`);
        server.close(async () => {
          await mongoose.connection.close().catch(() => undefined);
          process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000).unref();
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    })
    .catch((err) => {
      console.error('Failed to initialize VibeCart backend:', err);
      process.exit(1);
    });
}

export default app;
