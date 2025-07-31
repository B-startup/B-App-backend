# Tag Module

Le module **Tag** gère le système de tags dans l'application. Il permet de créer, gérer et catégoriser des tags qui peuvent être utilisés pour classifier les projets et les posts.

## Structure du module

```
tag/
├── dto/
│   ├── create-tag.dto.ts        # DTO pour créer un tag
│   ├── update-tag.dto.ts        # DTO pour mettre à jour un tag
│   └── tag-response.dto.ts      # DTO de réponse pour les tags
├── __tests__/
│   ├── create-tag.dto.spec.ts
│   ├── update-tag.dto.spec.ts
│   ├── tag.service.spec.ts
│   └── tag.controller.spec.ts
├── tag.controller.ts            # Contrôleur REST API
├── tag.service.ts              # Service métier
├── tag.module.ts               # Module NestJS
└── README.md                   # Documentation du module
```

## Modèle de données (Prisma)

```prisma
model Tag {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  projectTags ProjectTag[]
  PostTag     PostTag[]

  @@map("tags")
}
```

### Contraintes importantes :
- **Nom unique** : Chaque tag doit avoir un nom unique dans le système
- **Relations** : Les tags peuvent être associés aux projets (via ProjectTag) et aux posts (via PostTag)
- **Suppression** : La suppression d'un tag supprime automatiquement ses associations

## API Endpoints

### Endpoints CRUD de base

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/tag` | Créer un nouveau tag |
| `GET` | `/tag` | Récupérer tous les tags |
| `GET` | `/tag/:id` | Récupérer un tag par ID |
| `PATCH` | `/tag/:id` | Mettre à jour un tag |
| `DELETE` | `/tag/:id` | Supprimer un tag |

### Endpoints spécialisés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/tag?withUsageCount=true` | Tags avec compteur d'utilisations |
| `GET` | `/tag?search=term` | Rechercher des tags par nom |
| `GET` | `/tag/most-used` | Tags les plus utilisés |
| `GET` | `/tag/project-tags` | Tags utilisés dans les projets |
| `GET` | `/tag/post-tags` | Tags utilisés dans les posts |

## Logique métier

### Fonctionnalités principales

1. **Création de tags** : 
   - Validation du nom unique
   - Nettoyage automatique des espaces
   - Gestion des conflits

2. **Recherche et filtrage** :
   - Recherche partielle par nom (insensible à la casse)
   - Filtrage par type d'utilisation (projets/posts)
   - Tri par popularité

3. **Statistiques d'utilisation** :
   - Comptage des utilisations dans projets et posts
   - Identification des tags les plus populaires
   - Analyse de l'usage par catégorie

4. **Gestion des relations** :
   - Association avec les projets via ProjectTag
   - Association avec les posts via PostTag
   - Nettoyage automatique des relations

## DTOs (Data Transfer Objects)

### CreateTagDto
```typescript
{
  name: string;           // Nom du tag (requis, unique, max 100 chars)
  description?: string;   // Description optionnelle (max 500 chars)
}
```

### UpdateTagDto
```typescript
{
  name?: string;          // Nom du tag (optionnel, unique, max 100 chars)
  description?: string;   // Description optionnelle (max 500 chars)
}
```

### TagResponseDto
```typescript
{
  id: string;            // ID unique du tag
  name: string;          // Nom du tag
  description?: string;  // Description du tag
  createdAt: Date;       // Date de création
  updatedAt: Date;       // Date de dernière mise à jour
}
```

## Tests

Le module inclut une couverture de tests complète :

- **Tests DTOs** : Validation des champs et contraintes
- **Tests Service** : Logique métier et intégration Prisma
- **Tests Controller** : Endpoints REST et gestion d'erreurs

### Exécuter les tests

```bash
# Tests unitaires du module
npm run test -- tag

# Tests avec couverture
npm run test:cov -- tag

# Tests en mode watch
npm run test:watch -- tag
```

