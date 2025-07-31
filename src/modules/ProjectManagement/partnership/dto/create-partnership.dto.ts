import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreatePartnershipDto {
    @IsNotEmpty()
    @IsString()
    projectId: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsUrl()
    webSite: string;
}
