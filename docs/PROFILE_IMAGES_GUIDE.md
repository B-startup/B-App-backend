# 📸 Gestion des Images de Profil - Guide d'utilisation

## 🎯 Fonctionnalités implémentées

### ✨ Nouveaux endpoints pour la gestion d'images de profil :

1. **📤 Upload d'image lors de la création d'utilisateur**
   ```
   POST /api/v1/user/with-profile-image
   ```

2. **🔄 Mise à jour avec nouvelle image de profil**
   ```
   PATCH /api/v1/user/:id/with-profile-image
   ```

3. **📸 Upload d'image pour utilisateur existant**
   ```
   POST /api/v1/user/:id/profile-image
   ```

4. **🗑️ Suppression d'image de profil**
   ```
   DELETE /api/v1/user/:id/profile-image
   ```

## ⚙️ Configuration des variables d'environnement

Nouvelles variables ajoutées dans `.env` :

```env
# Profile Images Upload
PROFILE_IMAGES_DIR=uploads/profile-images
PROFILE_IMAGES_MAX_SIZE=2097152
```

- `PROFILE_IMAGES_DIR` : Dossier de stockage des images de profil
- `PROFILE_IMAGES_MAX_SIZE` : Taille maximale en bytes (2MB par défaut)

## 🚀 Testing

### 1. Tests automatisés

```bash
# Tests e2e standards
npm run test:e2e test/user.e2e-spec.ts

# Tests e2e avec images
npm run test:e2e test/user-with-images.e2e-spec.ts
```

### 2. Script de test interactif

```bash
# Lancer l'application
npm start

# Dans un autre terminal, exécuter le script de test
node test-upload-images.js
```

### 3. Test via Swagger UI

1. Aller sur http://localhost:8050/api
2. Chercher les endpoints avec les icônes 📸, 🔄, 🗑️
3. Utiliser l'interface Swagger pour tester l'upload

## 📋 Formats d'images supportés

- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ✅ WebP (.webp)

## 📏 Limites

- **Taille maximale** : 2MB par défaut (configurable via `PROFILE_IMAGES_MAX_SIZE`)
- **Types de fichiers** : Images uniquement
- **Stockage** : Local dans le dossier `uploads/profile-images/`

## 🛡️ Sécurité

- ✅ Validation du type MIME
- ✅ Limitation de taille
- ✅ Noms de fichiers uniques générés automatiquement
- ✅ Suppression automatique des anciennes images

## 📂 Structure des fichiers

```
uploads/
└── profile-images/
    ├── profile-1641234567890-abc123.png
    ├── profile-1641234567891-def456.jpg
    └── ...
```

## 🌐 URLs d'accès aux images

Les images sont accessibles via :
```
http://localhost:8050/uploads/profile-images/[filename]
```

## 💡 Exemple d'utilisation avec cURL

### Créer un utilisateur avec image de profil :

```bash
curl -X POST http://localhost:8050/api/v1/user/with-profile-image \
  -F "email=test@example.com" \
  -F "password=StrongPass123!" \
  -F "name=Test User" \
  -F "profileImage=@path/to/image.jpg"
```

### Upload d'image pour utilisateur existant :

```bash
curl -X POST http://localhost:8050/api/v1/user/USER_ID/profile-image \
  -F "profileImage=@path/to/new-image.png"
```

## 🔧 Personnalisation

### Modifier la taille maximale :
```env
PROFILE_IMAGES_MAX_SIZE=5242880  # 5MB
```

### Modifier le dossier de stockage :
```env
PROFILE_IMAGES_DIR=uploads/custom-profiles
```

## 🐛 Gestion d'erreurs

| Erreur | Code | Message |
|--------|------|---------|
| Fichier trop volumineux | 400 | "Fichier trop volumineux. Taille maximale: XMB" |
| Type non supporté | 400 | "Type de fichier non autorisé..." |
| Utilisateur inexistant | 409 | "Utilisateur non trouvé" |
| Aucun fichier | 400 | "Aucun fichier image fourni" |

## 📊 Monitoring

Les logs incluent :
- Upload d'images réussis
- Suppressions d'anciennes images
- Erreurs de validation
- Erreurs d'écriture de fichiers

---

🎉 **Votre API est maintenant prête pour gérer les images de profil !**
