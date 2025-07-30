const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('file');
const fileInputArea = document.getElementById('fileInputArea');
const fileInputText = document.getElementById('fileInputText');
const filePreview = document.getElementById('filePreview');
const submitBtn = document.getElementById('submitBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');

// Configuration de l'API
const API_BASE_URL = 'http://localhost:8050/api/v1';

// Gestion du clic sur la zone de fichier
fileInputArea.addEventListener('click', () => {
    fileInput.click();
});

// Gestion du drag and drop
fileInputArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileInputArea.classList.add('dragover');
});

fileInputArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    fileInputArea.classList.remove('dragover');
});

fileInputArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileInputArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect(files[0]);
    }
});

// Gestion de la sélection de fichier
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    // Mise à jour du texte
    fileInputText.innerHTML = `
        ✅ Fichier sélectionné: ${file.name}<br>
        <small>Taille: ${(file.size / 1024 / 1024).toFixed(2)} MB</small><br>
        <small>Type: ${file.type}</small>
    `;

    // Prévisualisation pour les images
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            filePreview.innerHTML = `
                <img src="${e.target.result}" alt="Prévisualisation">
            `;
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        filePreview.innerHTML = `
            <video width="200" height="150" controls>
                <source src="${URL.createObjectURL(file)}" type="${file.type}">
                Votre navigateur ne supporte pas la balise vidéo.
            </video>
        `;
    } else {
        filePreview.innerHTML = '';
    }
}

// Gestion de la soumission du formulaire
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const postId = document.getElementById('postId').value;
    const file = fileInput.files[0];
    
    if (!postId || !file) {
        showResult('error', 'Veuillez remplir tous les champs');
        return;
    }

    // Déterminer le type de média basé sur le type MIME du fichier
    let mediaType;
    if (file.type.startsWith('image/')) {
        mediaType = 'IMAGE';
    } else if (file.type.startsWith('video/')) {
        mediaType = 'VIDEO';
    } else {
        showResult('error', 'Type de fichier non supporté. Veuillez choisir une image ou une vidéo.');
        return;
    }

    // Préparation des données
    const formData = new FormData();
    formData.append('file', file);
    formData.append('postId', postId);
    formData.append('mediaType', mediaType);

    // Affichage du loading
    submitBtn.disabled = true;
    loading.style.display = 'block';
    result.style.display = 'none';

    try {
        // D'abord, créer un post si nécessaire
        let postExists = false;
        try {
            const checkPostResponse = await fetch(`${API_BASE_URL}/posts/${postId}`);
            postExists = checkPostResponse.ok;
        } catch (error) {
            // Le post n'existe pas ou une erreur réseau est survenue
            console.warn('Erreur lors de la vérification du post:', error);
            postExists = false;
        }

        // Créer un post si il n'existe pas
        if (!postExists) {
            const createPostResponse = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 'test-user-' + Date.now(),
                    content: 'Post créé automatiquement pour tester l\'upload de media',
                    isPublic: true
                })
            });

            if (!createPostResponse.ok) {
                throw new Error('Impossible de créer le post de test');
            }
            
            const createdPost = await createPostResponse.json();
            // Mettre à jour le postId avec l'ID du post créé
            document.getElementById('postId').value = createdPost.id;
            formData.set('postId', createdPost.id);
        }

        const response = await fetch(`${API_BASE_URL}/post-media/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showResult('success', `
                ✅ Upload réussi !<br>
                <strong>ID:</strong> ${data.id}<br>
                <strong>Post ID:</strong> ${data.postId}<br>
                <strong>URL du fichier:</strong> ${data.mediaUrl}<br>
                <strong>Type:</strong> ${data.mediaType}<br>
                <strong>Créé le:</strong> ${new Date(data.createdAt).toLocaleString('fr-FR')}
            `);
            
            // Réinitialiser le formulaire
            form.reset();
            filePreview.innerHTML = '';
            fileInputText.innerHTML = `
                📁 Cliquez ici pour choisir un fichier<br>
                <small>ou glissez-déposez un fichier ici</small><br>
                <small>Formats acceptés: Images (JPG, PNG, GIF) et Vidéos (MP4, AVI, MOV)</small>
            `;
        } else {
            // Afficher les détails de l'erreur pour le debug
            console.error('Erreur détaillée:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
            showResult('error', `❌ Erreur ${response.status}: ${data.message || data.error || 'Erreur inconnue'}<br>
                <small>Détails: ${JSON.stringify(data)}</small>`);
        }
    } catch (error) {
        showResult('error', `❌ Erreur de connexion: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        loading.style.display = 'none';
    }
});

function showResult(type, message) {
    result.className = `result ${type}`;
    result.innerHTML = message;
    result.style.display = 'block';
}

// Générer un Post ID par défaut
document.addEventListener('DOMContentLoaded', () => {
    const defaultPostId = 'post-' + Date.now();
    document.getElementById('postId').value = defaultPostId;
});
