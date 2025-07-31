# Post Tag Module

Le module **PostTag** gère les associations many-to-many entre les posts et les tags dans l'application BOM. Il permet de taguer les posts avec des mots-clés pour faciliter la recherche et la découverte de contenu.

## Structure du module

```
post-tag/
├── dto/
│   ├── create-post-tag.dto.ts      # DTO pour créer une association
│   └── update-post-tag.dto.ts      # DTO pour mettre à jour une association
├── __tests__/
│   ├── post-tag.service.spec.ts    # Tests du service
│   └── post-tag.controller.spec.ts # Tests du contrôleur
├── post-tag.controller.ts          # Contrôleur REST API
├── post-tag.service.ts            # Service métier
└── post-tag.module.ts             # Module NestJS
```

## Modèle de données (Prisma)

```prisma
model PostTag {
  id        String   @id @default(uuid())
  postId    String
  tagId     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([postId, tagId])
}
```

### Contraintes importantes :
- **Contrainte unique** : Un post ne peut être associé qu'une seule fois à un tag donné
- **Suppression en cascade** : Si un post ou un tag est supprimé, toutes les associations sont automatiquement supprimées
- **Validation d'existence** : Vérification que le post et le tag existent avant association

## API Endpoints

### Associations de base
```http
POST   /post-tag                          # Créer une association
DELETE /post-tag                          # Supprimer une association
```

### Ajout en lot
```http
POST   /post-tag/bulk/:postId             # Ajouter plusieurs tags à un post
```

### Recherche par entité
```http
GET    /post-tag/post/:postId             # Tags d'un post
GET    /post-tag/tag/:tagId               # Posts d'un tag
```

### Analyse et recommandations
```http
GET    /post-tag/popular-tags             # Tags populaires
GET    /post-tag/similar/:postId          # Posts similaires
```

### Compteurs
```http
GET    /post-tag/count/post/:postId       # Compter tags d'un post
GET    /post-tag/count/tag/:tagId         # Compter posts d'un tag
```

## Fonctionnalités principales

### 1. **Gestion des Associations**
- ✅ Création d'associations post-tag
- ✅ Validation d'unicité (éviter les doublons)
- ✅ Vérification d'existence des entités liées
- ✅ Suppression d'associations spécifiques

### 2. **Opérations en Lot**
- ✅ Ajout de plusieurs tags à un post
- ✅ Gestion automatique des doublons

### 3. **Recherche et Filtrage**
- ✅ Récupération des tags d'un post
- ✅ Récupération des posts d'un tag
- ✅ Inclusion optionnelle des détails liés

### 4. **Recommandations et Analytics**
- ✅ Tags populaires (les plus utilisés)
- ✅ Posts similaires basés sur tags partagés
- ✅ Compteurs d'associations

## DTOs (Data Transfer Objects)

### CreatePostTagDto
```typescript
{
  postId: string;  // ID du post (requis)
  tagId: string;   // ID du tag (requis)
}
```

### BulkPostTagDto
```typescript
{
  postId: string;    // ID du post (requis)
  tagIds: string[];  // Liste des IDs de tags (requis)
}
```

### UpdatePostTagDto
```typescript
{
  postId?: string;  // ID du post (optionnel)
  tagId?: string;   // ID du tag (optionnel)
}
```

## Exemples d'utilisation

### 1. Associer un tag à un post
```bash
curl -X POST http://localhost:3000/api/post-tag \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "post-uuid-123",
    "tagId": "tag-uuid-456"
  }'
```

### 2. Ajouter plusieurs tags
```bash
curl -X POST http://localhost:3000/api/post-tag/bulk/post-uuid-123 \
  -H "Content-Type: application/json" \
  -d '{
    "tagIds": ["tag-fintech", "tag-ai", "tag-startup"]
  }'
```

### 3. Récupérer les tags d'un post
```bash
curl "http://localhost:3000/api/post-tag/post/post-uuid-123?withTags=true"
```

### 4. Trouver des posts similaires
```bash
curl "http://localhost:3000/api/post-tag/similar/post-uuid-123?limit=5"
```

### 5. Obtenir les tags populaires
```bash
curl "http://localhost:3000/api/post-tag/popular-tags?limit=10"
```

## Architecture et patterns

### Héritage de BaseCrudServiceImpl

Le `PostTagService` hérite de `BaseCrudServiceImpl` qui fournit :
- Méthodes CRUD standardisées
- Gestion d'erreurs automatique
- Types TypeScript stricts
- Validation des DTOs

```typescript
export class PostTagService extends BaseCrudServiceImpl<
    PostTag,
    CreatePostTagDto,
    UpdatePostTagDto
> {
    // Méthodes personnalisées spécifiques aux associations post-tag
}
```

### Méthodes spécialisées

```typescript
// Associations de base
createAssociation(dto: CreatePostTagDto): Promise<PostTag>
removeAssociation(postId: string, tagId: string): Promise<PostTag>

// Recherche par entité
findByPost(postId: string): Promise<PostTag[]>
findByPostWithTags(postId: string): Promise<any[]>
findByTag(tagId: string): Promise<PostTag[]>
findByTagWithPosts(tagId: string): Promise<any[]>

// Opérations avancées
addMultipleTagsToPost(postId: string, tagIds: string[]): Promise<PostTag[]>
findSimilarPosts(postId: string, limit?: number): Promise<any[]>
findPopularTags(limit?: number): Promise<any[]>
```

## Gestion d'erreurs

### Types d'erreurs gérées

1. **ConflictException (409)** : Association déjà existante
2. **NotFoundException (404)** : Post, tag ou association non trouvé
3. **BadRequestException (400)** : Données invalides
4. **ValidationException** : Erreurs de validation DTO

### Exemples de réponses d'erreur

```json
// Conflit d'association
{
  "statusCode": 409,
  "message": "This post is already associated with this tag",
  "error": "Conflict"
}

// Entité non trouvée
{
  "statusCode": 404,
  "message": "Post not found",
  "error": "Not Found"
}
```

## Cas d'usage

### 1. **Tagging de contenu**
- Taguer les posts par thème (Technology, Business, Design)
- Identifier les sujets tendance
- Faciliter la recherche par mots-clés

### 2. **Découverte de contenu**
- Suggérer des posts similaires aux lecteurs
- Créer des flux thématiques
- Analyser les intérêts des utilisateurs

### 3. **Analytics et recommandations**
- Identifier les tags populaires
- Analyser l'engagement par tag
- Recommander du contenu personnalisé

## Intégration avec d'autres modules

### Dépendances
- **Post Module** : Validation des posts
- **Tag Module** : Gestion des tags disponibles
- **BaseCrudServiceImpl** : Héritage des méthodes CRUD

### Relations
```typescript
// Avec le module Post
Post (1) ←→ (N) PostTag

// Avec le module Tag
Tag (1) ←→ (N) PostTag
```

## Performance et optimisation

- **Index automatique** sur `(postId, tagId)` pour l'unicité
- **Requêtes groupées** pour les statistiques
- **Limitation des résultats** pour éviter la surcharge
- **Déduplication automatique** dans les ajouts en lot
- **Cache possible** pour les tags populaires

## Tests

### Couverture de tests
- **Service** : Tests de toutes les méthodes
- **Controller** : Tests de tous les endpoints
- **DTOs** : Validation des champs
- **Intégration** : Tests bout en bout

### Exécuter les tests
```bash
# Tests du service
npm test -- post-tag.service.spec.ts

# Tests du contrôleur
npm test -- post-tag.controller.spec.ts

# Tous les tests PostTag
npm test -- "post-tag.*\.spec\.ts$"
```
