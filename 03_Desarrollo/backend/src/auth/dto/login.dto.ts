import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(1, { message: 'El usuario es obligatorio' })
  username: string;

  @IsString()
  @MinLength(1, { message: 'La contraseña es obligatoria' })
  password: string;
}
