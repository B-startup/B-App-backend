# API Endpoint: Complete Profile Update

## 🚀 Endpoint Unique pour la Mise à Jour Complète du Profil

### **PATCH** `/user/{id}`

Cet endpoint **remplace les anciens endpoints de mise à jour séparés** et permet de mettre à jour le profil utilisateur et les réseaux sociaux en **une seule requête**, réduisant considérablement le payload et les appels réseau.

---

## ✅ Avantages

- **Endpoint unique** : Remplace tous les anciens endpoints de mise à jour
- **Réduction du payload** : 3 requêtes → 1 requête
- **API simplifiée** : Plus besoin de gérer plusieurs endpoints
- **Logique intelligente** : Création/Mise à jour automatique des réseaux sociaux
- **Gestion complète** : Profil + Image + Réseaux sociaux

---

## 📋 Exemple d'Utilisation (Flutter/Dart)

### Avant (3 requêtes séparées - DEPRECATED)
```dart
// ❌ ANCIEN: 1. Mise à jour profil
await dio.patch('/user/$userId', data: userProfileData);

// ❌ ANCIEN: 2. Ajout/Mise à jour Facebook
await dio.post('/social-media', data: {'userId': userId, 'platform': 'FACEBOOK', 'url': facebookUrl});

// ❌ ANCIEN: 3. Ajout/Mise à jour Instagram  
await dio.post('/social-media', data: {'userId': userId, 'platform': 'INSTAGRAM', 'url': instagramUrl});
```

### Maintenant (1 requête optimisée - NOUVEAU)
```dart
final formData = FormData.fromMap({
  'name': 'John Doe Updated',
  'email': 'john.updated@example.com',
  'description': 'Passionate developer in Tunisia',
  'country': 'Tunisia',
  'city': 'Tunis',
  'phone': '+216 20 123 456',
  'webSite': 'https://johndoe.dev',
  'profileImage': await MultipartFile.fromFile(
    imageFile.path,
    filename: 'profile.jpg'
  ),
  'socialMediaLinks': jsonEncode([
    {
      "platform": "FACEBOOK",
      "url": "https://facebook.com/johndoe"
    },
    {
      "platform": "INSTAGRAM", 
      "url": "https://instagram.com/johndoe"
    },
    {
      "platform": "LINKEDIN",
      "url": "https://linkedin.com/in/johndoe"
    }
  ])
});

final response = await dio.patch(
  '/user/$userId',
  data: formData
);
```

---

## � Body Input (Détaillé pour l'équipe Front)

### **Content-Type:** `multipart/form-data`

### **Champs Obligatoires:** Aucun (tous optionnels)

### **Structure Complète:**
```javascript
{
  // === INFORMATIONS UTILISATEUR ===
  "name": "John Doe Updated",                    // string (optionnel)
  "email": "john.updated@example.com",           // string (optionnel) 
  "password": "NewSecurePassword123!",           // string (optionnel)
  "description": "Passionate developer in Tunisia", // string (optionnel, max 500 chars)
  "country": "Tunisia",                          // string (optionnel, max 100 chars)
  "city": "Tunis",                              // string (optionnel, max 100 chars)
  "birthdate": "1990-01-15",                    // string (optionnel, format YYYY-MM-DD)
  "phone": "+216 20 123 456",                   // string (optionnel)
  "webSite": "https://johndoe.dev",             // string (optionnel, URL valide)
  
  // === IMAGE DE PROFIL ===
  "profileImage": File,                          // File (optionnel, JPEG/PNG/GIF/WebP, max 2MB)
  
  // === RÉSEAUX SOCIAUX ===
  "socialMediaLinks": "[{\"platform\":\"FACEBOOK\",\"url\":\"https://facebook.com/johndoe\"},{\"platform\":\"INSTAGRAM\",\"url\":\"https://instagram.com/johndoe\"}]"
  // string (optionnel, JSON array en string)
}
```

### **Plateformes Social Media Supportées:**
```javascript
// Valeurs autorisées pour "platform"
[
  "FACEBOOK",
  "INSTAGRAM", 
  "LINKEDIN",
  "TWITTER",
  "YOUTUBE",
  "TIKTOK",
  "GITHUB",
  "WEBSITE"
]
```

