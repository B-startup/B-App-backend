# 🏷️ TagsMetadata Modules - CRUD Complete

Ce document présente les **quatre modules CRUD** créés avec BaseCrudServiceImpl pour la gestion des métadonnées de tags et secteurs dans l'application BOM.

## 📋 Vue d'ensemble

Les modules **Tag**, **PostSector**, **PostTag** et **ProjectTag** fournissent une API complète pour la gestion des métadonnées et associations dans le système. Tous utilisent le pattern BaseCrudServiceImpl pour une cohérence architecturale.

### 🎯 Module ProjectTag

Le **ProjectTag Module** a été ajouté avec des fonctionnalités avancées :
- ✅ **29 tests** complets (15 service + 14 controller)
- 🚀 **Recommandations** de projets similaires
- 📊 **Statistiques** et analytics
- 🔗 **9 endpoints** API spécialisés
- 📚 **Documentation complète** disponible

## Modules créés

### 1. Tag Module (`/tag`)

**Objectif** : Gestion des tags génériques pour catégoriser projets et posts.

**Fonctionnalités** :
- ✅ CRUD complet avec BaseCrudServiceImpl
- ✅ Validation d'unicité des noms
- ✅ Recherche par nom (partielle, insensible à la casse)
- ✅ Statistiques d'utilisation (projets + posts)
- ✅ Tags populaires et tri par usage
- ✅ Filtrage par type d'utilisation

**Endpoints** :
```
POST   /tag                      # Créer un tag
GET    /tag                      # Lister tous les tags
GET    /tag?search=term          # Rechercher des tags
GET    /tag?withUsageCount=true  # Tags avec compteurs
GET    /tag/most-used            # Tags populaires
GET    /tag/project-tags         # Tags utilisés dans projets
GET    /tag/post-tags            # Tags utilisés dans posts
GET    /tag/:id                  # Récupérer un tag
PATCH  /tag/:id                  # Mettre à jour un tag
DELETE /tag/:id                  # Supprimer un tag
```

### 2. PostSector Module (`/post-sector`)

**Objectif** : Gestion des associations many-to-many entre Posts et Secteurs.

**Fonctionnalités** :
- ✅ CRUD complet avec BaseCrudServiceImpl
- ✅ Associations post-secteur avec validation d'unicité
- ✅ Vérification d'existence des entités liées
- ✅ Recherche par post ou par secteur
- ✅ Inclusion des détails relationnels
- ✅ Compteurs et statistiques
- ✅ Secteurs populaires par nombre de posts

**Endpoints** :
```
POST   /post-sector                        # Créer une association
GET    /post-sector                        # Lister toutes les associations
GET    /post-sector/popular-sectors        # Secteurs populaires
GET    /post-sector/post/:postId           # Secteurs d'un post
GET    /post-sector/sector/:sectorId       # Posts d'un secteur
GET    /post-sector/count/post/:postId     # Compter secteurs d'un post
GET    /post-sector/count/sector/:sectorId # Compter posts d'un secteur
GET    /post-sector/:id                    # Récupérer une association
PATCH  /post-sector/:id                    # Mettre à jour une association
DELETE /post-sector/:id                    # Supprimer une association
DELETE /post-sector/association/:postId/:sectorId # Supprimer association spécifique
```

### 3. PostTag Module (`/post-tag`)

**Objectif** : Gestion des associations many-to-many entre Posts et Tags.

**Fonctionnalités** :
- ✅ CRUD complet avec BaseCrudServiceImpl
- ✅ Associations post-tag avec validation d'unicité
- ✅ Ajout multiple de tags à un post
- ✅ Recherche de posts similaires basée sur tags partagés
- ✅ Tags populaires par nombre de posts
- ✅ Compteurs et statistiques avancées

**Endpoints** :
```
POST   /post-tag                          # Créer une association
POST   /post-tag/bulk/:postId             # Ajouter plusieurs tags à un post
GET    /post-tag                          # Lister toutes les associations
GET    /post-tag/popular-tags             # Tags populaires
GET    /post-tag/post/:postId             # Tags d'un post
GET    /post-tag/tag/:tagId               # Posts d'un tag
GET    /post-tag/similar/:postId          # Posts similaires
GET    /post-tag/count/post/:postId       # Compter tags d'un post
GET    /post-tag/count/tag/:tagId         # Compter posts d'un tag
GET    /post-tag/:id                      # Récupérer une association
PATCH  /post-tag/:id                      # Mettre à jour une association
DELETE /post-tag/:id                      # Supprimer une association
DELETE /post-tag/association/:postId/:tagId # Supprimer association spécifique
```

### 4. ProjectTag Module (`/project-tag`)

**Objectif** : Gestion des associations many-to-many entre Projects et Tags.

**Fonctionnalités** :
- ✅ CRUD complet avec BaseCrudServiceImpl
- ✅ Associations projet-tag avec validation d'unicité
- ✅ Ajout multiple de tags à un projet
- ✅ Recherche de projets similaires basée sur tags partagés
- ✅ Tags populaires par nombre de projets
- ✅ Compteurs et statistiques avancées
- ✅ Recommandations intelligentes

