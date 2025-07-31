# Post Sector Module

Le module **PostSector** gère les associations many-to-many entre les posts et les secteurs dans l'application BOM. Il permet de catégoriser les posts par secteur d'activité pour faciliter la recherche et la découverte.

## Structure du module

```
post-sector/
├── dto/
│   ├── create-post-sector.dto.ts    # DTO pour créer une association
│   └── update-post-sector.dto.ts    # DTO pour mettre à jour une association
├── __tests__/
│   ├── post-sector.service.spec.ts   # Tests du service
│   └── post-sector.controller.spec.ts # Tests du contrôleur
├── post-sector.controller.ts        # Contrôleur REST API
├── post-sector.service.ts          # Service métier
└── post-sector.module.ts           # Module NestJS
```

## Modèle de données (Prisma)

```prisma
model PostSector {
  id        String   @id @default(uuid())
  postId    String
  sectorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  sector Sector @relation(fields: [sectorId], references: [id], onDelete: Cascade)

  @@unique([postId, sectorId])
}
```

### Contraintes importantes :
- **Contrainte unique** : Un post ne peut être associé qu'une seule fois à un secteur donné
- **Suppression en cascade** : Si un post ou un secteur est supprimé, toutes les associations sont automatiquement supprimées
- **Validation d'existence** : Vérification que le post et le secteur existent avant association

## API Endpoints

### Associations de base
```http
POST   /post-sector                        # Créer une association
DELETE /post-sector                        # Supprimer une association
```

### Recherche par entité
```http
GET    /post-sector/post/:postId           # Secteurs d'un post
GET    /post-sector/sector/:sectorId       # Posts d'un secteur
```

### Statistiques
```http
GET    /post-sector/popular-sectors        # Secteurs populaires
GET    /post-sector/count/post/:postId     # Compter secteurs d'un post
GET    /post-sector/count/sector/:sectorId # Compter posts d'un secteur
```

## Fonctionnalités principales

### 1. **Gestion des Associations**
- ✅ Création d'associations post-secteur
- ✅ Validation d'unicité (éviter les doublons)
- ✅ Vérification d'existence des entités liées
- ✅ Suppression d'associations spécifiques

### 2. **Recherche et Filtrage**
- ✅ Récupération des secteurs d'un post
- ✅ Récupération des posts d'un secteur
- ✅ Inclusion optionnelle des détails liés

### 3. **Analyse et Statistiques**
- ✅ Secteurs populaires (les plus utilisés)
- ✅ Compteurs d'associations
- ✅ Analyse de tendances sectorielles

## DTOs (Data Transfer Objects)

### CreatePostSectorDto
```typescript
{
  postId: string;    // ID du post (requis)
  sectorId: string;  // ID du secteur (requis)
}
```

### UpdatePostSectorDto
```typescript
{
  postId?: string;   // ID du post (optionnel)
  sectorId?: string; // ID du secteur (optionnel)
}
```

## Architecture et patterns

### Héritage de BaseCrudServiceImpl

Le `PostSectorService` hérite de `BaseCrudServiceImpl` qui fournit :
- Méthodes CRUD standardisées
- Gestion d'erreurs automatique
- Types TypeScript stricts
- Validation des DTOs

```typescript
export class PostSectorService extends BaseCrudServiceImpl<
    PostSector,
    CreatePostSectorDto,
    UpdatePostSectorDto
> {
    // Méthodes personnalisées spécifiques aux associations post-secteur
}
```

## Gestion d'erreurs

### Types d'erreurs gérées

1. **ConflictException (409)** : Association déjà existante
2. **NotFoundException (404)** : Post, secteur ou association non trouvé
3. **BadRequestException (400)** : Données invalides
4. **ValidationException** : Erreurs de validation DTO

## Cas d'usage

### 1. **Catégorisation de posts**
- Associer les posts par secteur (Fintech, HealthTech, EdTech)
- Identifier les domaines d'activité
- Faciliter la recherche thématique

### 2. **Découverte de contenu**
- Suggérer des posts par secteur d'intérêt
- Créer des fils thématiques
- Analyser les tendances sectorielles

### 3. **Analytics**
- Identifier les secteurs populaires
- Analyser l'engagement par secteur
- Mesurer l'activité sectorielle

## Intégration avec d'autres modules

### Dépendances
- **Post Module** : Validation des posts
- **Sector Module** : Gestion des secteurs
- **BaseCrudServiceImpl** : Héritage des méthodes CRUD

### Relations
```typescript
// Avec le module Post
Post (1) ←→ (N) PostSector

// Avec le module Sector
Sector (1) ←→ (N) PostSector
```

## Performance et optimisation

- **Index automatique** sur `(postId, sectorId)` pour l'unicité
- **Requêtes optimisées** avec include/select
- **Limitation des résultats** pour éviter la surcharge
- **Cache possible** pour les secteurs populaires
