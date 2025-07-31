# Documentation des Modules - B-App Backend

Cette documentation présente tous les modules de l'application B-App Backend avec leurs fonctionnalités, APIs et guides d'utilisation.

## 📋 Vue d'ensemble

L'application utilise **NestJS** avec **Prisma ORM** et suit le pattern **BaseCrudServiceImpl** pour une architecture cohérente et maintenable.

## 🏗️ Architecture générale

### Pattern BaseCrudServiceImpl

Tous les services héritent de `BaseCrudServiceImpl<T, CreateDto, UpdateDto>` qui fournit :

- **Méthodes CRUD standardisées** : `create`, `findAll`, `findByUser`, `findOne`, `findOneOrFail`, `update`, `remove`
- **Gestion d'erreurs automatique** : `NotFoundException`, gestion des erreurs Prisma
- **Types TypeScript stricts** : Validation et autocomplétion
- **Injection de dépendance** : Utilisation de `PrismaClient`

### Avantages de cette approche

- ✅ **Consistance** : Tous les services suivent les mêmes patterns
- ✅ **Réutilisabilité** : Code générique réutilisé
- ✅ **Maintenabilité** : Modifications centralisées
- ✅ **Extensibilité** : Méthodes spécialisées ajoutées facilement

## 📚 Modules disponibles

### TagsMetadata

#### [Tag Module](./tag.md)
Gestion des tags génériques pour catégoriser projets et posts.
- **CRUD complet** avec validation d'unicité
- **Recherche avancée** par nom
- **Statistiques d'utilisation**
- **Tags populaires**

#### [Project Tag Module](./project-tag.md)
Associations many-to-many entre projets et tags.
- **Gestion des associations** avec validation
- **Ajout multiple** de tags
- **Recommandations** de projets similaires
- **Analytics** et statistiques

#### Post Sector Module
Associations many-to-many entre posts et secteurs.
- **Associations post-secteur** avec validation
- **Secteurs populaires**
- **Compteurs** et statistiques

#### Post Tag Module  
Associations many-to-many entre posts et tags.
- **Associations post-tag** avec validation
- **Posts similaires** basés sur tags partagés
- **Tags populaires**

#### [Tags Metadata Overview](./tags-metadata.md)
Vue d'ensemble complète de tous les modules TagsMetadata.

### MediaFiles

#### [Post Module](./post.md)
CRUD complet pour la gestion des posts.
- **Pagination optimisée mobile**
- **Interactions sociales** (likes, vues, commentaires, partages)
- **Gestion des relations**
- **Posts publics/privés**

#### [Post Media Module](./post-media.md)
Gestion des médias (images/vidéos) associés aux posts.
- **Upload de fichiers** avec validation
- **Stockage organisé** par type
- **Validation de sécurité**
- **Gestion d'intégrité**

#### [Post Shared Module](./post-shared.md)
Système de partage de publications.
- **Partage avec description**
- **Compteurs automatiques**
- **Gestion des doublons**
- **Statistiques de partage**

### UserAccess

#### User Module
Gestion des utilisateurs et authentification.
- **CRUD utilisateurs**
- **Gestion des mots de passe**
- **Validation email**
- **Notifications**

### ProjectManagement

#### Project Module
Gestion des projets.
- **CRUD projets**
- **Associations avec tags/secteurs**
- **Gestion des médias**

#### Sector Module
Gestion des secteurs d'activité.
- **CRUD secteurs**
- **Classifications**

## 🚀 Démarrage rapide

### 1. Installation

```bash
npm install
```

### 2. Configuration

```bash
# Configurer la base de données
npx prisma migrate dev

# Générer le client Prisma
npx prisma generate
```

### 3. Démarrage

```bash
# Mode développement
npm run start:dev

# Mode production
npm run start:prod
```

### 4. Documentation API

Accédez à Swagger UI :
```
http://localhost:3000/api
```

## 🧪 Tests

### Exécution des tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests en mode watch
npm run test:watch

# Tests d'intégration
npm run test:e2e
```

### Structure des tests

Chaque module inclut :
- **Tests DTOs** : Validation des champs
- **Tests Service** : Logique métier
- **Tests Controller** : Endpoints REST
- **Tests d'intégration** : Bout en bout

## 🛠️ Développement

### Ajouter un nouveau module

1. **Créer la structure** :
```bash
src/modules/NewModule/
├── dto/
├── new-module.controller.ts
├── new-module.service.ts
└── new-module.module.ts
```

2. **Hériter de BaseCrudServiceImpl** :
```typescript
export class NewModuleService extends BaseCrudServiceImpl<
    Entity,
    CreateDto,
    UpdateDto
> {
    protected model = this.prisma.entity;
    
    constructor(protected readonly prisma: PrismaClient) {
        super(prisma);
    }
}
```

3. **Configurer le module** :
```typescript
@Module({
    controllers: [NewModuleController],
    providers: [NewModuleService, PrismaClient],
    exports: [NewModuleService]
})
export class NewModuleModule {}
```

4. **Créer la documentation** :
Ajouter un fichier `docs/modules/new-module.md`

### Bonnes pratiques

- ✅ **Valider les DTOs** avec class-validator
- ✅ **Documenter avec Swagger** (@ApiProperty, @ApiResponse)
- ✅ **Tester tous les cas** y compris les erreurs
- ✅ **Suivre les conventions** de nommage
- ✅ **Gérer les erreurs** de manière consistante

## 🔧 Maintenance

### Migrations Prisma

```bash
# Créer une migration
npx prisma migrate dev --name description_migration

# Appliquer les migrations
npx prisma migrate deploy

# Réinitialiser (développement uniquement)
npx prisma migrate reset
```

### Gestion des versions

```bash
# Vérifier les changements
git status

# Commiter les changements
git add .
git commit -m "feat: description des modifications"

# Pousser vers la branche
git push origin feature-branch
```

## 📞 Support

Pour toute question ou problème :

1. **Vérifiez la documentation** du module concerné
2. **Consultez Swagger UI** pour les détails des APIs
3. **Exécutez les tests** pour identifier les problèmes
4. **Vérifiez les logs** de l'application

## 🎯 Prochaines étapes

- [ ] Ajouter des modules manquants
- [ ] Améliorer la couverture de tests
- [ ] Optimiser les performances
- [ ] Ajouter la cache
- [ ] Implémenter la sécurité avancée

---

**Architecture solide** 🏗️ | **Tests complets** 🧪 | **Documentation claire** 📚
