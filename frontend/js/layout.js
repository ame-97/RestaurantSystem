/*
   layout.js
   Carga header/footer dinamicos y activa su comportamiento.
*/

let tiempoInactivo; // control global

document.addEventListener("DOMContentLoaded", () => {
  loadPartial("header-container", "header.html", initHeader);
  loadPartial("footer-container", "footer.html", initFooter);
});

function loadPartial(containerId, fileName, onLoad) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const candidates = [fileName, `./${fileName}`, `/${fileName}`];

  const tryFetch = (index) => {
    if (index >= candidates.length) {
      console.error(`No se pudo cargar ${fileName}`);
      return;
    }

    fetch(candidates[index])
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((html) => {
        container.innerHTML = html;
        if (typeof onLoad === "function") onLoad(container);
      })
      .catch(() => tryFetch(index + 1));
  };

  tryFetch(0);
}

function initHeader() {
  console.log("Header insertado");

  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  const admin1 = document.getElementById("menuAdmin1");
  const admin2 = document.getElementById("menuAdmin2");
  const nombreUsuario = document.getElementById("nombreUsuario");
  const btnLogout = document.getElementById("btnLogout");
  const linkUsuario = document.getElementById("linkUsuario");

  const extraerUsuario = (data) => {
    if (!data) return null;
    return data.usuario || data.Usuario || data.user || data.User || data.data || data.Data || data;
  };

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // =========================
  // MENÚ RESPONSIVE
  // =========================
  if (toggle && links && toggle.dataset.bound !== "true") {
    const closeMenu = () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeMenu();
    });

    toggle.dataset.bound = "true";
  }

  // =========================
  // SESIÓN USUARIO
  // =========================

  if (nombreUsuario) nombreUsuario.textContent = "Iniciar sesión";
  if (btnLogout) btnLogout.style.display = "none";
  if (admin1) admin1.style.display = "none";
  if (admin2) admin2.style.display = "none";
  if (linkUsuario) linkUsuario.href = "inicioSe.html";

  const aplicarHeader = (usuario) => {
    const rolId = Number(
      usuario?.RolId ??
      usuario?.rolId ??
      usuario?.RoleId
    );
    const rolNombre = String(
      usuario?.RolNombre ??
      usuario?.rolNombre ??
      usuario?.RoleName ??
      usuario?.roleName ??
      usuario?.rol ??
      usuario?.role ??
      ""
    ).toLowerCase();
    const esAdmin = rolId === 1 || rolNombre === "admin";
    const nombre = usuario?.Nombre ?? usuario?.nombre ?? "Mi cuenta";

    if (nombreUsuario) {
      nombreUsuario.textContent = nombre;
    }

    if (admin1) admin1.style.display = esAdmin ? "inline-block" : "none";
    if (admin2) admin2.style.display = esAdmin ? "inline-block" : "none";

    if (btnLogout) {
      btnLogout.style.display = "inline-block";
      btnLogout.onclick = logout;
    }

    if (linkUsuario) {
      linkUsuario.href = "#";
    }
  };

  const usuarioLocalRaw = JSON.parse(localStorage.getItem("usuario") || "null");
  const usuarioLocal = extraerUsuario(usuarioLocalRaw);
  if (usuarioLocal) aplicarHeader(usuarioLocal);

  fetch("http://localhost:61828/api/usuarios/session", {
    method: "GET",
    credentials: "include",
    headers: { ...authHeaders }
  })
  .then(async (res) => {
    console.log("SESSION STATUS:", res.status);

    if (!res.ok) return null;

    const raw = await res.text();
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("No se pudo parsear sesión, usando respaldo local.");
      return null;
    }
  })
  .then(data => {
    const usuario = extraerUsuario(data);
    if (usuario) {
      console.log("USUARIO:", usuario);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      aplicarHeader(usuario);
    }

    // INICIAR CONTROL DE INACTIVIDAD SOLO SI HAY SESIÓN
    if (data) iniciarInactividad();

  })
  .catch(() => {});
}

// =========================
// CONTROL INACTIVIDAD
// =========================

function iniciarInactividad() {

  function resetTimer() {
    clearTimeout(tiempoInactivo);

    tiempoInactivo = setTimeout(() => {
      mostrarInactividad();
    }, 1800000); // 30 minutos
  }

  ["click", "mousemove", "keydown", "scroll"].forEach(event => {
    document.addEventListener(event, resetTimer);
  });

  resetTimer();
}

// =========================
// MENSAJE INACTIVIDAD
// =========================

function mostrarInactividad() {

  console.log("Sesión expirada");

  const alerta = document.createElement("div");
  alerta.className = "alerta-inactividad";
  alerta.textContent = "Sesión cerrada por inactividad";

  document.body.appendChild(alerta);

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  fetch("http://localhost:61828/api/usuarios/logout", {
    method: "POST",
    credentials: "include",
    headers: { ...authHeaders }
  })
  .finally(() => {
    setTimeout(() => {
      window.location.href = "inicioSe.html";
    }, 2000);
  });
}

// =========================
// LOGOUT MANUAL
// =========================

function logout() {
  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  localStorage.removeItem("usuario");
  localStorage.removeItem("token");

  fetch("http://localhost:61828/api/usuarios/logout", {
    method: "POST",
    credentials: "include",
    headers: { ...authHeaders }
  })
  .finally(() => {
    window.location.href = "index.html";
  });
}

// =========================
//  FOOTER
// =========================

function initFooter() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const btn = document.getElementById("newsletterBtn");
  const input = document.getElementById("newsletterEmail");
  const message = document.getElementById("newsletterMessage");

  if (!btn || !input || !message) return;

  btn.addEventListener("click", () => {
    const email = input.value.trim();

    if (email === "") {
      message.textContent = "Ingresa un correo valido.";
      message.className = "newsletter-message show error";
      return;
    }

    message.textContent = "Gracias por suscribirte!";
    message.className = "newsletter-message show success";
    input.value = "";

    setTimeout(() => {
      message.classList.remove("show");
    }, 3000);
  });
}
