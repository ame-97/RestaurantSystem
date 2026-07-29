// URL base de la API
const API = "http://localhost:61828/api";


document.addEventListener("DOMContentLoaded", () => {

    // Conectamos el formulario de categorías con su función de guardar
    document.getElementById("formCategoria").addEventListener("submit", guardarCategoria);

    cargarCategorias();  //categorías en el select
    cargarCategoriasTabla(); //categorías en tabla
    cargarProductos();   //productos en tabla

    // Elementos del DOM para manejar imagen y mensajes
    const inputImagen = document.getElementById("imagenProducto");
    const preview = document.getElementById("previewImagen");
    const mensaje = document.getElementById("mensaje");


    // Evento para cuando el usuario selecciona una imagen
    inputImagen.addEventListener("change", () => {
        const file = inputImagen.files[0];

        if (file) {
            preview.src = URL.createObjectURL(file); // crea URL temporal de la imagen
            preview.style.display = "block"; // muestra la imagen en pantalla
        }
    });


    //Evento del formulario de productos

    document.getElementById("formProducto").addEventListener("submit", async (e) => {
        e.preventDefault(); // evita que la página se recargue

        // Obtener valores del formulario
        const nombre = document.getElementById("nombreProducto").value;
        const categoriaId = document.getElementById("categoriaProducto").value;
        const descripcion = document.getElementById("descripcionProducto").value;
        const precio = document.getElementById("precioProducto").value;
        const imagenFile = document.getElementById("imagenProducto").files[0];

        try {
            //Crear el producto en la base de datos     
            const resProducto = await fetch(`${API}/producto`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Nombre: nombre,
                    CategoriaId: parseInt(categoriaId)
                })
            });

            // Obtener el producto creado 
            const producto = await resProducto.json();

            //Guardar el detalle del producto (precio y descripción)
            await fetch(`${API}/detalleproducto`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ProductoId: producto.Id,
                    Descripcion: descripcion,
                    Precio: parseFloat(precio)
                })
            });

            //Guardar imagen del producto (solo nombre en este caso)
            await fetch(`${API}/imagen`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ProductoId: producto.Id,
                    Url: imagenFile.name
                })
            });

            // Mostrar mensaje de éxito al usuario
            mensaje.textContent = "Producto agregado correctamente";
            mensaje.className = "mensaje success";
            mensaje.style.display = "block";

            // Limpiar formulario después de guardar
            document.getElementById("formProducto").reset();
            preview.src = "";
            preview.style.display = "none";

            // Recargar productos en la tabla
            cargarProductos();

        } catch (error) {
            console.error(error);

            // Mostrar error si algo falla
            mensaje.textContent = "Error al guardar producto";
            mensaje.className = "mensaje error";
            mensaje.style.display = "block";
        }

        // Ocultar mensaje
        setTimeout(() => mensaje.style.display = "none", 1000);
    });
});


//CATEGORÍAS (SELECT)

async function cargarCategorias() {
    const select = document.getElementById("categoriaProducto");

    // Reinicia opciones del select
    select.innerHTML = `<option value="">Selecciona una categoría</option>`;

    // Trae categorías desde API
    const res = await fetch(`${API}/categorias`);
    const data = await res.json();

    // Agrega cada categoría como option
    data.forEach(cat => {
        select.innerHTML += `<option value="${cat.Id}">${cat.Nombre}</option>`;
    });
}


//Guardar nueva categoría desde formulario

