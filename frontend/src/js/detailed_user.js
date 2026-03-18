import { users } from './db.js';
import { setActiveNav } from "./page_directory.js";

setActiveNav("users");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const user = users.find(u => u.id == id);

document.getElementById("upperUserId").textContent = id;

document.getElementById("idUser").textContent = user.id;
document.getElementById("userName").textContent = `${user.nombre} ${user.apellidoP} ${user.apellidoM}`;
document.getElementById("userRole").textContent = user.idRol;
document.getElementById("userMail").textContent = user.correo;
document.getElementById("userPassword").textContent = user.contraseña;
document.getElementById("userType").textContent = user.vistaCliente;
document.getElementById("userStatus").textContent = user.estado;