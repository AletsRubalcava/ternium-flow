import { setActiveNav } from '../shared/utils/nav.js';
import { renderHeader } from '../shared/components/header.js';
import { getAppContext, roles } from '../shared/app_context.js';
import { navIds } from "../../../shared/navigation.js";
import { api } from '../shared/api/api_routes.js';

const context = getAppContext();
renderHeader(context);
setActiveNav(navIds.users);

// ── Fetch data ────────────────────────────────────────────────────────────────
const { data: users }     = await axios.get(api.users.getAll());
const { data: customers } = await axios.get(api.customers.getAll());

// ── Toast de error ────────────────────────────────────────────────────────────
function showApiError(msg) {
    const toast = $("apiErrorToast");
    $("apiErrorMsg").textContent = msg;
    toast.classList.remove("hidden", "opacity-0");
    toast.classList.add("opacity-100");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.add("opacity-0");
        setTimeout(() => toast.classList.add("hidden"), 300);
    }, 4000);
}

// --- Shortcuts ---
const $ = id => document.getElementById(id);
const editButton = $("editButton");
const deleteBtn  = $("deleteButton");
const modal      = $("deleteModal");
const cancelBtn  = $("cancelDelete");
const confirmBtn = $("confirmDelete");

const params     = new URLSearchParams(window.location.search);
const urlId      = params.get("id");
const createMode = params.get("create") === "true";

// In view mode, load the single user from the API to get full data
let user = {};
if (!createMode && urlId) {
    const { data } = await axios.get(api.users.getByID(urlId));
    user = data;
}

let editMode = false;
let selectedCustomerId = user?.id_cliente ?? null;

// ── Role string ↔ button id ───────────────────────────────────────────────────
// These strings must match exactly what the backend stores in the `role` column
const ROLES = {
    administrador:          "adminRoleButton",
    operador_logistico:      "logisticsRoleButton",
    gestion_clientes: "customerMgmtRoleButton",
    customer:        "clientRoleButton",
};

function roleToButtonId(role) {
    return ROLES[role] ?? "customerMgmtRoleButton";
}

function buttonIdToRole(btnId) {
    return Object.entries(ROLES).find(([, v]) => v === btnId)?.[0] ?? "administrador";
}

function getSelectedRole() {
    const active = document.querySelector(".roleButton.border-primary");
    return active ? buttonIdToRole(active.id) : null;
}

// ── Render Campos ─────────────────────────────────────────────────────────────
function renderCampos() {
    if (createMode) {
        $("upperUserId").textContent = "Nuevo Usuario";
    } else {
        $("userName").textContent    = user.nombre;
        $("userMail").textContent    = user.email;
        $("upperUserId").textContent = user.nombre;

        const rolBtn = $(roleToButtonId(user.role));
        if (rolBtn) {
            rolBtn.classList.add("border-2", "border-primary", "bg-orange-50");
            rolBtn.querySelector("span.material-symbols-outlined").classList.add("text-primary");
        }
    }
    syncCustomerButton();
}

// ── Sync "Seleccionar cuenta" link ────────────────────────────────────────────
function syncCustomerButton() {
    const isClientSelected = $("clientRoleButton").classList.contains("border-primary");
    $("openCustomerBtn").classList.toggle("hidden", !(isClientSelected && editMode));
}

// ── Handle Role Click ─────────────────────────────────────────────────────────
function handleRoleClick(e) {
    if (!editMode) return;

    $("rolesGrid").classList.remove("ring-2", "ring-red-400", "rounded-xl");

    document.querySelectorAll(".roleButton").forEach(b => {
        b.classList.remove("border-2", "border-primary", "bg-orange-50");
        b.querySelector("span.material-symbols-outlined").classList.replace("text-primary", "text-gray-400");
    });

    const btn = e.currentTarget;
    btn.classList.add("border-2", "border-primary", "bg-orange-50");
    btn.querySelector("span.material-symbols-outlined").classList.replace("text-gray-400", "text-primary");

    syncCustomerButton();
}

// ── Password helpers ──────────────────────────────────────────────────────────
function showPasswordEditFields(isCreate) {
    $("passwordViewWrap").classList.add("hidden");
    $("passwordEditLabel").textContent = isCreate ? "Contraseña" : "Cambiar Contraseña";
    $("passwordEditWrap").classList.remove("hidden");
    $("confirmPasswordEditWrap").classList.remove("hidden");
    $("userPassword-edit").value        = "";
    $("userPasswordConfirm-edit").value = "";
}