### **Exemple Minimal (mise à jour nom uniquement):**
```javascript
{
  "name": "John Doe Updated"
}
```

### **Exemple avec Image:**
```javascript
{
  "name": "John Doe",
  "description": "Developer from Tunisia",
  "profileImage": selectedImageFile  // File object
}
```

### **Exemple avec Social Media:**
```javascript
{
  "name": "John Doe",
  "country": "Tunisia", 
  "socialMediaLinks": JSON.stringify([
    {
      "platform": "FACEBOOK",
      "url": "https://facebook.com/johndoe"
    },
    {
      "platform": "LINKEDIN",
      "url": "https://linkedin.com/in/johndoe"
    }
  ])
}
```

### **Exemple Complet:**
```javascript
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "description": "Full-stack developer passionate about innovative solutions",
  "country": "Tunisia",
  "city": "Tunis",
  "phone": "+216 20 123 456",
  "webSite": "https://johndoe.dev",
  "profileImage": profileImageFile,
  "socialMediaLinks": JSON.stringify([
    {"platform": "FACEBOOK", "url": "https://facebook.com/johndoe"},
    {"platform": "INSTAGRAM", "url": "https://instagram.com/johndoe"},
    {"platform": "LINKEDIN", "url": "https://linkedin.com/in/johndoe"},
    {"platform": "GITHUB", "url": "https://github.com/johndoe"}
  ])
}
```

---

## 📤 Response Output (Détaillé pour l'équipe Front)

### **Status:** `200 OK`
### **Content-Type:** `application/json`

### **Structure Complète de la Réponse:**
```json
{
  // === INFORMATIONS UTILISATEUR MISES À JOUR ===
  "id": "user-uuid-123",
  "name": "John Doe Updated",
  "email": "john.updated@example.com", 
  "description": "Full-stack developer passionate about innovative solutions",
  "country": "Tunisia",
  "city": "Tunis",
  "birthdate": "1990-01-15T00:00:00.000Z",
  "phone": "+216 20 123 456",
  "webSite": "https://johndoe.dev",
  "profilePicture": "profile-images/profile-1726156789123-abc456.jpg",
  "CIN": null,
  "passport": null,
  "score": 100,
  "role": "User",
  "isEmailVerified": true,
  "isCompleteProfile": true,
  "isPhoneVerified": false,
  "nbPosts": 5,
  "nbProjects": 3,
  "nbOffer": 1,
  "nbConnects": 15,
  "nbFollowers": 42,
  "nbFollowing": 18,
  "nbVisits": 234,
  "timeSpent": 1250,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-09-12T10:30:00.000Z",
  
  // === RÉSEAUX SOCIAUX TRAITÉS ===
  "socialMedias": [
    {
      "id": "sm-uuid-001",
      "userId": "user-uuid-123", 
      "platform": "FACEBOOK",
      "url": "https://facebook.com/johndoe",
      "createdAt": "2024-09-12T10:30:00.000Z",
      "updatedAt": "2024-09-12T10:30:00.000Z"
    },
    {
      "id": "sm-uuid-002",
      "userId": "user-uuid-123",
      "platform": "INSTAGRAM", 
      "url": "https://instagram.com/johndoe",
      "createdAt": "2024-09-12T10:30:00.000Z",
      "updatedAt": "2024-09-12T10:30:00.000Z"
    },
    {
      "id": "sm-uuid-003",
      "userId": "user-uuid-123",
      "platform": "LINKEDIN",
      "url": "https://linkedin.com/in/johndoe", 
      "createdAt": "2024-09-12T10:30:00.000Z",
      "updatedAt": "2024-09-12T10:30:00.000Z"
    }
  ],
  
  // === MESSAGE DE CONFIRMATION ===
  "message": "Profile updated successfully"
}
```

### **Champs Calculés Automatiquement:**
- `updatedAt`: Timestamp de la dernière modification
- `profilePicture`: Chemin vers l'image uploadée (si fournie)
- `socialMedias`: Array des réseaux sociaux créés/mis à jour
- `message`: Message de confirmation

