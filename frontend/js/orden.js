window.onload = async function () {


    const API =
        "http://localhost:61828/api";


    const IMG =
        "http://localhost:61828/img/";




    // ===============================
    // SESION
    // ===============================


    let autenticado = false;
    let usuarioLocal = null;


    function extraerUsuario(data) {

        if (!data) return null;

        return data.usuario ||
            data.Usuario ||
            data.user ||
            data.User ||
            data.data ||
            data.Data ||
            data;

    }



    function obtenerUsuarioId(){

        const guardado =
            extraerUsuario(
                JSON.parse(localStorage.getItem("usuario") || "null")
            );

        return guardado &&
            (
                guardado.Id ||
                guardado.id ||
                guardado.UsuarioId
            );

    }



    usuarioLocal =
        extraerUsuario(
            JSON.parse(localStorage.getItem("usuario") || "null")
        );


    if (usuarioLocal) {
        autenticado = true;
    }


    const token =
        localStorage.getItem("token");


    const authHeaders =
        token ? { Authorization: `Bearer ${token}` } : {};


    try {

        const res = await fetch(
            `${API}/usuarios/session`,
            {
                method: "GET",
                credentials: "include",
                headers: { ...authHeaders }
            }
        );

        if (res.ok) {

            autenticado = true;

            // La sesión trae el nombre real del usuario, que es más confiable
            // que lo que haya quedado en localStorage.
            const datosSesion = extraerUsuario(await res.json());

            if (datosSesion && datosSesion.Nombre) {
                usuarioLocal = datosSesion;
            }

        }

    }
    catch (error) {
        console.log(error);
    }




    // ===============================
    // ELEMENTOS
    // ===============================


    const formulario = document.getElementById("formOrdenar");

    const nombre = document.getElementById("nombre");
    const telefono = document.getElementById("telefono");
    const comentarios = document.getElementById("comentarios");
    const cantidad = document.getElementById("cantidad");

    const platillo = document.getElementById("platillo");
    const contenedorPlatillos = document.getElementById("platillos");
    const filtrosPlatillos = document.getElementById("filtrosPlatillos");
    const estadoPlatillos = document.getElementById("estadoPlatillos");
    const resumenLinea = document.getElementById("resumenLinea");

    const estadoNombre = document.getElementById("estadoNombre");

    const tipoPedido = document.getElementById("tipoPedido");
    const metodoPago = document.getElementById("metodoPago");

    const datosDireccion = document.getElementById("datosDireccion");
    const calle = document.getElementById("calle");
    const colonia = document.getElementById("colonia");
    const referencia = document.getElementById("referencia");
    const estadoDireccion = document.getElementById("estadoDireccion");
    const latitud = document.getElementById("latitud");
    const longitud = document.getElementById("longitud");
    const usarUbicacion = document.getElementById("usarUbicacion");

    const estadoPedido = document.getElementById("estadoPedido");


    let direccionValida = false;
    let platillos = [];
    let categoriaActiva = "todos";
    let platilloElegido = null;




    // ===============================
    // MENSAJES EN PANTALLA
    // ===============================


    function mostrarMensaje(texto, tipo, elemento) {

        estadoPedido.textContent = texto;

        estadoPedido.className = `mensaje ${tipo}`;

        estadoPedido.style.display = texto ? "block" : "none";


        if (elemento) {

            elemento.scrollIntoView({ block: "center", behavior: "smooth" });

            if (typeof elemento.focus === "function") {
                elemento.focus({ preventScroll: true });
            }

        }

    }



    function limpiarMensaje() {
        mostrarMensaje("", "");
    }



    // La API responde el error como {Message} en BadRequest y agrega
    // ExceptionMessage cuando algo truena del lado del servidor.
    function mensajeDeError(data) {

        if (!data) return "No se pudo registrar el pedido";

        return data.ExceptionMessage ||
            data.Message ||
            data.message ||
            "No se pudo registrar el pedido";

    }



    function escapar(texto) {

        return String(texto === null || texto === undefined ? "" : texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

    }




    // ===============================
    // PLATILLOS
    // ===============================


    async function traer(recurso) {

        const respuesta = await fetch(`${API}/${recurso}`);

        if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);

        return respuesta.json();

    }



    async function cargarPlatillos() {

        estadoPlatillos.textContent = "Cargando platillos...";


        try {

            const [productos, detalles, imagenes, categorias] =
                await Promise.all([
                    traer("producto"),
                    traer("detalleproducto"),
                    traer("imagen"),
                    traer("categorias")
                ]);


            platillos = productos.map(producto => {

                const detalle = detalles.find(d => d.ProductoId === producto.Id);
                const imagen = imagenes.find(i => i.ProductoId === producto.Id);
                const categoria = categorias.find(c => c.Id === producto.CategoriaId);

                return {
                    id: producto.Id,
                    nombre: producto.Nombre,
                    categoria: categoria ? categoria.Nombre : "sin categoría",
                    descripcion: detalle ? detalle.Descripcion : "",
                    precio: detalle ? Number(detalle.Precio) : 0,
                    imagen: imagen ? `${IMG}${imagen.Url}` : ""
                };

            });


            pintarFiltros();
            pintarPlatillos();

            estadoPlatillos.textContent = "";

        }
        catch (error) {

            console.error(error);

            estadoPlatillos.textContent =
                "No se pudieron cargar los platillos. Revisa que la API esté encendida.";

        }

    }



    function pintarFiltros() {

        const categorias = [];

        platillos.forEach(p => {
            if (!categorias.includes(p.categoria)) categorias.push(p.categoria);
        });


        filtrosPlatillos.innerHTML =
            [`<button type="button" class="filtro-chip activo" data-categoria="todos">Todos</button>`]
            .concat(
                categorias.map(c =>
                    `<button type="button" class="filtro-chip" data-categoria="${escapar(c)}">${escapar(c)}</button>`
                )
            )
            .join("");


        filtrosPlatillos.querySelectorAll(".filtro-chip").forEach(chip => {

            chip.addEventListener("click", () => {

                categoriaActiva = chip.dataset.categoria;

                filtrosPlatillos.querySelectorAll(".filtro-chip")
                    .forEach(c => c.classList.toggle("activo", c === chip));

                pintarPlatillos();

            });

        });

    }



    function pintarPlatillos() {

        const visibles =
            categoriaActiva === "todos"
                ? platillos
                : platillos.filter(p => p.categoria === categoriaActiva);


        if (!visibles.length) {

            contenedorPlatillos.innerHTML =
                `<p class="api-order-status">No hay platillos en esta categoría.</p>`;

            return;

        }


        contenedorPlatillos.innerHTML = visibles.map(p => `
<label class="platillo-card${platilloElegido && platilloElegido.id === p.id ? " seleccionado" : ""}">

    <input type="radio" name="platilloOpcion" value="${p.id}"${platilloElegido && platilloElegido.id === p.id ? " checked" : ""}>

    <img class="platillo-foto" src="${escapar(p.imagen)}" alt="${escapar(p.nombre)}" loading="lazy">

    <span class="platillo-cuerpo">
        <span class="platillo-cat">${escapar(p.categoria)}</span>
        <span class="platillo-nombre">${escapar(p.nombre)}</span>
        <span class="platillo-desc">${escapar(p.descripcion)}</span>
        <span class="platillo-precio">$${p.precio.toFixed(2)}</span>
    </span>

    <span class="platillo-check"><i class="fa-solid fa-check"></i></span>

</label>`).join("");


        contenedorPlatillos.querySelectorAll('input[name="platilloOpcion"]')
            .forEach(radio => {

                radio.addEventListener("change", () => {

                    platilloElegido =
                        platillos.find(p => p.id === Number(radio.value)) || null;

                    platillo.value = radio.value;

                    contenedorPlatillos.querySelectorAll(".platillo-card")
                        .forEach(card =>
                            card.classList.toggle(
                                "seleccionado",
                                card.contains(radio) && radio.checked
                            )
                        );

                    actualizarLinea();

                    limpiarMensaje();

                });

            });

    }



    function actualizarLinea() {

        if (!platilloElegido) {
            resumenLinea.textContent = "";
            return;
        }


        const piezas = Math.max(1, Number(cantidad.value) || 1);

        resumenLinea.innerHTML =
            `${escapar(platilloElegido.nombre)} × ${piezas} = <strong>$${(platilloElegido.precio * piezas).toFixed(2)}</strong>`;

    }




    // ===============================
    // BLOQUEAR SIN SESION
    // ===============================


    if (!autenticado) {

        formulario
            .querySelectorAll("input, select, button, textarea")
            .forEach(e => e.disabled = true);

        estadoPlatillos.textContent =
            "Inicia sesión para poder ordenar.";

        return;

    }



    cargarPlatillos();




    // ===============================
    // DATOS DEL USUARIO
    // ===============================
    // El nombre se precarga con el de la cuenta; el usuario puede corregirlo.


    if (usuarioLocal && usuarioLocal.Nombre) {

        nombre.value = usuarioLocal.Nombre;

        revisarNombre();

    }



    function validarNombre() {

        const valor = nombre.value.trim();


        if (valor.length < 5) {
            return "Escribe tu nombre completo (mínimo 5 letras)";
        }


        if (valor.length > 60) {
            return "El nombre es demasiado largo";
        }


        if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'´\s-]+$/.test(valor)) {
            return "El nombre solo puede llevar letras";
        }


        const palabras =
            valor.split(/\s+/).filter(p => p.length >= 2);


        if (palabras.length < 2) {
            return "Incluye al menos nombre y apellido";
        }


        return "";

    }



    function revisarNombre() {

        const error = validarNombre();

        nombre.setCustomValidity(error);

        // Solo se avisa cuando algo está mal: el borde verde ya dice que está bien.
        estadoNombre.textContent = error;

        return error;

    }



    nombre.addEventListener("blur", revisarNombre);

    nombre.addEventListener("input", () => {
        if (estadoNombre.textContent) revisarNombre();
    });



    telefono.addEventListener("input", () => {
        telefono.value = telefono.value.replace(/\D/g, "").slice(0, 10);
    });



    cantidad.addEventListener("input", actualizarLinea);


    document.getElementById("masCantidad").addEventListener("click", () => {
        cantidad.value = Math.min(10, (Number(cantidad.value) || 1) + 1);
        actualizarLinea();
    });


    document.getElementById("menosCantidad").addEventListener("click", () => {
        cantidad.value = Math.max(1, (Number(cantidad.value) || 1) - 1);
        actualizarLinea();
    });




    // ===============================
    // OPCIONES (entrega y pago)
    // ===============================
    // Las tarjetas de opción escriben en un input oculto y disparan "change",
    // así los listeners que ya existían (aquí y en pago.js) siguen sirviendo
    // sin cambios.


    function conectarOpciones(grupo, destino) {

        const radios =
            document.querySelectorAll(`input[name="${grupo}"]`);


        radios.forEach(radio => {

            radio.addEventListener("change", () => {

                radios.forEach(r =>
                    r.closest(".opcion").classList.toggle("seleccionada", r.checked)
                );

                destino.value = radio.value;

                destino.dispatchEvent(new Event("change"));

                limpiarMensaje();

            });

        });

    }


    conectarOpciones("tipoPedidoOpcion", tipoPedido);
    conectarOpciones("metodoPagoOpcion", metodoPago);




    // ===============================
    // UBICACION Y DIRECCION REAL
    // ===============================


    function pedirCoordenadas() {

        return new Promise((resolve, reject) => {

            if (!navigator.geolocation) {
                reject(new Error("Este navegador no soporta geolocalización"));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                posicion => resolve(posicion.coords),
                error => reject(error),
                { enableHighAccuracy: true, timeout: 10000 }
            );

        });

    }



    // Geocodificación inversa: de coordenadas a una dirección escrita real.
    async function direccionDesdeCoordenadas(lat, lon) {

        const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat=${lat}&lon=${lon}`;

        const respuesta = await fetch(url);

        if (!respuesta.ok) throw new Error("Nominatim no respondió");

        return respuesta.json();

    }



    async function autocompletarDireccion() {

        estadoDireccion.textContent = "Buscando tu ubicación...";


        try {

            const coords = await pedirCoordenadas();

            latitud.value = coords.latitude;
            longitud.value = coords.longitude;


            estadoDireccion.textContent = "Traduciendo tu ubicación a una dirección...";


            const lugar =
                await direccionDesdeCoordenadas(coords.latitude, coords.longitude);

            const dir = (lugar && lugar.address) || {};


            const via = dir.road || dir.pedestrian || dir.residential || "";

            const numero = dir.house_number ? ` ${dir.house_number}` : "";

            const barrio =
                dir.neighbourhood ||
                dir.suburb ||
                dir.quarter ||
                dir.city_district ||
                dir.town ||
                "";


            if (!via && !barrio) {

                estadoDireccion.textContent =
                    "Tenemos tu ubicación, pero no un nombre de calle. Escríbela tú.";

                return;

            }


            if (via) calle.value = `${via}${numero}`.trim();

            if (barrio) colonia.value = barrio;


            // La dirección viene del mismo servicio que la valida, así que ya
            // cuenta como verificada.
            direccionValida = true;

            calle.setCustomValidity("");
            colonia.setCustomValidity("");

            estadoDireccion.textContent =
                "Tomamos tu dirección de la ubicación actual. Corrígela si hace falta.";

        }
        catch (error) {

            console.log(error);

            estadoDireccion.textContent =
                "No pudimos obtener tu ubicación. Escribe tu dirección y la validamos.";

        }

    }



    usarUbicacion.addEventListener("click", autocompletarDireccion);




    // ===============================
    // VALIDACION DIRECCION ESCRITA
    // ===============================


    async function buscarPorCalle(calleTexto) {

        const url =
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&street=${encodeURIComponent(calleTexto)}&country=Mexico&viewbox=-98.30,19.15,-98.05,18.95&bounded=1`;

        const respuesta = await fetch(url);

        return respuesta.json();

    }



    async function buscarPorColonia(coloniaTexto) {

        const url =
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(coloniaTexto)}&viewbox=-98.30,19.15,-98.05,18.95&bounded=1`;

        const respuesta = await fetch(url);

        return respuesta.json();

    }



    function quitarNumero(texto) {
        return texto.replace(/[0-9].*$/, "").trim();
    }



    async function validarDireccionEscrita() {

        const calleValor = calle.value.trim();
        const coloniaValor = colonia.value.trim();


        if (calleValor.length < 5 || coloniaValor.length < 3) {

            direccionValida = false;

            calle.setCustomValidity("Dirección incompleta");
            colonia.setCustomValidity("Dirección incompleta");

            estadoDireccion.textContent =
                "Completa calle y colonia para validar la dirección";

            return;

        }


        estadoDireccion.textContent = "Validando dirección...";


        try {

            const porCalleCompleta = await buscarPorCalle(calleValor);


            if (porCalleCompleta.length > 0) {

                aceptarDireccion(
                    porCalleCompleta[0],
                    "Dirección válida"
                );

                return;

            }


            const porCalleSinNumero =
                await buscarPorCalle(quitarNumero(calleValor));


            if (porCalleSinNumero.length > 0) {

                aceptarDireccion(
                    porCalleSinNumero[0],
                    "Dirección aproximada validada: se usará esta zona como referencia de entrega"
                );

                return;

            }


            const porColonia = await buscarPorColonia(coloniaValor);


            if (porColonia.length > 0) {

                aceptarDireccion(
                    porColonia[0],
                    "No se pudo confirmar la calle exacta, pero la colonia es válida en Puebla; se usará como referencia de entrega"
                );

            }
            else {

                direccionValida = false;

                calle.setCustomValidity("La dirección no pudo ser encontrada");
                colonia.setCustomValidity("La dirección no pudo ser encontrada");

                latitud.value = "";
                longitud.value = "";

                estadoDireccion.textContent =
                    "No se encontró la dirección, revisa calle y colonia";

            }

        }
        catch (error) {

            console.error(error);

            direccionValida = false;

            estadoDireccion.textContent = "Error validando la dirección";

        }

    }



    function aceptarDireccion(resultado, texto) {

        direccionValida = true;

        calle.setCustomValidity("");
        colonia.setCustomValidity("");

        latitud.value = resultado.lat;
        longitud.value = resultado.lon;

        estadoDireccion.textContent = texto;

    }



    calle.addEventListener("blur", validarDireccionEscrita);
    colonia.addEventListener("blur", validarDireccionEscrita);




    // ===============================
    // DOMICILIO
    // ===============================


    tipoPedido.addEventListener("change", () => {

        if (tipoPedido.value === "A domicilio") {

            datosDireccion.style.display = "block";

            // Se intenta llenar con la dirección real de donde está el usuario.
            autocompletarDireccion();

        }
        else {

            datosDireccion.style.display = "none";

            calle.value = "";
            colonia.value = "";
            referencia.value = "";
            latitud.value = "";
            longitud.value = "";

            calle.setCustomValidity("");
            colonia.setCustomValidity("");

            direccionValida = false;

            estadoDireccion.textContent = "";

        }

    });




    // ===============================
    // PAGO
    // ===============================


    Pago.init();


    // Los chips llenan el número de tarjeta de prueba de un clic.
    document.querySelectorAll(".chip-tarjeta").forEach(chip => {

        chip.addEventListener("click", () => {

            const numero = document.getElementById("numeroTarjeta");

            numero.value = chip.dataset.tarjeta;

            numero.dispatchEvent(new Event("input"));

            numero.focus();

        });

    });




    // ===============================
    // VALIDACION ANTES DE ENVIAR
    // ===============================


    function revisarFormulario() {

        if (!platillo.value) {
            return { mensaje: "Elige un platillo para continuar.", foco: contenedorPlatillos };
        }


        const piezas = Number(cantidad.value);

        if (!piezas || piezas < 1 || piezas > 10) {
            return { mensaje: "La cantidad debe estar entre 1 y 10.", foco: cantidad };
        }


        const errorNombre = revisarNombre();

        if (errorNombre) {
            return { mensaje: errorNombre, foco: nombre };
        }


        if (!/^\d{10}$/.test(telefono.value)) {
            return { mensaje: "El teléfono debe tener 10 dígitos.", foco: telefono };
        }


        if (!tipoPedido.value) {
            return { mensaje: "Elige si tu pedido es para llevar o a domicilio.", foco: datosDireccion };
        }


        if (tipoPedido.value === "A domicilio") {

            if (!direccionValida) {
                return { mensaje: "Verifica que la dirección sea válida antes de continuar.", foco: calle };
            }

            if (!latitud.value || !longitud.value) {
                return { mensaje: "No se obtuvo la ubicación. Usa el botón de ubicación e intenta de nuevo.", foco: calle };
            }

        }


        if (!metodoPago.value) {
            return { mensaje: "Elige un método de pago.", foco: metodoPago };
        }


        const resultadoPago = Pago.validar();

        if (!resultadoPago.ok) {
            return { mensaje: resultadoPago.mensaje, foco: null };
        }


        return null;

    }




    // ===============================
    // ENVIAR PEDIDO
    // ===============================


    formulario.addEventListener("submit", async function (e) {


        e.preventDefault();

        limpiarMensaje();


        const usuarioId = obtenerUsuarioId();


        if (!usuarioId) {

            mostrarMensaje(
                "No se encontró tu usuario. Inicia sesión de nuevo.",
                "error"
            );

            return;

        }


        const problema = revisarFormulario();

        if (problema) {

            mostrarMensaje(problema.mensaje, "error", problema.foco);

            return;

        }


        const direccionCompleta =
            [calle.value, colonia.value, referencia.value]
                .filter(x => x && x.trim() !== "")
                .join(", ");


        const esDomicilio = tipoPedido.value === "A domicilio";


        const pedido = {

            UsuarioId: usuarioId,

            TipoPedido: tipoPedido.value,

            Direccion: esDomicilio ? direccionCompleta : null,

            Latitud: esDomicilio ? Number(latitud.value) : null,

            Longitud: esDomicilio ? Number(longitud.value) : null,

            MetodoPago: metodoPago.value,

            Detalles: [
                {
                    ProductoId: Number(platillo.value),
                    Cantidad: Number(cantidad.value)
                }
            ]

        };


        const boton = formulario.querySelector('button[type="submit"]');

        boton.disabled = true;


        try {

            const respuesta = await fetch(
                `${API}/pedido`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(pedido)
                }
            );


            // La respuesta no siempre es JSON (por ejemplo una página de error
            // de IIS), así que se lee de forma defensiva.
            let data = null;

            try {
                data = await respuesta.json();
            }
            catch (errorJson) {
                data = null;
            }


            if (!respuesta.ok) {

                console.error(data);

                mostrarMensaje(mensajeDeError(data), "error");

                return;

            }


            const guardado = (data && data.pedido) || {};


            mostrarMensaje(
                `Pedido #${guardado.Id} registrado. Total: $${Number(guardado.Total || 0).toFixed(2)}`,
                "success"
            );


            limpiarFormulario();


            // El resumen se recarga desde la API: así solo aparecen los pedidos
            // que de verdad quedaron guardados en la base.
            await cargarPedidos();

        }
        catch (error) {

            console.error(error);

            mostrarMensaje(
                "No se pudo conectar con el servidor. Revisa que la API esté encendida.",
                "error"
            );

        }
        finally {

            boton.disabled = false;

        }

    });



    function limpiarFormulario() {

        formulario.reset();


        // reset() no dispara "change", así que el estado visual se limpia aquí.
        document.querySelectorAll(".opcion.seleccionada")
            .forEach(o => o.classList.remove("seleccionada"));

        document.querySelectorAll(".platillo-card.seleccionado")
            .forEach(c => c.classList.remove("seleccionado"));


        platillo.value = "";
        tipoPedido.value = "";
        metodoPago.value = "";

        platilloElegido = null;

        resumenLinea.textContent = "";


        datosDireccion.style.display = "none";

        latitud.value = "";
        longitud.value = "";

        direccionValida = false;

        estadoDireccion.textContent = "";


        // El nombre se vuelve a precargar: es un dato de la cuenta, no del pedido.
        if (usuarioLocal && usuarioLocal.Nombre) {
            nombre.value = usuarioLocal.Nombre;
        }

        estadoNombre.textContent = "";


        Pago.reiniciar();

    }




    // ===============================
    // HISTORIAL DE PEDIDOS
    // ===============================
    // El resumen se arma con lo que responde la API, no con lo que quedó en el
    // formulario. Así refleja lo que está guardado y sobrevive a recargas.


    function formatearFecha(fecha) {

        const valor = new Date(fecha);

        return isNaN(valor.getTime())
            ? ""
            : valor.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });

    }



    // Los mismos iconos que usa el paso 4, para que un método de pago se vea
    // igual cuando lo eliges que cuando lo consultas.
    const ICONOS_PAGO = {
        "Efectivo": "fa-money-bill-wave",
        "Tarjeta al recibir": "fa-credit-card",
        "Tarjeta simulada": "fa-lock"
    };



    function crearTarjetaPedido(pedido) {

        const div = document.createElement("div");

        div.className = "pedido-item";


        const esDomicilio = pedido.TipoPedido === "A domicilio";

        const pagado = pedido.EstadoPago === "Pagado";

        const iconoPago = ICONOS_PAGO[pedido.MetodoPago] || "fa-wallet";


        const detalles =
            (pedido.Detalles || [])
                .map(d => `
<p>
<i class="fa-solid fa-utensils"></i>
<strong>${escapar(d.ProductoNombre)}</strong>
× ${escapar(d.Cantidad)} — $${Number(d.Subtotal || 0).toFixed(2)}
</p>`)
                .join("");


        div.innerHTML = `

<div class="pedido-header">

    <span class="badge ${esDomicilio ? "domicilio" : "llevar"}">
        <i class="fa-solid ${esDomicilio ? "fa-house-chimney" : "fa-bag-shopping"}"></i>
        ${escapar(pedido.TipoPedido)}
    </span>

    <span class="badge ${pagado ? "pagado" : "pendiente"}">
        <i class="fa-solid ${pagado ? "fa-circle-check" : "fa-hourglass-half"}"></i>
        ${escapar(pedido.EstadoPago)}
    </span>

</div>


<div class="pedido-info">

${detalles}

<p><i class="fa-solid ${iconoPago}"></i> <strong>Método de pago:</strong> ${escapar(pedido.MetodoPago)}</p>

<p><i class="fa-solid fa-location-dot"></i> <strong>Dirección:</strong> ${esDomicilio ? escapar(pedido.Direccion) : "No aplica"}</p>

${esDomicilio ? `<p class="ubicacion"><i class="fa-solid fa-crosshairs"></i> <strong>Ubicación:</strong> ${escapar(pedido.Latitud)} , ${escapar(pedido.Longitud)}</p>` : ""}

<p><i class="fa-regular fa-clock"></i> <strong>Fecha:</strong> ${escapar(formatearFecha(pedido.Fecha))}</p>

</div>


<div class="pedido-total">
    <i class="fa-solid fa-receipt"></i>
    Total: $${Number(pedido.Total || 0).toFixed(2)}
</div>


<div class="pedido-id">
    <i class="fa-solid fa-hashtag"></i>
    Pedido ${escapar(pedido.Id)}
</div>

`;


        return div;

    }



    async function cargarPedidos() {

        const lista = document.getElementById("lista");

        const usuarioId = obtenerUsuarioId();


        if (!usuarioId) return;


        try {

            const respuesta =
                await fetch(`${API}/pedido/usuario/${usuarioId}`);


            if (!respuesta.ok) {

                lista.innerHTML =
                    `<p class="api-order-status">No se pudo cargar tu historial de pedidos.</p>`;

                return;

            }


            const pedidos = await respuesta.json();


            lista.innerHTML = "";


            if (!pedidos.length) {

                lista.innerHTML =
                    `<p class="api-order-status">Todavía no has hecho ningún pedido.</p>`;

                return;

            }


            pedidos.forEach(pedido =>
                lista.appendChild(crearTarjetaPedido(pedido))
            );

        }
        catch (error) {

            console.error(error);

            lista.innerHTML =
                `<p class="api-order-status">No se pudo cargar tu historial de pedidos.</p>`;

        }

    }



    cargarPedidos();


};
