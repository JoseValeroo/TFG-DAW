import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictException('El email ya está registrado');
    }
    if (await this.users.findByUsername(dto.username)) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.users.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    const token = this.jwt.sign({ sub: user.id, username: user.username });
    return {
      token,
      user: { id: user.id, username: user.username, email: user.email },
    };
  }
}
