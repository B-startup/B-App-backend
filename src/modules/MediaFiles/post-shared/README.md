# PostShared Module

Le module **PostShared** gère le système de partage de publications dans l'application. Il permet aux utilisateurs de partager des publications existantes avec une description optionnelle et maintient automatiquement un compteur de partages.

## Structure du module

```
post-shared/
├── dto/
│   ├── create-post-shared.dto.ts    # DTO pour créer un partage
│   └── update-post-shared.dto.ts    # DTO pour mettre à jour un partage
├── __tests__/
│   ├── create-post-shared.dto.spec.ts
│   ├── update-post-shared.dto.spec.ts
│   ├── post-shared.service.spec.ts
│   ├── post-shared.controller.spec.ts
│   └── post-shared.integration.spec.ts
├── post-shared.controller.ts        # Contrôleur REST API
├── post-shared.service.ts          # Service métier
└── post-shared.module.ts           # Module NestJS
```

## Modèle de données (Prisma)

```prisma
model PostShared {
  id          String   @id @default(cuid())
  postId      String
  userId      String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
}
```

### Contraintes importantes :
- **Contrainte unique** : Un utilisateur ne peut partager une publication qu'une seule fois (userId + postId unique)
- **Suppression en cascade** : Si une publication ou un utilisateur est supprimé, tous les partages associés sont automatiquement supprimés
- **Compteur automatique** : Le champ `nbShares` de la publication est automatiquement mis à jour

## API Endpoints

### 1. Partager une publication
```http
POST /post-shared
```

**Body (JSON):**
```json
{
  "postId": "cld1234567890",
  "userId": "cld0987654321",
  "description": "Regardez cette publication intéressante !" // optionnel
}
```

