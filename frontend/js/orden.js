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


    let direccionValida = false;



    const API =
        "http://localhost:61828/api";







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
    // ENVIAR PEDIDO
    // ===============================


    document
    .getElementById("formOrdenar")
    .addEventListener(
        "submit",
        async function(e){


            e.preventDefault();




            let usuario =
                extraerUsuario(
                    JSON.parse(
                        localStorage.getItem("usuario")
                    )
                );



            const usuarioId =
                usuario.Id ||
                usuario.id ||
                usuario.UsuarioId;




            if(!usuarioId){


                alert(
                    "No se encontró usuario"
                );


                return;

            }






            // VALIDAR DIRECCION Y UBICACION

            if(tipoPedido.value === "A domicilio"){


                if(!direccionValida){


                    alert(
                        "Verifica que la dirección sea válida antes de continuar."
                    );


                    return;


                }



                if(!latitud.value || !longitud.value){


                    alert(
                        "No se obtuvo la ubicación. Activa el permiso de ubicación e intenta nuevamente."
                    );


                    obtenerUbicacion();

                    return;


                }


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





                const data =
                    await response.json();







                if(!response.ok){


                    console.error(data);


                    alert(
                        data.Message ||
                        "Error creando pedido"
                    );


                    return;


                }







                alert(
                    "Pedido registrado correctamente"
                );





                agregarResumen(data);





                document
                .getElementById("formOrdenar")
                .reset();



                datosDireccion.style.display =
                    "none";



                latitud.value="";
                longitud.value="";



                direccionValida = false;

                estadoDireccion.textContent = "";



            }
            catch(error){


                console.error(error);


                alert(
                    "Error conectando con servidor"
                );


            }



        }
    );










    // ===============================
    // RESUMEN
    // ===============================


    function agregarResumen(data){



        const lista =
            document.getElementById("lista");



        const div =
            document.createElement("div");



        div.className =
            "pedido-item";



        const pedidoRespuesta =
            data.pedido || {};



        const direccionMostrar =

            tipoPedido.value === "A domicilio"

            ?

            [
                calle.value,
                colonia.value,
                referencia.value
            ]
            .filter(
                x=>x && x.trim()!==""
            )
            .join(", ")

            :

            "No aplica";





        div.innerHTML = `

<h3>
    Pedido confirmado
</h3>


<div class="pedido-header">

    <span class="badge ${tipoPedido.value === "A domicilio" ? "domicilio" : "llevar"}">

        ${tipoPedido.value}

    </span>


    <span class="badge ${data.EstadoPago === "Pagado" ? "pagado" : "pendiente"}">

        ${data.EstadoPago || "Pendiente"}

    </span>

</div>



<div class="pedido-info">


<p>
<strong>🍽️ Platillo:</strong>
${platillo.options[platillo.selectedIndex].text}
</p>



<p>
<strong>🔢 Cantidad:</strong>
${cantidad.value}
</p>



<p>
<strong>💳 Método de pago:</strong>
${metodoPago.value}
</p>



<p>
<strong>📍 Dirección:</strong>
${tipoPedido.value === "A domicilio" 
? `${calle.value}, ${colonia.value}` 
: "No aplica"}
</p>



<p class="ubicacion">

<strong>🌎 Ubicación:</strong>

${latitud.value || "Sin ubicación"} ,

${longitud.value || ""}

</p>



<p>
<strong>📝 Comentarios:</strong>

${comentarios.value || "Sin comentarios"}

</p>


</div>



<div class="pedido-total">

💰 Total:
$${data.pedido?.Total || data.Total || 0}

</div>



<div class="pedido-id">

ID Pedido:
${data.pedido?.Id || data.Id || "N/A"}

</div>

`;



        lista.appendChild(div);



    }



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