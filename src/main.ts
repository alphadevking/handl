import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet'; // Import helmet
import * as session from 'express-session'; // Import express-session
import * as passport from 'passport'; // Import passport

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet()); // Apply helmet for security headers
  const configService = app.get(ConfigService); // Get ConfigService instance

  // Configure express-session
  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET') || 'supersecret', // Use a strong secret from environment variables
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
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
  console.log(`Handl application running on port ${port}`);
}
bootstrap();