async function guardarCategoria(e) {
    e.preventDefault(); // evita recargar página

    const nombre = document.getElementById("nombreCategoria").value;
    const mensaje = document.getElementById("mensajeCategoria");

    try {
        // Enviar categoría al backend
        await fetch(`${API}/categorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nombre: nombre })
        });

        // Mensaje de éxito
        mensaje.textContent = "Categoría agregada";
        mensaje.className = "mensaje success";
        mensaje.style.display = "block";

        // Limpiar formulario
        document.getElementById("formCategoria").reset();

        // Recargar datos en UI
        cargarCategorias();
        cargarCategoriasTabla();

    } catch {
        // Mensaje de error
        mensaje.textContent = "Error al agregar categoría";
        mensaje.className = "mensaje error";
    }

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => mensaje.style.display = "none", 3000);
}

    //Muestra todos los productos en una tabla
async function cargarProductos() {
    const tbody = document.querySelector("#tablaProductos tbody");

    // Trae los datos
    const [productos, detalles, categorias] = await Promise.all([
        fetch(`${API}/producto`).then(r => r.json()),
        fetch(`${API}/detalleproducto`).then(r => r.json()),
        fetch(`${API}/categorias`).then(r => r.json())
    ]);

    // Limpia la tabla antes de llenar
    tbody.innerHTML = "";

    // Construye filas
    productos.forEach(p => {
        const detalle = detalles.find(d => d.ProductoId === p.Id);
        const categoria = categorias.find(c => c.Id === p.CategoriaId);

        tbody.innerHTML += `
            <tr>
                <td>${p.Id}</td>
                <td>${p.Nombre}</td>
                <td>${categoria ? categoria.Nombre : "Sin categoría"}</td>
                <td>$${detalle ? detalle.Precio : "-"}</td>
                <td>
                    <button class="btn btn-edit" onclick="editar(${p.Id}, this)">Editar</button>
                    <button class="btn btn-delete" onclick="eliminar(${p.Id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}


//Convierte la fila en inputs editables
async function editar(id, btn) {
    const fila = btn.closest("tr");

    const nombre = fila.children[1].textContent;
    const precio = fila.children[3].textContent.replace("$", "");

    const resCat = await fetch(`${API}/categorias`);
    const categorias = await resCat.json();

    //Se crea  la tabla
    fila.innerHTML = ` 
        <td>${id}</td>
        <td><input id="nombre-${id}" value="${nombre}"></td>
        <td>
            <select id="categoria-${id}">
                ${categorias.map(c => `<option value="${c.Id}">${c.Nombre}</option>`).join("")}
            </select>
        </td>
        <td><input id="precio-${id}" value="${precio}"></td>
        <td>
            <button class="btn btn-save" onclick="guardar(${id})">Guardar</button>
            <button class="btn btn-cancel" onclick="cargarProductos()">Cancelar</button>
        </td>
    `;
}


//GUARDAR PRODUCTO EDITADO
async function guardar(id) {
    const nombre = document.getElementById(`nombre-${id}`).value;
    const categoriaId = document.getElementById(`categoria-${id}`).value;
    const precio = document.getElementById(`precio-${id}`).value.replace("$", "");

    // actualizar producto
    await fetch(`${API}/producto/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Id: id,
            Nombre: nombre,
            CategoriaId: parseInt(categoriaId)
        })
    });

    // actualizar detalle del producto
    await fetch(`${API}/detalleproducto/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Precio: parseFloat(precio),
            Descripcion: ""
        })
    });

    // recargar tabla
    cargarProductos();
}

//ELIMINAR PRODUCTO
async function eliminar(id) {
    await fetch(`${API}/producto/${id}`, {
        method: "DELETE"
    });

    cargarProductos();
}


//CATEGORÍAS TABLA
async function cargarCategoriasTabla() {
    const tbody = document.querySelector("#tablaCategorias tbody");

    const res = await fetch(`${API}/categorias`);
    const data = await res.json();

    tbody.innerHTML = "";

    data.forEach(cat => {

        //Se crea la tabla
        tbody.innerHTML += `
            <tr>
                <td>${cat.Id}</td>
                <td>${cat.Nombre}</td>
                <td>
                    <button class="btn btn-edit" onclick="editarCategoria(${cat.Id}, this)">Editar</button>
                    <button class="btn btn-delete" onclick="eliminarCategoria(${cat.Id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}


//EDITAR CATEGORÍA
function editarCategoria(id, btn) {
    const fila = btn.closest("tr");
    const nombre = fila.children[1].textContent;

    //Se crea la tabla
    fila.innerHTML = `
        <td>${id}</td>
        <td><input id="cat-${id}" value="${nombre}"></td>
        <td>
            <button class="btn btn-save" onclick="guardarCategoriaEdit(${id})">Guardar</button>
            <button class="btn btn-cancel" onclick="cargarCategoriasTabla()">Cancelar</button>
        </td>
    `;
}


//GUARDAR CATEGORÍA EDITADA
async function guardarCategoriaEdit(id) {
    const nombre = document.getElementById(`cat-${id}`).value;

    await fetch(`${API}/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Id: id,
            Nombre: nombre
        })
    });

    cargarCategorias();
    cargarCategoriasTabla();
}


//ELIMINAR CATEGORÍA
async function eliminarCategoria(id) {
    await fetch(`${API}/categorias/${id}`, {
        method: "DELETE"
    });

    cargarCategorias();
    cargarCategoriasTabla();
}