### **Gestion des Erreurs:**
```json
// 400 Bad Request - Format invalide
{
  "statusCode": 400,
  "message": "Invalid socialMediaLinks format. Must be a valid JSON array.",
  "error": "Bad Request"
}

// 400 Bad Request - Validation échouée
{
  "statusCode": 400, 
  "message": [
    "email must be an email",
    "webSite must be a URL address"
  ],
  "error": "Bad Request"
}

// 404 Not Found - Utilisateur introuvable
{
  "statusCode": 404,
  "message": "User with ID user-uuid-123 not found",
  "error": "Not Found"
}
```

---

## �🔧 Logique Automatique du Backend

### Pour chaque réseau social dans la requête :

1. **Vérification d'existence** : Vérifie si l'utilisateur a déjà ce réseau social
2. **Mise à jour** : Si existe → Met à jour l'URL
3. **Création** : Si n'existe pas → Crée un nouveau lien
4. **Performance** : Tout dans une seule transaction

### Code Backend (Logique dans le Contrôleur)
```typescript
// 1. Update user profile (réutilise services existants)
if (profileImage) {
    updatedUser = await this.userService.updateWithProfileImage(id, userUpdateData, profileImage);
} else {
    updatedUser = await this.userService.update(id, userUpdateData);
}

// 2. Handle social media links
for (const socialMediaData of parsedSocialMediaLinks) {
    const { platform, url } = socialMediaData;
    
    // Vérifier si existe déjà
    const existingSocialMedias = await this.socialMediaService.findAll();
    const existingSocialMedia = existingSocialMedias.find(
        sm => sm.userId === id && sm.platform === platform
    );

    if (existingSocialMedia) {
        // UPDATE avec service existant
        await this.socialMediaService.update(existingSocialMedia.id, { url });
    } else {
        // CREATE avec service existant
        await this.socialMediaService.create({ userId: id, platform, url });
    }
}
```

---

## 📊 Réponse Complète

```json
{
  "id": "user-uuid",
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "description": "Passionate developer in Tunisia",
  "country": "Tunisia",
  "city": "Tunis",
  "phone": "+216 20 123 456",
  "webSite": "https://johndoe.dev",
  "profilePicture": "profile-images/profile-1234567890-abc123.jpg",
  "role": "User",
  "nbFollowers": 42,
  "nbFollowing": 18,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "socialMedias": [
    {
      "id": "sm-uuid-1",
      "platform": "FACEBOOK",
      "url": "https://facebook.com/johndoe",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "sm-uuid-2", 
      "platform": "INSTAGRAM",
      "url": "https://instagram.com/johndoe",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "stats": {
    "totalPosts": 15,
    "totalProjects": 3,
    "totalOffers": 2
  }
}
```

---

## 🎯 Plateformes Supportées

- `FACEBOOK`
- `INSTAGRAM` 
- `LINKEDIN`
- `TWITTER`
- `YOUTUBE`
- `TIKTOK`
- `GITHUB`
- `WEBSITE`

---

---

## 🎯 Cas d'Usage Concrets pour l'Équipe Front

### **Cas 1: Mise à jour nom et email uniquement**
```javascript
// INPUT
const formData = new FormData();
formData.append('name', 'John Smith');
formData.append('email', 'john.smith@example.com');

// API CALL
const response = await fetch('/user/user-uuid-123', {
  method: 'PATCH',
  body: formData,
  headers: { 'Authorization': 'Bearer token' }
});

// OUTPUT (extrait)
{
  "id": "user-uuid-123",
  "name": "John Smith",
  "email": "john.smith@example.com",
  "socialMedias": [], // Inchangé
  "message": "Profile updated successfully"
}
```

### **Cas 2: Upload image de profil uniquement**
```javascript
// INPUT
const formData = new FormData();
formData.append('profileImage', selectedImageFile);

// OUTPUT (extrait)  
{
  "profilePicture": "profile-images/profile-1726156789123-abc456.jpg",
  "message": "Profile updated successfully"
}
```