**Réponse (201):**
```json
{
  "id": "clp1234567890",
  "postId": "cld1234567890",
  "userId": "cld0987654321",
  "description": "Regardez cette publication intéressante !",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Erreurs possibles:**
- `409 Conflict` : L'utilisateur a déjà partagé cette publication
- `404 Not Found` : Publication ou utilisateur inexistant

---

### 2. Obtenir tous les partages
```http
GET /post-shared
```

**Paramètres de requête optionnels:**
- `skip` : Nombre d'éléments à ignorer (pagination)
- `take` : Nombre d'éléments à retourner (limite)

**Réponse (200):**
```json
[
  {
    "id": "clp1234567890",
    "postId": "cld1234567890",
    "userId": "cld0987654321",
    "description": "Regardez cette publication !",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### 3. Obtenir les partages d'une publication
```http
GET /post-shared/post/{postId}
```

**Paramètres de requête optionnels:**
- `withUsers=true` : Inclure les informations des utilisateurs qui ont partagé
- `skip` : Pagination
- `take` : Limite

**Réponse (200) avec `withUsers=true`:**
```json
[
  {
    "id": "clp1234567890",
    "postId": "cld1234567890",
    "userId": "cld0987654321",
    "description": "Regardez cette publication !",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "user": {
      "id": "cld0987654321",
      "name": "Jean Dupont",
      "profilePicture": "https://example.com/profile.jpg"
    }
  }
]
```

---

### 4. Obtenir les partages d'un utilisateur
```http
GET /post-shared/user/{userId}
```

**Paramètres de requête optionnels:**
- `withPosts=true` : Inclure les détails des publications partagées
- `skip` : Pagination
- `take` : Limite

**Réponse (200) avec `withPosts=true`:**
```json
[
  {
    "id": "clp1234567890",
    "postId": "cld1234567890",
    "userId": "cld0987654321",
    "description": "Regardez cette publication !",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "post": {
      "id": "cld1234567890",
      "title": "Titre de la publication",
      "content": "Contenu de la publication...",
      "createdAt": "2024-01-10T09:00:00.000Z",
      "user": {
        "id": "cld1111111111",
        "name": "Marie Martin",
        "profilePicture": null
      }
    }
  }
]
```

---

### 5. Compter les partages d'une publication
```http
GET /post-shared/post/{postId}/count
```

**Réponse (200):**
```json
{
  "count": 42
}
```

---

### 6. Compter les partages d'un utilisateur
```http
GET /post-shared/user/{userId}/count
```

**Réponse (200):**
```json
{
  "count": 15
}
```

---

### 7. Obtenir un partage spécifique
```http
GET /post-shared/{id}
```

**Réponse (200):**
```json
{
  "id": "clp1234567890",
  "postId": "cld1234567890",
  "userId": "cld0987654321",
  "description": "Regardez cette publication !",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 8. Mettre à jour un partage
```http
PATCH /post-shared/{id}
```

**Body (JSON):**
```json
{
  "description": "Nouvelle description mise à jour"
}
```

**Réponse (200):**
```json
{
  "id": "clp1234567890",
  "postId": "cld1234567890",
  "userId": "cld0987654321",
  "description": "Nouvelle description mise à jour",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

---

### 9. Supprimer un partage par ID
```http
DELETE /post-shared/{id}
```

**Réponse (200):** Retourne le partage supprimé

---

### 10. Retirer le partage d'une publication (unshare)
```http
DELETE /post-shared/unshare/{userId}/{postId}
```

**Réponse (200):** Retourne le partage supprimé

**Erreurs possibles:**
- `404 Not Found` : Aucun partage trouvé pour cet utilisateur et cette publication

## Logique métier

### Partage d'une publication (`sharePost`)
1. Vérification que l'utilisateur n'a pas déjà partagé cette publication
2. Validation de l'existence de la publication et de l'utilisateur
3. Création du partage dans la base de données
4. **Incrémentation automatique** du compteur `nbShares` de la publication

### Retrait d'un partage (`unsharePost`)
1. Recherche du partage existant
2. Suppression du partage
3. **Décrémentation automatique** du compteur `nbShares` de la publication

## DTOs (Data Transfer Objects)

### CreatePostSharedDto
```typescript
{
  postId: string;      // ID de la publication à partager (requis)
  userId: string;      // ID de l'utilisateur qui partage (requis)
  description?: string; // Description optionnelle (max 500 caractères)
}
```

### UpdatePostSharedDto
```typescript
{
  description?: string; // Seule la description peut être mise à jour
}
```

## Tests

Le module inclut une suite complète de tests :

### Tests unitaires
- **DTOs** : Validation des champs et contraintes
- **Service** : Logique métier et gestion des erreurs
- **Controller** : Endpoints et réponses HTTP

### Tests d'intégration
- Tests end-to-end complets de tous les endpoints
- Simulation des interactions avec la base de données
- Validation des codes de statut HTTP et des réponses

### Exécution des tests
```bash
# Tests unitaires
npm run test -- post-shared

# Tests d'intégration
npm run test:e2e -- post-shared

# Couverture de code
npm run test:cov -- post-shared
```

## Comment tester avec Swagger

1. **Accédez à Swagger UI** : `http://localhost:3000/api`

2. **Authentification** : Assurez-vous d'être connecté si nécessaire

3. **Test du partage d'une publication** :
   - Utilisez `POST /post-shared`
   - Fournissez un `postId` et `userId` valides
   - Ajoutez une description optionnelle

4. **Test des requêtes GET** :
   - Testez `GET /post-shared/post/{postId}` avec différents paramètres
   - Essayez `withUsers=true` pour voir les détails des utilisateurs
   - Testez la pagination avec `skip` et `take`

5. **Test du comptage** :
   - Utilisez `GET /post-shared/post/{postId}/count`
   - Vérifiez que le nombre correspond aux partages créés

6. **Test de la suppression** :
   - Utilisez `DELETE /post-shared/unshare/{userId}/{postId}`
   - Vérifiez que le compteur de partages diminue

## Architecture et patterns

### BaseService Pattern
Le `PostSharedService` étend `BaseService<PostShared>` qui fournit :
- **CRUD générique** : `findAll`, `findOne`, `create`, `update`, `remove`
- **Gestion d'erreurs standardisée**
- **Validation automatique** des DTOs
- **Pagination uniforme**

### Avantages de cette approche :
- **Consistance** : Tous les services suivent les mêmes patterns
- **Réutilisabilité** : Code générique réutilisé
- **Maintenabilité** : Modifications centralisées dans BaseService
- **Extensibilité** : Méthodes spécialisées ajoutées facilement

### Gestion des erreurs
- **ConflictException** : Tentative de partage multiple
- **NotFoundException** : Entités non trouvées
- **BadRequestException** : Données invalides
- **Validation automatique** : via class-validator

## Bonnes pratiques

1. **Toujours vérifier l'existence** des entités avant les opérations
2. **Utiliser les contraintes de base de données** pour l'intégrité
3. **Maintenir la cohérence** des compteurs automatiquement
4. **Valider les DTOs** avec des décorateurs appropriés
5. **Tester tous les cas d'usage** y compris les erreurs
6. **Documenter les APIs** avec Swagger

## Migration et déploiement

Si vous modifiez le modèle Prisma, n'oubliez pas de :
```bash
# Générer une nouvelle migration
npx prisma migrate dev --name add_post_shared_feature

# Générer le client Prisma
npx prisma generate
```
