document.addEventListener('DOMContentLoaded', () => {
  const ADMIN_PASSWORD = '1234';

  // TRABAJOS PÚBLICOS POR DEFECTO
const INITIAL_POSTS = [
    {
      title: "Percepción sobre la falta de impresoras de cortado laser y 3D en la FISI-UNSM-Perú",
      unit: "Unidad I",
      type: "MAPA MENTAL",
      course: "Teoría General de Sistemas",
      summary: "En el presente trabajo doy mi punto de vista sobre la falta de impresoras de cortado laser y 3D en la FISI.",
      pdfUrl: "tarea sobre la percepción.pdf",
      date: "10 SET. 2026"
    },
    {
      title: "Análisis General del Sistema: Pollería",
      unit: "Unidad I",
      type: "INFORME",
      course: "Teoría General de Sistemas",
      summary: "Estudio de una pollería como sistema abierto bajo la TGS: entradas, procesos, salidas, subsistemas, entorno y retroalimentación.",
      pdfUrl: "Análisis de Sistemas - Pollería.pdf", // Nombre exacto del PDF que subiste a GitHub
      date: "11 SET. 2026"
    }
  ];

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

  // FUNCIÓN PARA ABRIR PDF
  window.openPdf = function(index) {
    const post = posts[index];
    if (!post || !post.pdfUrl) {
      alert("Este trabajo no tiene un archivo PDF adjunto.");
      return;
    }

    if (!post.pdfUrl.startsWith('data:')) {
      window.open(post.pdfUrl, '_blank');
      return;
    }

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

  // INYECCIÓN DINÁMICA DE GISCUS EN CADA TARJETA
  function loadGiscusComments(filteredPosts) {
    filteredPosts.forEach((post, index) => {
      const container = document.getElementById(`giscus-container-${index}`);
      if (!container) return;

      container.innerHTML = ''; 

      const script = document.createElement('script');
      script.src = "https://giscus.app/client.js";
      script.setAttribute('data-repo', "ejmacedoma-ui/ej.-bitacora-fisi");
      script.setAttribute('data-repo-id', "R_kgDOUWGogA");
      script.setAttribute('data-category', "Announcements");
      script.setAttribute('data-category-id', "DIC_kwDOUWGogM4DFWvB");
      script.setAttribute('data-mapping', "specific");
      script.setAttribute('data-term', post.title || `Publicacion-${index}`);
      script.setAttribute('data-strict', "0");
      script.setAttribute('data-reactions-enabled', "1");
      script.setAttribute('data-emit-metadata', "0");
      script.setAttribute('data-input-position', "bottom");
      script.setAttribute('data-theme', "light");
      script.setAttribute('data-lang', "es");
      script.setAttribute('crossorigin', "anonymous");
      script.async = true;

      container.appendChild(script);
    });
  }

  // RENDERIZAR PUBLICACIONES
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

          <!-- CONTENEDOR EN VIVO DE GISCUS -->
          <div class="comments-box" style="border-top: 1px solid #e0e0e0; padding-top: 10px; margin-top: 10px;">
            <div id="giscus-container-${index}"></div>
          </div>
        </article>
      `;
    }).join('');

    // Cargar hilos de comentarios reales en tiempo real
    loadGiscusComments(filtered);
  }

  // ADMINISTRACIÓN Y EVENTOS
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