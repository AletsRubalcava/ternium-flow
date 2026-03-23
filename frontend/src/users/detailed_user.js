import { users, changes, entities } from '../shared/db.js';
import { setActiveNav } from "../shared/page_directory.js";

setActiveNav("users");

// --- Shortcuts ---
const $ = id => document.getElementById(id);
const editButton = $("editButton"); // $() == document.getElementById();
const deleteBtn = $("deleteButton");
const modal = $("deleteModal");
const cancelBtn = $("cancelDelete");
const confirmBtn = $("confirmDelete");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const createMode = params.get("create") === "true";
const user = createMode ? {} : users.find(u => u.id == id);
const userChanges = createMode ? [] : changes.filter(c => c.idUser == user.id);

let editMode = false;

// --- Badges ---
const badges = {
    estado: v => `<span class="${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ? "Activo" : "Inactivo"}</span>`,
    tipo: v => `<span class="${v ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ? "Cliente" : "Personal"}</span>`
};

// --- Roles map ---
const roleMap = { 1: "adminRoleButton", 2: "logisticsRoleButton", 3: "customRoleButton", 4: "customerRoleButton" };

// --- Render Campos ---
function renderCampos() {
    if (createMode) {
        $("upperUserId").textContent = id;
        $("idUser").textContent = id;
        $("userType").innerHTML = badges.tipo(false);
        $("userStatus").innerHTML = badges.estado(false);
    } else {
        const fields = {
            idUser: id,
            userName: `${user.nombre} ${user.apellidoP} ${user.apellidoM}`,
            userMail: user.correo,
            userPassword: user.contraseña
        };

        // Turns object into an array of arrays
        // [[userName, nombreCompleto], [userMail, mail], ...]
        // forEach element "k" (key) the text is v
        Object.entries(fields).forEach(([k, v]) => $(k).textContent = v);
        $("userType").innerHTML = badges.tipo(user.vistaCliente);
        $("userStatus").innerHTML = badges.estado(user.estado);

        const rolBtn = $(roleMap[user.idRol] ?? "customerRoleButton");
        rolBtn.classList.add("border-2", "border-primary", "bg-orange-50");
        rolBtn.querySelector("span").classList.add("text-primary");
    }
}

// --- Handle Role Click ---
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

// --- Validar campos ---
function validarCampos() {
    let valido = true;
    ["userName-edit", "userMail-edit", "userPassword-edit"].forEach(id => {
        const input = $(id);
        if (!input.value.trim()) { input.classList.add("border-red-400"); valido = false; }
    });
    if (!document.querySelector(".roleButton.border-primary")) {
        document.querySelector(".roleButton").closest(".grid").classList.add("ring-2", "ring-red-400", "rounded-xl");
        valido = false;
    }
    return valido;
}

// --- Toggle Edit Mode ---
function toggleEdit(active) {
    editButton.querySelector("span").textContent = active ? "save" : "edit";
    editButton.childNodes[2].textContent = active ? " Guardar" : " Editar";

    document.querySelectorAll(".editable").forEach(f => {
        const view = f.querySelector(".view");
        const input = f.querySelector(".edit");
        if (active) input.value = view.textContent.trim(); else view.textContent = input.value;
        view.classList.toggle("hidden", active);
        input.classList.toggle("hidden", !active);
    });

    [["userStatus", "userStatus-edit", "estado", badges.estado], ["userType", "userType-edit", "vistaCliente", badges.tipo]]
        .forEach(([view, select, key, render]) => {
            const v = $(view), s = $(select);
            if (active) s.value = user[key] ? "1" : "0";
            else { user[key] = s.value === "1"; v.innerHTML = render(user[key]); }
            v.classList.toggle("hidden", active);
            s.classList.toggle("hidden", !active);
        });

    document.querySelectorAll(".roleButton").forEach(btn => {
        btn.classList.toggle("hover:border-primary", active);
        btn.classList.toggle("cursor-pointer", active);
        btn.classList.toggle("cursor-default", !active);
        if (active) btn.addEventListener("click", () => document.querySelector(".roleButton").closest(".grid").classList.remove("ring-2", "ring-red-400", "rounded-xl"));
    });

    if (!active && (createMode || editMode)) {
        if (!validarCampos()) { editMode = true; toggleEdit(true); return; }
        if (createMode) {
            const nuevo = guardarUsuario();
            $("idUser").textContent = $("upperUserId").textContent = nuevo.id;
        }
    }
}

// --- Guardar usuario ---
function guardarUsuario() {
    const nuevoUsuario = {
        id: Number(id),
        nombre: $("userName-edit").value.trim(),
        correo: $("userMail-edit").value.trim(),
        contraseña: $("userPassword-edit").value.trim(),
        estado: $("userStatus-edit").value === "1",
        vistaCliente: $("userType-edit").value === "1",
        idRol: Number(document.querySelector(".roleButton.border-primary")?.id.replace("RoleButton", "") ?? 4)
    };
    users.push(nuevoUsuario);
    deleteBtn.classList.remove("hidden");
    window.history.replaceState({}, "", `?id=${nuevoUsuario.id}`);
    return nuevoUsuario;
}

// --- Render Historial ---
function formatCambios(orig, changed, accion) {
    if (accion === 'create') return 'Nuevo registro';
    if (accion === 'delete') return 'Registro eliminado';
    return Object.keys(changed).map(k => `<span class="font-medium">${k}:</span> ${orig[k] ?? '—'} → ${changed[k]}`).join('<br>');
}
function renderHistorial() {
    $("activityBody").innerHTML = userChanges.map(u => `
        <tr data-id="${u.id}" class="row bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${entities.find(e => e.id == u.idEntityCatalog)?.name ?? '—'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${u.idEntity}</td>
            <td class="px-6 py-4 text-sm text-text-secondary-light">${formatCambios(u.originalValues, u.changedValues, u.accion)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${u.timeStamp}</td>
        </tr>`).join('');
}

// --- Delete User ---
function eliminarUsuario() {
    const idx = users.findIndex(u => u.id == user.id);
    if (idx !== -1) users.splice(idx, 1);
}

// --- Event Listeners ---
editButton.addEventListener("click", () => { editMode = !editMode; toggleEdit(editMode); });
document.querySelectorAll(".roleButton").forEach(btn => btn.addEventListener("click", handleRoleClick));
document.querySelectorAll(".edit").forEach(input => input.addEventListener("input", () => input.classList.remove("border-red-400", "focus:border-red-400")));

deleteBtn.addEventListener("click", () => modal.classList.remove("hidden"));
cancelBtn.addEventListener("click", () => modal.classList.add("hidden"));
confirmBtn.addEventListener("click", () => {
    eliminarUsuario();
    window.location.href = "/frontend/src/shared/list_view.html?type=users";
});

// --- Init ---
renderCampos();
renderHistorial();
if (createMode) { editMode = true; toggleEdit(true); } else deleteBtn.classList.remove("hidden");