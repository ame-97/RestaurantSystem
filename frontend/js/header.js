document.addEventListener("DOMContentLoaded", async () => {

    console.log("Header cargado");

    const admin1 = document.getElementById("menuAdmin1");
    const admin2 = document.getElementById("menuAdmin2");
    const nombreUsuario = document.getElementById("nombreUsuario");
    const btnLogout = document.getElementById("btnLogout");
    const linkUsuario = document.getElementById("linkUsuario");

    const extraerUsuario = (data) => {
        if (!data) return null;
        return data.usuario || data.Usuario || data.user || data.User || data.data || data.Data || data;
    };

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

    try {
        const res = await fetch("http://localhost:61828/api/usuarios/session", {
            method: "GET",
            credentials: "include"
        });

        console.log("STATUS SESSION:", res.status);

        if (res.ok) {
            const raw = await res.text();
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    const usuario = extraerUsuario(data);
                    if (usuario) {
                        localStorage.setItem("usuario", JSON.stringify(usuario));
                        aplicarHeader(usuario);
                    }
                } catch (error) {
                    console.warn("No se pudo parsear sesión, usando respaldo local.");
                }
            }
        }

    } catch (error) {
        console.log("ERROR SESION:", error);
    }
});

function logout() {
    localStorage.removeItem("usuario");
    fetch("http://localhost:61828/api/usuarios/logout", {
        method: "POST",
        credentials: "include"
    })
    .finally(() => {
        window.location.href = "inicioSe.html";
    });
}