function hidePasswordEditFields() {
    $("passwordViewWrap").classList.remove("hidden");
    $("passwordEditWrap").classList.add("hidden");
    $("confirmPasswordEditWrap").classList.add("hidden");
    $("passwordMismatch").classList.add("hidden");
}

function validatePasswords() {
    const pw  = $("userPassword-edit").value;
    const cpw = $("userPasswordConfirm-edit").value;

    $("userPassword-edit").classList.remove("border-red-400");
    $("userPasswordConfirm-edit").classList.remove("border-red-400");
    $("passwordMismatch").classList.add("hidden");

    if (createMode) {
        // Obligatorio al crear
        if (!pw)  { $("userPassword-edit").classList.add("border-red-400"); return false; }
        if (!cpw) { $("userPasswordConfirm-edit").classList.add("border-red-400"); return false; }
        if (pw !== cpw) {
            $("userPasswordConfirm-edit").classList.add("border-red-400");
            $("passwordMismatch").classList.remove("hidden");
            return false;
        }
    } else {
        if (pw || cpw) {
            if (!pw)  { $("userPassword-edit").classList.add("border-red-400"); return false; }
            if (!cpw) { $("userPasswordConfirm-edit").classList.add("border-red-400"); return false; }
            if (pw !== cpw) {
                $("userPasswordConfirm-edit").classList.add("border-red-400");
                $("passwordMismatch").classList.remove("hidden");
                return false;
            }
        }
    }
    return true;
}

// ── Validar Campos ────────────────────────────────────────────────────────────
function validarCampos() {
    let valido = true;

    ["userName-edit", "userMail-edit"].forEach(fid => {
        const input = $(fid);
        if (!input.value.trim()) { input.classList.add("border-red-400"); valido = false; }
    });

    if (!validatePasswords()) valido = false;

    if (!document.querySelector(".roleButton.border-primary")) {
        $("rolesGrid").classList.add("ring-2", "ring-red-400", "rounded-xl");
        valido = false;
    }

    if ($("clientRoleButton").classList.contains("border-primary") && !selectedCustomerId) {
        $("rolesGrid").classList.add("ring-2", "ring-red-400", "rounded-xl");
        valido = false;
    }

    return valido;
}

// ── Toggle Edit Mode ──────────────────────────────────────────────────────────
function toggleEdit(active) {
    if (!active) {
        if (!validarCampos()) {
            editMode = true;
            editButton.querySelector("span").textContent = "save";
            editButton.childNodes[2].textContent         = " Guardar";
            return;
        }
        editMode = false;
    }

    editButton.querySelector("span").textContent = active ? "save"     : "edit";
    editButton.childNodes[2].textContent          = active ? " Guardar" : " Editar";

    // Campos editables genéricos
    document.querySelectorAll(".editable").forEach(f => {
        const view  = f.querySelector(".view");
        const input = f.querySelector(".edit");
        if (active) input.value = view.textContent.trim();
        else        view.textContent = input.value;
        view.classList.toggle("hidden", active);
        input.classList.toggle("hidden", !active);
    });

    // Password
    if (active) showPasswordEditFields(createMode);
    else        hidePasswordEditFields();

    // Roles interacción
    document.querySelectorAll(".roleButton").forEach(btn => {
        btn.classList.toggle("hover:border-primary", active);
        btn.classList.toggle("cursor-pointer", active);
        btn.classList.toggle("cursor-default", !active);
    });

    syncCustomerButton();

    // Commit al guardar
    if (!active) {
        if (createMode) guardarUsuario();
        else            actualizarUsuario();
    }
}

// ── Guardar usuario nuevo (POST) ──────────────────────────────────────────────
async function guardarUsuario() {
    const role = getSelectedRole();
    const payload = {
        nombre:     $("userName-edit").value.trim(),
        email:      $("userMail-edit").value.trim(),
        password:   $("userPassword-edit").value,
        role,
        id_cliente: role === roles.customer ? selectedCustomerId : null,
    };

    try {
        const { data: nuevo } = await axios.post(api.users.create(), payload);
        user = nuevo;
        $("upperUserId").textContent = nuevo.nombre;
        window.history.replaceState({}, "", `?id=${nuevo.id}`);
        deleteBtn.classList.remove("hidden");
    } catch (err) {
        console.error("Error al crear usuario:", err);
        showApiError(err.response?.data?.message ?? "Error al crear usuario.");
        editMode = true;
        toggleEdit(true);
    }
}

