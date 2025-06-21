import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet'; // Import helmet
import passport from 'passport'; // Import passport
import cookieParser from 'cookie-parser'; // Import cookie-parser
import session from 'express-session'; // Import express-session
import { jwtConstants } from './auth/constants'; // Import jwtConstants

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet()); // Apply helmet for security headers
  const configService = app.get(ConfigService); // Get ConfigService instance

  // Use cookie-parser middleware
  app.use(cookieParser());

  // Configure and use express-session
  app.use(
    session({
      secret: jwtConstants.secret, // Use secret from constants
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: jwtConstants.sessionTimeout, // Use sessionTimeout from constants
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
    }),
  );

  // Initialize Passport
  app.use(passport.initialize());
  // Enable Passport session support for cookie-based authentication
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
