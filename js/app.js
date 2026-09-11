document.addEventListener('DOMContentLoaded', () => {
  const ADMIN_PASSWORD = '1234';

  // 📌 LÍNEAS 4 - 16: TRABAJOS PÚBLICOS POR DEFECTO
  const INITIAL_POSTS = [
    {
      title: "Percepción sobre la falta de impresoras de cortado laser y 3D en la FISI-UNSM-Perú",
      unit: "Unidad I",
      type: "MAPA MENTAL",
      course: "Teoría General de Sistemas",
      summary: "En el presente trabajo doy mi punto de vista sobre la falta de impresoras de cortado laser y 3D en la FISI.",
      pdfUrl: "tarea sobre la percepción.pdf", // Nombre exacto del PDF que subiste a GitHub
      comments: [],
      date: "10 SET. 2026"
    }
  ];

  // Cargar publicaciones del navegador o establecer las iniciales
  let posts = JSON.parse(localStorage.getItem('academic_posts'));
  if (!posts || posts.length === 0) {
    posts = INITIAL_POSTS;
    localStorage.setItem('academic_posts', JSON.stringify(posts));
  }

  const modal = document.getElementById('newPostDialog');
  const openBtn = document.getElementById('openModalBtn');
  const newPostForm = document.getElementById('newPostForm');
  const postCountElem = document.getElementById('post-count');

  function updateCounter() {
    if (postCountElem) {
      postCountElem.textContent = posts.length;
    }
  }

  const normalize = str => {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/[\s\-_]/g, '')
      .replace('unidad1', 'unidadi')
      .replace('1', 'i');
  };

  let currentFilter = 'Todos';

  // 📌 LÍNEAS 43 - 75: FUNCIÓN PARA ABRIR PDFS (Locales de GitHub y Base64)
  window.openPdf = function(index) {
    const post = posts[index];
    if (!post || !post.pdfUrl) {
      alert("Este trabajo no tiene un archivo PDF adjunto.");
      return;
    }

    // Abre el archivo PDF subido directamente a tu repositorio en GitHub
    if (!post.pdfUrl.startsWith('data:')) {
      window.open(post.pdfUrl, '_blank');
      return;
    }

    // Abre el archivo procesado dinámicamente si proviene del navegador
    try {
      const parts = post.pdfUrl.split(';base64,');
      const contentType = parts[0].replace('data:', '') || 'application/pdf';
      const raw = window.atob(parts[1]);
      const uInt8Array = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      window.open(URL.createObjectURL(blob), '_blank');
    } catch (err) {
      alert("No se pudo procesar el archivo PDF.");
    }
  };

  window.addComment = function(index) {
    const authorInput = document.getElementById(`comment-author-${index}`);
    const textInput = document.getElementById(`comment-input-${index}`);

    if (!textInput || !textInput.value.trim()) return;

    const author = (authorInput && authorInput.value.trim()) ? authorInput.value.trim() : 'Lector';
    const text = textInput.value.trim();

    if (!posts[index].comments) {
      posts[index].comments = [];
    }

    posts[index].comments.push({
      author: author,
      text: text,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    });

    localStorage.setItem('academic_posts', JSON.stringify(posts));
    renderPosts(currentFilter);
  };

  function renderPosts(filterCategory = currentFilter) {
    currentFilter = filterCategory;
    const container = document.getElementById('postsGrid');
    const emptyState = document.getElementById('emptyState');
    if (!container) return;

    const filtered = posts.filter(post => {
      if (filterCategory === 'Todos' || filterCategory === 'Todas las unidades' || filterCategory === 'Todas') {
        return true;
      }
      return normalize(post.unit) === normalize(filterCategory);
    });

    if (filtered.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = filtered.map((post, index) => {
      const comments = post.comments || [];
      const commentsHtml = comments.map(c => `
        <div style="font-size: 0.8rem; background: #f8f9fa; padding: 6px 10px; border-radius: 6px; margin-top: 4px; border: 1px solid #eee; color: #333;">
          <strong>${c.author || 'Lector'}:</strong> ${c.text} <span style="opacity: 0.5; font-size: 0.75rem; float: right;">${c.date}</span>
        </div>
      `).join('');

      return `
        <article class="post-card">
          <div class="post-header">
            <span class="post-type">${post.type || 'TRABAJO'}</span>
            <span class="post-date">${post.date || 'Reciente'}</span>
          </div>
          <small class="post-course">${post.course || ''}</small>
          <h3>${post.title || 'Sin título'}</h3>
          <p>${post.summary || ''}</p>

          <div class="post-footer" style="margin-bottom: 12px;">
            ${post.pdfUrl 
              ? `<button type="button" onclick="openPdf(${index})" class="read-more" style="background:none; border:none; padding:0; cursor:pointer; font:inherit; color:#6d0821; font-weight:bold; text-decoration:underline;">Abrir PDF 📄</button>`
              : `<span class="read-more" style="opacity:0.5;">Sin PDF</span>`
            }
          </div>

          <div class="comments-box" style="border-top: 1px solid #e0e0e0; padding-top: 10px; margin-top: 10px;">
            <div style="font-size: 0.8rem; font-weight: bold; color: #555; margin-bottom: 6px;">
              💬 Comentarios (${comments.length})
            </div>

            <div style="max-height: 100px; overflow-y: auto; margin-bottom: 8px;">
              ${commentsHtml || '<p style="font-size:0.75rem; color:#888; margin:0;">Sé el primero en comentar.</p>'}
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; gap: 6px;">
                <input type="text" id="comment-author-${index}" placeholder="Tu nombre..." style="width: 35%; padding: 6px 10px; font-size: 0.8rem; border: 1px solid #ccc; border-radius: 6px; outline: none;">
                <input type="text" id="comment-input-${index}" placeholder="Escribe un comentario..." style="flex: 1; padding: 6px 10px; font-size: 0.8rem; border: 1px solid #ccc; border-radius: 6px; outline: none;">
              </div>
              <button type="button" onclick="addComment(${index})" style="padding: 6px 12px; font-size: 0.8rem; background: #6d0821; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; align-self: flex-end;">Enviar</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  if (openBtn && modal) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const inputPass = prompt("Ingresa la clave de administrador para agregar contenido:");
      
      if (inputPass === ADMIN_PASSWORD) {
        modal.showModal();
      } else if (inputPass !== null) {
        alert("Clave incorrecta. Solo el propietario de la bitácora puede publicar.");
      }
    });
  }

  const closeElements = document.querySelectorAll('.dialog-close, [data-close-dialog], #closeModalBtn');
  closeElements.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.close();
    });
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const clickedInside = (
        rect.top <= e.clientY && e.clientY <= rect.bottom &&
        rect.left <= e.clientX && e.clientX <= rect.right
      );
      if (!clickedInside) modal.close();
    });
  }

  const fileToBase64 = file => new Promise((resolve, reject) => {
    if (!file || file.size === 0) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  if (newPostForm) {
    newPostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(newPostForm);
      const pdfFile = formData.get('pdfDocument');

      let pdfUrl = null;
      if (pdfFile && pdfFile.size > 0) {
        try {
          pdfUrl = await fileToBase64(pdfFile);
        } catch (err) {
          console.error("Error procesando PDF:", err);
        }
      }

      const newPost = {
        title: formData.get('title') || '',
        unit: formData.get('unit') || 'Unidad I',
        type: formData.get('type') || 'Informe',
        course: formData.get('course') || '',
        summary: formData.get('summary') || '',
        pdfUrl: pdfUrl,
        comments: [],
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
      };

      posts.unshift(newPost);
      localStorage.setItem('academic_posts', JSON.stringify(posts));

      updateCounter();
      renderPosts(currentFilter);

      if (modal) modal.close();
      newPostForm.reset();
    });
  }

  const filterButtons = document.querySelectorAll('.filters button, .unit-btn, [data-filter]');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      const selectedFilter = e.currentTarget.getAttribute('data-filter') || e.currentTarget.textContent.trim();
      renderPosts(selectedFilter);
    });
  });

  updateCounter();
  renderPosts('Todos');
});