**Endpoints** :
```
POST   /project-tag                       # Créer une association
POST   /project-tag/multiple             # Ajouter plusieurs tags à un projet
GET    /project-tag                      # Lister toutes les associations
GET    /project-tag/popular              # Tags populaires
GET    /project-tag/project/:id          # Tags d'un projet
GET    /project-tag/tag/:id              # Projets d'un tag
GET    /project-tag/similar/:id          # Projets similaires
GET    /project-tag/count/project/:id    # Compter tags d'un projet
GET    /project-tag/count/tag/:id        # Compter projets d'un tag
DELETE /project-tag                      # Supprimer une association
```

## Architecture

### Pattern BaseCrudServiceImpl

Tous les modules héritent de `BaseCrudServiceImpl<T, CreateDTO, UpdateDTO>` qui fournit :

```typescript
// Méthodes CRUD automatiques
- create(createDto): Promise<T>
- findAll(): Promise<T[]>
- findByUser(userId): Promise<T[]>
- findOne(id): Promise<T>
- findOneOrFail(id): Promise<T>
- update(id, updateDto): Promise<T>
- remove(id): Promise<T>
```

### Fonctionnalités ajoutées

Chaque service ajoute des méthodes spécialisées :

**TagService** :
- `createTag()` : Création avec validation d'unicité
- `searchByName()` : Recherche partielle
- `findMostUsedTags()` : Popularité
- `findAllWithUsageCount()` : Statistiques

**PostSectorService** :
- `createAssociation()` : Association avec validation
- `findByPostWithSectors()` : Données relationnelles
- `findPopularSectors()` : Secteurs populaires
- `removeAssociation()` : Suppression spécifique

**PostTagService** :
- `addMultipleTagsToPost()` : Ajout en masse
- `findSimilarPosts()` : Recommandations
- `findPopularTags()` : Tags populaires
- `findByTagWithPosts()` : Données relationnelles

**ProjectTagService** :
- `createAssociation()` : Association avec validation
- `addMultipleTagsToProject()` : Ajout en masse
- `findSimilarProjects()` : Recommandations
- `findPopularTags()` : Tags populaires
- `findByProjectWithTags()` : Données relationnelles

## Modèles de données

### Tag
```prisma
model Tag {
  id          String @id @default(uuid())
  name        String @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  projectTags ProjectTag[]
  PostTag     PostTag[]
}
```

### PostSector
```prisma
model PostSector {
  id        String @id @default(uuid())
  postId    String
  sectorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  sector Sector @relation(fields: [sectorId], references: [id], onDelete: Cascade)
  
  @@unique([postId, sectorId])
}
```

### PostTag
```prisma
model PostTag {
  id        String @id @default(uuid())
  postId    String
  tagId     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([postId, tagId])
}
```

### ProjectTag
```prisma
model ProjectTag {
  id        String @id @default(uuid())
  projectId String
  tagId     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag     Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([projectId, tagId])
}
```

## Tests

### Structure des tests
```
module/
├── __tests__/
│   ├── create-dto.spec.ts       # Tests de validation DTO
│   ├── update-dto.spec.ts       # Tests de validation DTO
│   ├── service.spec.ts          # Tests logique métier
│   └── controller.spec.ts       # Tests endpoints REST
```

### Couverture de tests
- **DTOs** : Validation des champs et contraintes
- **Services** : Logique métier et intégration Prisma
- **Controllers** : Endpoints REST et gestion d'erreurs
- **Intégration** : Tests bout en bout

## Gestion d'erreurs

### Types d'erreurs gérées

| Code | Type | Description |
|------|------|-------------|
| 400 | BadRequest | Données invalides |
| 404 | NotFound | Entité non trouvée |
| 409 | Conflict | Contrainte d'unicité violée |

### Exemples de réponses

```json
// Conflit d'unicité
{
  "statusCode": 409,
  "message": "This post is already associated with this tag",
  "error": "Conflict"
}

// Entité non trouvée
{
  "statusCode": 404,
  "message": "Tag not found",
  "error": "Not Found"
}
```

## Bonnes pratiques

### Validation
- ✅ Validation DTO avec class-validator
- ✅ Contraintes de base de données (unique, foreign keys)
- ✅ Vérification d'existence avant associations

### Performance
- ✅ Index automatiques sur clés étrangères
- ✅ Requêtes optimisées avec include/select
- ✅ Pagination pour les grandes listes

### Sécurité
- ✅ Validation stricte des UUIDs
- ✅ Nettoyage des données (trim)
- ✅ Gestion des erreurs sans fuite d'informations

### Documentation
- ✅ Swagger complet avec exemples
- ✅ DTOs documentés
- ✅ README détaillés par module

## Conclusion

Les quatre modules **Tag**, **PostSector**, **PostTag** et **ProjectTag** fournissent une base solide pour la gestion des métadonnées dans l'application BOM. Ils suivent les meilleures pratiques NestJS et utilisent le pattern BaseCrudServiceImpl pour une architecture cohérente et maintenable.
