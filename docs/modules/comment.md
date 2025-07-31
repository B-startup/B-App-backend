# Module Comment

Le module Comment gère toutes les fonctionnalités liées aux commentaires dans l'application BOM.

## Description

Ce module permet aux utilisateurs de :
- Créer des commentaires sur des projets et des posts
- Répondre à des commentaires existants (système hiérarchique)
- Modifier et supprimer leurs commentaires
- Liker/unliker des commentaires
- Consulter les statistiques des commentaires

## Architecture

Le module utilise l'architecture `BaseCrudServiceImpl` qui fournit :
- Opérations CRUD de base (Create, Read, Update, Delete)
- Méthodes de recherche et pagination
- Gestion des erreurs standardisée

## Modèle de données

```typescript
model Comment {
  id        String   @id @default(uuid())
  userId    String
  projectId String?
  postId    String?
  parentId  String?  // Pour les réponses
  content   String
  nbLikes   Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## DTOs

### CreateCommentDto
- `userId` (required): ID de l'utilisateur qui écrit le commentaire
- `projectId` (optional): ID du projet associé
- `postId` (optional): ID du post associé
- `parentId` (optional): ID du commentaire parent pour les réponses
- `content` (required): Contenu du commentaire

### UpdateCommentDto
- Tous les champs de CreateCommentDto sauf `userId` (optionnels)

## Endpoints API

### Commentaires de base
- `POST /comments` - Créer un commentaire
- `GET /comments` - Récupérer tous les commentaires
- `GET /comments/:id` - Récupérer un commentaire par ID
- `PATCH /comments/:id` - Modifier un commentaire
- `DELETE /comments/:id` - Supprimer un commentaire

### Commentaires par contexte
- `GET /comments/user/:userId` - Commentaires d'un utilisateur
- `GET /comments/project/:projectId` - Commentaires d'un projet
- `GET /comments/post/:postId` - Commentaires d'un post
- `GET /comments/replies/:parentId` - Réponses à un commentaire

### Statistiques
- `GET /comments/project/:projectId/stats` - Statistiques des commentaires d'un projet
- `GET /comments/post/:postId/stats` - Statistiques des commentaires d'un post

### Gestion des likes
- `PATCH /comments/:id/increment-likes` - Incrémenter les likes
- `PATCH /comments/:id/decrement-likes` - Décrémenter les likes

### Recherche et pagination
- `GET /comments/search?keyword=...` - Recherche par mot-clé
- `GET /comments/paginate?skip=0&take=10` - Pagination

## Méthodes spécialisées

### `findByProject(projectId: string)`
Récupère tous les commentaires d'un projet avec les informations des utilisateurs et les réponses.

### `findByPost(postId: string)`
Récupère tous les commentaires d'un post avec les informations des utilisateurs et les réponses.

### `findReplies(parentId: string)`
Récupère toutes les réponses à un commentaire spécifique.

### `incrementLikes(commentId: string)` / `decrementLikes(commentId: string)`
Gère le compteur de likes des commentaires.

### `getProjectCommentStats(projectId: string)` / `getPostCommentStats(postId: string)`
Retourne des statistiques détaillées sur les commentaires.

## Relations

Le module Comment est lié à :
- **User** : Auteur du commentaire
- **Project** : Projet commenté (optionnel)
- **Post** : Post commenté (optionnel)
- **Comment** : Commentaire parent (pour les réponses)
- **Like** : Likes reçus par le commentaire

## Sécurité

- Validation des UUIDs pour tous les paramètres d'ID
- Validation du contenu des commentaires
- Contrôle d'accès pour la modification/suppression

## Exemples d'utilisation

### Créer un commentaire sur un projet
```typescript
POST /comments
{
  "userId": "uuid-user",
  "projectId": "uuid-project",
  "content": "Excellent projet !"
}
```

### Répondre à un commentaire
```typescript
POST /comments
{
  "userId": "uuid-user",
  "parentId": "uuid-comment",
  "content": "Je suis d'accord avec vous !"
}
```

### Rechercher des commentaires
```typescript
GET /comments/search?keyword=excellent
```
