const form = document.getElementById("form");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value; // o cambia el id a "email"
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("http://localhost:3000/api/usuarios/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = '/frontend/src/home/home.html';
        } else {
            const mensajes = data.detalles
                ? data.detalles.join('\n')
                : data.message;

            alert(mensajes);
        }

    } catch (err) {
        console.error("Error de red:", err);
        alert("No se pudo conectar al servidor.");
    }
});