document.getElementById('photo-names-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const names = document.getElementById('photo-names').value.split('\n').filter(Boolean);
  generatePhotoUploadForm(names);
});

function generatePhotoUploadForm(names) {
  const form = document.getElementById('photo-upload-form');
  form.innerHTML = ''; // Clear existing content
  names.forEach((name) => {
    const div = document.createElement('div');
    div.classList.add('photo-group');
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
  document.getElementById('photo-names-form').style.display = 'none';
  document.getElementById('photo-upload-section').style.display = 'block';
}

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

document.getElementById('process-button').addEventListener('click', async () => {
  const photoGroups = document.querySelectorAll('.photo-group');
  const zip = new JSZip();

  for (const group of photoGroups) {
    const name = group.querySelector('label').textContent.trim();
    const inputs = group.querySelectorAll('input[type="file"]');
    let fileIndex = 1;
    let filesSelected = false;

    for (const input of inputs) {
      const file = input.files[0];
      if (file) {
        filesSelected = true;
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
      alert(`No files selected for ${name}`);
      return;
    }
  }

  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'renamed-photos.zip');
  });
});
