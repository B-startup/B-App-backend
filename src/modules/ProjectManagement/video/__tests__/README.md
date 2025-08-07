# Video Module Tests

Ce dossier contient les tests pour le module Video du système de gestion de projets.

## Structure des tests

### 1. `video.controller.spec.ts`
Tests unitaires pour le contrôleur Video :
- Tests des endpoints CRUD
- Tests de validation des paramètres
- Tests de gestion des erreurs
- Tests de protection par token JWT

### 2. `video.service.spec.ts`
Tests unitaires pour le service Video :
- Tests de logique métier
- Tests d'interaction avec Prisma
- Tests de gestion des fichiers
- Tests de validation des données

### 3. `video.dto.spec.ts`
Tests de validation des DTOs :
- Tests de validation des champs requis
- Tests de validation des types de données
- Tests de validation des contraintes

### 4. `video.integration.spec.ts`
Tests d'intégration end-to-end :
- Tests complets des endpoints API
- Tests d'authentification JWT
- Tests de gestion des fichiers
- Tests de scénarios réels

## Couverture des tests

Les tests couvrent :
- ✅ Création de vidéos
- ✅ Upload de fichiers vidéo
- ✅ Lecture des vidéos (individuelle et par projet)
- ✅ Mise à jour des métadonnées
- ✅ Suppression des vidéos
- ✅ Comptage des vidéos par projet
- ✅ Validation des données
- ✅ Gestion des erreurs
- ✅ Protection JWT

## Exécution des tests

```bash
# Tests unitaires
npm run test video

# Tests d'intégration
npm run test:e2e video

# Coverage
npm run test:cov -- --testPathPattern=video
```

## Mocks utilisés

- **PrismaService** : Mock des opérations base de données
- **ConfigService** : Mock de la configuration
- **FileSystem (fs)** : Mock des opérations fichiers
- **JwtService** : Mock pour les tokens JWT
