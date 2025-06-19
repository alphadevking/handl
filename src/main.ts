import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet'; // Import helmet
import * as session from 'express-session'; // Import express-session
import * as passport from 'passport'; // Import passport
import { getConnectionToken } from '@nestjs/mongoose'; // Import getConnectionToken
import { Connection } from 'mongoose'; // Import Connection from mongoose
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { createServer, Server } from 'http';

// Import custom Mongoose session store
const MongoDBStore = require('connect-mongodb-session')(session);

/**
 * Creates and configures the NestJS application instance.
 * This function is designed to be reusable for both local development and serverless environments.
 * @returns {Promise<INestApplication>} The configured NestJS application instance.
 */
async function createApp(): Promise<INestApplication> {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.use(helmet()); // Apply helmet for security headers
  const configService = app.get(ConfigService); // Get ConfigService instance

  // Get Mongoose connection instance
  const connection = app.get<Connection>(getConnectionToken());

  // Configure MongoDB session store
  const store = new MongoDBStore({
    uri: configService.get<string>('MONGODB_URI'), // MongoDB connection URI from environment variables
    collection: 'sessions', // Collection name for sessions
    connection: connection, // Pass the Mongoose connection
  });

  // Catch errors
  store.on('error', function(error) {
    console.error('MongoDB Session Store Error:', error);
  });

  // Configure express-session with Mongoose store
  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET') || 'supersecret', // Use a strong secret from environment variables
      resave: false,
      saveUninitialized: false,
      store: store, // Use the MongoDB store
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

  // Enable Global Validation Pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips away properties not defined in the DTO
    forbidNonWhitelisted: true, // Throws an error if unknown properties are sent
    transform: true, // Automatically transforms payload to DTO instance
    transformOptions: {
      enableImplicitConversion: true, // Allows automatic type conversion (e.g., string to number)
    },
  }));

  // Configure CORS
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

  await app.init();
  return app;
}

/**
 * Bootstraps the NestJS application for local development.
 * This function is called when the application is run directly (e.g., `npm run start:dev`).
 */
async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Handl now running on port ${port}`);
}

// Check if the file is being run directly (e.g., for local development)
if (require.main === module) {
  bootstrap();
}

/**
 * Vercel serverless function handler.
 * This function is the entry point for Vercel deployments.
 * @param req The incoming HTTP request.
 * @param res The outgoing HTTP response.
 */
export default async function (req, res) {
  const app = await createApp();
  const server = app.getHttpAdapter().getInstance();
  server(req, res);
}
