document.addEventListener('DOMContentLoaded', () => {
  const ADMIN_PASSWORD = '1234';

  // 📌 CADA TRABAJO TIENE UN ID ÚNICO PARA QUE GISCUS SEPA EN QUÉ HILO GUARDAR SUS COMENTARIOS
  const INITIAL_POSTS = [
    {
      id: "trabajo-percepcion-impresoras-3d",
      title: "Percepción sobre la falta de impresoras de cortado laser y 3D en la FISI-UNSM-Perú",
      unit: "Unidad I",
      type: "MAPA MENTAL",
      course: "Teoría General de Sistemas",
      summary: "En el presente trabajo doy mi punto de vista sobre la falta de impresoras de cortado laser y 3D en la FISI.",
      pdfUrl: "informe1.pdf",
      date: "10 SET. 2026"
    },
    {
      id: "trabajo-analisis-sistema-polleria",
      title: "Análisis General del Sistema: Pollería",
      unit: "Unidad I",
      type: "INFORME",
      course: "Teoría General de Sistemas",
      summary: "Estudio de una pollería como sistema abierto bajo la TGS: entradas, procesos, salidas, subsistemas, entorno y retroalimentación.",
      pdfUrl: "analisis_polleria.pdf",
      date: "11 SET. 2026"
    },
    {
      id: "informe-tipos-clasificacion-sistemas",
      title: "Tipos de Sistemas y su Clasificación: Aeropuerto Comercial y Central Hidroeléctrica",
      unit: "Unidad I",
      type: "INFORME",
      course: "Teoría General de Sistemas",
      summary: "Análisis y clasificación de un Aeropuerto Comercial y una Central Hidroeléctrica bajo los 6 criterios de la TGS, junto con su bucle de retroalimentación unida[cite: 2].",
      pdfUrl: "informe_tipos_sistemas.pdf",
      date: "18 SET. 2026"
    }
  ];

  let posts = INITIAL_POSTS;
  localStorage.setItem('academic_posts', JSON.stringify(posts));

  const modal = document.getElementById('newPostDialog');
  const openBtn = document.getElementById('openModalBtn');
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

  // ABRIR PDF
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

  // 📌 CARGA UN GISCUS INDEPENDIENTE PARA CADA TRABAJO USANDO SU ID ÚNICO
  function loadGiscusComments(filteredPosts) {
    filteredPosts.forEach((post, index) => {
      const container = document.getElementById(`giscus-container-${index}`);
      if (!container) return;

      container.innerHTML = ''; 

      // Se asigna el ID único de la publicación como término de búsqueda
      const termIdentifier = post.id || post.title || `publicacion-${index}`;

      const iframe = document.createElement('iframe');
      const params = new URLSearchParams({
        origin: window.location.origin,
        repo: "ejmacedoma-ui/ej.-bitacora-fisi",
        repoId: "R_kgDOUWGogA",
        category: "Announcements",
        categoryId: "DIC_kwDOUWGogM4DFWvB",
        mapping: "specific",
        term: termIdentifier,
        strict: "0",
        reactionsEnabled: "1",
        emitMetadata: "0",
        inputPosition: "bottom",
        theme: "light",
        lang: "es"
      });

      iframe.src = `https://giscus.app/es/widget?${params.toString()}`;
      iframe.style.width = "100%";
      iframe.style.height = "380px";
      iframe.style.border = "none";
      iframe.style.borderRadius = "8px";
      iframe.loading = "lazy";

      container.appendChild(iframe);
    });
  }

  // RENDERIZAR TARJETAS EN PANTALLA
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
        <article class="post-card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
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
          </div>

          <!-- CONTENEDOR INDIVIDUAL DE COMENTARIOS -->
          <div class="comments-box" style="border-top: 1px solid #e0e0e0; padding-top: 10px; margin-top: 10px; background: #fafafa; border-radius: 8px; padding: 10px;">
            <div id="giscus-container-${index}"></div>
          </div>
        </article>
      `;
    }).join('');

    loadGiscusComments(filtered);
  }

  // MODAL Y PUBLICACIONES NUEVAS
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

  const newPostForm = document.getElementById('newPostForm');
  if (newPostForm) {
    newPostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(newPostForm);

      // Genera automáticamente un ID único para los comentarios del nuevo trabajo
      const newPost = {
        id: "trabajo-" + Date.now(),
        title: formData.get('title') || 'Publicación',
        unit: formData.get('unit') || 'Unidad I',
        type: formData.get('type') || 'Informe',
        course: formData.get('course') || '',
        summary: formData.get('summary') || '',
        pdfUrl: null,
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