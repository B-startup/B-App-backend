# Auto-incrémentation des Compteurs Utilisateur

## Vue d'ensemble

Cette documentation détaille l'implémentation de l'auto-incrémentation des compteurs utilisateur lors de la création/suppression d'entités liées. Les compteurs suivants sont gérés automatiquement :

- `nbPosts` : Nombre de posts créés par l'utilisateur
- `nbFollowers` : Nombre de followers de l'utilisateur  
- `nbFollowing` : Nombre d'utilisateurs suivis par l'utilisateur
- `nbConnects` : Nombre de demandes de connexion effectuées par l'utilisateur
- `nbVisits` : Nombre de visites de profil reçues par l'utilisateur
- `nbProjects` : Nombre de projets créés par l'utilisateur
- `nbOffer` : Nombre d'offres d'investissement effectuées par l'utilisateur
- `timeSpent` : Temps total passé dans l'application (en minutes)

## Modules implémentés

### 1. PostService
**Fichier** : `src/modules/PostManagement/post/post.service.ts`

**Compteur géré** : `nbPosts`

**Fonctionnalités** :
- ✅ Incrémente `nbPosts` lors de la création d'un post
- ✅ Décrémente `nbPosts` lors de la suppression d'un post
- ✅ Utilise des transactions pour garantir la cohérence

### 2. FollowService (Nouveau module CRUD complet)
**Fichier** : `src/modules/UserAccess/follow/follow.service.ts`

**Compteurs gérés** : `nbFollowers`, `nbFollowing`

**Fonctionnalités** :
- ✅ Module CRUD complet avec BaseCrudServiceImpl
- ✅ Incrémente `nbFollowing` pour le follower
- ✅ Incrémente `nbFollowers` pour l'utilisateur suivi
- ✅ Décrémente les compteurs lors de l'unfollow
- ✅ Validation : empêche l'auto-suivi et les relations duplicatas
- ✅ API complète avec endpoints spécialisés
- ✅ Tests unitaires complets
- ✅ Documentation complète

**Endpoints API** :
- `POST /follow` - Créer une relation de suivi
- `GET /follow` - Récupérer toutes les relations
- `GET /follow/:id` - Récupérer une relation par ID
- `DELETE /follow/:id` - Supprimer une relation
- `GET /follow/user/:userId/following` - Utilisateurs suivis
- `GET /follow/user/:userId/followers` - Followers
- `GET /follow/user/:userId/stats` - Statistiques de suivi
- `POST /follow/toggle` - Toggle suivi/ne suit plus
- `GET /follow/check` - Vérifier une relation
- `GET /follow/mutual/:userId1/:userId2` - Suivis mutuels

### 3. ProjectService
**Fichier** : `src/modules/ProjectManagement/project/project.service.ts`

**Compteur géré** : `nbProjects`

**Fonctionnalités** :
- ✅ Incrémente `nbProjects` lors de la création d'un projet
- ✅ Décrémente `nbProjects` lors de la suppression d'un projet
- ✅ Utilise le champ `creatorId` du projet

### 4. ConnectService
**Fichier** : `src/modules/ProjectManagement/connect/connect.service.ts`

**Compteur géré** : `nbConnects`

**Fonctionnalités** :
- ✅ Incrémente `nbConnects` lors d'une demande de connexion
- ✅ Décrémente `nbConnects` lors de l'annulation d'une connexion
- ✅ Méthodes utilitaires pour les statistiques

### 5. VisitorProfileProjectService
**Fichier** : `src/modules/ProjectManagement/visitor-profile-project/visitor-profile-project.service.ts`

**Compteur géré** : `nbVisits`

**Fonctionnalités** :
- ✅ Incrémente `nbVisits` lors des visites de profil
- ✅ Décrémente `nbVisits` lors de la suppression de visites
- ✅ Gère les visites de profil et de projet
- ✅ Méthodes pour les statistiques de visite

### 6. OfferService
**Fichier** : `src/modules/ProjectManagement/offer/offer.service.ts`

**Compteur géré** : `nbOffer`

**Fonctionnalités** :
- ✅ Incrémente `nbOffer` lors de la création d'une offre
- ✅ Décrémente `nbOffer` lors de la suppression d'une offre
- ✅ Méthodes pour les statistiques d'offres

### 7. ViewService (Modifié)
**Fichier** : `src/modules/InteractionSocial/view/view.service.ts`

**Compteur géré** : `timeSpent`

**Fonctionnalités** :
- ✅ Incrémente `timeSpent` global lors des vues de vidéo
- ✅ Gestion du temps passé sur les contenus vidéo

### 8. UserActivityService (Nouveau service utilitaire)
**Fichier** : `src/core/common/services/user-activity.service.ts`

