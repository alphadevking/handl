import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet'; // Import helmet
import * as session from 'express-session'; // Import express-session
import * as passport from 'passport'; // Import passport
import { TypeormStore } from 'connect-typeorm'; // Import TypeormStore
import { DataSource } from 'typeorm'; // Import DataSource
import { Session } from './database/entities/session.entity'; // Import Session entity

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet()); // Apply helmet for security headers
  const configService = app.get(ConfigService); // Get ConfigService instance
  const dataSource = app.get(DataSource); // Get the TypeORM DataSource

  // Ensure DataSource is initialized before connecting TypeormStore
  if (!dataSource.isInitialized) {
    console.log('DataSource not initialized, attempting to initialize...');
    await dataSource.initialize();
    console.log('DataSource initialized.');
  }

  // Configure express-session with TypeORM store
  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET') || 'supersecret', // Use a strong secret from environment variables
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore({
        cleanupLimit: 2, // Number of expired sessions to clean up
        limitSubquery: false, // If using MySQL, set to true
        ttl: 3600000, // Session TTL in milliseconds (1 hour)
      }).connect(dataSource.getRepository(Session)), // Connect to the Session entity repository
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
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Handl now running on port ${port}`);
}
bootstrap();
