// api/index.ts
import { VercelApiHandler as Handler } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import passport from 'passport'; // Import passport
import cookieParser from 'cookie-parser'; // Import cookie-parser
import session from 'express-session'; // Import express-session
import { jwtConstants } from '../src/auth/constants'; // Import jwtConstants

let cachedServer: any = null;

async function bootstrapServer() {
  if (!cachedServer) {
    // Disable bodyParser so Nest can handle it natively
    const app = await NestFactory.create(AppModule, { bodyParser: false });

    // Enable helmet for security headers
    app.use(helmet());
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
