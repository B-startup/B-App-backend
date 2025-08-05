#!/usr/bin/env node

/**
 * File Storage Initialization Script
 * 
 * This script creates the necessary directory structure for file uploads
 * and sets up the initial configuration for the File module.
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const UPLOADS_DIR = path.join(BASE_DIR, 'uploads');
const PROJECT_FILES_DIR = path.join(UPLOADS_DIR, 'ProjectFiles');

function createDirectoryIfNotExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${path.relative(BASE_DIR, dirPath)}`);
    } else {
        console.log(`📁 Directory already exists: ${path.relative(BASE_DIR, dirPath)}`);
    }
}

function createFileIfNotExists(filePath, content) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Created file: ${path.relative(BASE_DIR, filePath)}`);
    } else {
        console.log(`📄 File already exists: ${path.relative(BASE_DIR, filePath)}`);
    }
}

function initializeFileStorage() {
    console.log('🚀 Initializing File Storage...\n');

    // Create upload directories
    console.log('📁 Creating upload directories...');
    createDirectoryIfNotExists(UPLOADS_DIR);
    createDirectoryIfNotExists(PROJECT_FILES_DIR);
    createDirectoryIfNotExists(path.join(UPLOADS_DIR, 'postMedia', 'images'));
    createDirectoryIfNotExists(path.join(UPLOADS_DIR, 'postMedia', 'videos'));

    // Create README files
    console.log('\n📄 Creating documentation files...');
    
    const projectFilesReadme = `# Project Files Directory

This directory contains all files uploaded for projects.

## Structure
- Each project has its own subdirectory: \`project-{projectId}/\`
- Files are stored with timestamps to avoid naming conflicts
- Supported file types: PDF, PNG, JPG, PPT

## Security Notes
- File uploads are validated for type and size
- Access is controlled through authentication guards
- Physical files are automatically cleaned up when records are deleted

## Example Structure
\`\`\`
ProjectFiles/
├── project-123e4567-e89b-12d3-a456-426614174000/
│   ├── 1641234567890_business_plan.pdf
│   ├── 1641234568000_pitch_deck.ppt
│   └── 1641234569000_logo.png
└── project-456e7890-e89b-12d3-a456-426614174001/
    └── 1641234570000_financial_model.pdf
\`\`\`
`;

    const gitignoreContent = `# Ignore uploaded files but keep directory structure
*
!.gitignore
!README.md
`;

    createFileIfNotExists(path.join(PROJECT_FILES_DIR, 'README.md'), projectFilesReadme);
    createFileIfNotExists(path.join(PROJECT_FILES_DIR, '.gitignore'), gitignoreContent);
    createFileIfNotExists(path.join(UPLOADS_DIR, 'postMedia', 'images', '.gitignore'), gitignoreContent);
    createFileIfNotExists(path.join(UPLOADS_DIR, 'postMedia', 'videos', '.gitignore'), gitignoreContent);

    // Create example environment file
    console.log('\n⚙️  Environment configuration is now integrated in .env.example');

    // Remove old file-upload.example as it's now integrated in .env.example
    // Configuration is now part of the main .env.example file

    console.log('\n✅ File storage initialization completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the file upload configuration');
    console.log('2. Ensure proper permissions for the uploads directory');
    console.log('3. Configure your reverse proxy (if any) to handle file uploads');
    console.log('4. Test file upload functionality');
    
    console.log('\n🔧 Environment variables to add to your .env:');
    console.log('PROJECT_FILES_DIR=uploads/ProjectFiles');
    console.log('PROJECT_FILES_MAX_SIZE=10485760');
    
    console.log('\n📚 Documentation available at: docs/modules/file-module.md');
}

// Run the initialization
if (require.main === module) {
    initializeFileStorage();
}

module.exports = { initializeFileStorage };
