const form = document.getElementById("form");

const user = {
    username: "admin",
    password: "2026"
}

form.addEventListener("submit", function (submit) {
    submit.preventDefault();

    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (email == user.username && password == user.password) {
        window.location.href = "home.html";
    }
});