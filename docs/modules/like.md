# Module Like

Le module Like gère toutes les fonctionnalités liées aux likes dans l'application BOM avec synchronisation automatique des compteurs.

## Description

Ce module permet aux utilisateurs de :
- Liker/unliker des projets, posts et commentaires
- Gérer les doublons automatiquement
- Synchroniser automatiquement les compteurs dans les entités parentes
- Consulter les statistiques des likes
- Analyser l'activité de like des utilisateurs

## Architecture

Le module utilise l'architecture `BaseCrudServiceImpl` avec le système `CounterService` qui :
- Met à jour automatiquement les compteurs `nbLikes` dans Project, Post et Comment
- Prévient les incohérences entre les likes et les compteurs
- Fournit des méthodes de recalcul pour la maintenance
- Opérations CRUD de base (Create, Read, Update, Delete)
- Méthodes de recherche et pagination
- Gestion des erreurs standardisée
- Fonctionnalités spécialisées pour les likes

## Modèle de données

```typescript
model Like {
  id        String   @id @default(uuid())
  userId    String
  projectId String?
  postId    String?
  commentId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Synchronisation automatique

### Lors de la création d'un like
```typescript
// Crée le like
const like = await likeService.create(createLikeDto);

// Met à jour automatiquement les compteurs
if (projectId) project.nbLikes += 1
if (postId) post.nbLikes += 1  
if (commentId) comment.nbLikes += 1
```

### Lors de la suppression d'un like
```typescript
// Supprime le like
const deletedLike = await likeService.remove(likeId);

// Met à jour automatiquement les compteurs
if (projectId) project.nbLikes -= 1
if (postId) post.nbLikes -= 1
if (commentId) comment.nbLikes -= 1
```
  updatedAt DateTime @updatedAt
}
```

## DTOs

### CreateLikeDto
- `userId` (required): ID de l'utilisateur qui like
- `projectId` (optional): ID du projet liké
- `postId` (optional): ID du post liké
- `commentId` (optional): ID du commentaire liké

### UpdateLikeDto
- Tous les champs de CreateLikeDto sauf `userId` (optionnels)

## Endpoints API

### Likes de base
- `POST /likes` - Créer un like
- `POST /likes/toggle` - Toggle like (like/unlike)
- `GET /likes` - Récupérer tous les likes
- `GET /likes/:id` - Récupérer un like par ID
- `PATCH /likes/:id` - Modifier un like
- `DELETE /likes/:id` - Supprimer un like

### Likes par contexte
- `GET /likes/user/:userId` - Likes d'un utilisateur
- `GET /likes/project/:projectId` - Likes d'un projet
- `GET /likes/post/:postId` - Likes d'un post
- `GET /likes/comment/:commentId` - Likes d'un commentaire

### Compteurs
- `GET /likes/project/:projectId/count` - Nombre de likes d'un projet
- `GET /likes/post/:postId/count` - Nombre de likes d'un post
- `GET /likes/comment/:commentId/count` - Nombre de likes d'un commentaire

### Vérifications
- `GET /likes/check/:userId/:targetId?type=project|post|comment` - Vérifier si l'utilisateur a liké

### Statistiques
- `GET /likes/user/:userId/activity` - Activité de like d'un utilisateur

### Pagination
- `GET /likes/paginate?skip=0&take=10` - Pagination

## Méthodes spécialisées

### `create(data: CreateLikeDto)`
Crée un like avec vérification des doublons. Lance une `ConflictException` si l'utilisateur a déjà liké l'élément.

### `toggleLike(data: CreateLikeDto)`
Fonction intelligente qui :
- Crée un like si l'utilisateur n'a pas encore liké
- Supprime le like si l'utilisateur a déjà liké
- Retourne l'état final et le like créé le cas échéant

### `findByProject(projectId: string)` / `findByPost(postId: string)` / `findByComment(commentId: string)`
Récupèrent tous les likes pour un élément spécifique avec les informations des utilisateurs.

### `countProjectLikes(projectId: string)` etc.
Comptent le nombre de likes pour différents types d'éléments.

### `hasUserLiked(userId: string, targetId: string, targetType: string)`
Vérifie si un utilisateur a liké un élément spécifique.

### `getUserLikeActivity(userId: string)`
Retourne les statistiques d'activité de like d'un utilisateur.

## Relations

Le module Like est lié à :
- **User** : Utilisateur qui a liké
- **Project** : Projet liké (optionnel)
- **Post** : Post liké (optionnel)
- **Comment** : Commentaire liké (optionnel)

## Logique métier

### Prévention des doublons
Le système empêche automatiquement qu'un utilisateur like plusieurs fois le même élément.

### Toggle intelligent
La fonction `toggleLike` permet une interaction fluide côté frontend :
- Un clic like si pas encore liké
- Un clic unlike si déjà liké

### Compteurs en temps réel
Les compteurs de likes sont mis à jour en temps réel et peuvent être interrogés séparément pour les performances.

## Sécurité

- Validation des UUIDs pour tous les paramètres d'ID
- Prévention des likes en double
- Contrôle d'accès pour la suppression

## Exemples d'utilisation

### Liker un projet
```typescript
POST /likes
{
  "userId": "uuid-user",
  "projectId": "uuid-project"
}
```

### Toggle like sur un post
```typescript
POST /likes/toggle
{
  "userId": "uuid-user",
  "postId": "uuid-post"
}
```

### Vérifier si un utilisateur a liké un commentaire
```typescript
GET /likes/check/uuid-user/uuid-comment?type=comment
```

### Obtenir l'activité de like d'un utilisateur
```typescript
GET /likes/user/uuid-user/activity
```

## Réponses

### LikeToggleResponse
```typescript
{
  "liked": true,
  "like": {
    "id": "uuid",
    "userId": "uuid-user",
    "projectId": "uuid-project",
    "createdAt": "2025-01-31T...",
    "updatedAt": "2025-01-31T..."
  }
}
```

### UserLikeActivity
```typescript
{
  "totalLikes": 45,
  "projectLikes": 12,
  "postLikes": 28,
  "commentLikes": 5
}
```
