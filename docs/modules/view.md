# Module View - Documentation

## Vue d'ensemble

Le module View gère le suivi des visualisations de vidéos par les utilisateurs dans l'application. Il permet de tracker le temps passé à regarder chaque vidéo et maintient automatiquement les compteurs de vues.

## Architecture

### Service (ViewService)
Hérite de `BaseCrudServiceImpl` et fournit des fonctionnalités spécialisées pour :
- **Création intelligente** : Évite les doublons en mettant à jour le temps passé si une vue existe déjà
- **Synchronisation automatique** : Met à jour les compteurs de vues des vidéos et des projets associés
- **Statistiques avancées** : Calcule les statistiques de visionnage par utilisateur et par vidéo

#### Méthodes principales :
- `create(data)` : Crée une vue ou met à jour le temps passé si elle existe
- `findByUser(userId)` : Récupère toutes les vues d'un utilisateur
- `findByVideo(videoId)` : Récupère toutes les vues d'une vidéo
- `countVideoViews(videoId)` : Compte le nombre total de vues pour une vidéo
- `getTotalTimeSpent(videoId)` : Calcule le temps total passé sur une vidéo
- `hasUserViewed(userId, videoId)` : Vérifie si un utilisateur a vu une vidéo
- `getUserViewingStats(userId)` : Statistiques complètes de visionnage d'un utilisateur

### Contrôleur (ViewController)
Expose une API REST complète avec :

#### Endpoints principaux :
- `POST /view` : Créer une nouvelle vue
- `GET /view` : Récupérer toutes les vues
- `GET /view/user/:userId` : Vues par utilisateur
- `GET /view/video/:videoId` : Vues par vidéo
- `GET /view/video/:videoId/count` : Compteur de vues
- `GET /view/video/:videoId/total-time` : Temps total de visionnage
- `GET /view/check/:userId/:videoId` : Vérifier si un utilisateur a vu une vidéo
- `GET /view/user/:userId/stats` : Statistiques de visionnage d'un utilisateur
- `GET /view/:id` : Récupérer une vue spécifique
- `PATCH /view/:id` : Mettre à jour une vue
- `DELETE /view/:id` : Supprimer une vue

### DTOs

#### CreateViewDto
```typescript
{
    userId: string;     // ID de l'utilisateur (requis)
    videoId: string;    // ID de la vidéo (requis)
    timespent?: number; // Temps passé en secondes (optionnel, min: 0)
}
```

#### UpdateViewDto
Hérite de `PartialType(CreateViewDto)`, permettant la mise à jour de tous les champs de façon optionnelle.

#### ViewResponseDto
Structure de réponse complète avec métadonnées temporelles.

## Fonctionnalités avancées

### Synchronisation automatique des compteurs
- **Vidéo** : Incrémente/décrémente `nbViews` directement
- **Projet** : Utilise le `CounterService` pour synchroniser le compteur de vues du projet associé

### Gestion intelligente des doublons
- Vérifie l'existence d'une vue pour le couple `(userId, videoId)`
- Si elle existe : additionne le temps passé
- Sinon : crée une nouvelle vue et incrémente les compteurs

### Statistiques complètes
- Nombre total de vues par utilisateur
- Temps total passé à regarder des vidéos
- Nombre de vidéos uniques vues
- Agrégations par vidéo ou par utilisateur

## Relations avec d'autres modules

### Dépendances :
- **PrismaService** : Accès aux données
- **CounterService** : Synchronisation des compteurs
- **Video** : Association avec les vidéos
- **Project** : Mise à jour des compteurs de projet via les vidéos
- **User** : Association avec les utilisateurs

### Schema Prisma :
```prisma
model View {
  id        String   @id @default(uuid())
  userId    String
  videoId   String
  timespent Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  video Video @relation(fields: [videoId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([videoId])
  @@map("views")
}
```

## Tests

### Couverture complète (70 tests) :
- **Tests unitaires du service** (19 tests)
- **Tests unitaires du contrôleur** (12 tests)  
- **Tests de validation des DTOs** (20 tests)
- **Tests d'intégration de l'API** (19 tests)

### Scenarios testés :
- ✅ Création et mise à jour de vues
- ✅ Gestion des doublons
- ✅ Synchronisation des compteurs
- ✅ Statistiques et agrégations
- ✅ Validation des données d'entrée
- ✅ Gestion des erreurs (404, 400)
- ✅ Endpoints REST complets

## Installation et configuration

Le module est prêt à l'emploi et s'intègre automatiquement dans l'architecture NestJS existante avec :
- Injection de dépendances configurée
- Factory pattern pour le CounterService
- Export du service pour réutilisation
- Documentation Swagger complète

## Usage exemple

```typescript
// Créer une vue
const view = await viewService.create({
    userId: 'user-123',
    videoId: 'video-456',
    timespent: 120
});

// Obtenir les statistiques d'un utilisateur
const stats = await viewService.getUserViewingStats('user-123');
// => { totalViews: 5, totalTimeSpent: 600, uniqueVideos: 3 }

// Vérifier si un utilisateur a vu une vidéo
const hasViewed = await viewService.hasUserViewed('user-123', 'video-456');
// => { hasViewed: true }
```
