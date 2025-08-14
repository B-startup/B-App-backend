# Follow Module Documentation

## Vue d'ensemble

Le module Follow gère les relations de suivi (follow) entre les utilisateurs de l'application. Il permet aux utilisateurs de suivre d'autres utilisateurs et de gérer leurs listes de followers et de following.

## Architecture

### Structure des fichiers
```
follow/
├── dto/
│   ├── create-follow.dto.ts
│   ├── update-follow.dto.ts
│   ├── follow-response.dto.ts
│   └── index.ts
├── _test_/
│   ├── follow.service.spec.ts
│   ├── follow.controller.spec.ts
│   ├── follow.module.spec.ts
│   └── dto.spec.ts
├── follow.controller.ts
├── follow.service.ts
└── follow.module.ts
```

### Modèle de données (Prisma)
```prisma
model Follow {
  id          String   @id @default(uuid())
  followerId  String   // ID de l'utilisateur qui suit
  followingId String   // ID de l'utilisateur suivi
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  follower  User @relation("UserFollows", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("UserFollowed", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follows")
}
```

## Service (FollowService)

### Héritage
Le `FollowService` étend `BaseCrudServiceImpl<Follow, CreateFollowDto, UpdateFollowDto>` pour bénéficier des opérations CRUD de base.

### Méthodes héritées
- `findAll()`: Trouve toutes les relations de suivi
- `findByUser(userId: string)`: Trouve les relations de suivi d'un utilisateur
- `findOne(id: string)`: Trouve une relation par ID
- `findOneOrFail(id: string)`: Trouve une relation ou throw une exception
- `update(id: string, updateDto: UpdateFollowDto)`: Met à jour une relation

### Méthodes surchargées

#### `create(createFollowDto: CreateFollowDto): Promise<Follow>`
- **Fonction** : Crée une nouvelle relation de suivi
- **Validations** :
  - Empêche l'auto-suivi (un utilisateur ne peut pas se suivre lui-même)
  - Empêche les relations duplicatas
- **Transaction** : Incrémente automatiquement `nbFollowing` pour le follower et `nbFollowers` pour l'utilisateur suivi

#### `remove(id: string): Promise<Follow>`
- **Fonction** : Supprime une relation de suivi
- **Transaction** : Décrémente automatiquement `nbFollowing` pour le follower et `nbFollowers` pour l'utilisateur suivi

### Méthodes personnalisées

#### Méthodes de transformation DTO
- `createFollow(createFollowDto: CreateFollowDto): Promise<FollowResponseDto>`
- `findAllFollows(): Promise<FollowResponseDto[]>`
- `findFollowById(id: string): Promise<FollowResponseDto>`
- `removeFollow(id: string): Promise<FollowResponseDto>`

#### Méthodes de requête spécialisées
- `getFollowing(userId: string): Promise<FollowWithUserDetailsDto[]>` - Utilisateurs suivis par un utilisateur
- `getFollowers(userId: string): Promise<FollowWithUserDetailsDto[]>` - Followers d'un utilisateur
- `isFollowing(followerId: string, followingId: string): Promise<boolean>` - Vérification de relation
- `toggleFollow(followerId: string, followingId: string): Promise<{isFollowing: boolean; follow?: FollowResponseDto}>` - Toggle suivi/ne suit plus
- `getFollowStats(userId: string): Promise<{followersCount: number; followingCount: number}>` - Statistiques
- `getMutualFollows(userId1: string, userId2: string): Promise<FollowWithUserDetailsDto[]>` - Suivis mutuels

## Contrôleur (FollowController)

### Endpoints API

#### Opérations CRUD de base
- `POST /follow` - Créer une relation de suivi
- `GET /follow` - Récupérer toutes les relations
- `GET /follow/:id` - Récupérer une relation par ID
- `PATCH /follow/:id` - Mettre à jour une relation
- `DELETE /follow/:id` - Supprimer une relation

