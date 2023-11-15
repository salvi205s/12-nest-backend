import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  // Usamos un guardia de autenticación (AuthGuard) para proteger esta ruta
  @UseGuards(AuthGuard)
  // Definimos un endpoint GET con la ruta 'check-token'
  @Get('check-token')
  // Definimos la función controladora 'checkToken' que recibe la solicitud (req) como parámetro
  checkToken(@Request() req: Request): LoginResponse {
    
    // Extraemos el usuario autenticado de la solicitud y lo asignamos a la variable 'user'
    const user = req['user'] as User;

    // Devolvemos un objeto que contiene la información del usuario y un nuevo token JWT
    return {
      user, // Devolvemos la información del usuario
      token: this.authService.getJwtToken({ id: user._id }), // Generamos un nuevo token JWT para el usuario
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