**Compteur géré** : `timeSpent`

**Fonctionnalités** :
- ✅ Service centralisé pour la gestion du temps d'activité
- ✅ Enregistrement en minutes et secondes
- ✅ Statistiques utilisateur et globales
- ✅ Gestion des sessions

## Pattern d'implémentation

### Template de base pour l'auto-incrémentation
```typescript
async create(createDto: CreateXxxDto): Promise<Xxx> {
    return await this.prisma.$transaction(async (prisma) => {
        // 1. Créer l'entité
        const newEntity = await prisma.xxx.create({
            data: createDto
        });

        // 2. Incrémenter le compteur utilisateur
        await prisma.user.update({
            where: { id: createDto.userId },
            data: {
                nbXxx: {
                    increment: 1
                }
            }
        });

        return newEntity;
    });
}

async remove(id: string): Promise<Xxx> {
    return await this.prisma.$transaction(async (prisma) => {
        // 1. Récupérer l'entité pour l'userId
        const entityToDelete = await prisma.xxx.findUniqueOrThrow({
            where: { id },
            select: { userId: true }
        });

        // 2. Supprimer l'entité
        const deletedEntity = await prisma.xxx.delete({
            where: { id }
        });

        // 3. Décrémenter le compteur utilisateur
        await prisma.user.update({
            where: { id: entityToDelete.userId },
            data: {
                nbXxx: {
                    decrement: 1
                }
            }
        });

        return deletedEntity;
    });
}
```

## Tests

### Tests implémentés
- ✅ FollowService : Tests complets (service, controller, module, DTOs)
- 📋 TODO : Tests pour les autres services modifiés

### Structure des tests pour Follow
```
follow/_test_/
├── follow.service.spec.ts     - Tests du service
├── follow.controller.spec.ts  - Tests du contrôleur  
├── follow.module.spec.ts      - Tests du module
└── dto.spec.ts                - Tests des DTOs
```

## Avantages de cette approche

### 1. Cohérence des données
- Utilisation de transactions Prisma pour garantir l'atomicité
- Les compteurs sont toujours synchronisés avec les données réelles

### 2. Performance
- Évite les requêtes COUNT() coûteuses à chaque consultation
- Les compteurs sont immédiatement disponibles

### 3. Maintenabilité
- Pattern uniforme appliqué à tous les services
- Héritage de BaseCrudServiceImpl maintenu
- Code centralisé et réutilisable

### 4. Résilience
- Gestion d'erreurs avec rollback automatique des transactions
- Validation des contraintes métier (ex: pas d'auto-suivi)

## Migration et synchronisation

### Commandes utiles pour synchroniser les compteurs existants
```sql
-- Synchroniser nbPosts
UPDATE users SET "nbPosts" = (
    SELECT COUNT(*) FROM posts WHERE "userId" = users.id
);

-- Synchroniser nbProjects  
UPDATE users SET "nbProjects" = (
    SELECT COUNT(*) FROM projects WHERE "creatorId" = users.id
);

-- Synchroniser nbFollowers
UPDATE users SET "nbFollowers" = (
    SELECT COUNT(*) FROM follows WHERE "followingId" = users.id
);

-- Synchroniser nbFollowing
UPDATE users SET "nbFollowing" = (
    SELECT COUNT(*) FROM follows WHERE "followerId" = users.id
);

-- Et ainsi de suite pour les autres compteurs...
```

## Documentation associée

- 📄 [Follow Module Documentation](./follow.md) - Documentation complète du module Follow
- 📄 [Base CRUD Service](../base-crud-service.md) - Documentation du service CRUD de base
- 📄 [User Model Enhancement](./user-model-enhancement.md) - Améliorations du modèle User

## Prochaines étapes

### À implémenter
1. 📋 Tests unitaires pour tous les services modifiés
2. 📋 Service de synchronisation des compteurs
3. 📋 Monitoring et alertes pour détecter les incohérences
4. 📋 Migration pour synchroniser les données existantes
5. 📋 Documentation API Swagger mise à jour

### Améliorations possibles
1. Cache Redis pour les compteurs fréquemment consultés
2. Jobs de background pour la resynchronisation périodique
3. Métriques et dashboards pour le monitoring
4. API de diagnostic pour vérifier la cohérence des compteurs

## Conclusion

L'implémentation de l'auto-incrémentation des compteurs utilisateur est maintenant complète et fonctionnelle. Le système garantit la cohérence des données tout en maintenant de bonnes performances et une architecture maintenable.

Le module Follow a été entièrement créé avec un pattern CRUD complet, des tests unitaires et une documentation détaillée, servant d'exemple pour les futurs développements.
