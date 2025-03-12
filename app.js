// Register service worker for offline capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

// Handle offline status
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
  const offlineIndicator = document.getElementById('offline-indicator');
  if (!navigator.onLine) {
    offlineIndicator.style.display = 'block';
  } else {
    offlineIndicator.style.display = 'none';
  }
}

// Initial check for online status
document.addEventListener('DOMContentLoaded', () => {
  updateOnlineStatus();
  const textarea = document.getElementById('photo-names');
  textarea.value = ''; // Explicitly clear any default value
  
  // Set up the back button
  document.getElementById('back-button').addEventListener('click', () => {
    document.getElementById('photo-upload-section').style.display = 'none';
    document.getElementById('photo-names-section').style.display = 'block';
  });
  
  // Set up the PWA install button
  let deferredPrompt;
  const installContainer = document.getElementById('install-container');
  const installButton = document.getElementById('install-button');
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    installContainer.style.display = 'block';
  });
  
  installButton.addEventListener('click', () => {
    // Hide the install button, as it can't be called twice
    installContainer.style.display = 'none';
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the saved prompt since it can't be used again
      deferredPrompt = null;
    });
  });
  
  // Hide the install UI when the app is installed
  window.addEventListener('appinstalled', () => {
    installContainer.style.display = 'none';
    console.log('PWA was installed');
  });
});

// Listen for submission of the photo names form
document.getElementById('photo-names-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const textarea = document.getElementById('photo-names');
  textarea.value = textarea.value.trim(); // Remove leading/trailing whitespace
  const names = textarea.value.split('\n').filter(Boolean);
  generatePhotoUploadForm(names);
});

// Generate the photo upload form based on the provided photo names
function generatePhotoUploadForm(names) {
  const form = document.getElementById('photo-upload-form');
  form.innerHTML = ''; // Clear existing content
  names.forEach((name) => {
    const div = document.createElement('div');
    div.classList.add('photo-group');
    div.setAttribute('data-name', name.trim()); // Add data-name for highlighting later
    div.innerHTML = `
      <label>${name}</label>
      <div class="file-inputs">
        <div class="file-input">
          <input type="file" accept="image/*" data-name="${name.trim()}" />
        </div>
      </div>
      <button type="button" class="add-photo-btn" data-name="${name.trim()}">Add Photo</button>
    `;
    form.appendChild(div);
  });
  document.getElementById('photo-names-section').style.display = 'none';
  document.getElementById('photo-upload-section').style.display = 'block';
}

// Handle adding additional photo inputs for each name
document.getElementById('photo-upload-form').addEventListener('click', (event) => {
  if (event.target && event.target.classList.contains('add-photo-btn')) {
    const name = event.target.getAttribute('data-name');
    const photoGroup = event.target.parentNode;
    const fileInputsDiv = photoGroup.querySelector('.file-inputs');

    const newFileInputDiv = document.createElement('div');
    newFileInputDiv.classList.add('file-input');
    newFileInputDiv.innerHTML = `
      <input type="file" accept="image/*" data-name="${name.trim()}" />
    `;
    fileInputsDiv.appendChild(newFileInputDiv);
  }
});

// Handle image previews when a file is selected
document.getElementById('photo-upload-form').addEventListener('change', (event) => {
  if (event.target && event.target.matches('input[type="file"]')) {
    handleFileSelect(event);
  }
});

function handleFileSelect(event) {
  const file = event.target.files[0];

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      let img = event.target.parentNode.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.style.maxWidth = '100px';
        img.style.display = 'block';
        event.target.parentNode.appendChild(img);
      }
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Handle processing of the uploaded photos
document.getElementById('process-button').addEventListener('click', async () => {
  const photoGroups = document.querySelectorAll('.photo-group');
  const zip = new JSZip();
  let missingPhotos = []; // To store names with missing photos
  let filesAdded = false; // To check if at least one file has been uploaded

  // Reset any previous "missing" highlights
  photoGroups.forEach(group => group.classList.remove('missing'));

  // Check for missing photos and prepare ZIP
  for (const group of photoGroups) {
    const name = group.querySelector('label').textContent.trim();
    const inputs = group.querySelectorAll('input[type="file"]');
    let fileIndex = 1;
    let filesSelected = false;

    for (const input of inputs) {
      const file = input.files[0];
      if (file) {
        filesSelected = true;
        filesAdded = true; // At least one file has been uploaded
        const data = await file.arrayBuffer();
        const extension = file.name.split('.').pop();
        let fileName = `${name}.${extension}`;

        if (fileIndex > 1) {
          fileName = `${name}_${fileIndex}.${extension}`;
        }

        zip.file(fileName, data);
        fileIndex++;
      }
    }

    if (!filesSelected) {
      missingPhotos.push(name);
    }
  }

  // If there are missing photos, show popup instead of alert
  if (missingPhotos.length > 0) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
      <div class="popup-content">
        <p>Warning: No files were uploaded for the following names:</p>
        <ul>${missingPhotos.map(name => `<li>${name}</li>`).join('')}</ul>
        <button id="add-missing-btn">Add Missing Photos</button>
        <button id="download-anyway-btn">Download Anyway</button>
      </div>
    `;
    document.body.appendChild(popup);

    // Handle "Add Missing Photos" button
    document.getElementById('add-missing-btn').addEventListener('click', () => {
      document.body.removeChild(popup);
      // Highlight missing photo groups in red
      photoGroups.forEach(group => {
        const name = group.getAttribute('data-name');
        if (missingPhotos.includes(name)) {
          group.classList.add('missing');
        }
      });
    });

    // Handle "Download Anyway" button
    document.getElementById('download-anyway-btn').addEventListener('click', async () => {
      document.body.removeChild(popup);
      if (filesAdded) {
        zip.generateAsync({ type: 'blob' }).then((content) => {
          saveAs(content, 'renamed-photos.zip');
        });
      } else {
        alert('No files were uploaded. Please upload at least one file to generate the ZIP.');
      }
    });
  } else {
    // No missing photos, proceed directly to download
    if (filesAdded) {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'renamed-photos.zip');
      });
    } else {
      alert('No files were uploaded. Please upload at least one file to generate the ZIP.');
    }
  }
});
