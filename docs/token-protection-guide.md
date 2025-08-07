# 🔐 Guide d'Utilisation - Protection des Tokens et Endpoints

## 📋 Vue d'Ensemble

Ce guide explique comment utiliser le système de protection avancé des tokens avec blacklist dans vos contrôleurs.

## 🛡️ Niveaux de Protection

### 1. TokenProtected - Protection Basique
Vérifie que l'utilisateur a un token valide et non blacklisté.

```typescript
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';
import { CurrentUser, CurrentToken } from '../../../core/common/decorators/current-user.decorator';

@Controller('example')
export class ExampleController {
    
    @Post('create')
    @TokenProtected()
    @ApiOperation({ summary: 'Create something (requires valid token)' })
    async create(
        @Body() createDto: CreateDto,
        @CurrentUser() user: any,
        @CurrentToken() token: string
    ) {
        // user.sub = ID de l'utilisateur
        // user.email = email de l'utilisateur
        // token = token JWT brut
        return this.service.create({ ...createDto, userId: user.sub });
    }
}
```

### 2. OwnerProtected - Protection Propriétaire
Vérifie le token + que l'utilisateur est propriétaire de la ressource.

```typescript
import { OwnerProtected } from '../../../core/common/decorators/owner-protected.decorator';

@Controller('comments')
export class CommentController {
    
    @Patch(':id')
    @OwnerProtected('comment')
    @ApiOperation({ summary: 'Update comment (owner only)' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateDto,
        @CurrentUser() user: any
    ) {
        // Vérification automatique que user.sub est propriétaire du commentaire
        return this.service.update(id, updateDto);
    }
}
```

## 🔧 Types de Ressources Supportés

| Type | Description | Champ Propriétaire |
|------|-------------|-------------------|
| `comment` | Commentaires | `userId` |
| `post` | Publications | `userId` |
| `project` | Projets | `creatorId` |

## 📝 Exemples Pratiques

### Contrôleur de Posts
```typescript
@ApiTags('Posts')
@Controller('posts')
export class PostController {
    
    // Lecture libre (pas de protection)
    @Get()
    @ApiOperation({ summary: 'Get all posts' })
    findAll() {
        return this.postService.findAll();
    }
    
    // Création avec authentification
    @Post()
    @TokenProtected()
    @ApiOperation({ summary: 'Create post (authenticated users)' })
    create(@Body() createDto: CreatePostDto, @CurrentUser() user: any) {
        return this.postService.create({ ...createDto, userId: user.sub });
    }
    
    // Modification par le propriétaire
    @Patch(':id')
    @OwnerProtected('post')
    @ApiOperation({ summary: 'Update post (owner only)' })
    update(@Param('id') id: string, @Body() updateDto: UpdatePostDto) {
        return this.postService.update(id, updateDto);
    }
    
    // Suppression par le propriétaire
    @Delete(':id')
    @OwnerProtected('post')
    @ApiOperation({ summary: 'Delete post (owner only)' })
    remove(@Param('id') id: string) {
        return this.postService.remove(id);
    }
}
```

### Contrôleur de Projets
```typescript
@ApiTags('Projects')
@Controller('projects')
export class ProjectController {
    
    @Post()
    @TokenProtected()
    @ApiOperation({ summary: 'Create project' })
    create(@Body() createDto: CreateProjectDto, @CurrentUser() user: any) {
        return this.projectService.create({ ...createDto, creatorId: user.sub });
    }
    
    @Patch(':id')
    @OwnerProtected('project')
    @ApiOperation({ summary: 'Update project (creator only)' })
    update(@Param('id') id: string, @Body() updateDto: UpdateProjectDto) {
        return this.projectService.update(id, updateDto);
    }
}
```

## 🔍 Réponses d'Erreur Automatiques

### Token Invalide ou Manquant (401)
```json
{
    "statusCode": 401,
    "message": "Token has been revoked or invalidated",
    "error": "Unauthorized"
}
```

### Pas Propriétaire (403)
```json
{
    "statusCode": 403,
    "message": "You are not the owner of this comment",
    "error": "Forbidden"
}
```

### Ressource Non Trouvée (404)
```json
{
    "statusCode": 404,
    "message": "Comment not found",
    "error": "Not Found"
}
```

## ⚡ Avantages

### Sécurité Renforcée
- ✅ **Révocation immédiate** des tokens compromis
- ✅ **Vérification de propriété** automatique
- ✅ **Protection multi-niveaux** (JWT + Blacklist + Ownership)

### Développement Simplifié
- ✅ **Décorateurs simples** à utiliser
- ✅ **Gestion d'erreurs automatique**
- ✅ **Documentation Swagger** générée
- ✅ **Types TypeScript** intégrés

### Performance Optimisée
- ✅ **Cache DB** avec index optimisés
- ✅ **Validation unique** par requête
- ✅ **Erreurs rapides** (fail-fast)

## 🚀 Bonnes Pratiques

### 1. Choix de la Protection
```typescript
// ✅ Lecture publique
@Get() findAll() { }

// ✅ Action authentifiée
@Post() @TokenProtected() create() { }

// ✅ Modification propriétaire
@Patch(':id') @OwnerProtected('resource') update() { }
```

### 2. Utilisation des Décorateurs
```typescript
// ✅ Récupérer l'utilisateur
async create(@CurrentUser() user: any) {
    console.log(user.sub); // ID utilisateur
    console.log(user.email); // Email utilisateur
}

// ✅ Récupérer le token (si nécessaire)
async logout(@CurrentToken() token: string) {
    await this.authService.blacklistToken(token);
}
```

### 3. Messages d'API Clairs
```typescript
@TokenProtected()
@ApiOperation({ summary: 'Action nécessitant une authentification' })
@ApiResponse({ status: 401, description: 'Token requis' })
async protectedAction() { }
```

## 🔧 Configuration

Assurez-vous que vos modules importent les services nécessaires :

```typescript
@Module({
    providers: [
        AuthService,
        TokenBlacklistService,
        PrismaService
    ],
    controllers: [YourController]
})
export class YourModule {}
```

---

*Guide mis à jour avec les dernières pratiques de sécurité*  
*Pour plus d'informations, consultez [README-logout.md](./README-logout.md)*