// ── Actualizar usuario existente (PUT) ────────────────────────────────────────
async function actualizarUsuario() {
    const role = getSelectedRole();
    const payload = {
        nombre:     $("userName-edit").value.trim(),
        email:      $("userMail-edit").value.trim(),
        role,
        id_cliente: role === "customer" ? selectedCustomerId : null,
    };

    const newPw = $("userPassword-edit").value;
    if (newPw) payload.password = newPw;

    try {
        const { data: updated } = await axios.put(api.users.update(user.id), payload);
        user = { ...user, ...updated };
        $("upperUserId").textContent = user.nombre;
        $("userName").textContent    = user.nombre;
        $("userMail").textContent    = user.email;
    } catch (err) {
        console.error("Error al actualizar usuario:", err);
        showApiError(err.response?.data?.message ?? "Error al actualizar usuario.");
        editMode = true;
        toggleEdit(true);
    }
}

// ── Render Historial ──────────────────────────────────────────────────────────
function renderHistorial() {
    $("activityBody").innerHTML = "";
}

// ── Eliminar usuario (DELETE) ─────────────────────────────────────────────────
async function eliminarUsuario() {
    try {
        await axios.delete(api.users.delete(user.id));
        window.location.href = "/frontend/src/shared/list_view.html?type=users";
    } catch (err) {
        modal.classList.add("hidden");
        showApiError(err.response?.data?.message ?? "Error al eliminar usuario.");
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MODAL CLIENTE ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function populateCustomerSelect() {
    const select = $("customerSelect");
    while (select.options.length > 1) select.remove(1);

    customers.forEach(c => {
        const opt = document.createElement("option");
        opt.value       = c.id;
        opt.textContent = c.nombre ?? c.name ?? c.razonSocial ?? `Cliente ${c.id}`;
        select.appendChild(opt);
    });

    if (selectedCustomerId) select.value = selectedCustomerId;
}

window.openCustomerModal = function () {
    populateCustomerSelect();
    $("customerSelectError").classList.add("hidden");
    $("customerModal").classList.remove("hidden");
};

window.closeCustomerModal = function () {
    $("customerModal").classList.add("hidden");
};

window.saveCustomer = function () {
    const select = $("customerSelect");
    if (!select.value) {
        $("customerSelectError").classList.remove("hidden");
        return;
    }
    selectedCustomerId = select.value;

    // ── Limpiar el borde rojo del grid de roles al asignar cliente ──
    $("rolesGrid").classList.remove("ring-2", "ring-red-400", "rounded-xl");

    closeCustomerModal();
};

// ── Event Listeners ───────────────────────────────────────────────────────────
editButton.addEventListener("click", () => {
    if (editMode) toggleEdit(false);
    else { editMode = true; toggleEdit(true); }
});

document.querySelectorAll(".roleButton").forEach(btn =>
    btn.addEventListener("click", handleRoleClick)
);

document.querySelectorAll(".edit").forEach(input =>
    input.addEventListener("input", () => input.classList.remove("border-red-400"))
);

$("userPassword-edit").addEventListener("input", () => {
    $("userPassword-edit").classList.remove("border-red-400");
    $("passwordMismatch").classList.add("hidden");
});
$("userPasswordConfirm-edit").addEventListener("input", () => {
    $("userPasswordConfirm-edit").classList.remove("border-red-400");
    $("passwordMismatch").classList.add("hidden");
});

deleteBtn.addEventListener("click",  () => modal.classList.remove("hidden"));
cancelBtn.addEventListener("click",  () => modal.classList.add("hidden"));
confirmBtn.addEventListener("click", eliminarUsuario);

$("customerModal").addEventListener("click", e => {
    if (e.target === $("customerModal")) closeCustomerModal();
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderCampos();
renderHistorial();

if (createMode) {
    editMode = true;
    toggleEdit(true);
} else {
    deleteBtn.classList.remove("hidden");
}