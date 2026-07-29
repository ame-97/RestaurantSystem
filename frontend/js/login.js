document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const alertBox = document.getElementById("loginAlert");
    const alertText = document.getElementById("loginAlertText");

    if (!email || !password) {
        mostrarAlerta("Todos los campos son obligatorios", "error");
        return;
    }

    if (password.length < 8 || password.length > 15) {
        mostrarAlerta("La contrasena debe tener entre 8 y 15 caracteres", "error");
        return;
    }

    try {
        const response = await fetch("http://localhost:61828/api/usuarios/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                Email: email,
                Contra: password
            })
        });

        if (response.ok) {

            const data = await response.json(); //  obtenemos el usuario
            const usuario = data.usuario || data.Usuario || data.user || data.User || data.data || data.Data || data;
            if (data.token) localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify(usuario));

            mostrarAlerta("Login exitoso", "success");

            setTimeout(() => {
                // REDIRECCION SEGUN ROL
                if (usuario.RolId === 1) {
                    window.location.href = "adminProduc.html"; // admin
                } else {
                    window.location.href = "index.html"; // cliente
                }
            }, 1500);

        } else if (response.status === 401) {
            mostrarAlerta("Correo o contrasena incorrectos", "error");
        } else {
            mostrarAlerta("Error en el servidor", "error");
        }

    } catch (error) {
        console.error(error);
        mostrarAlerta("No se pudo conectar con la API", "error");
    }

    function mostrarAlerta(mensaje, tipo) {
        alertBox.style.display = "block";
        alertText.textContent = mensaje;

        if (tipo === "error") {
            alertBox.style.background = "#e74c3c";
        } else {
            alertBox.style.background = "#2ecc71";
        }
    }
});
