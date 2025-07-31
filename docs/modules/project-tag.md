# 🏷️ Project Tag Module

## 📋 Vue d'ensemble

Le module **ProjectTag** gère les associations many-to-many entre les projets et les tags dans l'application BOM. Il permet de catégoriser les projets avec des mots-clés pour faciliter la recherche et la découverte.

## 🏗️ Architecture

### Structure des fichiers
```
project-tag/
├── dto/
│   ├── create-project-tag.dto.ts     # DTO pour créer une association
│   └── project-tag-response.dto.ts   # DTO de réponse avec validation
├── __tests__/
│   ├── project-tag.service.spec.ts   # Tests du service (15 tests)
│   └── project-tag.controller.spec.ts # Tests du contrôleur (14 tests)
├── project-tag.controller.ts         # Contrôleur REST API (9 endpoints)
├── project-tag.service.ts           # Service métier (12 méthodes)
└── project-tag.module.ts            # Configuration du module
```

### Relations de données
```
Project (1) ←→ (N) ProjectTag (N) ←→ (1) Tag
```

## 🚀 Fonctionnalités Principales

### 1. **Gestion des Associations**
- ✅ Création d'associations projet-tag
- ✅ Validation d'unicité (éviter les doublons)
- ✅ Vérification d'existence des entités liées
- ✅ Suppression d'associations spécifiques

### 2. **Opérations en Lot**
- ✅ Ajout de plusieurs tags à un projet
- ✅ Gestion automatique des doublons

### 3. **Recherche et Filtrage**
- ✅ Récupération des tags d'un projet
- ✅ Récupération des projets d'un tag
- ✅ Inclusion optionnelle des détails liés

### 4. **Analyse et Recommandations**
- ✅ Tags populaires (les plus utilisés)
- ✅ Projets similaires basés sur les tags partagés
- ✅ Compteurs d'associations

## 📡 API Endpoints

### Associations de base
```http
POST   /api/v1/project-tags              # Créer une association
DELETE /api/v1/project-tags              # Supprimer une association
```

### Ajout en lot
```http
POST   /api/v1/project-tags/multiple     # Ajouter plusieurs tags
```

### Recherche par entité
```http
GET    /api/v1/project-tags/project/:id  # Tags d'un projet
GET    /api/v1/project-tags/tag/:id      # Projets d'un tag
```

### Analyse et statistiques
```http
GET    /api/v1/project-tags/popular      # Tags populaires
GET    /api/v1/project-tags/similar/:id  # Projets similaires
```

### Compteurs
```http
GET    /api/v1/project-tags/count/project/:id  # Compter tags d'un projet
GET    /api/v1/project-tags/count/tag/:id      # Compter projets d'un tag
```

## 💡 Exemples d'utilisation

### 1. Associer un tag à un projet
```bash
curl -X POST http://localhost:3000/api/v1/project-tags \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-uuid-123",
    "tagId": "tag-uuid-456"
  }'
```

### 2. Ajouter plusieurs tags
```bash
curl -X POST http://localhost:3000/api/v1/project-tags/multiple \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-uuid-123",
    "tagIds": ["tag-fintech", "tag-ai", "tag-startup"]
  }'
```

### 3. Récupérer les tags d'un projet avec détails
```bash
curl "http://localhost:3000/api/v1/project-tags/project/project-uuid-123?withDetails=true"
```

### 4. Trouver des projets similaires
```bash
curl "http://localhost:3000/api/v1/project-tags/similar/project-uuid-123?limit=5"
```

### 5. Obtenir les tags populaires
```bash
curl "http://localhost:3000/api/v1/project-tags/popular?limit=10"
```

## 🧪 Tests

### Couverture des tests
- **Service** : 15 tests couvrant toutes les méthodes
- **Contrôleur** : 14 tests pour tous les endpoints
- **Total** : 29 tests passants

