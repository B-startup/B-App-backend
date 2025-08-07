# Tests du Module File

Ce dossier contient tous les tests unitaires pour le module de gestion des fichiers.

## Structure des Tests

### file.service.spec.ts (13 tests)
Tests unitaires complets pour le service FileService :

**Tests create() :**
- ✅ Création d'un enregistrement de fichier quand le projet existe
- ✅ Lancement d'une NotFoundException quand le projet n'existe pas

**Tests uploadFile() :**
- ✅ Upload réussi d'un fichier et création d'enregistrement
- ✅ Validation des types de fichiers (BadRequestException pour type invalide)
- ✅ Validation de la taille (BadRequestException pour taille dépassée)

**Tests findByProject() :**
- ✅ Retour des fichiers pour un projet spécifique

**Tests update() :**
- ✅ Mise à jour réussie d'un enregistrement de fichier
- ✅ Vérification de l'existence du nouveau projet lors de la mise à jour

**Tests remove() :**
- ✅ Suppression de l'enregistrement et du fichier physique
- ✅ Gestion gracieuse des fichiers physiques manquants

**Tests downloadFile() :**
- ✅ Retour du chemin et nom de fichier pour un fichier existant
- ✅ NotFoundException quand le fichier physique n'existe pas

**Tests getProjectFileStats() :**
- ✅ Retour des statistiques des fichiers d'un projet

### file.controller.spec.ts (11 tests)
Tests unitaires complets pour le contrôleur FileController :

**Tests create() :**
- ✅ Création d'un enregistrement de fichier

**Tests uploadFile() :**
- ✅ Upload réussi d'un fichier et création d'enregistrement
- ✅ BadRequestException quand le fichier est manquant

**Tests findAll() :**
- ✅ Retour de tous les fichiers quand aucun projectId n'est fourni
- ✅ Retour des fichiers du projet quand projectId est fourni

**Tests findByProject() :**
- ✅ Retour des fichiers pour un projet spécifique

**Tests getProjectStats() :**
- ✅ Retour des statistiques des fichiers d'un projet

**Tests findOne() :**
- ✅ Retour d'un fichier par ID

**Tests downloadFile() :**
- ✅ Téléchargement d'un fichier

**Tests update() :**
- ✅ Mise à jour d'un enregistrement de fichier

**Tests remove() :**
- ✅ Suppression d'un enregistrement de fichier

## Stratégies de Mocking

### Service Tests
- **PrismaService** : Mock complet avec toutes les méthodes nécessaires
- **ConfigService** : Mock pour les variables d'environnement
- **File System** : Mock des opérations fs (existsSync, unlinkSync, mkdirSync)

### Controller Tests
- **FileService** : Mock complet de tous les méthodse du service
- **Express Response** : Mock pour les réponses HTTP et téléchargements

## Couverture des Tests

Les tests couvrent :
- ✅ **Fonctionnalités CRUD complètes** : Create, Read, Update, Delete
- ✅ **Gestion des fichiers** : Upload, Download, validation
- ✅ **Validation des données** : Types de fichiers, tailles, UUIDs
- ✅ **Gestion d'erreurs** : Cas d'erreur et exceptions appropriées
- ✅ **Opérations sur le système de fichiers** : Création/suppression de dossiers et fichiers
- ✅ **Statistiques** : Comptage et métadonnées des fichiers par projet

## Exécution des Tests

```bash
# Tous les tests du module File
npm test -- "src/modules/ProjectManagement/file/__tests__"

# Tests du service uniquement
npm test -- "src/modules/ProjectManagement/file/__tests__/file.service.spec.ts"

# Tests du contrôleur uniquement
npm test -- "src/modules/ProjectManagement/file/__tests__/file.controller.spec.ts"
```

## Résultats Attendus

- **2 test suites** : Service et Contrôleur
- **24 tests** : 13 tests du service + 11 tests du contrôleur
- **Temps d'exécution** : ~23 secondes
- **Statut** : Tous les tests doivent passer ✅

Les tests garantissent la robustesse et la fiabilité du module de gestion des fichiers.