#### Endpoints spécialisés
- `GET /follow/user/:userId/following` - Utilisateurs suivis par un utilisateur
- `GET /follow/user/:userId/followers` - Followers d'un utilisateur
- `GET /follow/user/:userId/stats` - Statistiques de suivi d'un utilisateur
- `POST /follow/toggle` - Toggle suivi/ne suit plus
- `GET /follow/check?followerId=&followingId=` - Vérifier si un utilisateur en suit un autre
- `GET /follow/mutual/:userId1/:userId2` - Suivis mutuels entre deux utilisateurs

### Sécurité
- Tous les endpoints sont protégés par `@TokenProtected()`
- Validation des UUIDs avec `ParseUUIDPipe`
- Documentation Swagger complète

## DTOs (Data Transfer Objects)

### CreateFollowDto
```typescript
class CreateFollowDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  followerId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  followingId: string;
}
```

### UpdateFollowDto
```typescript
class UpdateFollowDto extends PartialType(CreateFollowDto) {}
```

### FollowResponseDto
```typescript
class FollowResponseDto {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### FollowWithUserDetailsDto
```typescript
class FollowWithUserDetailsDto extends FollowResponseDto {
  follower?: {
    id: string;
    name: string;
    email: string;
  };
  following?: {
    id: string;
    name: string;
    email: string;
  };
}
```

## Gestion automatique des compteurs

Le module Follow gère automatiquement les compteurs de suivi dans le modèle User :

### Lors de la création d'un suivi (`create`)
```sql
-- Incrémenter nbFollowing pour le follower
UPDATE users SET nbFollowing = nbFollowing + 1 WHERE id = followerId;

-- Incrémenter nbFollowers pour l'utilisateur suivi
UPDATE users SET nbFollowers = nbFollowers + 1 WHERE id = followingId;
```

### Lors de la suppression d'un suivi (`remove`)
```sql
-- Décrémenter nbFollowing pour le follower
UPDATE users SET nbFollowing = nbFollowing - 1 WHERE id = followerId;

-- Décrémenter nbFollowers pour l'utilisateur suivi
UPDATE users SET nbFollowers = nbFollowers - 1 WHERE id = followingId;
```

## Tests

### Structure des tests
- `follow.service.spec.ts` - Tests unitaires du service
- `follow.controller.spec.ts` - Tests unitaires du contrôleur
- `follow.module.spec.ts` - Tests d'intégration du module
- `dto.spec.ts` - Tests des DTOs

### Couverture des tests
- ✅ Création de relations de suivi
- ✅ Suppression de relations de suivi
- ✅ Gestion des erreurs (ConflictException, NotFoundException)
- ✅ Validations (auto-suivi, relations duplicatas)
- ✅ Transactions pour la cohérence des données
- ✅ Méthodes de requête spécialisées
- ✅ Transformations DTO

## Utilisation

### Exemples d'utilisation dans l'application

#### Créer une relation de suivi
```typescript
POST /follow
{
  "followerId": "user-1-id",
  "followingId": "user-2-id"
}
```

#### Récupérer les utilisateurs suivis
```typescript
GET /follow/user/user-1-id/following
```

#### Toggle suivi/ne suit plus
```typescript
POST /follow/toggle
{
  "followerId": "user-1-id",
  "followingId": "user-2-id"
}
```

#### Vérifier une relation de suivi
```typescript
GET /follow/check?followerId=user-1-id&followingId=user-2-id
```

## Bonnes pratiques

1. **Transactions** : Toutes les opérations qui modifient les compteurs utilisent des transactions pour garantir la cohérence
2. **Validation** : Validation stricte des UUIDs et des relations
3. **Sécurité** : Tous les endpoints sont protégés par token
4. **Documentation** : Documentation Swagger complète pour tous les endpoints
5. **Tests** : Couverture complète des tests unitaires et d'intégration

## Erreurs communes

### ConflictException
- Tentative d'auto-suivi
- Création d'une relation de suivi existante

### NotFoundException
- Tentative d'accès à une relation inexistante
- Utilisateur non trouvé lors des opérations

## Intégration avec d'autres modules

Le module Follow s'intègre avec :
- **User Module** : Mise à jour automatique des compteurs nbFollowers/nbFollowing
- **Security Module** : Utilisation des tokens d'authentification
- **Prisma Module** : Base de données et transactions