### **Cas 3: Ajout de nouveaux réseaux sociaux**
```javascript
// INPUT
const formData = new FormData();
formData.append('socialMediaLinks', JSON.stringify([
  {"platform": "FACEBOOK", "url": "https://facebook.com/newuser"},
  {"platform": "GITHUB", "url": "https://github.com/newuser"}
]));

// OUTPUT (extrait)
{
  "socialMedias": [
    {
      "id": "sm-new-001", // Nouveau créé
      "platform": "FACEBOOK",
      "url": "https://facebook.com/newuser"
    },
    {
      "id": "sm-new-002", // Nouveau créé  
      "platform": "GITHUB",
      "url": "https://github.com/newuser"
    }
  ]
}
```

### **Cas 4: Mise à jour réseaux sociaux existants**
```javascript
// INPUT (utilisateur a déjà FACEBOOK et INSTAGRAM)
const formData = new FormData();
formData.append('socialMediaLinks', JSON.stringify([
  {"platform": "FACEBOOK", "url": "https://facebook.com/updated-url"}, // Sera mis à jour
  {"platform": "LINKEDIN", "url": "https://linkedin.com/in/newprofile"} // Sera créé
]));

// OUTPUT (extrait)
{
  "socialMedias": [
    {
      "id": "sm-existing-001", // ID existant conservé
      "platform": "FACEBOOK", 
      "url": "https://facebook.com/updated-url", // URL mise à jour
      "updatedAt": "2024-09-12T10:30:00.000Z"    // Timestamp mis à jour
    },
    {
      "id": "sm-new-003", // Nouveau créé
      "platform": "LINKEDIN",
      "url": "https://linkedin.com/in/newprofile",
      "createdAt": "2024-09-12T10:30:00.000Z"
    }
  ]
}
```

### **Cas 5: Mise à jour complète (profil + image + social media)**
```javascript
// INPUT
const formData = new FormData();
formData.append('name', 'John Complete');
formData.append('description', 'Full-stack developer');
formData.append('country', 'Tunisia');
formData.append('profileImage', newImageFile);
formData.append('socialMediaLinks', JSON.stringify([
  {"platform": "FACEBOOK", "url": "https://facebook.com/complete"},
  {"platform": "INSTAGRAM", "url": "https://instagram.com/complete"},
  {"platform": "LINKEDIN", "url": "https://linkedin.com/in/complete"}
]));

// OUTPUT (extrait)
{
  "name": "John Complete",
  "description": "Full-stack developer", 
  "country": "Tunisia",
  "profilePicture": "profile-images/profile-new-timestamp.jpg",
  "socialMedias": [
    // Tous les réseaux sociaux traités (créés ou mis à jour)
  ],
  "message": "Profile updated successfully"
}
```

### **⚠️ Gestion d'Erreurs Importantes**
```javascript
// Erreur: Format JSON invalide pour socialMediaLinks
const formData = new FormData();
formData.append('socialMediaLinks', 'invalid-json-string');

// RESPONSE: 400 Bad Request
{
  "statusCode": 400,
  "message": "Invalid socialMediaLinks format. Must be a valid JSON array.",
  "error": "Bad Request"
}

// Erreur: URL social media invalide
formData.append('socialMediaLinks', JSON.stringify([
  {"platform": "FACEBOOK", "url": "invalid-url"}
]));

// Le backend continuera avec les autres réseaux sociaux valides
// et loggera l'erreur sans faire échouer toute la requête
```

---

## 🔄 Migration des Anciens Endpoints

### ❌ **Endpoints Dépréciés (à remplacer)**
```typescript
PATCH /user/:id                    // ❌ Mise à jour simple (remplacé)
POST  /social-media               // ❌ Création sociale media séparée
PATCH /social-media/:id           // ❌ Mise à jour sociale media séparée
```

### ✅ **Nouvel Endpoint Unique**
```typescript
PATCH /user/:id                    // ✅ Mise à jour complète (profil + social media)
```

### 📋 **Guide de Migration Frontend**
```dart
// ❌ AVANT: Multiple appels API
Future<void> updateProfileOld() async {
  await updateUser(userId, profileData);
  for (var socialMedia in socialMedias) {
    await createOrUpdateSocialMedia(socialMedia);
  }
}

// ✅ APRÈS: Un seul appel API
Future<void> updateProfileNew() async {
  final formData = FormData.fromMap({
    ...profileData,
    'socialMediaLinks': jsonEncode(socialMedias)
  });
  await dio.patch('/user/$userId', data: formData);
}
```

