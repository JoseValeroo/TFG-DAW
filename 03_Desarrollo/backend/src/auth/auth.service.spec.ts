import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let users: {
    findByEmail: jest.Mock;
    findByUsername: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    users = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    jwt = { sign: jest.fn().mockReturnValue('signed-token') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('crea el usuario, hashea la contraseña y devuelve token + datos públicos', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.findByUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      users.create.mockResolvedValue({
        id: 1,
        username: 'jose',
        email: 'jose@example.com',
        passwordHash: 'hashed-pw',
      });

      const result = await service.register({
        username: 'jose',
        email: 'jose@example.com',
        password: 'secreto123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('secreto123', 10);
      expect(users.create).toHaveBeenCalledWith({
        username: 'jose',
        email: 'jose@example.com',
        passwordHash: 'hashed-pw',
      });
      expect(result).toEqual({
        token: 'signed-token',
        user: { id: 1, username: 'jose', email: 'jose@example.com' },
      });
      // Nunca debe devolver el hash de la contraseña.
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('lanza ConflictException si el email ya está registrado', async () => {
      users.findByEmail.mockResolvedValue({ id: 9 });

      await expect(
        service.register({
          username: 'nuevo',
          email: 'dup@example.com',
          password: 'secreto123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(users.create).not.toHaveBeenCalled();
    });

    it('lanza ConflictException si el nombre de usuario ya existe', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.findByUsername.mockResolvedValue({ id: 9 });

      await expect(
        service.register({
          username: 'dup',
          email: 'libre@example.com',
          password: 'secreto123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    const existingUser = {
      id: 1,
      username: 'jose',
      email: 'jose@example.com',
      passwordHash: 'hashed-pw',
    };

    it('devuelve token y datos cuando las credenciales son válidas', async () => {
      users.findByUsername.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ username: 'jose', password: 'secreto123' });

      expect(bcrypt.compare).toHaveBeenCalledWith('secreto123', 'hashed-pw');
      expect(result.token).toBe('signed-token');
      expect(result.user).toEqual({ id: 1, username: 'jose', email: 'jose@example.com' });
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      users.findByUsername.mockResolvedValue(null);

      await expect(
        service.login({ username: 'fantasma', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
      users.findByUsername.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ username: 'jose', password: 'incorrecta' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
