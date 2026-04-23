import { api } from "./shared/api/api_routes.js";
import { session } from "./shared/session.js"

const form = document.getElementById("form");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value; // o cambia el id a "email"
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(api.users.login(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            session.setSession({ token: data.token, user: data.user });
            
            const id = data.user.id_cliente || data.user.id;
            window.location.href = `/frontend/src/home/home.html?id=${id}`;
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