import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// Definimos una función asíncrona llamada bootstrap
async function bootstrap() {
  // Creamos una instancia de la aplicación Nest.js
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Configuramos el uso de tuberías (pipes) globales en la aplicación
  app.useGlobalPipes(
    new ValidationPipe({
      // Configuración de la tubería de validación
      whitelist: true, // Solo permite propiedades definidas en la clase DTO (Transferencia de Datos)
      forbidNonWhitelisted: true, // Rechaza solicitudes con propiedades no permitidas
    }),
  );

  // Escuchamos en el puerto 3000
  await app.listen(3000);
}

// Llamamos a la función bootstrap para iniciar la aplicación
bootstrap();
