document.addEventListener("DOMContentLoaded", function () {
    const h1 = document.querySelector("h1");

    // Se crea un contenedor para el mensaje
    const mensaje = document.createElement("div");
    mensaje.style.fontSize = "1.2rem"; //Se asignan los estilos 
    mensaje.style.marginBottom = "8px";
    mensaje.style.color = "#000000";
    mensaje.style.opacity = 0;
    mensaje.style.transition = "opacity 0.3s";
    mensaje.textContent = "¡Gracias por visitarnos! :)"; //Mensaje que se mostrará 
    h1.parentNode.insertBefore(mensaje, h1.nextSibling); //El mensaje se inserta debajo del h1

    // Cuando el mouse entra sobre el H1
    h1.addEventListener("mouseover", () => {
        h1.style.color = "#b08a57"; //Se asignan los estilos 
        h1.style.transform = "scale(1.1)";
        h1.style.transition = "all 0.3s";

        mensaje.style.opacity = 1; // mostramos el texto
    });

    // Cuando el mouse sale del h1, se oculta el mensaje
    h1.addEventListener("mouseout", () => {
        h1.style.color = ""; //Se elimina el color asignado anteriormente del h1
        h1.style.transform = "scale(1)";

        mensaje.style.opacity = 0; // ocultamos el texto
    });

    document.querySelectorAll("h2").forEach(h2 => { //Se buscan todos los h2
        h2.addEventListener("mouseover", () => {  //Se agrega el evento cuando se pasa el mouse sobre h2
            h2.style.background = "#f8f8f8"; //Asignamos los estilos
            h2.style.cursor = "pointer";
            h2.style.color = "#000000";
        });
        //Ocultamos el mensaje cuando pasa el mouse fuera del h2
        h2.addEventListener("mouseout", () => { 
            h2.style.background = ""; //Se elimina el estilo que se asigno
        });
    });


    const textarea = document.querySelector("textarea"); //Obtenemos los textareas
    const form = document.querySelector("form"); //Se obtienen los formularios

    function escribir() {
        textarea.style.borderColor = "#7257b0"; //Se cambia el color del borde del textarea

        let mensaje = document.getElementById("msg"); //Se busca el elemento cuyo id sea msg
        
        if (!mensaje) { // Si no encuentra el elemento con id msg, se asignan los estilos

            mensaje = document.createElement("p"); //Creamos el elemento p 
            mensaje.id = "msg";
            mensaje.style.color = "#000000"; // Se asignan los estilos 
            mensaje.style.marginTop = "5px";
            textarea.insertAdjacentElement("afterend", mensaje); //Se inserta debajo del textarea
        }

        mensaje.textContent = "Escribe algo... :)"; //Texto del mensaje que se mostrará
    }

    textarea.addEventListener("keypress", escribir); //Se agrega el evento si se preciona una tecla

    form.addEventListener("submit", function () { //Cuando se envía el formulario 
        textarea.removeEventListener("keypress", escribir); //Se elimina el evento de la tecla

        textarea.style.borderColor = ""; //Se limpia el borde que se había asignado

        const mensaje = document.getElementById("msg"); //Se obtiene el mensaje
        if (mensaje)
            mensaje.remove(); //Se eliminar el mensaje que se había mostrado 

    });



});




