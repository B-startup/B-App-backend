# Discussion & Message Management API

## Vue d'ensemble

Ce module fournit une API complète pour la gestion des discussions et des messages entre utilisateurs. Il supporte deux types de discussions :
- **Discussions privées** : Conversations directes entre deux utilisateurs
- **Discussions projet** : Conversations liées à un projet spécifique

## Architecture

### Structure des modules
```
src/modules/InteractionSocial/
├── discussion/
│   ├── dto/
│   │   ├── create-discussion.dto.ts
│   │   ├── update-discussion.dto.ts
│   │   ├── discussion-response.dto.ts
│   │   └── index.ts
│   ├── _test_/
│   │   ├── discussion.service.spec.ts
│   │   ├── discussion.controller.spec.ts
│   │   └── discussion.module.spec.ts
│   ├── discussion.controller.ts
│   ├── discussion.service.ts
│   └── discussion.module.ts
└── message/
    ├── dto/
    │   ├── create-message.dto.ts
    │   ├── update-message.dto.ts
    │   ├── message-response.dto.ts
    │   └── index.ts
    ├── _test_/
    │   ├── message.service.spec.ts
    │   ├── message.controller.spec.ts
    │   └── message.module.spec.ts
    ├── message.controller.ts
    ├── message.service.ts
    └── message.module.ts
```

### Modèles de données

#### Discussion
```prisma
model Discussion {
  id         String          @id @default(uuid())
  senderId   String          // Utilisateur qui initie la discussion
  receiverId String          // Utilisateur qui reçoit la discussion
  type       DiscussionType  // PRIVATE ou PROJECT
  projectId  String?         // ID du projet (optionnel)
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt
  
  // Relations
  sender     User            @relation("SentDiscussions")
  receiver   User            @relation("ReceivedDiscussions")
  project    Project?        @relation
  messages   Message[]
}
```

#### Message
```prisma
model Message {
  id           String      @id @default(uuid())
  discussionId String      // ID de la discussion
  senderId     String      // Utilisateur qui envoie le message
  content      String      // Contenu du message (max 2000 caractères)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  // Relations
  discussion   Discussion  @relation
  sender       User        @relation
}
```

## API Endpoints

### Discussion Management

#### Créer une discussion
```http
POST /api/v1/discussion
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "uuid",
  "type": "PRIVATE" | "PROJECT",
  "projectId": "uuid" // optionnel, requis pour type PROJECT
}
```

#### Obtenir mes discussions
```http
GET /api/v1/discussion/my-discussions
Authorization: Bearer <token>
```

#### Obtenir une discussion spécifique
```http
GET /api/v1/discussion/{id}
Authorization: Bearer <token>
```

#### Rechercher des discussions
```http
GET /api/v1/discussion/search?q=recherche
Authorization: Bearer <token>
```

#### Obtenir les discussions d'un projet
```http
GET /api/v1/discussion/project/{projectId}
Authorization: Bearer <token>
```

#### Supprimer une discussion
```http
DELETE /api/v1/discussion/{id}
Authorization: Bearer <token>
```

### Message Management

#### Envoyer un message
```http
POST /api/v1/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "discussionId": "uuid",
  "content": "Contenu du message"
}
```

#### Obtenir les messages d'une discussion
```http
GET /api/v1/message/discussion/{discussionId}?page=1&limit=50
Authorization: Bearer <token>
```

#### Obtenir un message spécifique
```http
GET /api/v1/message/{id}
Authorization: Bearer <token>
```

#### Modifier un message
```http
PATCH /api/v1/message/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Nouveau contenu"
}
```

#### Supprimer un message
```http
DELETE /api/v1/message/{id}
Authorization: Bearer <token>
```

#### Rechercher des messages
```http
GET /api/v1/message/discussion/{discussionId}/search?q=recherche
Authorization: Bearer <token>
```

#### Obtenir mes messages récents
```http
GET /api/v1/message/recent?limit=20
Authorization: Bearer <token>
```

## Règles métier

### Discussions
- Un utilisateur ne peut pas créer une discussion avec lui-même
- Une seule discussion peut exister entre deux utilisateurs pour un même type et projet
- Pour les discussions de type PROJECT, le projet doit exister
- Seul l'initiateur de la discussion peut la supprimer
- Les participants peuvent consulter la discussion et ses messages

### Messages
- Seuls les participants d'une discussion peuvent envoyer des messages
- Le contenu est limité à 2000 caractères
- Seul l'expéditeur peut modifier ou supprimer ses messages
- Les messages sont ordonnés par date de création (plus récent en premier)

## Sécurité

### Authentification
- Tous les endpoints nécessitent une authentification via token JWT
- Utilisation du décorateur `@TokenProtected()` pour la vérification des tokens

### Autorisations
- **Discussions** : Seuls les participants peuvent accéder aux données
- **Messages** : Seuls les participants peuvent lire, seul l'expéditeur peut modifier/supprimer

## Fonctionnalités avancées

### Pagination
- Les messages supportent la pagination (page, limit)
- Métadonnées de pagination incluses dans la réponse

### Recherche
- Recherche de discussions par nom d'utilisateur ou titre de projet
- Recherche de messages par contenu (insensible à la casse)

### Métadonnées enrichies
- Informations sur les utilisateurs (nom, email, photo de profil)
- Informations sur les projets pour les discussions projet
- Dernier message et nombre total de messages par discussion

## Tests

### Couverture des tests
- **Services** : Logique métier, cas d'erreur, validations
- **Controllers** : Endpoints, autorisations, formats de réponse
- **Modules** : Configuration, injection de dépendances

### Types de tests
- Tests unitaires pour chaque service et controller
- Tests d'intégration pour les modules
- Mocking des dépendances (PrismaService, TokenBlacklistGuard)

## Utilisation avec Flutter

### Exemple d'appel API
```dart
// Créer une discussion
final response = await http.post(
  Uri.parse('$baseUrl/api/v1/discussion'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'receiverId': userId,
    'type': 'PRIVATE',
  }),
);

// Envoyer un message
final messageResponse = await http.post(
  Uri.parse('$baseUrl/api/v1/message'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'discussionId': discussionId,
    'content': messageContent,
  }),
);
```

## Monitoring et Logs

### Logging
- Erreurs d'authentification et d'autorisation
- Tentatives d'accès non autorisé
- Créations/suppressions de discussions et messages

### Métriques suggérées
- Nombre de discussions créées par jour
- Nombre de messages envoyés par discussion
- Utilisateurs les plus actifs
- Temps de réponse des endpoints

## Migration et déploiement

### Base de données
- Schéma Prisma fourni et testé
- Index optimisés pour les requêtes fréquentes
- Relations avec cascade pour l'intégrité référentielle

### Variables d'environnement
- `DATABASE_URL` : URL de connexion PostgreSQL
- `JWT_SECRET` : Secret pour la validation des tokens
- `BASE_URL` : URL de base pour les liens

## Roadmap

### Fonctionnalités futures possibles
- Notifications en temps réel (WebSocket)
- Pièces jointes dans les messages
- Messages vocaux
- Indicateurs de lecture
- Groupes de discussion
- Modération de contenu