---

## ⚡ Performance & Architecture

- **API simplifiée** : 1 seul endpoint au lieu de 3+
- **Réduction réseau** : ~70% moins de requêtes
- **Services réutilisés** : Aucune duplication de code, utilise UserService et SocialMediaService existants
- **Logique centralisée** : Vérifications dans le contrôleur, services maintenus propres
- **Séparation des responsabilités** : Chaque service garde sa responsabilité unique
- **Maintenabilité** : Modifications futures dans les services existants automatiquement appliquées
- **UX améliorée** : Interface plus fluide et responsive

---

## 📋 Guide Complet des Codes de Réponse

### ✅ **Succès**
| Code | Description | Exemple |
|------|-------------|---------|
| `200` | Mise à jour réussie | Profil mis à jour avec succès |

### ❌ **Erreurs Client (4xx)**
| Code | Description | Cause Commune | Action Frontend |
|------|-------------|---------------|-----------------|
| `400` | Bad Request | JSON socialMediaLinks invalide | Vérifier le format JSON |
| `400` | Bad Request | Validation échouée (email, URL) | Vérifier les formats des champs |
| `401` | Unauthorized | Token manquant/invalide | Rediriger vers login |
| `404` | Not Found | Utilisateur inexistant | Vérifier l'ID utilisateur |
| `413` | Payload Too Large | Image > 2MB | Compresser l'image |

### ⚠️ **Erreurs Serveur (5xx)**
| Code | Description | Action Frontend |
|------|-------------|-----------------|
| `500` | Internal Server Error | Réessayer ou contacter support |

### 🔧 **Headers Requis**
```javascript
{
  'Authorization': 'Bearer your-jwt-token',
  'Content-Type': 'multipart/form-data' // Automatique avec FormData
}
```

### 📱 **Exemple Flutter/Dart Complet**
```dart
import 'package:dio/dio.dart';

class UserService {
  final Dio _dio;

  Future<Map<String, dynamic>> updateCompleteProfile({
    required String userId,
    String? name,
    String? email,
    String? description,
    String? country,
    String? city,
    String? phone,
    String? webSite,
    File? profileImage,
    List<Map<String, String>>? socialMediaLinks,
  }) async {
    try {
      final formData = FormData();
      
      // Ajouter les champs utilisateur
      if (name != null) formData.fields.add(MapEntry('name', name));
      if (email != null) formData.fields.add(MapEntry('email', email));
      if (description != null) formData.fields.add(MapEntry('description', description));
      if (country != null) formData.fields.add(MapEntry('country', country));
      if (city != null) formData.fields.add(MapEntry('city', city));
      if (phone != null) formData.fields.add(MapEntry('phone', phone));
      if (webSite != null) formData.fields.add(MapEntry('webSite', webSite));
      
      // Ajouter l'image de profil
      if (profileImage != null) {
        formData.files.add(MapEntry(
          'profileImage',
          await MultipartFile.fromFile(
            profileImage.path,
            filename: 'profile.${profileImage.path.split('.').last}'
          )
        ));
      }
      
      // Ajouter les réseaux sociaux
      if (socialMediaLinks != null && socialMediaLinks.isNotEmpty) {
        formData.fields.add(MapEntry(
          'socialMediaLinks', 
          jsonEncode(socialMediaLinks)
        ));
      }

      final response = await _dio.patch(
        '/user/$userId',
        data: formData,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return response.data;
      
    } on DioException catch (e) {
      if (e.response?.statusCode == 400) {
        throw Exception('Données invalides: ${e.response?.data['message']}');
      } else if (e.response?.statusCode == 404) {
        throw Exception('Utilisateur non trouvé');
      } else if (e.response?.statusCode == 413) {
        throw Exception('Image trop volumineuse (max 2MB)');
      } else {
        throw Exception('Erreur de connexion');
      }
    }
  }
}
```
