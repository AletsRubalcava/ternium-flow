import { users, changes, entities } from '../shared/db.js';
import { setActiveNav } from '../shared/utils/nav.js';
import { renderHeader } from '../shared/components/header.js';
import { getAppContext } from '../shared/app_context.js';
import { navIds } from "../../../shared/navigation.js";

const context = getAppContext();
renderHeader(context);
setActiveNav(navIds.users);

// --- Shortcuts ---
const $ = id => document.getElementById(id);
const editButton = $("editButton");
const deleteBtn  = $("deleteButton");
const modal      = $("deleteModal");
const cancelBtn  = $("cancelDelete");
const confirmBtn = $("confirmDelete");

const params     = new URLSearchParams(window.location.search);
const id         = params.get("id");
const createMode = params.get("create") === "true";
const user       = createMode ? {} : users.find(u => u.id == id);
const userChanges = createMode ? [] : changes.filter(c => c.idUser == user.id);

let editMode = false;

// ── Definición de módulos y permisos ────────────────────────────────────────
const permissionModules = [
    { key: "clientes",      label: "Clientes",      extras: ["Consignatarios", "Tarimas"] },
    { key: "comercial",     label: "Comercial",      extras: ["Consignatarios", "Tarimas"] },
    { key: "productos",     label: "Productos",      extras: [] },
    { key: "paquetes",      label: "Paquetes",       extras: [] },
    { key: "seguimientos",  label: "Seguimientos",   extras: [] },
    { key: "estadisticas",  label: "Estadísticas",   extras: [] },
    { key: "usuarios",      label: "Usuarios",       extras: [] },
];

// Estado actual de permisos personalizados (se carga del usuario o vacío)
let customPermissions = user?.customPermissions ? { ...user.customPermissions } : buildEmptyPermissions();

function buildEmptyPermissions() {
    const perms = {};
    permissionModules.forEach(mod => {
        perms[mod.key] = {
            agregar:      false,
            verDetalle:   false,
            editar:       false,
            eliminar:     false,
        };
        mod.extras.forEach(ext => {
            perms[mod.key][ext.toLowerCase()] = false;
        });
    });
    return perms;
}

// ── Badges ───────────────────────────────────────────────────────────────────
const badges = {
    estado: v => `<span class="${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ? "Activo" : "Inactivo"}</span>`,
    tipo:   v => `<span class="${v ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ? "Cliente" : "Personal"}</span>`
};

// ── Roles map ────────────────────────────────────────────────────────────────
const roleMap = { 1: "adminRoleButton", 2: "logisticsRoleButton", 3: "customRoleButton", 4: "customerRoleButton" };

// ── Render Campos ────────────────────────────────────────────────────────────
function renderCampos() {
    if (createMode) {
        $("upperUserId").textContent = id;
        $("idUser").textContent      = id;
        $("userType").innerHTML      = badges.tipo(false);
        $("userStatus").innerHTML    = badges.estado(false);
    } else {
        const fields = {
            userName:     `${user.nombre} ${user.apellidoP} ${user.apellidoM}`,
            userMail:     user.correo,
            userPassword: user.contraseña,
        };
        Object.entries(fields).forEach(([k, v]) => $(k).textContent = v);
        $("upperUserId").textContent = user.id;
        $("idUser").textContent      = user.id;
        $("userType").innerHTML      = badges.tipo(user.vistaCliente);
        $("userStatus").innerHTML    = badges.estado(user.estado);

        const rolBtn = $(roleMap[user.idRol] ?? "customerRoleButton");
        rolBtn.classList.add("border-2", "border-primary", "bg-orange-50");
        rolBtn.querySelector("span.material-symbols-outlined").classList.add("text-primary");

        // Si ya tiene permisos personalizados, cargarlos
        if (user.customPermissions) {
            customPermissions = { ...user.customPermissions };
        }
    }

    // Actualizar visibilidad del botón de permisos según rol actual
    syncPermissionsButton();
}

// ── Sincronizar visibilidad del botón "Permisos" ─────────────────────────────
function syncPermissionsButton() {
    const isCustomSelected = $("customRoleButton").classList.contains("border-primary");
    const btn = $("openPermissionsBtn");
    if (isCustomSelected && editMode) {
        btn.classList.remove("hidden");
    } else {
        btn.classList.add("hidden");
    }
}

