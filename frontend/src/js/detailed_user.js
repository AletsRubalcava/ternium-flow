import { users, changes, entities } from './db.js';
import { setActiveNav } from "./page_directory.js";

setActiveNav("users");

// --- Datos ---
const params     = new URLSearchParams(window.location.search);
const id         = params.get("id");
const createMode = params.get("create") === "true";
const user       = createMode ? {} : users.find(u => u.id == id);
const userChanges = createMode ? [] : changes.filter(c => c.idUser == user.id);

const editButton = document.getElementById("editButton");
const deleteBtn = document.getElementById("deleteButton");
const modal = document.getElementById("deleteModal");
const cancelBtn = document.getElementById("cancelDelete");
const confirmBtn = document.getElementById("confirmDelete");
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
    if (!createMode) {
        const fields = {
            upperUserId:  id,
            idUser:       user.id,
            userName:     `${user.nombre} ${user.apellidoP} ${user.apellidoM}`,
            userMail:     user.correo,
            userPassword: user.contraseña,
        };

        for (const [fieldId, value] of Object.entries(fields)) {
            document.getElementById(fieldId).textContent = value;
        }

        document.getElementById("userType").innerHTML   = badges.tipo(user.vistaCliente);
        document.getElementById("userStatus").innerHTML = badges.estado(user.estado);

        const rolBtn = document.getElementById(roleMap[user.idRol] ?? "customerRoleButton");
        rolBtn.classList.add("border-2", "border-primary", "bg-orange-50");
        rolBtn.querySelector("span").classList.add("text-primary");
    } else {
        document.getElementById("upperUserId").textContent = "Nuevo";
        document.getElementById("idUser").textContent      = id; // ← usa el id de la URL
        document.getElementById("userType").innerHTML      = badges.tipo(false);
        document.getElementById("userStatus").innerHTML    = badges.estado(false);
    }
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

function validarCampos() {
    let valido = true;

    // Campos de texto
    const campos = [
        "userName-edit",
        "userMail-edit",
        "userPassword-edit",
    ];

    campos.forEach(id => {
        const input = document.getElementById(id);
        if (input.value.trim() === "") {
            input.classList.add("border-red-400");
            valido = false;
        }
    });

    // Selects — siempre tienen valor, no necesitan validación
    // pero si quisieras forzar una selección explícita, agrega una opción vacía:
    // <option value="">-- Selecciona --</option>
    // y validas que no sea ""

    // Rol — verificar que haya uno seleccionado
    const rolSeleccionado = document.querySelector(".roleButton.border-primary");
    if (!rolSeleccionado) {
        document.querySelector(".roleButton").closest(".grid")
            .classList.add("ring-2", "ring-red-400", "rounded-xl");
        valido = false;
    }

    return valido;
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

    document.querySelectorAll(".roleButton").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".roleButton").closest(".grid")
            .classList.remove("ring-2", "ring-red-400", "rounded-xl");
    });
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
            user[key]        = selectEl.value === "1";
            viewEl.innerHTML = render(user[key]);
        }

        viewEl.classList.toggle("hidden", active);
        selectEl.classList.toggle("hidden", !active);
    });

    // Guardar si es createMode y se está cerrando el modo edición
    if (!active && (createMode || editMode)) {
    if (!validarCampos()) {
        // revertir el toggle si hay errores
        editMode = true;
        toggleEdit(true);
        return;
    }
    if (createMode) {
        const nuevo = guardarUsuario();
        document.getElementById("idUser").textContent      = nuevo.id;
        document.getElementById("upperUserId").textContent = nuevo.id;
    }
}
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

// --- Guardar nuevo usuario ---
function guardarUsuario() {
    const nuevoUsuario = {
        id:           Number(id), // ← viene de la URL, ya calculado en list_view
        nombre:       document.getElementById("userName-edit").value.trim(),
        correo:       document.getElementById("userMail-edit").value.trim(),
        contraseña:   document.getElementById("userPassword-edit").value.trim(),
        estado:       document.getElementById("userStatus-edit").value === "1",
        vistaCliente: document.getElementById("userType-edit").value === "1",
        idRol:        Number(document.querySelector(".roleButton.border-primary")?.id.replace("RoleButton", "") ?? 4),
    };

    users.push(nuevoUsuario);
    window.history.replaceState({}, "", `?id=${nuevoUsuario.id}`);
    deleteBtn.classList.remove("hidden");
    return nuevoUsuario;
}

// --- Init ---
renderCampos();
renderHistorial();
document.querySelectorAll(".edit").forEach(input => {
    input.addEventListener("input", () => {
        input.classList.remove("border-red-400", "focus:border-red-400");
    });
});

if (createMode) {
    editMode = true;
    toggleEdit(true);
}else{
    deleteBtn.classList.remove("hidden");
}

function eliminarUsuario() {
    const index = users.findIndex(u => u.id == user.id);
    if (index !== -1) {
        users.splice(index, 1);
    }
}

deleteBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

confirmBtn.addEventListener("click", () => {
    eliminarUsuario();
    window.location.href = "/frontend/src/list_view.html?type=users";
});