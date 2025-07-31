import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PostTagService } from '../post-tag.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CreatePostTagDto } from '../dto/create-post-tag.dto';

describe('PostTagService', () => {
  let service: PostTagService;
  let mockPrismaService: any;

  const mockPostTag = {
    id: 'test-association-id',
    postId: 'test-post-id',
    tagId: 'test-tag-id',
    createdAt: new Date('2025-07-30T10:30:00.000Z'),
    post: {
      id: 'test-post-id',
      title: 'Test Post',
    },
    tag: {
      id: 'test-tag-id',
      name: 'test-tag',
    },
  };

  const mockPost = {
    id: 'test-post-id',
    title: 'Test Post',
    content: 'Test content',
  };

  const mockTag = {
    id: 'test-tag-id',
    name: 'test-tag',
    description: 'Test tag description',
  };

  beforeEach(async () => {
    const mockPrisma = {
      postTag: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      post: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      tag: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostTagService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PostTagService>(PostTagService);
    mockPrismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAssociation', () => {
    const createDto: CreatePostTagDto = {
      postId: 'test-post-id',
      tagId: 'test-tag-id',
    };

    it('should create association successfully', async () => {
      (mockPrismaService.postTag.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrismaService.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (mockPrismaService.tag.findUnique as jest.Mock).mockResolvedValue(mockTag);
      (mockPrismaService.postTag.create as jest.Mock).mockResolvedValue(mockPostTag);

      const result = await service.createAssociation(createDto);

      expect(mockPrismaService.postTag.findFirst).toHaveBeenCalledWith({
        where: {
          postId: 'test-post-id',
          tagId: 'test-tag-id',
        },
      });
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-post-id' },
      });
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-tag-id' },
      });
      expect(mockPrismaService.postTag.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockPostTag);
    });

    it('should throw ConflictException when association already exists', async () => {
      (mockPrismaService.postTag.findFirst as jest.Mock).mockResolvedValue(mockPostTag);

      await expect(service.createAssociation(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException when post not found', async () => {
      (mockPrismaService.postTag.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrismaService.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createAssociation(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when tag not found', async () => {
      (mockPrismaService.postTag.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrismaService.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (mockPrismaService.tag.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createAssociation(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addMultipleTagsToPost', () => {
    it('should add multiple tags to post successfully', async () => {
      const tagIds = ['tag1', 'tag2', 'tag3'];
      (mockPrismaService.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (mockPrismaService.tag.findMany as jest.Mock).mockResolvedValue([
        { id: 'tag1' },
        { id: 'tag2' },
        { id: 'tag3' },
      ]);
      (mockPrismaService.postTag.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // Premier tag n'existe pas
        .mockResolvedValueOnce(null) // Deuxième tag n'existe pas  
        .mockResolvedValueOnce(null); // Troisième tag n'existe pas
      (mockPrismaService.postTag.create as jest.Mock)
        .mockResolvedValueOnce({ ...mockPostTag, tagId: 'tag1' })
        .mockResolvedValueOnce({ ...mockPostTag, tagId: 'tag2' })
        .mockResolvedValueOnce({ ...mockPostTag, tagId: 'tag3' });

      const result = await service.addMultipleTagsToPost('test-post-id', tagIds);

      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-post-id' },
      });
      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        where: { id: { in: tagIds } },
      });
      expect(result).toHaveLength(3);
    });

    it('should throw NotFoundException when post not found', async () => {
      (mockPrismaService.post.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addMultipleTagsToPost('test-post-id', ['tag1']),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPost', () => {
    it('should return associations for a post', async () => {
      (mockPrismaService.postTag.findMany as jest.Mock).mockResolvedValue([mockPostTag]);

      const result = await service.findByPost('test-post-id');

      expect(mockPrismaService.postTag.findMany).toHaveBeenCalledWith({
        where: { postId: 'test-post-id' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockPostTag]);
    });
  });

  describe('findByTag', () => {
    it('should return associations for a tag', async () => {
      (mockPrismaService.postTag.findMany as jest.Mock).mockResolvedValue([mockPostTag]);

      const result = await service.findByTag('test-tag-id');

      expect(mockPrismaService.postTag.findMany).toHaveBeenCalledWith({
        where: { tagId: 'test-tag-id' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockPostTag]);
    });
  });

  describe('removeAssociation', () => {
    it('should remove association successfully', async () => {
      (mockPrismaService.postTag.findFirst as jest.Mock).mockResolvedValue(mockPostTag);
      (mockPrismaService.postTag.delete as jest.Mock).mockResolvedValue(mockPostTag);

      const result = await service.removeAssociation('test-post-id', 'test-tag-id');

      expect(mockPrismaService.postTag.findFirst).toHaveBeenCalledWith({
        where: { postId: 'test-post-id', tagId: 'test-tag-id' },
      });
      expect(mockPrismaService.postTag.delete).toHaveBeenCalledWith({
        where: { id: 'test-association-id' },
      });
      expect(result).toEqual(mockPostTag);
    });

    it('should throw NotFoundException when association not found', async () => {
      (mockPrismaService.postTag.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.removeAssociation('test-post-id', 'test-tag-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('countByPost', () => {
    it('should return count of associations for a post', async () => {
      (mockPrismaService.postTag.count as jest.Mock).mockResolvedValue(5);

      const result = await service.countByPost('test-post-id');

      expect(mockPrismaService.postTag.count).toHaveBeenCalledWith({
        where: { postId: 'test-post-id' },
      });
      expect(result).toBe(5);
    });
  });

  describe('countByTag', () => {
    it('should return count of associations for a tag', async () => {
      (mockPrismaService.postTag.count as jest.Mock).mockResolvedValue(3);

      const result = await service.countByTag('test-tag-id');

      expect(mockPrismaService.postTag.count).toHaveBeenCalledWith({
        where: { tagId: 'test-tag-id' },
      });
      expect(result).toBe(3);
    });
  });

  describe('findPopularTags', () => {
    it('should return popular tags with post counts', async () => {
      const mockGroupBy = [
        { tagId: 'tag1', _count: { postId: 10 } },
        { tagId: 'tag2', _count: { postId: 8 } },
      ];
      const mockTags = [
        { id: 'tag1', name: 'Tag 1' },
        { id: 'tag2', name: 'Tag 2' },
      ];
      (mockPrismaService.postTag.groupBy as jest.Mock).mockResolvedValue(mockGroupBy);
      (mockPrismaService.tag.findMany as jest.Mock).mockResolvedValue(mockTags);

      const result = await service.findPopularTags(10);

      expect(mockPrismaService.postTag.groupBy).toHaveBeenCalledWith({
        by: ['tagId'],
        _count: { postId: true },
        orderBy: { _count: { postId: 'desc' } },
        take: 10,
      });
      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['tag1', 'tag2'] } },
      });
      expect(result).toEqual([
        { id: 'tag1', name: 'Tag 1', postCount: 10 },
        { id: 'tag2', name: 'Tag 2', postCount: 8 },
      ]);
    });
  });

  describe('findSimilarPosts', () => {
    it('should return similar posts based on shared tags', async () => {
      const mockPostTags = [
        { tagId: 'tag1', postId: 'test-post-id' },
        { tagId: 'tag2', postId: 'test-post-id' },
      ];
      const mockSimilarPosts = [
        { 
          postId: 'similar-post-1', 
          tagId: 'tag1',
          post: { id: 'similar-post-1', title: 'Similar Post 1' }
        },
        { 
          postId: 'similar-post-2', 
          tagId: 'tag2',
          post: { id: 'similar-post-2', title: 'Similar Post 2' }
        },
      ];
      
      (mockPrismaService.postTag.findMany as jest.Mock)
        .mockResolvedValueOnce(mockPostTags) // Premier appel pour findByPost
        .mockResolvedValueOnce(mockSimilarPosts); // Deuxième appel pour findSimilarPosts

      const result = await service.findSimilarPosts('test-post-id', 5);

      expect(mockPrismaService.postTag.findMany).toHaveBeenCalledWith({
        where: { postId: 'test-post-id' },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.postTag.findMany).toHaveBeenCalledWith({
        where: {
          tagId: { in: ['tag1', 'tag2'] },
          postId: { not: 'test-post-id' },
        },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              content: true,
              isPublic: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
        take: 10,
      });
      expect(result).toHaveLength(2);
    });
  });
});