// ── Handle Role Click ────────────────────────────────────────────────────────
function handleRoleClick(e) {
    if (!editMode) return;

    // Limpiar ring de error si existía
    $("rolesGrid").classList.remove("ring-2", "ring-red-400", "rounded-xl");

    document.querySelectorAll(".roleButton").forEach(b => {
        b.classList.remove("border-2", "border-primary", "bg-orange-50");
        b.querySelector("span.material-symbols-outlined").classList.replace("text-primary", "text-gray-400");
    });

    const btn = e.currentTarget;
    btn.classList.add("border-2", "border-primary", "bg-orange-50");
    btn.querySelector("span.material-symbols-outlined").classList.replace("text-gray-400", "text-primary");

    syncPermissionsButton();
}

// ── Validar Campos ────────────────────────────────────────────────────────────
function validarCampos() {
    let valido = true;

    ["userName-edit", "userMail-edit", "userPassword-edit"].forEach(fid => {
        const input = $(fid);
        if (!input.value.trim()) { input.classList.add("border-red-400"); valido = false; }
    });

    if (!document.querySelector(".roleButton.border-primary")) {
        $("rolesGrid").classList.add("ring-2", "ring-red-400", "rounded-xl");
        valido = false;
    }

    return valido;
}

// ── Toggle Edit Mode ─────────────────────────────────────────────────────────
function toggleEdit(active) {
    // Si se intenta guardar, validar antes
    if (!active) {
        if (!validarCampos()) {
            editMode = true;
            editButton.querySelector("span").textContent = "save";
            editButton.childNodes[2].textContent         = " Guardar";
            return;
        }
        editMode = false;
    }

    editButton.querySelector("span").textContent = active ? "save"   : "edit";
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

    // Status y Tipo
    [["userStatus", "userStatus-edit", "estado", badges.estado], ["userType", "userType-edit", "vistaCliente", badges.tipo]]
        .forEach(([viewId, selectId, key, render]) => {
            const v = $(viewId), s = $(selectId);
            if (active) s.value = user[key] ? "1" : "0";
            else { user[key] = s.value === "1"; v.innerHTML = render(user[key]); }
            v.classList.toggle("hidden", active);
            s.classList.toggle("hidden", !active);
        });

    // Roles: habilitar/deshabilitar interacción
    document.querySelectorAll(".roleButton").forEach(btn => {
        btn.classList.toggle("hover:border-primary", active);
        btn.classList.toggle("cursor-pointer", active);
        btn.classList.toggle("cursor-default", !active);
    });

    // Sincronizar botón de permisos
    syncPermissionsButton();

    // Commit al guardar
    if (!active) {
        if (createMode) {
            const nuevo = guardarUsuario();
            $("idUser").textContent = $("upperUserId").textContent = nuevo.id;
            deleteBtn.classList.remove("hidden");
        } else {
            // Actualizar usuario existente
            const idx = users.findIndex(u => u.id == user.id);
            if (idx !== -1) {
                user.nombre            = $("userName-edit").value.trim();
                user.correo            = $("userMail-edit").value.trim();
                user.contraseña        = $("userPassword-edit").value.trim();
                user.customPermissions = { ...customPermissions };
                users[idx] = { ...user };
            }
        }
    }
}

// ── Guardar usuario nuevo ─────────────────────────────────────────────────────
function guardarUsuario() {
    const rolSelected = document.querySelector(".roleButton.border-primary");
    const rolId = rolSelected
        ? Object.entries({ 1: "adminRoleButton", 2: "logisticsRoleButton", 3: "customRoleButton", 4: "customerRoleButton" })
            .find(([, btnId]) => btnId === rolSelected.id)?.[0] ?? 4
        : 4;

    const nuevoUsuario = {
        id:               Number(id),
        nombre:           $("userName-edit").value.trim(),
        correo:           $("userMail-edit").value.trim(),
        contraseña:       $("userPassword-edit").value.trim(),
        estado:           $("userStatus-edit").value === "1",
        vistaCliente:     $("userType-edit").value === "1",
        idRol:            Number(rolId),
        customPermissions: { ...customPermissions },
    };
    users.push(nuevoUsuario);
    window.history.replaceState({}, "", `?id=${nuevoUsuario.id}`);
    return nuevoUsuario;
}

// ── Render Historial ─────────────────────────────────────────────────────────
function formatCambios(orig, changed, accion) {
    if (accion === "create") return "Nuevo registro";
    if (accion === "delete") return "Registro eliminado";
    return Object.keys(changed)
        .map(k => `<span class="font-medium">${k}:</span> ${orig[k] ?? "—"} → ${changed[k]}`)
        .join("<br>");
}

