import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/services/prisma.service';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { SocialMediaResponseDto } from './dto/social-media-response.dto';
import { SocialMedia } from '@prisma/client';

@Injectable()
export class SocialMediaService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Create a new social media link
     */
    async create(createSocialMediaDto: CreateSocialMediaDto): Promise<SocialMediaResponseDto> {
        const { userId, platform, url } = createSocialMediaDto;

        // Check if user already has this platform
        const existingSocialMedia = await this.prisma.socialMedia.findUnique({
            where: {
                userId_platform: {
                    userId,
                    platform
                }
            }
        });

        if (existingSocialMedia) {
            throw new ConflictException(`User already has a ${platform} social media link`);
        }

        try {
            const socialMedia = await this.prisma.socialMedia.create({
                data: {
                    userId,
                    platform,
                    url
                }
            });

            return this.mapToResponseDto(socialMedia);
        } catch (error) {
            console.error('Failed to create social media link:', error);
            throw new BadRequestException('Failed to create social media link');
        }
    }

    /**
     * Get all social media links
     */
    async findAll(): Promise<SocialMediaResponseDto[]> {
        const socialMediaLinks = await this.prisma.socialMedia.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return socialMediaLinks.map(link => this.mapToResponseDto(link));
    }

    /**
     * Get a specific social media link by ID
     */
    async findOne(id: string): Promise<SocialMediaResponseDto> {
        const socialMedia = await this.prisma.socialMedia.findUnique({
            where: { id }
        });

        if (!socialMedia) {
            throw new NotFoundException(`Social media link with ID ${id} not found`);
        }

        return this.mapToResponseDto(socialMedia);
    }

    /**
     * Update a social media link
     */
    async update(id: string, updateSocialMediaDto: UpdateSocialMediaDto): Promise<SocialMediaResponseDto> {
        const existingSocialMedia = await this.prisma.socialMedia.findUnique({
            where: { id }
        });

        if (!existingSocialMedia) {
            throw new NotFoundException(`Social media link with ID ${id} not found`);
        }

        try {
            const updatedSocialMedia = await this.prisma.socialMedia.update({
                where: { id },
                data: updateSocialMediaDto
            });

            return this.mapToResponseDto(updatedSocialMedia);
        } catch (error) {
            console.error('Failed to update social media link:', error);
            throw new BadRequestException('Failed to update social media link');
        }
    }

    /**
     * Remove a social media link
     */
    async remove(id: string): Promise<void> {
        const existingSocialMedia = await this.prisma.socialMedia.findUnique({
            where: { id }
        });

        if (!existingSocialMedia) {
            throw new NotFoundException(`Social media link with ID ${id} not found`);
        }

        try {
            await this.prisma.socialMedia.delete({
                where: { id }
            });
        } catch (error) {
            console.error('Failed to delete social media link:', error);
            throw new BadRequestException('Failed to delete social media link');
        }
    }

    /**
     * Map Prisma model to response DTO
     */
    private mapToResponseDto(socialMedia: SocialMedia): SocialMediaResponseDto {
        return {
            id: socialMedia.id,
            userId: socialMedia.userId,
            platform: socialMedia.platform,
            url: socialMedia.url,
            createdAt: socialMedia.createdAt,
            updatedAt: socialMedia.updatedAt
        };
    }
}
