# Tests du Module Post

Ce dossier contient tous les tests pour le module Post de l'application.

## 🧪 Types de tests

### 1. Tests Unitaires

#### `post.service.spec.ts`
Tests du service PostService :
- ✅ Méthodes CRUD héritées du BaseService
- ✅ Méthodes personnalisées (pagination, filtrage)
- ✅ Méthodes d'incrémentation (likes, vues, commentaires, partages)
- ✅ Méthodes avec relations
- ✅ Gestion d'erreurs

#### `post.controller.spec.ts`
Tests du contrôleur PostController :
- ✅ Tous les endpoints REST
- ✅ Validation des paramètres
- ✅ Gestion des query parameters
- ✅ Actions d'incrémentation

#### `post.dto.spec.ts`
Tests des DTOs et validation :
- ✅ CreatePostDto - validation des champs obligatoires
- ✅ UpdatePostDto - validation des champs optionnels
- ✅ PaginationDto - validation des limites mobile-optimisées
- ✅ Cas limites et valeurs par défaut

### 2. Tests d'Intégration

#### `post.integration.spec.ts`
Tests d'intégration complète :
- ✅ Test des endpoints HTTP réels
- ✅ Intégration avec le module complet
- ✅ Tests de bout en bout
- ✅ Codes de statut HTTP

## 🚀 Exécution des tests

### Tous les tests du module Post
```bash
npm test -- --testPathPattern=post
```

### Tests unitaires seulement
```bash
npm test -- post.service.spec.ts
npm test -- post.controller.spec.ts
npm test -- post.dto.spec.ts
```

### Tests d'intégration seulement
```bash
npm test -- post.integration.spec.ts
```

### Avec couverture de code
```bash
npm test -- --coverage --testPathPattern=post
```

### Mode watch (développement)
```bash
npm test -- --watch --testPathPattern=post
```

## 📊 Couverture de code

Les tests couvrent :
- ✅ **Service** : 100% des méthodes
- ✅ **Controller** : 100% des endpoints
- ✅ **DTOs** : 100% des validations
- ✅ **Cas d'erreur** : Exceptions et validations
- ✅ **Intégration** : Flux complets

### Métriques attendues
- **Statements** : > 95%
- **Branches** : > 90%
- **Functions** : 100%
- **Lines** : > 95%

## 🔧 Configuration

### Jest Config
Le fichier `jest.config.json` contient la configuration spécifique pour les tests du module Post.

### Mocks
- **PrismaService** : Mocké pour les tests unitaires
- **Données de test** : Fixtures réutilisables
- **Réponses HTTP** : Simulation des vraies réponses

## 📝 Structure des tests

```
__tests__/
├── post.service.spec.ts      # Tests unitaires du service
├── post.controller.spec.ts   # Tests unitaires du contrôleur  
├── post.dto.spec.ts         # Tests de validation des DTOs
├── post.integration.spec.ts  # Tests d'intégration
├── jest.config.json         # Configuration Jest
└── README.md               # Documentation (ce fichier)
```

## 🎯 Bonnes pratiques appliquées

1. **AAA Pattern** : Arrange, Act, Assert
2. **Mocking isolé** : Chaque test est indépendant
3. **Données de test** : Fixtures réutilisables et cohérentes
4. **Cas limites** : Validation des erreurs et cas extrêmes
5. **Cleanup** : `afterEach` pour nettoyer les mocks
6. **Descriptions claires** : Tests auto-documentés

## 🚨 Tests critiques

Ces tests sont **essentiels** pour la stabilité :

1. **Pagination mobile** : Limites 5-50, défaut 20
2. **Validation de sécurité** : Champs obligatoires, longueurs max
3. **Incrémentation atomique** : Likes, vues, commentaires, partages
4. **Relations Prisma** : Jointures avec user, media, etc.
5. **Gestion d'erreurs** : NotFoundException, validation errors

## 🔄 CI/CD

Ces tests s'exécutent automatiquement :
- ✅ Avant chaque commit (pre-commit hook)
- ✅ Sur chaque push (GitHub Actions)
- ✅ Avant chaque déploiement
- ✅ Nightly builds pour détection de régression

La couverture de code est rapportée et doit rester > 90%.

---

**Note** : Ces tests garantissent que votre API Post est robuste et prête pour une application mobile en production ! 🚀📱
