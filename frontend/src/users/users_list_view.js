import {users} from "../shared/db.js"

const attributes = [
    "Clave",
    "Nombre",
    "Apellidos",
    "Correo",
    "Tipo",
    "Estado",
];

export function loadUsers(){
    document.getElementById("pageTitle").innerHTML = "USUARIOS";

    const newButton = document.getElementById("newButton");
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    newButton.onclick = () => window.location.href = `/frontend/src/users/detailed_user.html?create=true&id=${newId}`;

    document.getElementById("search").placeholder = "Buscar Usuarios...";

    document.getElementById("newButton").innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
        Nuevo Usuario`;

    newButton.classList.remove("hidden");

    document.getElementById("listViewThead").innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    document.getElementById("listViewBody").innerHTML = users.map(u => `
        <tr data-id="${u.id}"
        class="row bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <td
                class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${u.id}</td>
            <td
                class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${u.nombre}</td>
            <td
                class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${u.apellidoP} ${u.apellidoM}</td>
            <td
                class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${u.correo}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span
                    class=" ${u.vistaCliente == 1 ? "bg-yellow-100 text-yellow-800": "bg-blue-100 text-blue-800"} px-2 inline-flex text-xs leading-5 font-semibold rounded-full">${u.vistaCliente == 1 ? "Cliente" : "Personal"}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span
                    class=" ${u.estado == 1 ? "bg-green-100 text-green-800": "bg-red-100 text-red-800"} px-2 inline-flex text-xs leading-5 font-semibold rounded-full">${u.estado == 1 ? "Activo" : "Inactivo"}</span>
            </td>
        </tr>
    `).join("");

    document.querySelectorAll(".row").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            window.location.href = `/frontend/src/users/detailed_user.html?id=${id}`;
        });
    });
}