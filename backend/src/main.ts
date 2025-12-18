import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IglesiaContextInterceptor } from './common/interceptors/iglesia-context.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new IglesiaContextInterceptor());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization, x-api-key',
});


  await app.listen(process.env.PORT!);
}
bootstrap();
