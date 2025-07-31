# Documentation B-App Backend

Bienvenue dans la documentation complète de l'application B-App Backend.

## 📁 Structure de la documentation

### 📚 [Modules](./modules/README.md)
Documentation complète de tous les modules de l'application.

### 🔐 [Système de Logout Sécurisé](./README-logout.md)
Documentation complète du système d'authentification et de révocation de tokens avec blacklist.

#### TagsMetadata
- 🏷️ [Tag Module](./modules/tag.md) - Gestion des tags génériques
- 🔗 [Project Tag Module](./modules/project-tag.md) - Associations projets-tags
- 📑 [Post Tag Module](./modules/post-tag.md) - Associations posts-tags  
- 🏢 [Post Sector Module](./modules/post-sector.md) - Associations posts-secteurs
- 📋 [Vue d'ensemble TagsMetadata](./modules/tags-metadata.md) - Documentation globale

#### MediaFiles
- 📝 [Post Module](./modules/post.md) - Gestion des publications
- 🖼️ [Post Media Module](./modules/post-media.md) - Médias des publications
- 🔄 [Post Shared Module](./modules/post-shared.md) - Partage de publications

## 🏗️ Architecture

L'application utilise :
- **NestJS** - Framework Node.js
- **Prisma ORM** - Accès aux données
- **TypeScript** - Typage statique
- **BaseCrudServiceImpl** - Pattern de service unifié

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Configuration de la base de données
npx prisma migrate dev
npx prisma generate

# Démarrage en développement
npm run start:dev

# Documentation API
# Accédez à http://localhost:3000/api
```

## 📖 Navigation

### Pour les développeurs
1. **[Index des modules](./modules/README.md)** - Vue d'ensemble complète
2. **Documentation spécifique** - Choisissez le module qui vous intéresse
3. **Tests** - Chaque module inclut sa suite de tests
4. **Swagger UI** - Documentation interactive des APIs

### Pour les utilisateurs des APIs
1. **Swagger UI** : `http://localhost:3000/api`
2. **Documentation des endpoints** dans chaque module
3. **Exemples d'utilisation** avec curl et code

## 🧪 Tests

Chaque module inclut une documentation de ses tests :
```bash
# Tests globaux
npm run test

# Tests avec couverture
npm run test:cov

# Tests d'un module spécifique
npm test -- nom-du-module
```

## 🛠️ Développement

### Ajouter un nouveau module
Suivez le guide dans [Modules README](./modules/README.md#-développement)

### Bonnes pratiques
- Hériter de `BaseCrudServiceImpl`
- Documenter avec Swagger
- Créer des tests complets
- Ajouter la documentation dans `docs/modules/`

## 📞 Support

- **Documentation modules** : Consultez le module concerné
- **API interactive** : Swagger UI
- **Tests** : Vérifiez les exemples de tests
- **Architecture** : Suivez les patterns établis

---

**🎯 Documentation complète et organisée pour une meilleure productivité**
