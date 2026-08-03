window.onload = async function () {


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



    if(usuarioLocal){
        autenticado = true;
    }



    const token =
        localStorage.getItem("token");



    const authHeaders =
        token
        ?
        {
            Authorization:`Bearer ${token}`
        }
        :
        {};





    try{

        const res =
            await fetch(
                "http://localhost:61828/api/usuarios/session",
                {
                    method:"GET",
                    credentials:"include",
                    headers:{
                        ...authHeaders
                    }
                }
            );


        if(res.ok){
            autenticado=true;
        }


    }
    catch(error){

        console.log(error);

    }





    // ===============================
    // ELEMENTOS
    // ===============================


    const nombre =
        document.getElementById("nombre");


    const platillo =
        document.getElementById("platillo");


    const cantidad =
        document.getElementById("cantidad");


    const comentarios =
        document.getElementById("comentarios");


    const estadoPlatillos =
        document.getElementById("estadoPlatillos");


    const tipoPedido =
        document.getElementById("tipoPedido");


    const metodoPago =
        document.getElementById("metodoPago");


    const datosDireccion =
        document.getElementById("datosDireccion");


    const calle =
        document.getElementById("calle");


    const colonia =
        document.getElementById("colonia");


    const referencia =
        document.getElementById("referencia");


    const estadoDireccion =
        document.getElementById("estadoDireccion");


    const latitud =
        document.getElementById("latitud");


    const longitud =
        document.getElementById("longitud");


    const estadoPedido =
        document.getElementById("estadoPedido");


    let direccionValida = false;



    const API =
        "http://localhost:61828/api";




    // ===============================
    // MENSAJES EN PANTALLA
    // ===============================


    function mostrarMensaje(texto, tipo){


        estadoPedido.textContent = texto;


        estadoPedido.className =
            `mensaje ${tipo}`;


        estadoPedido.style.display =
            texto ? "block" : "none";


    }



    function limpiarMensaje(){


        mostrarMensaje("", "");


    }



    // La API responde el error como {Message} en BadRequest y agrega
    // ExceptionMessage cuando algo truena del lado del servidor.
    function mensajeDeError(data){


        if(!data){

            return "No se pudo registrar el pedido";

        }


        return data.ExceptionMessage ||
            data.Message ||
            data.message ||
            "No se pudo registrar el pedido";


    }







    // ===============================
    // CARGAR PRODUCTOS
    // ===============================


    async function cargarPlatillos(){


        try{


            estadoPlatillos.textContent =
                "Cargando platillos...";



            const response =
                await fetch(
                    `${API}/producto`
                );



            const productos =
                await response.json();



            productos.forEach(producto=>{


                const option =
                    document.createElement("option");


                option.value =
                    producto.Id;


                option.textContent =
                    producto.Nombre;


                platillo.appendChild(option);



            });



            estadoPlatillos.textContent =
                "Platillos cargados correctamente";



        }
        catch(error){


            console.error(error);


            estadoPlatillos.textContent =
                "Error cargando platillos";


        }


    }



    cargarPlatillos();







    // ===============================
    // BLOQUEAR SIN SESION
    // ===============================


    if(!autenticado){


        document
        .querySelectorAll(
            "#formOrdenar input,#formOrdenar select,#formOrdenar button"
        )
        .forEach(
            e=>e.disabled=true
        );


        return;

    }









    // ===============================
    // VALIDACION DIRECCION (GEOLOCALIZACION)
    // ===============================


    async function buscarPorCalle(calleTexto){


        const url =
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&street=${encodeURIComponent(calleTexto)}&country=Mexico&viewbox=-98.30,19.15,-98.05,18.95&bounded=1`;


        const respuesta =
            await fetch(url);


        return await respuesta.json();


    }



    async function buscarPorColonia(coloniaTexto){


        const url =
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(coloniaTexto)}&viewbox=-98.30,19.15,-98.05,18.95&bounded=1`;


        const respuesta =
            await fetch(url);


        return await respuesta.json();


    }



    function quitarNumero(texto){


        return texto
            .replace(/[0-9].*$/, "")
            .trim();


    }



    async function validarDireccionEscrita(){


        const calleValor =
            calle.value.trim();


        const coloniaValor =
            colonia.value.trim();


        if(calleValor.length < 5 || coloniaValor.length < 3){


            direccionValida = false;


            calle.setCustomValidity("Dirección incompleta");

            colonia.setCustomValidity("Dirección incompleta");


            estadoDireccion.textContent =
                "Completa calle y colonia para validar la dirección";


            return;


        }



        estadoDireccion.textContent =
            "Validando dirección...";



        try{


            const resultadosCalleCompleta =
                await buscarPorCalle(calleValor);



            if(resultadosCalleCompleta.length > 0){


                direccionValida = true;


                calle.setCustomValidity("");

                colonia.setCustomValidity("");


                latitud.value =
                    resultadosCalleCompleta[0].lat;


                longitud.value =
                    resultadosCalleCompleta[0].lon;


                estadoDireccion.textContent =
                    "Dirección válida";


                return;


            }



            const calleSinNumero =
                quitarNumero(calleValor);


            const resultadosCalleSinNumero =
                await buscarPorCalle(calleSinNumero);



            if(resultadosCalleSinNumero.length > 0){


                direccionValida = true;


                calle.setCustomValidity("");

                colonia.setCustomValidity("");


                latitud.value =
                    resultadosCalleSinNumero[0].lat;


                longitud.value =
                    resultadosCalleSinNumero[0].lon;


                estadoDireccion.textContent =
                    "Dirección aproximada validada: se usará esta zona como referencia de entrega";


                return;


            }



            const resultadosColonia =
                await buscarPorColonia(coloniaValor);



            if(resultadosColonia.length > 0){


                direccionValida = true;


                calle.setCustomValidity("");

                colonia.setCustomValidity("");


                latitud.value =
                    resultadosColonia[0].lat;


                longitud.value =
                    resultadosColonia[0].lon;


                estadoDireccion.textContent =
                    "No se pudo confirmar la calle exacta, pero la colonia es válida en Puebla; se usará como referencia de entrega";


            }
            else{


                direccionValida = false;


                calle.setCustomValidity("La dirección no pudo ser encontrada");

                colonia.setCustomValidity("La dirección no pudo ser encontrada");


                latitud.value = "";

                longitud.value = "";


                estadoDireccion.textContent =
                    "No se encontró la dirección, revisa calle y colonia";


            }


        }
        catch(error){


            console.error(error);


            direccionValida = false;


            estadoDireccion.textContent =
                "Error validando la dirección";


        }


    }



    calle.addEventListener(
        "blur",
        validarDireccionEscrita
    );



    colonia.addEventListener(
        "blur",
        validarDireccionEscrita
    );








    // ===============================
    // DOMICILIO
    // ===============================


    tipoPedido.addEventListener(
        "change",
        ()=>{


            if(tipoPedido.value === "A domicilio"){


                datosDireccion.style.display =
                    "block";


                calle.required=true;

                colonia.required=true;


                obtenerUbicacion();



            }
            else{


                datosDireccion.style.display =
                    "none";


                calle.required=false;

                colonia.required=false;



                calle.value="";

                colonia.value="";

                referencia.value="";

                latitud.value="";

                longitud.value="";


                calle.setCustomValidity("");

                colonia.setCustomValidity("");


                direccionValida = false;


                estadoDireccion.textContent =
                    "";


            }


        }
    );




    // ===============================
    // PAGO
    // ===============================
    // pago.js se encarga de mostrar, validar y limpiar los campos de tarjeta
    // cuando el método de pago es "Tarjeta simulada".


    Pago.init();










    // ===============================
    // ENVIAR PEDIDO
    // ===============================


    document
    .getElementById("formOrdenar")
    .addEventListener(
        "submit",
        async function(e){


            e.preventDefault();


            limpiarMensaje();




            const usuarioId =
                obtenerUsuarioId();




            if(!usuarioId){


                mostrarMensaje(
                    "No se encontró tu usuario. Inicia sesión de nuevo.",
                    "error"
                );


                return;

            }






            // VALIDAR DIRECCION Y UBICACION

            if(tipoPedido.value === "A domicilio"){


                if(!direccionValida){


                    mostrarMensaje(
                        "Verifica que la dirección sea válida antes de continuar.",
                        "error"
                    );


                    return;


                }



                if(!latitud.value || !longitud.value){


                    mostrarMensaje(
                        "No se obtuvo la ubicación. Activa el permiso de ubicación e intenta nuevamente.",
                        "error"
                    );


                    obtenerUbicacion();

                    return;


                }


            }




            // VALIDAR PAGO SIMULADO


            const resultadoPago =
                Pago.validar();


            if(!resultadoPago.ok){


                mostrarMensaje(
                    resultadoPago.mensaje,
                    "error"
                );


                return;


            }







            const direccionCompleta =

                [
                    calle.value,
                    colonia.value,
                    referencia.value
                ]
                .filter(
                    x => x && x.trim() !== ""
                )
                .join(", ");







            const pedido = {


                UsuarioId:
                    usuarioId,


                TipoPedido:
                    tipoPedido.value,



                Direccion:
                    tipoPedido.value === "A domicilio"
                    ?
                    direccionCompleta
                    :
                    null,



                Latitud:
                    tipoPedido.value === "A domicilio"
                    ?
                    Number(latitud.value)
                    :
                    null,



                Longitud:
                    tipoPedido.value === "A domicilio"
                    ?
                    Number(longitud.value)
                    :
                    null,



                MetodoPago:
                    metodoPago.value,



                Detalles:[

                    {

                        ProductoId:
                            Number(
                                platillo.value
                            ),


                        Cantidad:
                            Number(
                                cantidad.value
                            )


                    }

                ]



            };









            try{


                const response =
                    await fetch(
                        `${API}/pedido`,
                        {


                            method:"POST",


                            headers:{

                                "Content-Type":
                                "application/json"

                            },


                            body:
                            JSON.stringify(pedido)


                        }
                    );





                // La respuesta no siempre es JSON (por ejemplo una página de
                // error de IIS), así que se lee de forma defensiva.

                let data = null;


                try{

                    data = await response.json();

                }
                catch(errorJson){

                    data = null;

                }







                if(!response.ok){


                    console.error(data);


                    mostrarMensaje(
                        mensajeDeError(data),
                        "error"
                    );


                    return;


                }





                const pedidoGuardado =
                    (data && data.pedido) || {};


                mostrarMensaje(
                    `Pedido #${pedidoGuardado.Id} registrado correctamente. Total: $${Number(pedidoGuardado.Total || 0).toFixed(2)}`,
                    "success"
                );





                // LIMPIAR FORMULARIO


                document
                .getElementById("formOrdenar")
                .reset();



                datosDireccion.style.display =
                    "none";



                calle.required = false;

                colonia.required = false;



                latitud.value="";
                longitud.value="";



                direccionValida = false;

                estadoDireccion.textContent = "";



                // Borra los datos de la tarjeta y oculta el bloque.

                Pago.reiniciar();




                // El resumen se recarga desde la API: así solo aparecen los
                // pedidos que de verdad quedaron guardados en la base.

                await cargarPedidos();



            }
            catch(error){


                console.error(error);


                mostrarMensaje(
                    "No se pudo conectar con el servidor. Revisa que la API esté encendida.",
                    "error"
                );


            }



        }
    );










    // ===============================
    // HISTORIAL DE PEDIDOS
    // ===============================
    // El resumen se arma con lo que responde la API, no con lo que quedó en el
    // formulario. Así refleja exactamente lo que está guardado en la base y
    // sobrevive a recargas de la página.


    function escapar(texto){


        return String(texto === null || texto === undefined ? "" : texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");


    }



    function formatearFecha(fecha){


        const valor = new Date(fecha);


        return isNaN(valor.getTime())
            ? ""
            : valor.toLocaleString("es-MX", {
                dateStyle: "medium",
                timeStyle: "short"
            });


    }



    const ICONOS_PAGO = {
        "Efectivo": "fa-money-bill-wave",
        "Tarjeta al recibir": "fa-credit-card",
        "Tarjeta simulada": "fa-lock"
    };



    function crearTarjetaPedido(pedido){


        const div =
            document.createElement("div");


        div.className =
            "pedido-item";



        const esDomicilio =
            pedido.TipoPedido === "A domicilio";


        const pagado =
            pedido.EstadoPago === "Pagado";


        const iconoPago =
            ICONOS_PAGO[pedido.MetodoPago] || "fa-wallet";



        const detalles =
            (pedido.Detalles || [])
            .map(detalle => `
<p>
<i class="fa-solid fa-utensils"></i>
<strong>${escapar(detalle.ProductoNombre)}</strong>
× ${escapar(detalle.Cantidad)} — $${Number(detalle.Subtotal || 0).toFixed(2)}
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



    async function cargarPedidos(){


        const lista =
            document.getElementById("lista");


        const usuarioId =
            obtenerUsuarioId();


        if(!usuarioId){

            return;

        }



        try{


            const respuesta =
                await fetch(
                    `${API}/pedido/usuario/${usuarioId}`
                );



            if(!respuesta.ok){


                lista.innerHTML =
                    `<p class="api-order-status">No se pudo cargar tu historial de pedidos.</p>`;


                return;


            }



            const pedidos =
                await respuesta.json();



            lista.innerHTML = "";



            if(!pedidos.length){


                lista.innerHTML =
                    `<p class="api-order-status">Todavía no has hecho ningún pedido.</p>`;


                return;


            }



            pedidos.forEach(pedido => {

                lista.appendChild(
                    crearTarjetaPedido(pedido)
                );

            });


        }
        catch(error){


            console.error(error);


            lista.innerHTML =
                `<p class="api-order-status">No se pudo cargar tu historial de pedidos.</p>`;


        }


    }



    cargarPedidos();



};








// ===============================
// UBICACION
// ===============================


function obtenerUbicacion(){


    if(navigator.geolocation){



        navigator.geolocation.getCurrentPosition(



            posicion=>{


                document.getElementById("latitud").value =
                    posicion.coords.latitude;



                document.getElementById("longitud").value =
                    posicion.coords.longitude;



                console.log(
                    "Ubicación obtenida:",
                    posicion.coords.latitude,
                    posicion.coords.longitude
                );



            },



            error=>{


                console.log(
                    "Error ubicación:",
                    error
                );


            }



        );


    }


}
