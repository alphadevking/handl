// api/index.ts
import { VercelApiHandler as Handler } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import session from 'express-session'; // Import express-session
import passport from 'passport'; // Import passport
import MongoDBStore from 'connect-mongodb-session'; // Import MongoDB session store

let cachedServer: any = null;

async function bootstrapServer() {
  if (!cachedServer) {
    // Disable bodyParser so Nest can handle it natively
    const app = await NestFactory.create(AppModule, { bodyParser: false });

    // Enable helmet for security headers
    app.use(helmet());
    const configService = app.get(ConfigService); // Get ConfigService instance

    // Configure MongoDB session store
    const MongoDBSessionStore = MongoDBStore(session);
    const mongoUri = configService.get<string>('MONGODB_URI');
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const store = new MongoDBSessionStore({
      uri: mongoUri,
      collection: 'express_sessions', // Use a different collection name to avoid conflicts
      expires: 3600000, // 1 hour (in milliseconds)
    });

    // Handle store errors
    store.on('error', (error) => {
      console.error('MongoDB session store error:', error);
    });

    // Configure express-session with MongoDB store
    app.use(
      session({
        secret: configService.get<string>('SESSION_SECRET') || 'supersecret', // Use a strong secret from environment variables
        resave: false,
        saveUninitialized: false,
        store: store, // Use MongoDB store instead of default MemoryStore
        cookie: {
          maxAge: 3600000, // 1 hour
          httpOnly: true,
          // For local development (HTTP), secure should be false.
          // For production (HTTPS), secure should be true.
          secure: process.env.NODE_ENV === 'production',
          // Set SameSite to 'Lax' for development (default, but explicit)
          // For cross-site requests in production (e.g., separate frontend domain),
          // it should be 'None' and 'secure' must be true.
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        },
      }),
    );

    // Initialize Passport
    app.use(passport.initialize());
    app.use(passport.session());

    // 1. Enable Global Validation Pipe for DTOs
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Strips away properties not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if unknown properties are sent
      transform: true, // Automatically transforms payload to DTO instance
      transformOptions: {
        enableImplicitConversion: true, // Allows automatic type conversion (e.g., string to number)
      },
    }));

    // 2. Configure CORS
    const allowedOrigins = configService.get<string>('CORS_ALLOWED_ORIGINS');
    if (allowedOrigins) {
      const originArray = allowedOrigins.split(',').map(o => o.trim());
      app.enableCors({
        origin: originArray.includes('*') ? '*' : originArray, // Allow all or specific origins
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true, // Allow cookies to be sent with requests
      });
    } else {
      console.warn('CORS_ALLOWED_ORIGINS is not set in .env. CORS is not explicitly configured.');
    }

    // 3. Start the application
    // const port = configService.get<number>('PORT') || 3000;
    // await app.listen(port);
    // console.log(`Handl now running on port ${port}`);
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

const handler: Handler = async (req, res) => {
  const server = await bootstrapServer();
  server(req, res);
};

export default handler;
