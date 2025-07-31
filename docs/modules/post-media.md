# Module PostMedia - API Documentation

Ce module fournit un CRUD complet pour la gestion des médias (images et vidéos) associés aux posts, avec stockage de fichiers optimisé.

## 🚀 Fonctionnalités principales

- **CRUD complet** avec `BaseCrudServiceImpl`
- **Upload de fichiers** avec validation stricte
- **Stockage organisé** par type (images/vidéos)
- **Gestion automatique** des dossiers
- **Validation de types MIME**
- **Suppression sécurisée** des fichiers
- **Vérification d'intégrité** des fichiers

## 📁 Structure de stockage

```
uploads/
└── postMedia/
    ├── images/          # Images (JPG, PNG, GIF, WebP)
    │   ├── 1234567890-image1.jpg
    │   └── 1234567890-image2.png
    └── videos/          # Vidéos (MP4, AVI, WebM, MOV)
        ├── 1234567890-video1.mp4
        └── 1234567890-video2.webm
```

## 🔧 Variables d'environnement

```bash
# Dossier principal d'upload
UPLOAD_DIRECTORY=uploads

# Limites de taille (en bytes)
POST_MEDIA_MAX_IMAGE_SIZE=5242880      # 5MB pour images
POST_MEDIA_MAX_VIDEO_SIZE=10485760     # 10MB pour vidéos

# Dossiers spécifiques (optionnel)
POST_MEDIA_IMAGES_DIR=uploads/postMedia/images
POST_MEDIA_VIDEOS_DIR=uploads/postMedia/videos
```

## 📋 Endpoints disponibles

### CRUD de base

#### POST `/post-media`
Créer un enregistrement de média (sans fichier)
- **Body**: `CreatePostMediaDto`
- **Response**: `PostMediaResponseDto`

#### POST `/post-media/upload`
Upload et créer un média avec fichier
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `file` (binary): Fichier image ou vidéo
  - `postId` (string): ID du post
  - `mediaType` (enum): 'IMAGE' ou 'VIDEO'
- **Response**: `PostMediaResponseDto`

#### GET `/post-media`
Récupérer tous les médias
- **Query params**:
  - `withPost` (boolean): Inclure les infos du post
- **Response**: `PostMediaResponseDto[]`

#### GET `/post-media/post/:postId`
Récupérer tous les médias d'un post
- **Params**: `postId` (string)
- **Query params**:
  - `type` (enum): Filtrer par type ('IMAGE' ou 'VIDEO')
- **Response**: `PostMediaResponseDto[]`

#### GET `/post-media/type/:type`
Récupérer tous les médias par type
- **Params**: `type` (enum): 'IMAGE' ou 'VIDEO'
- **Response**: `PostMediaResponseDto[]`

#### GET `/post-media/:id`
Récupérer un média par ID
- **Params**: `id` (string)
- **Response**: `PostMediaResponseDto`

#### PATCH `/post-media/:id`
Mettre à jour un média
- **Params**: `id` (string)
- **Body**: `UpdatePostMediaDto`
- **Response**: `PostMediaResponseDto`

#### DELETE `/post-media/:id`
Supprimer un média et son fichier
- **Params**: `id` (string)
- **Response**: `PostMediaResponseDto`

### Endpoints utilitaires

#### GET `/post-media/post/:postId/count`
Compter les médias d'un post
- **Params**: `postId` (string)
- **Query params**:
  - `type` (enum): Filtrer par type
- **Response**: `{ count: number }`

#### GET `/post-media/integrity/check`
Vérifier l'intégrité des fichiers (admin)
- **Response**: 
```json
{
  "validCount": 150,
  "missingCount": 2,
  "missing": [...]
}
```

## 📊 DTOs

### CreatePostMediaDto
```typescript
{
  postId: string;          // ID du post
  mediaUrl: string;        // URL du fichier
  mediaType: 'IMAGE' | 'VIDEO'  // Type de média
}
```

### UploadPostMediaDto
```typescript
{
  postId: string;          // ID du post
  mediaType: 'IMAGE' | 'VIDEO'  // Type de média
  file: File               // Fichier binaire
}
```

### PostMediaResponseDto
```typescript
{
  id: string;              // ID unique
  postId: string;          // ID du post
  mediaUrl: string;        // URL du fichier
  mediaType: 'IMAGE' | 'VIDEO'  // Type
  createdAt: Date;         // Date de création
  updatedAt: Date;         // Dernière MAJ
}
```

## 🔒 Validations de sécurité

### Types MIME autorisés

**Images** :
- `image/jpeg`, `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`

**Vidéos** :
- `video/mp4`
- `video/mpeg`
- `video/quicktime` (MOV)
- `video/x-msvideo` (AVI)
- `video/webm`

### Limites de taille
- **Images** : 5MB max
- **Vidéos** : 10MB max

### Sécurité des noms de fichiers
- Caractères dangereux supprimés
- Timestamp ajouté pour unicité
- Extension préservée

## 🛠️ Utilisation dans votre app mobile

### Upload d'image
```typescript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('postId', 'uuid-post-id');
formData.append('mediaType', 'IMAGE');

const response = await fetch('/api/post-media/upload', {
  method: 'POST',
  body: formData
});
```

### Récupérer les médias d'un post
```typescript
const medias = await fetch(`/api/post-media/post/${postId}?type=IMAGE`);
```

## 🎯 Bonnes pratiques

1. **Upload progressif** : Uploadez les médias après création du post
2. **Validation côté client** : Vérifiez taille/type avant upload
3. **Gestion d'erreurs** : Gérez les erreurs 413 (file too large)
4. **Cache** : Les URLs sont stables, vous pouvez les cacher
5. **Compression** : Compressez les images/vidéos côté client si possible

## 🔧 Maintenance

### Vérification d'intégrité
```bash
GET /post-media/integrity/check
```
Utilisez cet endpoint pour identifier les fichiers manquants.

### Nettoyage des fichiers orphelins
Si vous supprimez des posts, pensez à supprimer aussi leurs médias pour éviter les fichiers orphelins.

## Architecture et patterns

### Héritage de BaseCrudServiceImpl

Le `PostMediaService` hérite de `BaseCrudServiceImpl` qui fournit :
- Méthodes CRUD standardisées
- Gestion d'erreurs automatique
- Types TypeScript stricts
- Validation des DTOs

```typescript
export class PostMediaService extends BaseCrudServiceImpl<
    PostMedia,
    CreatePostMediaDto,
    UpdatePostMediaDto
> {
    // Méthodes personnalisées spécifiques aux médias de posts
}
```

Le module PostMedia est maintenant complet avec toutes les fonctionnalités nécessaires pour une application mobile moderne ! 🚀
