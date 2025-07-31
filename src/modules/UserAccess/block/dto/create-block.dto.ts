// create-block.dto.ts
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBlockDto {
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsUUID()
    @IsNotEmpty()
    blockedUserId: string;
}
