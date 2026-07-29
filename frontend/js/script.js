document.addEventListener("DOMContentLoaded", function () {

    /* ==========================================
       LOGIN
       Se ejecuta solo si existe el formulario
    ========================================== */
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        const correo = document.getElementById("email");
        const alertBox = document.getElementById("loginAlert");
        const alertText = document.getElementById("loginAlertText");

        /* 
           Validación personalizada del input email.
           Usa validity API del navegador para mostrar
           mensajes más claros al usuario.
        */
        correo.addEventListener("input", function () {
            if (correo.validity.typeMismatch) {
                correo.setCustomValidity("El formato del correo es incorrecto");
            } else if (correo.validity.valueMissing) {
                correo.setCustomValidity("El correo es obligatorio");
            } else {
                correo.setCustomValidity("");
            }
        });

        /*
           Evento submit:
           - Evita recarga del navegador
           - Valida formulario
           - Muestra alerta visual
           - Simula redirección
        */
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!loginForm.checkValidity()) {
                loginForm.reportValidity();
                return;
            }

            // Estado visual de éxito
            alertBox.className = "alert-box success";
            alertText.textContent = "¡Inicio de sesión exitoso! Redirigiendo...";
            alertBox.style.display = "block";

            // Simulación de login exitoso
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        });
    }

    /* ==========================================
       REGISTRO
       Igual que login, se ejecuta solo si existe
       el formulario de registro en la página.
    ========================================== */
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        const nombre = document.getElementById("nombre");
        const email = document.getElementById("email");
        const password = document.getElementById("password");
        const alertBox = document.getElementById("registerAlert");
        const alertText = document.getElementById("registerAlertText");

        // Barra visual que indica fortaleza de contraseña
        const strengthFill = document.getElementById("strengthFill");

        /*
           Calcula nivel de seguridad básico:
           - Longitud mínima
           - Mayúsculas
           - Números
           - Caracteres especiales
        */
        if (strengthFill) {
            password.addEventListener("input", function () {
                const val = password.value;
                let strength = 0;
                if (val.length >= 8) strength++;
                if (/[A-Z]/.test(val)) strength++;
                if (/[0-9]/.test(val)) strength++;
                if (/[^A-Za-z0-9]/.test(val)) strength++;

                const colors = ["#e55039", "#e67e22", "#f1c40f", "#6ab04c"];
                const widths = ["25%", "50%", "75%", "100%"];

                strengthFill.style.width = val.length ? (widths[strength - 1] || "10%") : "0%";
                strengthFill.style.background = val.length ? (colors[strength - 1] || "#e55039") : "transparent";
            });
        }

        // Validación nombre usando pattern del HTML
        nombre.addEventListener("input", function () {
            if (nombre.validity.patternMismatch) {
                nombre.setCustomValidity("El nombre solo debe contener letras");
            } else if (nombre.validity.valueMissing) {
                nombre.setCustomValidity("El nombre es obligatorio");
            } else {
                nombre.setCustomValidity("");
            }
        });

        // Validación email
        email.addEventListener("input", function () {
            if (email.validity.typeMismatch) {
                email.setCustomValidity("El formato del email es incorrecto");
            } else if (email.validity.valueMissing) {
                email.setCustomValidity("El email es obligatorio");
            } else {
                email.setCustomValidity("");
            }
        });

        // Validación longitud contraseña
        password.addEventListener("input", function () {
            if (password.value.length < 8 || password.value.length > 15) {
                password.setCustomValidity("La contraseña debe tener entre 8 y 15 caracteres");
            } else {
                password.setCustomValidity("");
            }
        });

        /*
           Submit registro:
           - Valida formulario
           - Muestra alerta éxito
           - Simula creación de cuenta
        */
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!registerForm.checkValidity()) {
                registerForm.reportValidity();
                return;
            }

            alertBox.className = "alert-box success";
            alertText.textContent = "¡Registro exitoso! Redirigiendo...";
            alertBox.style.display = "block";

            setTimeout(() => {
                window.location.href = "inicioSe.html";
            }, 2000);
        });
    }

});