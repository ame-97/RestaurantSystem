/*
   contacto.js
   Valida el campo correo usando pattern del HTML
   y muestra un mensaje personalizado si no coincide.
*/

window.onload = function () {

    // // Obtiene el input del correo desde el formulario
    // let correo = document.getElementById("correo");

    // /*
    //    Escucha cambios mientras el usuario escribe.
    //    Usa la Validity API del navegador para verificar
    //    si el valor cumple con el pattern definido en HTML.
    // */
    // correo.addEventListener("input", function () {

    //     // Si el texto no coincide con el patrón
    //     if (correo.validity.patternMismatch) {
    //         correo.setCustomValidity("El formato del correo es incorrecto");
    //     } else {
    //         // Limpia mensaje personalizado cuando es válido
    //         correo.setCustomValidity("");
    //     }
    // });

    const correo = document.getElementById("correo"); //Se obtiene el valor del input con id correo

    correo.addEventListener("input", () => {

        let mensaje = document.getElementById("msgCorreo");  //Se obtiene el elemento con id msgCorreo

        if (!mensaje) { //Si no encuentra el elemento lo crea
            mensaje = document.createElement("p"); //Se crea el elemento p 
            mensaje.id = "msgCorreo";
            correo.insertAdjacentElement("afterend", mensaje); //Se muestra despues del input correo
        }

        if (correo.value === "") { //Verifica si esta vacio 
            mensaje.textContent = "";
        }
        else if (correo.value.includes("@") && correo.value.includes(".com")) {  //Verificamos el formato de un correo
            mensaje.textContent = "Correo válido";
            mensaje.style.color = "green";
        }
        else {
            mensaje.textContent = "Correo inválido";
            mensaje.style.color = "red";
        }

    });
};