function renderHistorial() {
    $("activityBody").innerHTML = userChanges.map(u => `
        <tr class="bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${entities.find(e => e.id == u.idEntityCatalog)?.name ?? "—"}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${u.idEntity}</td>
            <td class="px-6 py-4 text-sm text-text-secondary-light">${formatCambios(u.originalValues, u.changedValues, u.accion)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${u.timeStamp}</td>
        </tr>`).join("");
}

// ── Eliminar usuario ─────────────────────────────────────────────────────────
function eliminarUsuario() {
    const idx = users.findIndex(u => u.id == user.id);
    if (idx !== -1) users.splice(idx, 1);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MODAL PERMISOS ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Columnas base siempre presentes
const baseCols = [
    { key: "agregar",    label: "Agregar"    },
    { key: "verDetalle", label: "Ver Detalle" },
    { key: "editar",     label: "Editar"     },
    { key: "eliminar",   label: "Eliminar"   },
];

window.openPermissionsModal = function () {
    renderPermissionsTable();
    $("permissionsModal").classList.remove("hidden");
};

window.closePermissionsModal = function () {
    $("permissionsModal").classList.add("hidden");
};

window.savePermissions = function () {
    // Leer todos los checkboxes y actualizar customPermissions
    document.querySelectorAll("[data-perm-mod]").forEach(cb => {
        const mod  = cb.dataset.permMod;
        const perm = cb.dataset.permKey;
        if (!customPermissions[mod]) customPermissions[mod] = {};
        customPermissions[mod][perm] = cb.checked;
    });
    closePermissionsModal();
};

window.toggleAllPermissions = function (value) {
    document.querySelectorAll("[data-perm-mod]").forEach(cb => { cb.checked = value; });
};

function renderPermissionsTable() {
    const tbody = $("permissionsTableBody");

    // Detectar si algún módulo tiene extras para ajustar columnas dinámicas
    const allExtras = [...new Set(permissionModules.flatMap(m => m.extras))];

    // Actualizar headers de columnas extra
    const extraHead1 = $("extraColHead1");
    const extraHead2 = $("extraColHead2");
    extraHead1.textContent = allExtras[0] ?? "";
    extraHead2.textContent = allExtras[1] ?? "";

    tbody.innerHTML = permissionModules.map(mod => {
        // Columnas base
        const baseCells = baseCols.map(col => {
            const checked = customPermissions[mod.key]?.[col.key] ? "checked" : "";
            return `
                <td class="px-2 py-3 text-center">
                    <input type="checkbox" ${checked}
                        data-perm-mod="${mod.key}" data-perm-key="${col.key}"
                        class="perm-checkbox" />
                </td>`;
        }).join("");

        // Columnas extra (Consignatarios, Tarimas) — solo para módulos que las tienen
        const extraCells = allExtras.map(ext => {
            const extKey = ext.toLowerCase();
            const hasExtra = mod.extras.includes(ext);
            if (!hasExtra) {
                return `<td class="px-2 py-3 text-center text-border-light">
                    <span class="material-symbols-outlined text-slate-400 text-sm opacity-70">remove</span>
                </td>`;
            }
            const checked = customPermissions[mod.key]?.[extKey] ? "checked" : "";
            return `
                <td class="px-2 py-3 text-center">
                    <input type="checkbox" ${checked}
                        data-perm-mod="${mod.key}" data-perm-key="${extKey}"
                        class="perm-checkbox" />
                </td>`;
        }).join("");

        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3 pr-4">
                    <span class="text-xs font-bold text-text-primary-light uppercase">${mod.label}</span>
                </td>
                ${baseCells}
                ${extraCells}
            </tr>`;
    }).join("");
}

// ── Event Listeners ───────────────────────────────────────────────────────────
editButton.addEventListener("click", () => {
    if (editMode) {
        toggleEdit(false);
    } else {
        editMode = true;
        toggleEdit(true);
    }
});

document.querySelectorAll(".roleButton").forEach(btn =>
    btn.addEventListener("click", handleRoleClick)
);

document.querySelectorAll(".edit").forEach(input =>
    input.addEventListener("input", () => input.classList.remove("border-red-400"))
);

deleteBtn.addEventListener("click",  () => modal.classList.remove("hidden"));
cancelBtn.addEventListener("click",  () => modal.classList.add("hidden"));
confirmBtn.addEventListener("click", () => {
    eliminarUsuario();
    window.location.href = "/frontend/src/shared/list_view.html?type=users";
});

// Cerrar modal de permisos al hacer click fuera
$("permissionsModal").addEventListener("click", e => {
    if (e.target === $("permissionsModal")) closePermissionsModal();
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