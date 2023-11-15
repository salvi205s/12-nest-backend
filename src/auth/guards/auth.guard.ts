import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload';

// Importamos los módulos necesarios desde Nest.js
@Injectable()

export class AuthGuard implements CanActivate {

  // Constructor que recibe instancias de JwtService y AuthService
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  // Método "canActivate" requerido por la interfaz CanActivate
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extraemos la solicitud (request) del contexto
    const request = context.switchToHttp().getRequest();

    // Extraemos el token de autorización del encabezado de la solicitud
    const token = this.extractTokenFromHeader(request);

    // Si no hay token, lanzamos una excepción de No Autorizado
    if (!token) {
      throw new UnauthorizedException('There is no bearer token');
    }

    try {
      // Verificamos y desciframos el token utilizando JwtService
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SEED, // Usamos la semilla JWT almacenada en las variables de entorno
      });

      // Buscamos al usuario en la base de datos utilizando el servicio AuthService
      const user = await this.authService.findUserById(payload.id);

      // Si no encontramos al usuario, lanzamos una excepción de No Autorizado
      if (!user) throw new UnauthorizedException('User does not exist');

      // Si el usuario no está activo, lanzamos una excepción de No Autorizado
      if (!user.isActive) throw new UnauthorizedException('User is not active');

      // Agregamos la información del usuario a la solicitud
      request['user'] = user;
    } catch (error) {
      // Si hay algún error al verificar el token, lanzamos una excepción de No Autorizado
      throw new UnauthorizedException();
    }

    // Si todo está bien, permitimos el acceso
    return true;
  }

  // Método auxiliar para extraer el token de autorización del encabezado de la solicitud
  private extractTokenFromHeader(request: Request): string | undefined {
    // Desestructuramos el encabezado de autorización en tipo y token, y retornamos el token solo si el tipo es 'Bearer'
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