## Comment tester avec Swagger

### 1. Accéder à Swagger UI
```
http://localhost:3000/api
```

### 2. Créer un tag
```json
POST /tag
{
  "name": "Fintech",
  "description": "Financial technology related posts and projects"
}
```

### 3. Récupérer tous les tags
```
GET /tag
```

### 4. Rechercher des tags
```
GET /tag?search=fin
```

### 5. Tags avec statistiques d'usage
```
GET /tag?withUsageCount=true
```

### 6. Tags les plus utilisés
```
GET /tag/most-used?limit=5
```

### 7. Mettre à jour un tag
```json
PATCH /tag/{id}
{
  "description": "Updated description"
}
```

### 8. Supprimer un tag
```
DELETE /tag/{id}
```

## Architecture et patterns

### Héritage de BaseCrudServiceImpl

Le `TagService` hérite de `BaseCrudServiceImpl` qui fournit :
- Méthodes CRUD standardisées
- Gestion d'erreurs automatique
- Types TypeScript stricts
- Validation des DTOs

```typescript
export class TagService extends BaseCrudServiceImpl<
    Tag,
    CreateTagDto,
    UpdateTagDto
> {
    // Méthodes personnalisées spécifiques aux tags
}
```

### Fonctionnalités héritées du BaseCrudServiceImpl

- `create(createTagDto)` : Création d'entité
- `findAll()` : Récupération de toutes les entités
- `findByUser(userId)` : Récupération par utilisateur
- `findOne(id)` : Récupération par ID
- `findOneOrFail(id)` : Récupération avec exception si non trouvé
- `update(id, updateTagDto)` : Mise à jour
- `remove(id)` : Suppression

### Fonctionnalités spécifiques au TagService

- `createTag()` : Création avec validation d'unicité
- `updateTag()` : Mise à jour avec validation d'unicité
- `findByName()` : Recherche par nom exact
- `searchByName()` : Recherche partielle
- `findAllWithUsageCount()` : Tags avec statistiques
- `findMostUsedTags()` : Tags populaires
- `findProjectTags()` : Tags de projets
- `findPostTags()` : Tags de posts

## Gestion d'erreurs

### Types d'erreurs gérées

1. **ConflictException (409)** : Nom de tag déjà existant
2. **NotFoundException (404)** : Tag non trouvé
3. **BadRequestException (400)** : Données invalides
4. **ValidationException** : Erreurs de validation DTO

### Exemples de réponses d'erreur

```json
// Conflit de nom
{
  "statusCode": 409,
  "message": "Tag with name \"Fintech\" already exists",
  "error": "Conflict"
}

// Tag non trouvé
{
  "statusCode": 404,
  "message": "Tag not found",
  "error": "Not Found"
}
```

## Bonnes pratiques

1. **Toujours valider l'unicité** des noms de tags
2. **Nettoyer les données** (trim des espaces)
3. **Utiliser la recherche insensible** à la casse
4. **Gérer les relations** correctement
5. **Tester tous les cas d'usage** y compris les erreurs
6. **Documenter les APIs** avec Swagger

## Migration et déploiement

Si vous modifiez le modèle Prisma, n'oubliez pas de :

```bash
# Générer une nouvelle migration
npx prisma migrate dev --name update_tag_model

# Générer le client Prisma
npx prisma generate
```

## Intégration avec d'autres modules

### ProjectTag
- Association many-to-many entre Project et Tag
- Permet de catégoriser les projets par tags

### PostTag
- Association many-to-many entre Post et Tag
- Permet de catégoriser les posts par tags

### Secteur
- Complémentaire aux tags pour une classification plus fine
- Les secteurs sont plus généraux, les tags plus spécifiques

## Performance et optimisation

- **Index automatique** sur le nom pour les recherches rapides
- **Requêtes optimisées** avec orderBy et pagination
- **Cache possible** pour les tags populaires
- **Agrégation efficace** des compteurs d'usage
