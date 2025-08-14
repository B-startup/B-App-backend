import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

export class CreateUserWithImageDto {
    @ApiProperty({ type: CreateUserDto, description: 'User data' })
    userData: CreateUserDto;

    @ApiPropertyOptional({ 
        type: 'string', 
        format: 'binary', 
        description: 'Profile image file (JPEG, PNG, GIF, WebP max 2MB)' 
    })
    profileImage?: Express.Multer.File;
}

export class UpdateUserWithImageDto {
    @ApiProperty({ type: UpdateUserDto, description: 'User data to update' })
    userData: UpdateUserDto;

    @ApiPropertyOptional({ 
        type: 'string', 
        format: 'binary', 
        description: 'New profile image file (JPEG, PNG, GIF, WebP max 2MB)' 
    })
    profileImage?: Express.Multer.File;
}
