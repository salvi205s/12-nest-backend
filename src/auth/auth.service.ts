import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    // private jwtService: JwtService,
  ) {}

  // Definimos una función asincrónica llamada "create" que recibe un objeto "createUserDto" y devuelve una promesa de tipo "User"
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Intentamos ejecutar el siguiente bloque de código
    try {
      // Extraemos la propiedad "password" del objeto "createUserDto" y almacenamos el resto de las propiedades en "userData"
      const { password, ...userData } = createUserDto;

      // Creamos una nueva instancia de modelo "userModel" con la contraseña hasheada usando bcrypt
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10), // Hasheamos la contraseña con bcrypt
        ...userData, // Agregamos el resto de las propiedades del usuario
      });

      // Guardamos el nuevo usuario en la base de datos
      await newUser.save();

      // Extraemos la propiedad "password" del nuevo usuario y almacenamos el resto en "user" ( Para que no se muestre la password en postman)
      const { password: _, ...user } = newUser.toJSON();

      // Devolvemos el usuario sin la contraseña
      return user;
    } catch (error) {
      // Si ocurre un error, verificamos si el código del error es 11000 (duplicado en MongoDB)
      if (error.code === 11000) {
        // Si es un duplicado, lanzamos una excepción de BadRequest indicando que el correo electrónico ya existe
        throw new BadRequestException(`${createUserDto.email} already exists!`);
      }
      // Si el error no es un duplicado, lanzamos una excepción de Error Interno del Servidor
      throw new InternalServerErrorException('Something terribe happen!!!');
    }
  }

  //----------------------------------------------------------------

  // Definimos una función asincrónica llamada "login" que recibe un objeto "loginDto" y devuelve una promesa de tipo "LoginResponse"
  async login(loginDto: LoginDto) {
    // Extraemos las propiedades "email" y "password" del objeto "loginDto"
    const { email, password } = loginDto;

    // Buscamos un usuario en la base de datos que tenga el mismo correo electrónico proporcionado
    const user = await this.userModel.findOne({ email: email });

    // Si no encontramos un usuario, lanzamos una excepción de No Autorizado indicando que las credenciales de correo electrónico no son válidas
    if (!user) {
      throw new UnauthorizedException('Not valid credentials - email');
    }

    // Comparamos la contraseña proporcionada con la contraseña almacenada en la base de datos usando bcrypt
    if (!bcryptjs.compareSync(password, user.password)) {
      // Si las contraseñas no coinciden, lanzamos una excepción de No Autorizado indicando que las credenciales de contraseña no son válidas
      throw new UnauthorizedException('Not valid credentials - password');
    }

    // Extraemos la propiedad "password" del usuario y almacenamos el resto en "rest"
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...rest } = user.toJSON();

    // Devolvemos un objeto con la información del usuario (sin la contraseña) y un token JWT
    return {
      user: rest,
      token: 'ABC-123',
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