### Exécuter les tests
```bash
# Tests du service
npm test -- project-tag.service.spec.ts

# Tests du contrôleur  
npm test -- project-tag.controller.spec.ts

# Tous les tests ProjectTag
npm test -- "project-tag.*\.spec\.ts$"
```

## 🔧 Méthodes du Service

### Associations de base
```typescript
// Créer une association avec validation
createAssociation(dto: CreateProjectTagDto): Promise<ProjectTag>

// Vérifier l'existence d'une association
hasProjectTagAssociation(projectId: string, tagId: string): Promise<boolean>

// Supprimer une association
removeAssociation(projectId: string, tagId: string): Promise<ProjectTag>
```

### Recherche par entité
```typescript
// Tags d'un projet
findByProject(projectId: string): Promise<ProjectTag[]>
findByProjectWithTags(projectId: string): Promise<any[]>

// Projets d'un tag
findByTag(tagId: string): Promise<ProjectTag[]>
findByTagWithProjects(tagId: string): Promise<any[]>
```

### Opérations avancées
```typescript
// Ajout multiple
addMultipleTagsToProject(projectId: string, tagIds: string[]): Promise<ProjectTag[]>

// Recommandations
findSimilarProjects(projectId: string, limit?: number): Promise<any[]>

// Statistiques
findPopularTags(limit?: number): Promise<any[]>
countByProject(projectId: string): Promise<number>
countByTag(tagId: string): Promise<number>
```

## 🛡️ Validation et Gestion d'Erreurs

### Validations
- **Unicité** : Empêche les associations dupliquées
- **Existence** : Vérifie que le projet et le tag existent
- **Format** : Validation des UUIDs et types de données

### Exceptions
- `ConflictException` : Association déjà existante
- `NotFoundException` : Projet, tag ou association introuvable
- `BadRequestException` : Données invalides

## 🎯 Cas d'usage

### 1. **Catégorisation de projets**
- Taguer les projets par secteur (Fintech, HealthTech, EdTech)
- Identifier les technologies utilisées (AI, Blockchain, IoT)
- Marquer les stades de développement (MVP, Beta, Production)

### 2. **Découverte et recommandations**
- Suggérer des projets similaires aux investisseurs
- Créer des listes de projets par thématique
- Analyser les tendances sectorielles

### 3. **Recherche avancée**
- Filtrer les projets par tags multiples
- Trouver des projets complémentaires
- Identifier les niches populaires

## 🔄 Intégration avec d'autres modules

### Dépendances
- **Tag Module** : Gestion des tags disponibles
- **Project Module** : Validation des projets
- **BaseCrudServiceImpl** : Héritage des méthodes CRUD standard

### Relations
```typescript
// Avec le module Tag
Tag (1) ←→ (N) ProjectTag

// Avec le module Project  
Project (1) ←→ (N) ProjectTag

// Avec BaseCrudServiceImpl
ProjectTagService extends BaseCrudServiceImpl<ProjectTag, CreateProjectTagDto, UpdateProjectTagDto>
```

## 📊 Métriques et Performance

### Optimisations
- **Index de base de données** sur `(projectId, tagId)` pour l'unicité
- **Requêtes groupées** pour les statistiques
- **Limitation des résultats** pour éviter la surcharge
- **Déduplication automatique** dans les recherches

### Exemples de retour
```json
{
  "id": "project-tag-uuid",
  "projectId": "project-uuid-123",
  "tagId": "tag-uuid-456", 
  "createdAt": "2025-07-30T12:00:00.000Z",
  "project": {
    "id": "project-uuid-123",
    "title": "EcoStartup",
    "description": "Application pour réduire le gaspillage alimentaire"
  },
  "tag": {
    "id": "tag-uuid-456",
    "name": "Sustainability",
    "description": "Projets axés sur le développement durable"
  }
}
```

---

## 🎯 Prêt pour l'utilisation

Le module ProjectTag est **entièrement fonctionnel** et testé. Il s'intègre parfaitement dans l'écosystème BOM pour la gestion des associations projet-tag, avec des fonctionnalités avancées de recommandation et d'analyse.
