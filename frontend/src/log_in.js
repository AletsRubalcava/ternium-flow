const form = document.getElementById("form");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = '/frontend/src/home/home.html';
        } else {
            const mensajes = data.detalles
                ? data.detalles.join('\n')
                : data.error;

            alert(mensajes);
        }

    } catch (err) {
        console.error("Error de red:", err);
    }
});