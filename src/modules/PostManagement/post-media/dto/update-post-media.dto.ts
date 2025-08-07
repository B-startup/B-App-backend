import { PartialType } from '@nestjs/swagger';
import { CreatePostMediaDto } from './create-post-media.dto';

export class UpdatePostMediaDto extends PartialType(CreatePostMediaDto) {
    // Hérite de tous les champs de CreatePostMediaDto en mode optionnel
    // Généralement, on ne met à jour que l'URL ou le type de média
}
