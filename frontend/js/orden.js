window.onload = async function () {

    // VALIDAR SESION
    let autenticado = false;
    let usuarioLocal = null;

    const extraerUsuario = (data) => {
        if (!data) return null;
        return data.usuario || data.Usuario || data.user || data.User || data.data || data.Data || data;
    };

    const localRaw = JSON.parse(localStorage.getItem("usuario") || "null");
    usuarioLocal = extraerUsuario(localRaw);

    if (usuarioLocal) {
        autenticado = true;
    }

    const token = localStorage.getItem("token");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    try {
        const res = await fetch("http://localhost:61828/api/usuarios/session", {
            method: "GET",
            credentials: "include",
            headers: { ...authHeaders }
        });

        if (res.ok) {
            autenticado = true;
        } else if (!usuarioLocal) {
            mostrarMensajeNoAuth("Debes iniciar sesion para ordenar");
        }

    } catch (error) {
        if (!usuarioLocal) {
            mostrarMensajeNoAuth("Error al verificar sesion");
        }
    }


    let nombre = document.getElementById("nombre");
    let platillo = document.getElementById("platillo");
    let cantidad = document.getElementById("cantidad");
    let telefono = document.getElementById("telefono");
    let comenta = document.getElementById("comentarios");
    let estadoPlatillos = document.getElementById("estadoPlatillos");

    const API_BASE = "http://localhost:61828/api";

    async function cargarPlatillos() {
        try {
            estadoPlatillos.textContent = "Cargando platillos desde la API...";

            const response = await fetch(`${API_BASE}/producto`);
            const productos = await response.json();

            productos.forEach(function (producto) {
                const option = document.createElement("option");
                option.value = producto.Nombre;
                option.textContent = producto.Nombre;
                platillo.appendChild(option);
            });

            estadoPlatillos.textContent = "Platillos cargados correctamente.";
        } catch (error) {
            estadoPlatillos.textContent = "No se pudieron cargar los platillos desde la API.";
            console.error(error);
        }
    }

    cargarPlatillos();

    // ===============================
    // BLOQUEAR FORM SI NO HAY SESION
    // ===============================

    if (!autenticado) {
        document.querySelectorAll("#formOrdenar input, #formOrdenar select, #formOrdenar button")
            .forEach(el => el.disabled = true);
        return;
    }

    // ===============================
    // VALIDACIONES
    // ===============================

    nombre.addEventListener("input", function () {
        if (nombre.value.length < 10) {
            nombre.setCustomValidity("El nombre debe tener al menos 10 caracteres");
        } else {
            nombre.setCustomValidity("");
        }
    });

    platillo.addEventListener("input", function () {
        if (platillo.value === "") {
            platillo.setCustomValidity("Selecciona un platillo");
        } else {
            platillo.setCustomValidity("");
        }
    });

    telefono.addEventListener("input", function () {
        if (telefono.validity.patternMismatch) {
            telefono.setCustomValidity("El telefono debe tener 10 digitos");
        } else {
            telefono.setCustomValidity("");
        }
    });

    cantidad.addEventListener("input", function () {
        if (cantidad.value < 1 || cantidad.value > 10) {
            cantidad.setCustomValidity("La cantidad debe ser entre 1 y 10");
        } else {
            cantidad.setCustomValidity("");
        }
    });

    document.getElementById("formOrdenar").addEventListener("submit", function (event) {
        event.preventDefault();

        const lista = document.getElementById("lista");
        let tabla = document.getElementById("tablaPedidos");

        if (!tabla) {
            tabla = document.createElement("table");
            tabla.id = "tablaPedidos";
            tabla.classList.add("tabla-estilo");

            tabla.innerHTML = `
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Platillo</th>
                        <th>Cantidad</th>
                        <th>Comentarios</th>
                        <th>Accion</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            lista.appendChild(tabla);
        }

        const tbody = tabla.querySelector("tbody");
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${nombre.value}</td>
            <td>${platillo.value}</td>
            <td>${cantidad.value}</td>
            <td>${comenta.value}</td>
            <td></td>
        `;

        const borrar = document.createElement("button");
        borrar.textContent = "Eliminar";
        borrar.classList.add("boton-eliminar");

        borrar.addEventListener("click", function () {
            fila.remove();

            if (tbody.children.length === 0) {
                tabla.remove();
            }
        });

        fila.children[4].appendChild(borrar);
        tbody.appendChild(fila);

        nombre.value = "";
        platillo.value = "";
        cantidad.value = "";
        telefono.value = "";
        comenta.value = "";
    });
};
function mostrarMensajeNoAuth(texto) {
    const mensaje = document.createElement("div");
    mensaje.className = "alerta-inactividad";
    mensaje.textContent = texto;

    document.body.appendChild(mensaje);

    setTimeout(() => {
        window.location.href = "inicioSe.html";
    }, 2000);
}
