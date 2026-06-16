import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { User } from '../src/users/user.entity';

// E2E del flujo de autenticación contra una BD SQLite EN MEMORIA (sql.js),
// para que corra en cualquier entorno sin necesidad de MySQL.
describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          entities: [User],
          synchronize: true,
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const credentials = {
    username: 'jose',
    email: 'jose@example.com',
    password: 'secreto123',
  };

  it('POST /auth/register crea el usuario y devuelve token sin exponer el hash', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({
      username: 'jose',
      email: 'jose@example.com',
    });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('POST /auth/register con datos inválidos devuelve 400', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'ab', email: 'no-es-email', password: '123' })
      .expect(400);
  });

  it('POST /auth/register con email duplicado devuelve 409', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...credentials, username: 'otro' })
      .expect(409);
  });

  it('POST /auth/login con credenciales válidas devuelve token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'jose', password: 'secreto123' })
      .expect(201);

    expect(res.body.token).toBeDefined();
  });

  it('POST /auth/login con contraseña incorrecta devuelve 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'jose', password: 'incorrecta' })
      .expect(401);
  });

  it('GET /auth/me sin token devuelve 401', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('GET /auth/me con token válido devuelve el usuario autenticado', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'jose', password: 'secreto123' });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.username).toBe('jose');
        expect(res.body.email).toBe('jose@example.com');
      });
  });
});
