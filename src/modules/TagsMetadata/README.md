# 🏷️ TagsMetadata Modules - CRUD Complete

Ce document présente les **quatre modules CRUD** créés avec BaseService pour la gestion des métadonnées de tags et secteurs dans l'application BOM.

## 📋 Vue d'ensemble

Les modules **Tag**, **PostSector**, **PostTag** et **ProjectTag** fournissent une API complète pour la gestion des métadonnées et associations dans le système. Tous utilisent le pattern BaseService pour une cohérence architecturale.

### 🎯 Nouveau : Module ProjectTag

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
- ✅ CRUD complet avec BaseService
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
- ✅ CRUD complet avec BaseService
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
- ✅ CRUD complet avec BaseService
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

## Architecture

### Pattern BaseService

Tous les modules héritent de `BaseService<T, CreateDTO, UpdateDTO, ModelName>` qui fournit :

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

### Couverture de tests prévue
- **DTOs** : Validation des champs et contraintes
- **Services** : Logique métier et intégration Prisma
- **Controllers** : Endpoints REST et gestion d'erreurs
- **Intégration** : Tests bout en bout

## Comment tester avec Swagger

### 1. Accès à Swagger UI
```
http://localhost:3000/api
```

### 2. Scénario de test complet

#### Étape 1 : Créer des tags
```json
POST /tag
{
  "name": "Fintech",
  "description": "Financial technology"
}

POST /tag
{
  "name": "AI",
  "description": "Artificial Intelligence"
}
```

#### Étape 2 : Associer tags à un post
```json
POST /post-tag
{
  "postId": "your-post-id",
  "tagId": "fintech-tag-id"
}

POST /post-tag/bulk/your-post-id
{
  "tagIds": ["fintech-tag-id", "ai-tag-id"]
}
```

#### Étape 3 : Associer secteur à un post
```json
POST /post-sector
{
  "postId": "your-post-id",
  "sectorId": "your-sector-id"
}
```

#### Étape 4 : Consulter les statistiques
```
GET /tag/most-used
GET /post-tag/popular-tags
GET /post-sector/popular-sectors
```

#### Étape 5 : Recherche et découverte
```
GET /tag?search=fin
GET /post-tag/similar/your-post-id
GET /post-tag/post/your-post-id?withTags=true
```

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

## Déploiement

### Commandes de migration

```bash
# Générer le client Prisma (déjà fait)
npx prisma generate

# Créer une migration si modèles modifiés
npx prisma migrate dev --name add_tags_metadata_modules

# Réinitialiser la base (développement uniquement)
npx prisma migrate reset
```

### Installation et démarrage

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run start:dev

# Démarrer en mode production
npm run start:prod
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

Les trois modules **Tag**, **PostSector** et **PostTag** fournissent une base solide pour la gestion des métadonnées dans l'application BOM. Ils suivent les meilleures pratiques NestJS et utilisent le pattern BaseService pour une architecture cohérente et maintenable.
