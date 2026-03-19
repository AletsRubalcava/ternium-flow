import { users, changes, entities } from './db.js';
import { setActiveNav } from "./page_directory.js";

setActiveNav("users");

// --- Datos ---
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const user = users.find(u => u.id == id);
const userChanges = changes.filter(c => c.idUser == user.id);

const editButton = document.getElementById("editButton");
let editMode = false;

// --- Badges ---
const badges = {
    estado: (v) => `
        <span class="${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} 
        px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
            ${v ? "Activo" : "Inactivo"}
        </span>`,

    tipo: (v) => `
        <span class="${v ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"} 
        px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
            ${v ? "Cliente" : "Personal"}
        </span>`,
};

// --- Render inicial ---
const roleMap = {
    1: "adminRoleButton",
    2: "logisticsRoleButton",
    3: "customRoleButton",
    4: "customerRoleButton",
};

function renderCampos() {
    const fields = {
        upperUserId:  id,
        idUser:       user.id,
        userName:     `${user.nombre} ${user.apellidoP} ${user.apellidoM}`,
        userMail:     user.correo,
        userPassword: user.contraseña,
    };

    for (const [id, value] of Object.entries(fields)) {
        document.getElementById(id).textContent = value;
    }

    document.getElementById("userType").innerHTML = badges.tipo(user.vistaCliente);
    document.getElementById("userStatus").innerHTML = badges.estado(user.estado);

    const rolBtn = document.getElementById(roleMap[user.idRol] ?? "customerRoleButton");
    rolBtn.classList.add("border-2", "border-primary", "bg-orange-50");
    rolBtn.querySelector("span").classList.add("text-primary");
}

// --- Role buttons ---
function handleRoleClick(e) {
    if (!editMode) return;

    document.querySelectorAll(".roleButton").forEach(b => {
        b.classList.remove("border-2", "border-primary", "bg-orange-50");
        b.querySelector("span").classList.replace("text-primary", "text-gray-400");
    });

    const btn = e.currentTarget;
    btn.classList.add("border-2", "border-primary", "bg-orange-50");
    btn.querySelector("span").classList.replace("text-gray-400", "text-primary");
}

// --- Toggle edit ---
function toggleEdit(active) {
    editButton.querySelector("span").textContent = active ? "save" : "edit";
    editButton.childNodes[2].textContent         = active ? " Guardar" : " Editar";

    // Campos de texto
    document.querySelectorAll(".editable").forEach(field => {
        const view  = field.querySelector(".view");
        const input = field.querySelector(".edit");
        if (active) {
            input.value = view.textContent.trim();
        } else {
            view.textContent = input.value;
        }
        view.classList.toggle("hidden", active);
        input.classList.toggle("hidden", !active);
    });

    // Role buttons
    document.querySelectorAll(".roleButton").forEach(btn => {
        btn.classList.toggle("hover:border-primary", active);
        btn.classList.toggle("cursor-pointer", active);
        btn.classList.toggle("cursor-default", !active);
    });

    // Selects
    const selects = [
        { view: "userStatus", select: "userStatus-edit", key: "estado",       render: badges.estado },
        { view: "userType",   select: "userType-edit",   key: "vistaCliente", render: badges.tipo   },
    ];

    selects.forEach(({ view, select, key, render }) => {
        const viewEl   = document.getElementById(view);
        const selectEl = document.getElementById(select);

        if (active) {
            selectEl.value = user[key] ? "1" : "0";
        } else {
            user[key]          = selectEl.value === "1";
            viewEl.innerHTML   = render(user[key]);
        }

        viewEl.classList.toggle("hidden", active);
        selectEl.classList.toggle("hidden", !active);
    });
}

// --- Historial ---
function formatCambios(original, changed, accion) {
    if (accion === 'create') return 'Nuevo registro';
    if (accion === 'delete') return 'Registro eliminado';

    return Object.keys(changed)
        .map(key => `<span class="font-medium">${key}:</span> ${original[key] ?? '—'} → ${changed[key]}`)
        .join('<br>');
}

function renderHistorial() {
    document.getElementById("activityBody").innerHTML = userChanges.map(u => `
        <tr data-id="${u.id}" class="row bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${entities.find(e => e.id == u.idEntityCatalog)?.name ?? '—'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${u.idEntity}</td>
            <td class="px-6 py-4 text-sm text-text-secondary-light">${formatCambios(u.originalValues, u.changedValues, u.accion)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${u.timeStamp}</td>
        </tr>
    `).join('');
}

// --- Listeners ---
editButton.addEventListener("click", () => {
    editMode = !editMode;
    toggleEdit(editMode);
});

document.querySelectorAll(".roleButton").forEach(btn => {
    btn.addEventListener("click", handleRoleClick);
});

// --- Init ---
renderCampos();
renderHistorial();