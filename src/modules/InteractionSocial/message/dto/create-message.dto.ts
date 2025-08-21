import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMessageDto {
    @ApiProperty({
        description: 'ID of the discussion this message belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    discussionId: string;

    @ApiProperty({
        description: 'Content of the message',
        example: 'Hello! I am interested in your project.',
        maxLength: 2000
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000, { message: 'Message content cannot exceed 2000 characters' })
    content: string;
}
