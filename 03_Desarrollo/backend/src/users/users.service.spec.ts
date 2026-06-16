import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    repo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('findByEmail consulta por email', async () => {
    repo.findOne.mockResolvedValue({ id: 1 });
    const user = await service.findByEmail('a@b.com');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
    expect(user).toEqual({ id: 1 });
  });

  it('findByUsername consulta por username', async () => {
    repo.findOne.mockResolvedValue({ id: 2 });
    await service.findByUsername('jose');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { username: 'jose' } });
  });

  it('findById consulta por id', async () => {
    repo.findOne.mockResolvedValue(null);
    const user = await service.findById(99);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 99 } });
    expect(user).toBeNull();
  });

  it('create crea la entidad y la persiste', async () => {
    repo.create.mockReturnValue({ username: 'jose' });
    repo.save.mockResolvedValue({ id: 1, username: 'jose' });

    const result = await service.create({ username: 'jose' });

    expect(repo.create).toHaveBeenCalledWith({ username: 'jose' });
    expect(repo.save).toHaveBeenCalledWith({ username: 'jose' });
    expect(result).toEqual({ id: 1, username: 'jose' });
  });
});
