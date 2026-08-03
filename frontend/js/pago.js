// ===============================
// PAGO SIMULADO
// ===============================
//
// Controla los campos de tarjeta que solo se muestran cuando el método de pago
// es "Tarjeta simulada", los valida y los limpia.
//
// SEGURIDAD — manejo de datos bancarios:
// Ningún dato de la tarjeta se envía a la API ni se guarda en localStorage o
// sessionStorage. Los valores viven únicamente dentro de los inputs del DOM y
// se borran en cuanto dejan de usarse (al cambiar de método de pago o al
// registrarse el pedido). Los inputs no tienen atributo "name" (así nunca se
// serializan) y llevan autocomplete="off" para que el navegador no los guarde.
// Lo único que se conserva en memoria son los últimos 4 dígitos, y solo para
// mostrarlos enmascarados en el resumen en pantalla.


const Pago = (function () {


    const METODO_SIMULADO = "Tarjeta simulada";


    // Tarjetas de prueba aceptadas, al estilo de las pasarelas reales
    // (Stripe, PayPal sandbox). Como no hay cobro real, no existe forma de
    // saber si una tarjeta "existe": el algoritmo de Luhn solo detecta números
    // mal formados y acepta cualquier número bien construido. Por eso se
    // restringe a una lista fija, que además permite demostrar el camino de
    // pago rechazado.
    const TARJETAS_PRUEBA = {

        "4242424242424242": {
            aprobada: true
        },

        "4000000000000002": {
            aprobada: false,
            motivo: "La tarjeta fue declinada. Usa 4242 4242 4242 4242 para un pago aprobado."
        }

    };


    let metodoPago;
    let datosTarjeta;
    let numeroTarjeta;
    let titularTarjeta;
    let vencimientoTarjeta;
    let cvvTarjeta;
    let estadoTarjeta;


    // Solo los últimos 4 dígitos, para el resumen en pantalla.
    let ultimos4 = "";




    // ===============================
    // UTILIDADES
    // ===============================


    function soloDigitos(texto) {

        return texto.replace(/\D/g, "");

    }



    // Algoritmo de Luhn: la misma verificación que usan las tarjetas reales
    // para descartar números inventados o con dígitos mal tecleados.
    function luhnValido(numero) {

        let suma = 0;
        let alternar = false;


        for (let i = numero.length - 1; i >= 0; i--) {

            let digito = Number(numero[i]);


            if (alternar) {

                digito *= 2;

                if (digito > 9) {
                    digito -= 9;
                }

            }


            suma += digito;

            alternar = !alternar;

        }


        return suma % 10 === 0;

    }




    // ===============================
    // FORMATEO MIENTRAS SE ESCRIBE
    // ===============================


    function formatearNumero() {

        const digitos = soloDigitos(numeroTarjeta.value).slice(0, 16);


        numeroTarjeta.value =
            digitos.replace(/(.{4})/g, "$1 ").trim();

    }



    function formatearVencimiento() {

        const digitos = soloDigitos(vencimientoTarjeta.value).slice(0, 4);


        vencimientoTarjeta.value =
            digitos.length > 2
                ? `${digitos.slice(0, 2)}/${digitos.slice(2)}`
                : digitos;

    }



    function formatearCvv() {

        cvvTarjeta.value = soloDigitos(cvvTarjeta.value).slice(0, 4);

    }




    // ===============================
    // VALIDACIONES INDIVIDUALES
    // ===============================


    function validarNumero() {

        const digitos = soloDigitos(numeroTarjeta.value);


        if (digitos.length !== 16) {
            return "El número de tarjeta debe tener 16 dígitos";
        }


        if (!luhnValido(digitos)) {
            return "El número de tarjeta no es válido";
        }


        // El número está bien formado, pero solo se aceptan las tarjetas de
        // prueba: sin pasarela de pago no hay manera de validar una real.
        if (!TARJETAS_PRUEBA[digitos]) {
            return "Usa una tarjeta de prueba: 4242 4242 4242 4242 (aprobada) o 4000 0000 0000 0002 (declinada)";
        }


        return "";

    }



    function validarTitular() {

        const valor = titularTarjeta.value.trim();


        if (valor.length < 5) {
            return "Escribe el nombre del titular (mínimo 5 caracteres)";
        }


        if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(valor)) {
            return "El nombre del titular solo puede contener letras";
        }


        return "";

    }



    function validarVencimiento() {

        const valor = vencimientoTarjeta.value.trim();


        if (!/^\d{2}\/\d{2}$/.test(valor)) {
            return "La fecha de vencimiento debe tener el formato MM/AA";
        }


        const mes = Number(valor.slice(0, 2));
        const anio = 2000 + Number(valor.slice(3, 5));


        if (mes < 1 || mes > 12) {
            return "El mes de vencimiento debe estar entre 01 y 12";
        }


        const hoy = new Date();
        const anioActual = hoy.getFullYear();
        const mesActual = hoy.getMonth() + 1;


        if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
            return "La tarjeta está vencida";
        }


        if (anio > anioActual + 20) {
            return "La fecha de vencimiento no es válida";
        }


        return "";

    }



    function validarCvv() {

        const digitos = soloDigitos(cvvTarjeta.value);


        if (digitos.length < 3 || digitos.length > 4) {
            return "El CVV debe tener 3 o 4 dígitos";
        }


        return "";

    }




    // ===============================
    // MOSTRAR / OCULTAR
    // ===============================


    function esSimulado() {

        return metodoPago.value === METODO_SIMULADO;

    }



    function alternarCampos() {

        if (esSimulado()) {

            datosTarjeta.style.display = "block";

            marcarRequeridos(true);

        }
        else {

            datosTarjeta.style.display = "none";

            marcarRequeridos(false);

            // Se borra la tarjeta al cambiar de método para no dejar los datos
            // colgados en el DOM.
            limpiar();

        }

    }



    function marcarRequeridos(requerido) {

        [numeroTarjeta, titularTarjeta, vencimientoTarjeta, cvvTarjeta]
            .forEach(campo => campo.required = requerido);

    }




    // ===============================
    // API PUBLICA DEL MODULO
    // ===============================


    function init() {

        metodoPago = document.getElementById("metodoPago");
        datosTarjeta = document.getElementById("datosTarjeta");
        numeroTarjeta = document.getElementById("numeroTarjeta");
        titularTarjeta = document.getElementById("titularTarjeta");
        vencimientoTarjeta = document.getElementById("vencimientoTarjeta");
        cvvTarjeta = document.getElementById("cvvTarjeta");
        estadoTarjeta = document.getElementById("estadoTarjeta");


        if (!metodoPago || !datosTarjeta) {
            return;
        }


        metodoPago.addEventListener("change", alternarCampos);


        numeroTarjeta.addEventListener("input", formatearNumero);
        vencimientoTarjeta.addEventListener("input", formatearVencimiento);
        cvvTarjeta.addEventListener("input", formatearCvv);


        // Validación campo por campo al salir de cada uno, con el mismo patrón
        // de setCustomValidity que ya usa la validación de dirección.
        numeroTarjeta.addEventListener("blur", () => revisarCampo(numeroTarjeta, validarNumero));
        titularTarjeta.addEventListener("blur", () => revisarCampo(titularTarjeta, validarTitular));
        vencimientoTarjeta.addEventListener("blur", () => revisarCampo(vencimientoTarjeta, validarVencimiento));
        cvvTarjeta.addEventListener("blur", () => revisarCampo(cvvTarjeta, validarCvv));


        alternarCampos();

    }



    function revisarCampo(campo, validador) {

        const error = validador();


        campo.setCustomValidity(error);


        estadoTarjeta.textContent = error;

    }



    // Valida todo el bloque de tarjeta. Devuelve { ok, mensaje }.
    // Si el método de pago no es el simulado, siempre pasa.
    function validar() {

        if (!esSimulado()) {
            return { ok: true, mensaje: "" };
        }


        const revisiones = [
            { campo: numeroTarjeta, validador: validarNumero },
            { campo: titularTarjeta, validador: validarTitular },
            { campo: vencimientoTarjeta, validador: validarVencimiento },
            { campo: cvvTarjeta, validador: validarCvv }
        ];


        let primerError = "";


        revisiones.forEach(revision => {

            const error = revision.validador();


            revision.campo.setCustomValidity(error);


            if (error && !primerError) {

                primerError = error;

                revision.campo.focus();

            }

        });


        if (primerError) {

            estadoTarjeta.textContent = primerError;

            return { ok: false, mensaje: primerError };

        }


        // El formato ya es correcto; aquí se simula el cobro. La tarjeta de
        // rechazo permite probar el camino en que el pago no pasa.
        const tarjeta =
            TARJETAS_PRUEBA[soloDigitos(numeroTarjeta.value)];


        if (tarjeta && !tarjeta.aprobada) {

            estadoTarjeta.textContent = tarjeta.motivo;

            numeroTarjeta.focus();

            return { ok: false, mensaje: tarjeta.motivo };

        }


        // Solo se guardan los últimos 4 dígitos, para el resumen en pantalla.
        ultimos4 = soloDigitos(numeroTarjeta.value).slice(-4);


        estadoTarjeta.textContent = "Pago simulado aprobado";


        return { ok: true, mensaje: "" };

    }



    // Texto enmascarado para el resumen. Nunca se envía ni se persiste.
    function descripcion() {

        if (!esSimulado()) {
            return metodoPago.value;
        }


        return ultimos4
            ? `${METODO_SIMULADO} (•••• ${ultimos4})`
            : METODO_SIMULADO;

    }



    // Borra por completo los datos de la tarjeta del DOM y de memoria.
    function limpiar() {

        [numeroTarjeta, titularTarjeta, vencimientoTarjeta, cvvTarjeta]
            .forEach(campo => {

                if (!campo) return;

                campo.value = "";

                campo.setCustomValidity("");

            });


        ultimos4 = "";


        if (estadoTarjeta) {
            estadoTarjeta.textContent = "";
        }

    }



    // Limpieza completa tras registrar un pedido: borra los datos, oculta el
    // bloque y quita los required para no bloquear el siguiente pedido.
    function reiniciar() {

        limpiar();


        marcarRequeridos(false);


        if (datosTarjeta) {
            datosTarjeta.style.display = "none";
        }

    }




    return {
        init,
        validar,
        descripcion,
        limpiar,
        reiniciar,
        esSimulado
    };


})();
