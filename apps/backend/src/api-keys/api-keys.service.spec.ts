import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysService } from './api-keys.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let prisma: PrismaService;

  const mockPrisma = {
    apiKey: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should generate a key with ep_live_ prefix, hash with sha256, and return raw key once', async () => {
      mockPrisma.apiKey.create.mockImplementation(({ data }) => ({
        id: 'key-1',
        name: data.name,
        keyPrefix: data.keyPrefix,
        createdAt: new Date(),
      }));

      const result = await service.create('org-1', 'Production Key');

      expect(result.rawKey).toMatch(/^ep_live_/);
      expect(result.keyPrefix).toBe(result.rawKey.substring(0, 16));
      expect(mockPrisma.apiKey.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: 'org-1',
          name: 'Production Key',
          keyPrefix: result.rawKey.substring(0, 16),
          keyHash: crypto.createHash('sha256').update(result.rawKey).digest('hex'),
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('validateKey', () => {
    it('should return null for malformed or missing key', async () => {
      expect(await service.validateKey('')).toBeNull();
      expect(await service.validateKey('invalid_prefix_123')).toBeNull();
    });

    it('should return organizationId and fire lastUsedAt update when valid key matches', async () => {
      const rawKey = 'ep_live_validsecretkey1234567890';
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

      mockPrisma.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        organizationId: 'org-1',
        revokedAt: null,
      });
      mockPrisma.apiKey.update.mockResolvedValue({});

      const orgId = await service.validateKey(rawKey);

      expect(orgId).toBe('org-1');
      expect(mockPrisma.apiKey.findUnique).toHaveBeenCalledWith({
        where: { keyHash },
      });
      expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: 'key-1' },
        data: expect.objectContaining({ lastUsedAt: expect.any(Date) }),
      });
    });

    it('should return null if key is revoked', async () => {
      const rawKey = 'ep_live_revokedkey1234567890';

      mockPrisma.apiKey.findUnique.mockResolvedValue({
        id: 'key-2',
        organizationId: 'org-1',
        revokedAt: new Date(),
      });

      const orgId = await service.validateKey(rawKey);
      expect(orgId).toBeNull();
      expect(mockPrisma.apiKey.update).not.toHaveBeenCalled();
    });
  });

  describe('revoke', () => {
    it('should throw NotFoundException if key does not exist', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(null);

      await expect(service.revoke('nonexistent', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if key belongs to another org', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        organizationId: 'other-org',
      });

      await expect(service.revoke('key-1', 'org-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should set revokedAt when key belongs to org', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        organizationId: 'org-1',
      });
      mockPrisma.apiKey.update.mockResolvedValue({
        id: 'key-1',
        revokedAt: new Date(),
      });

      await service.revoke('key-1', 'org-1');

      expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: 'key-1' },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        select: expect.any(Object),
      });
    });
  });
});
