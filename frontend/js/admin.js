document.addEventListener("DOMContentLoaded", cargarUsuarios); // cuando carga la pagina ejecuta cargarUsuarios

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function cargarUsuarios() { // funcion async para traer usuarios de la API
    const tabla = document.querySelector("#tablaUsuarios tbody"); // selecciona el cuerpo de la tabla

    try { // intenta hacer la peticion a la API
        const response = await fetch("http://localhost:61828/api/usuarios", {
            method: "GET",
            credentials: "include",
            headers: { ...getAuthHeaders() }
        }); // pide usuarios al backend
        const data = await response.json(); // convierte la respuesta a JSON

        tabla.innerHTML = ""; // limpia la tabla antes de volver a llenarla

        data.forEach(user => { // recorre todos los usuarios
            tabla.innerHTML += ` 
                <tr>
                    <td>${user.Nombre}</td> <!-- muestra nombre -->
                    <td>${user.Email}</td> <!-- muestra email -->
                    <td>${user.RolNombre}</td> <!-- muestra rol -->
                    <td>
                        <button class="btn btn-edit" onclick="editar(${user.Id}, this)">Editar</button> <!-- boton editar -->
                        <button class="btn btn-delete" onclick="eliminar(${user.Id})">Eliminar</button> <!-- boton eliminar -->
                    </td>
                </tr>
            `;
        });

    } catch (error) { // si algo falla en la peticion
        console.error("Error al cargar usuarios:", error); // muestra error en consola
    }
}

function editar(id, btn) { // funcion para poner la fila en modo edicion
    const fila = btn.closest("tr"); // obtiene la fila del boton

    const nombre = fila.children[0].textContent; // obtiene nombre
    const email = fila.children[1].textContent; // obtiene email
    const rol = fila.children[2].textContent; // obtiene rol

    fila.innerHTML = ` 
    <td>${id}</td> <!-- id del usuario -->
    <td><input class="input-edit" type="text" id="nombre-${id}" value="${nombre}"></td> <!-- input nombre -->
    <td><input class="input-edit" type="email" id="email-${id}" value="${email}"></td> <!-- input email -->
    <td>
        <select id="rol-${id}" class="select-edit"> <!-- select de roles -->
            <option value="1" ${rol === "Admin" ? "selected" : ""}>Admin</option> <!-- opcion admin -->
            <option value="2" ${rol === "Usuario" ? "selected" : ""}>Usuario</option> <!-- opcion usuario -->
        </select>
    </td>
    <td>
        <button class="btn btn-save" onclick="guardar(${id})">Guardar</button> <!-- guardar cambios -->
        <button class="btn btn-cancel" onclick="cargarUsuarios()">Cancelar</button> <!-- cancelar edicion -->
    </td>
`;
}

function guardar(id) { // funcion para guardar cambios del usuario
    const nombre = document.getElementById(`nombre-${id}`).value; // obtiene nombre editado
    const email = document.getElementById(`email-${id}`).value; // obtiene email editado
    const rol = document.getElementById(`rol-${id}`).value; // obtiene rol seleccionado

    fetch(`http://localhost:61828/api/usuarios/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        credentials: "include",
        body: JSON.stringify({
            Id: id, // id del usuario
            Nombre: nombre, // nombre actualizado
            Email: email, // email actualizado
            Contra: "", // contrasena vacia (temporal)
            RolId: parseInt(rol) // convierte rol a numero
        })
    })
        .then(res => { // cuando responde la API
            if (!res.ok) throw new Error("Error al actualizar"); // si falla lanza error
            mostrarMensaje("Usuario actualizado correctamente", "success"); // mensaje exito
            cargarUsuarios(); // recarga tabla
        })
        .catch(err => { // si hay error
            mostrarMensaje("Error al actualizar usuario", "error"); // mensaje error
            console.error(err); // muestra error en consola
        });
}

function eliminar(id) { // funcion para eliminar usuario
    if (confirm("Eliminar usuario?")) { // pregunta confirmacion
        fetch(`http://localhost:61828/api/usuarios/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: { ...getAuthHeaders() }
        })
            .then(() => { // cuando termina
                mostrarMensaje("Usuario eliminado", "success"); // mensaje exito
                cargarUsuarios(); // recarga tabla
            });
    }
}

function mostrarMensaje(texto, tipo) { // funcion para mostrar mensajes en pantalla
    const msg = document.getElementById("mensaje"); // selecciona contenedor de mensajes

    msg.textContent = texto; // asigna texto
    msg.className = "mensaje " + tipo; // asigna estilo (success/error)
    msg.style.display = "block"; // lo muestra

    setTimeout(() => { // despues de un tiempo
        msg.style.display = "none"; // lo oculta
    }, 1000);
}
