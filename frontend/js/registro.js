document.addEventListener("DOMContentLoaded", function () { // espera a que cargue toda la página antes de ejecutar

    const registerForm = document.getElementById("registerForm"); // obtiene el formulario de registro

    if (registerForm) { // valida que el formulario exista en el HTML
        const nombre = document.getElementById("nombre"); // input nombre
        const email = document.getElementById("email"); // input email
        const password = document.getElementById("password"); // input contraseña
        const alertBox = document.getElementById("registerAlert"); // caja de alertas
        const alertText = document.getElementById("registerAlertText"); // texto de alerta

        const strengthFill = document.getElementById("strengthFill"); // barra de seguridad


        if (strengthFill) { // solo si existe la barra
            password.addEventListener("input", function () { // detecta cuando el usuario escribe contraseña
                const val = password.value; // obtiene valor de contraseña
                let strength = 0; // fuerza inicial

                if (val.length >= 8) strength++; // si tiene 8+ caracteres sube nivel
                if (/[A-Z]/.test(val)) strength++; // si tiene mayúscula sube nivel
                if (/[0-9]/.test(val)) strength++; // si tiene número sube nivel
                if (/[^A-Za-z0-9]/.test(val)) strength++; // si tiene símbolo sube nivel

                const colors = ["#e55039", "#e67e22", "#f1c40f", "#6ab04c"]; // colores de barra
                const widths = ["25%", "50%", "75%", "100%"]; // tamaños de barra

                strengthFill.style.width = val.length ? (widths[strength - 1] || "10%") : "0%"; // ajusta ancho
                strengthFill.style.background = val.length ? (colors[strength - 1] || "#e55039") : "transparent"; // cambia color
            });
        }

        /* =========================
           VALIDACIONES DE CAMPOS
        ========================= */

        nombre.addEventListener("input", function () { // valida nombre mientras escribe
            if (nombre.validity.patternMismatch) { // si no cumple patrón
                nombre.setCustomValidity("El nombre solo debe contener letras"); // error
            } else if (nombre.validity.valueMissing) { // si está vacío
                nombre.setCustomValidity("El nombre es obligatorio"); // error
            } else {
                nombre.setCustomValidity(""); // sin error
            }
        });

        email.addEventListener("input", function () { // valida email
            if (email.validity.typeMismatch) {
                email.setCustomValidity("El formato del email es incorrecto");
            } else if (email.validity.valueMissing) {
                email.setCustomValidity("El email es obligatorio");
            } else {
                email.setCustomValidity("");
            }
        });

        password.addEventListener("input", function () { // valida contraseña
            if (password.validity.patternMismatch) {
                password.setCustomValidity("Debe tener mayúscula, número y símbolo");
            } else if (password.validity.valueMissing) {
                password.setCustomValidity("La contraseña es obligatoria");
            } else {
                password.setCustomValidity("");
            }
        });

        registerForm.addEventListener("submit", function (e) { // evento al enviar formulario
            e.preventDefault(); // evita recarga de página

            if (!registerForm.checkValidity()) { // valida todo el formulario
                registerForm.reportValidity(); // muestra errores nativos del navegador
                return; // detiene ejecución
            }

            const usuario = { // crea objeto usuario
                Nombre: nombre.value,
                Email: email.value,
                Contra: password.value,
                RolId: 2 // rol por defecto usuario normal
            };

            console.log("Enviando:", usuario); // muestra en consola

            fetch("http://localhost:61828/api/usuarios/registro", { // envía al backend
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(usuario)
            })
                .then(response => { // respuesta del servidor
                    if (!response.ok) {
                        return response.text().then(text => { throw new Error(text); });
                    }
                    return response.text();
                })
                .then(data => { // si registro fue exitoso
                    alertBox.className = "alert-box success"; // estilo éxito
                    alertText.textContent = "¡Registro exitoso!"; // mensaje
                    alertBox.style.display = "block"; // mostrar alerta

                    registerForm.reset(); // limpia formulario

                    setTimeout(() => { // espera antes de redirigir
                        window.location.href = "inicioSe.html"; // va a login
                    }, 2000);
                })
                .catch(error => { // error en registro
                    console.error("Error:", error);

                    alertBox.className = "alert-box error"; // estilo error
                    alertText.textContent = "Error al registrar usuario"; // mensaje error
                    alertBox.style.display = "block"; // mostrar alerta
                });
        });
    }

});