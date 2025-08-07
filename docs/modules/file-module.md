# File Module Documentation

## Overview

Le module File est un CRUD complet pour la gestion des fichiers de projet dans l'application BOM. Il permet d'uploader, télécharger, organiser et gérer les fichiers associés aux projets.

## Features

### ✅ **CRUD Operations**
- ✅ Create file records
- ✅ Upload files with validation
- ✅ Read files and file lists
- ✅ Update file metadata
- ✅ Delete files (records + physical files)

### ✅ **File Management**
- ✅ File type validation (PDF, PNG, JPG, PPT)
- ✅ File size validation (configurable)
- ✅ Organized storage by project
- ✅ Automatic file cleanup on deletion
- ✅ File download with proper headers

### ✅ **Project Integration**
- ✅ Files organized by project ID
- ✅ Project validation before file creation
- ✅ File statistics per project
- ✅ Bulk operations per project

### ✅ **Security**
- ✅ Authentication guards
- ✅ Resource ownership validation
- ✅ File access control
- ✅ Secure file paths

## API Endpoints

### Authentication
All endpoints require authentication with `Bearer <token>` header.

### File Operations

#### 1. Upload File
```http
POST /files/upload
Content-Type: multipart/form-data

Form Data:
- file: [binary file]
- projectId: string (UUID)
- fileType: string (PDF|PNG|JPG|PPT)
```

#### 2. Create File Record
```http
POST /files
Content-Type: application/json

{
  "projectId": "uuid",
  "fileName": "document.pdf",
  "fileType": "PDF",
  "fileUrl": "path/to/file"
}
```

#### 3. Get All Files
```http
GET /files
GET /files?projectId=uuid  # Filter by project
```

#### 4. Get Files by Project
```http
GET /files/project/{projectId}
```

#### 5. Get Project File Statistics
```http
GET /files/project/{projectId}/stats

Response:
{
  "totalFiles": 5,
  "filesByType": {
    "PDF": 3,
    "PNG": 1,
    "JPG": 1,
    "PPT": 0
  },
  "totalSizeBytes": 1024000
}
```

#### 6. Get Single File
```http
GET /files/{id}
```

#### 7. Download File
```http
GET /files/{id}/download
```

#### 8. Update File
```http
PATCH /files/{id}
Content-Type: application/json

{
  "fileName": "updated-name.pdf",
  "fileType": "PDF"
}
```

#### 9. Delete File
```http
DELETE /files/{id}
```

## Environment Configuration

```env
# Project Files Configuration
PROJECT_FILES_DIR=uploads/ProjectFiles
PROJECT_FILES_MAX_SIZE=10485760  # 10MB in bytes

# General File Upload Configuration  
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIRECTORY=uploads
```

## Directory Structure

```
uploads/
├── ProjectFiles/
│   ├── project-123e4567-e89b-12d3-a456-426614174000/
│   │   ├── 1641234567890_business_plan.pdf
│   │   ├── 1641234568000_pitch_deck.ppt
│   │   └── 1641234569000_logo.png
│   ├── project-456e7890-e89b-12d3-a456-426614174001/
│   │   └── 1641234570000_financial_model.pdf
│   └── README.md
```

## File Types Supported

| Type | MIME Types | Extensions |
|------|-----------|------------|
| PDF | application/pdf | .pdf |
| PNG | image/png | .png |
| JPG | image/jpeg, image/jpg | .jpg, .jpeg |
| PPT | application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation | .ppt, .pptx |

## Usage Examples

### Frontend File Upload (React/JavaScript)

```javascript
const uploadFile = async (file, projectId, fileType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId);
  formData.append('fileType', fileType);

  const response = await fetch('/api/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};
```

### Download File

```javascript
const downloadFile = async (fileId) => {
  const response = await fetch(`/api/files/${fileId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'filename'; // Get from response headers
  a.click();
};
```

### Get Project Statistics

```javascript
const getProjectStats = async (projectId) => {
  const response = await fetch(`/api/files/project/${projectId}/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.json();
  // Returns: { totalFiles, filesByType, totalSizeBytes }
};
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum allowed size of 10485760 bytes",
  "error": "Bad Request"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Project with ID 123 not found",
  "error": "Not Found"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied: Not the owner of this resource",
  "error": "Forbidden"
}
```

## Validation Rules

### File Upload Validation
- **File Type**: Must match declared fileType
- **File Size**: Must not exceed PROJECT_FILES_MAX_SIZE
- **Project**: Must exist in database
- **Authentication**: User must be authenticated

### File Update Validation
- **Owner**: User must own the project or be admin
- **Project**: New projectId must exist (if changing)
- **File Type**: Must be valid enum value

## Testing

### Run Tests
```bash
# Test service
npm test -- file.service.spec.ts

# Test controller
npm test -- file.controller.spec.ts

# Test all file module
npm test -- file.*spec.ts
```

### Test Coverage
- ✅ Service CRUD operations
- ✅ File upload with validation
- ✅ File download functionality
- ✅ Error handling scenarios
- ✅ Controller endpoints
- ✅ Authentication and authorization

## Security Considerations

### File Security
- Files are stored outside web root
- Access controlled through API endpoints
- File type validation prevents malicious uploads
- File size limits prevent DoS attacks

### Authentication & Authorization
- All endpoints require valid JWT token
- Update/Delete operations require resource ownership
- Token blacklist verification on each request

### File Path Security
- File names are sanitized
- Paths are generated safely
- No direct file system access from frontend

## Monitoring & Maintenance

### Logs
- File upload/download activities
- Error scenarios and failures
- Authentication and authorization events

### Cleanup
- Physical file deletion on record removal
- Orphaned file detection and cleanup
- Storage usage monitoring

### Performance
- File streaming for large downloads
- Efficient directory organization
- Database indexing on projectId

## Integration with Other Modules

### Project Module
- Files belong to projects
- Project validation before file operations
- Cascade deletion when project is deleted

### User Module
- File ownership through project ownership
- User authentication and authorization
- File access based on user permissions

### Security Module
- Token blacklist validation
- Resource ownership guards
- Authentication decorators
