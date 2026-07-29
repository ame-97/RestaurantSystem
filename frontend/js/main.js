document.addEventListener("DOMContentLoaded", function () {

  /* ==========================================
     AÑO FOOTER
     Inserta el año actual automáticamente
     (evita cambiarlo manual cada año)
  ========================================== */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ==========================================
     CARRUSEL
     Controla navegación, autoplay y eventos UI
  ========================================== */
  const track   = document.querySelector(".carousel-track");
  const slides  = track ? Array.from(track.querySelectorAll("img")) : [];
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const dots    = Array.from(document.querySelectorAll(".carousel-dots .dot"));

  let index      = 0;     // índice actual del slide
  let autoplayId = null;  // referencia del setInterval

  /*
     Actualiza posición del carrusel y estado visual
     del indicador activo (dot).
  */
  function updateCarousel() {
    if (!track) return;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  // Avanza al siguiente slide (loop infinito)
  function goNext() {
    index = (index + 1) % slides.length;
    updateCarousel();
  }

  // Retrocede al slide anterior
  function goPrev() {
    index = (index - 1 + slides.length) % slides.length;
    updateCarousel();
  }

  /*
     Autoplay:
     Reinicia siempre antes de crear uno nuevo
     para evitar múltiples intervalos activos.
  */
  function startAutoplay() {
    stopAutoplay();
    if (slides.length > 1) {
      autoplayId = setInterval(goNext, 4500);
    }
  }

  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  // Controles manuales
  if (nextBtn) nextBtn.addEventListener("click", () => { goNext(); stopAutoplay(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { goPrev(); stopAutoplay(); startAutoplay(); });

  // Click en dots (navegación directa)
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      index = i;
      updateCarousel();
      stopAutoplay();
      startAutoplay();
    });
  });

  /*
     UX:
     Pausa autoplay cuando el usuario interactúa
     con el carrusel (hover).
  */
  const carousel = document.querySelector(".carousel");
  if (carousel) {
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
  }

  /*
     Optimización:
     Detiene autoplay cuando la pestaña no está visible,
     evitando consumo innecesario.
  */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // Inicializa estado del carrusel
  updateCarousel();
  startAutoplay();

  /* ==========================================
     BUSCAR PLATILLO
     Redirige a menu.html con querystring
  ========================================== */
  const searchInput = document.getElementById("searchInput");
  const searchBtn   = document.getElementById("searchBtn");
  const searchHint  = document.getElementById("searchHint");

  /*
     Construye la URL con encodeURIComponent
     para evitar errores con espacios o símbolos.
  */
  function doSearch() {
    const q = (searchInput ? searchInput.value : "").trim();
    if (!q) {
      if (searchHint) searchHint.textContent = "Escribe algo para buscar (Ej: Tacos, Ensalada, Pasta...)";
      return;
    }
    window.location.href = `menu.html?search=${encodeURIComponent(q)}`;
  }

  // Click en botón buscar
  if (searchBtn)   searchBtn.addEventListener("click", doSearch);

  // Enter dentro del input
  if (searchInput) searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });

});