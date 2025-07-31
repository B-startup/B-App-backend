# Module Post - API Documentation

Ce module fournit un CRUD complet pour les posts en utilisant le `BaseService` et des fonctionnalités avancées.

## Endpoints disponibles

### CRUD de base

#### POST `/posts`
Créer un nouveau post
- **Body**: `CreatePostDto`
- **Response**: `PostResponseDto`

#### GET `/posts`
Récupérer tous les posts
- **Query params**:
  - `withRelations` (boolean): Inclure les données relationnelles
  - `page` (number): Numéro de page pour la pagination
  - `limit` (number): Nombre d'éléments par page
- **Response**: `PostResponseDto[]` ou `PaginatedPostResponseDto`

#### GET `/posts/public`
Récupérer tous les posts publics
- **Query params**:
  - `page` (number): Numéro de page pour la pagination
  - `limit` (number): Nombre d'éléments par page
- **Response**: `PostResponseDto[]` ou `PaginatedPostResponseDto`

#### GET `/posts/user/:userId`
Récupérer tous les posts d'un utilisateur spécifique
- **Params**: `userId` (string)
- **Response**: `PostResponseDto[]`

#### GET `/posts/:id`
Récupérer un post par ID
- **Params**: `id` (string)
- **Query params**:
  - `withRelations` (boolean): Inclure les données relationnelles
- **Response**: `PostResponseDto`

#### PATCH `/posts/:id`
Mettre à jour un post
- **Params**: `id` (string)
- **Body**: `UpdatePostDto`
- **Response**: `PostResponseDto`

#### DELETE `/posts/:id`
Supprimer un post
- **Params**: `id` (string)
- **Response**: `PostResponseDto`

### Endpoints d'interaction

#### PATCH `/posts/:id/like`
Incrémenter le nombre de likes d'un post
- **Params**: `id` (string)
- **Response**: `PostResponseDto`

#### PATCH `/posts/:id/view`
Incrémenter le nombre de vues d'un post
- **Params**: `id` (string)
- **Response**: `PostResponseDto`

#### PATCH `/posts/:id/comment`
Incrémenter le nombre de commentaires d'un post
- **Params**: `id` (string)
- **Response**: `PostResponseDto`

#### PATCH `/posts/:id/share`
Incrémenter le nombre de partages d'un post
- **Params**: `id` (string)
- **Response**: `PostResponseDto`

## DTOs

### CreatePostDto
```typescript
{
  userId: string;         // ID de l'utilisateur créateur
  title: string;          // Titre du post (max 200 chars)
  content: string;        // Contenu du post (max 5000 chars)
  isPublic?: boolean;     // Visibilité du post (défaut: true)
  mlPrediction?: string;  // Prédiction ML optionnelle
}
```

### UpdatePostDto
Hérite de `CreatePostDto` avec tous les champs optionnels, plus :
```typescript
{
  nbLikes?: number;       // Nombre de likes
  nbComments?: number;    // Nombre de commentaires
  nbShares?: number;      // Nombre de partages
  nbViews?: number;       // Nombre de vues
}
```

### PostResponseDto
```typescript
{
  id: string;             // ID unique du post
  userId: string;         // ID de l'utilisateur créateur
  title: string;          // Titre du post
  content: string;        // Contenu du post
  nbLikes: number;        // Nombre de likes
  nbComments: number;     // Nombre de commentaires
  nbShares: number;       // Nombre de partages
  nbViews: number;        // Nombre de vues
  isPublic: boolean;      // Visibilité du post
  mlPrediction?: string;  // Prédiction ML
  createdAt: Date;        // Date de création
  updatedAt: Date;        // Date de dernière mise à jour
}
```

### PaginationDto (Mobile Optimized)
```typescript
{
  page?: number;          // Numéro de page (défaut: 1)
  limit?: number;         // Posts par page (défaut: 20, min: 5, max: 50)
}
```

## Fonctionnalités héritées du BaseService

Le `PostService` hérite de `BaseService` et bénéficie automatiquement de :
- Gestion d'erreurs standardisée
- Validation automatique des DTOs
- Gestion des erreurs Prisma (P2025 pour "not found")
- Types TypeScript stricts

## Fonctionnalités avancées

### Pagination (Optimisée Mobile)
La pagination est **essentielle** pour les applications mobiles :
- **Performance** : Évite le chargement de milliers de posts d'un coup
- **Économie de data** : L'utilisateur consomme moins de forfait mobile
- **UX fluide** : Scroll infini, chargement progressif
- **Batterie** : Moins de traitement = moins de consommation

Configuration optimisée mobile :
- **Défaut** : 20 posts par page (équilibre performance/UX)
- **Min** : 5 posts (pour connexions très lentes)
- **Max** : 50 posts (limite pour éviter les surcharges)

Exemples d'usage :
```
GET /posts?page=1&limit=20    // Premier chargement
GET /posts?page=2&limit=20    // Scroll infini - page suivante
GET /posts/public?page=1&limit=10  // Connexion lente
```

### Relations
Les posts peuvent être récupérés avec leurs relations :
```
GET /posts?withRelations=true
GET /posts/:id?withRelations=true
```

Inclut : user, media, likes, comments, sectors, tags

### Interactions
Des endpoints dédiés pour les interactions sociales :
- Likes, vues, commentaires, partages
- Incrémentation atomique des compteurs
- Gestion d'erreurs robuste

## Structure du module

```
post/
├── dto/
│   ├── create-post.dto.ts
│   ├── update-post.dto.ts
│   ├── post-response.dto.ts
│   ├── pagination.dto.ts
│   └── index.ts
├── post.controller.ts
├── post.service.ts
└── post.module.ts
```
