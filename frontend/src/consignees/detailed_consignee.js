import { setActiveNav } from "../shared/utils/nav.js";
import { getAppContext, roles } from "../shared/app_context.js";
import { renderHeader } from "../shared/components/header.js";
import { navIds } from "../../../shared/navigation.js";

const context = getAppContext();
renderHeader(context);
(context.role == roles.customer) ? setActiveNav(navIds.consignees) : setActiveNav(navIds.customers);

const $ = id => document.getElementById(id);
const editButton = $("editButton");
const deleteBtn  = $("deleteButton");
const modal      = $("deleteModal");
const cancelBtn  = $("cancelDelete");
const confirmBtn = $("confirmDelete");

const params     = new URLSearchParams(window.location.search);
const id         = params.get("id");
const idCus      = params.get("idCus");
const createMode = params.get("create") === "true";

let consignee;
let customer;

if (id) {
    const resConsignee = await axios.get(`http://localhost:3000/api/consignees/${id}`);
    consignee = resConsignee.data;
} else {
    consignee =  {}
}

if (idCus) {
    const resCustomers = await axios.get(`http://localhost:3000/api/customers/${idCus}`);
    customer = resCustomers.data;
} else {
    const resCustomer = await axios.get("http://localhost:3000/api/customers");
    customer = resCustomer.data.find(c => c.id == consignee.id_customer);
}

let editMode = false;
let isCreateMode = createMode;

// Mapa de campos de especificaciones: id -> propiedad en consignee
const specFields = [
    { view: "maxLoad-view",      edit: "maxLoad-edit",      key: "max_load",                 type: "number" },
    { view: "minLoad-view",      edit: "minLoad-edit",      key: "min_load",                 type: "number" },
    { view: "maxPieces-view",    edit: "maxPieces-edit",    key: "max_pieces_number",        type: "number" },
    { view: "packaging-view",    edit: "packaging-edit",    key: "preferred_dispatch",       type: "select" },
    { view: "maxWidth-view",     edit: "maxWidth-edit",     key: "max_width",                type: "number" },
    { view: "maxHeight-view",    edit: "maxHeight-edit",    key: "max_length",               type: "number" },
    { view: "intDiameter-view",  edit: "intDiameter-edit",  key: "max_internal_diameter",    type: "number" },
    { view: "extDiameter-view",  edit: "extDiameter-edit",  key: "max_external_diameter",    type: "number" },
    { view: "instructions-view", edit: "instructions-edit", key: "additional_instructions",  type: "textarea" },
];

const badges = {
    status: v => `<span class="${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ? "Activo" : "Inactivo"}</span>`
};

if (customer) {
    $("returnListView").href = `/frontend/src/shared/list_view.html?type=consignees&id=${customer.id}`;
}

// --- Render Campos ---
function renderCampos() {
    if (createMode) {
        $("upperConsigneeId").textContent = "Nuevo";
        $("consigneeCustomer").textContent = customer.name;
        $("consigneeStatus").innerHTML    = badges.status(false);
    } else {
        Object.entries({
            upperConsigneeId: consignee.name,
            consigneeCustomer: customer.name,
            consigneeName:    consignee.name,
            consigneeAddress: consignee.address,
        }).forEach(([k, v]) => $(k).textContent = v);
        $("consigneeStatus").innerHTML = badges.status(consignee.status);
    }
}

// --- Fill Dispatch Options

const dispatches = await axios.get("http://localhost:3000/api/dispatch");
const { data: platformRequests } = await axios.get("http://localhost:3000/api/platform_request");
const hasActiveRequests = platformRequests.some(
    pr => pr.id_consignee == consignee?.id && pr.status !== "Rechazada"
);

$("packaging-edit").innerHTML = dispatches.data.map(c => `
    <option value="${c.id}">${c.name}</option>
    `).join("");

function showToast(items, type = "error") {
    const existing = document.getElementById("specToast");
    if (existing) existing.remove();

    const isError = type === "error";
    const color   = isError ? "red" : "yellow";
    const icon    = isError ? "error" : "warning";
    const title   = isError ? "Edición bloqueada" : "Advertencia";

    const toast = document.createElement("div");
    toast.id = "specToast";
    toast.className = `fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-${color}-200 rounded-xl shadow-lg p-4 flex gap-3 items-start animate-[fadeIn_0.2s_ease]`;
    toast.innerHTML = `
        <span class="material-symbols-outlined text-${color}-500 mt-0.5 shrink-0">${icon}</span>
        <div class="flex-1">
            <p class="text-sm font-bold text-${color}-700 mb-1">${title}</p>
            <ul class="space-y-0.5">
                ${items.map(msg => `
                    <li class="text-xs text-${color}-600 flex items-start gap-1">
                        <span class="mt-0.5 shrink-0">•</span>${msg}
                    </li>`).join("")}
            </ul>
        </div>
        <button onclick="document.getElementById('specToast').remove()"
            class="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-sm">close</span>
        </button>`;

    document.body.appendChild(toast);
    setTimeout(() => toast?.remove(), 8000);
}

// --- Render Specs (vista) ---
function renderSpecs() {
    specFields.forEach(({ view, key }) => {
        const el = $(view);
        if (!el) return;

        if (key === "preferred_dispatch") {
            const packaging = dispatches.data.find(d => d.id == consignee[key]);
            el.textContent = packaging?.name ?? "—";
        } else {
            el.textContent = consignee[key] ?? "—";
        }
    });
}

// --- Validar Campos ---
function validarCampos() {
    let valido = true;

    // Campos de info general
    ["consigneeName-edit"].forEach(fieldId => {
        const input = $(fieldId);
        if (!input.value.trim()) {
            input.classList.add("border-red-400");
            valido = false;
        }
    });

    // Campos de especificaciones (skip si están bloqueados)
    specFields
        .filter(f => f.key !== "additional_instructions")
        .forEach(({ edit, type }) => {
            const input = $(edit);
            if (!input || input.disabled) return;

            let invalido = false;

            if (input.tagName === "SELECT") {
                invalido = !input.value;
            } else if (type === "number") {
                const value = input.value;
                if (value === "") {
                    invalido = true;
                } else {
                    const num = Number(value);
                    invalido = num <= 0 || isNaN(num);
                }
            } else {
                invalido = !input.value.trim();
            }

            if (invalido) {
                input.classList.add("border-red-400");
                valido = false;
            }
        });

    return valido;
}

document.querySelectorAll(".edit, .spec-edit").forEach(el =>
    el.addEventListener("input", () => el.classList.remove("border-red-400"))
);

async function renderMap() {
    if (consignee?.address) {
        const encoded = encodeURIComponent(consignee.address);
        const { data } = await axios.get("http://localhost:3000/api/config");
        $("consigneeMap").src = `https://www.google.com/maps/embed/v1/place?key=${data.googleApiKey}&q=${encoded}`;
    }
}
// --- Toggle Edit ---
async function toggleEdit(active) {
    editButton.querySelector("span").textContent = active ? "save" : "edit";
    editButton.childNodes[2].textContent         = active ? " Guardar" : " Editar";

    // Campos de info general
    document.querySelectorAll(".editable").forEach(f => {
        const view  = f.querySelector(".view");
        const input = f.querySelector(".edit");

        if (active) {
            input.value = view.textContent.trim();
        } else {
            view.textContent = input.value;

            if (input.id === "consigneeName-edit")    consignee.name    = input.value;
            if (input.id === "consigneeAddress-edit") consignee.address = input.value;
        }

        view.classList.toggle("hidden", active);
        input.classList.toggle("hidden", !active);
    });

    // Status select
    const statusView   = $("consigneeStatus");
    const statusSelect = $("consigneeStatus-edit");
    if (active) {
        statusSelect.value = consignee.status ? "1" : "0";
    } else {
        consignee.status     = statusSelect.value === "1";
        statusView.innerHTML = badges.status(consignee.status);
    }
    statusView.classList.toggle("hidden", active);
    statusSelect.classList.toggle("hidden", !active);

    // Campos de especificaciones
    specFields.forEach(({ view, edit, key }) => {
        const viewEl = $(view);
        const editEl = $(edit);
        if (!viewEl || !editEl) return;

        if (active) {
            editEl.value = consignee[key] ?? "";

            if (hasActiveRequests && key !== "additional_instructions") {
                editEl.disabled = true;
                editEl.classList.add("opacity-50", "cursor-not-allowed", "bg-gray-50");
            }
        } else {
            if (!hasActiveRequests || key === "additional_instructions") {
                consignee[key] = editEl.type === "number" ? Number(editEl.value) : editEl.value;
            }
            viewEl.textContent = consignee[key] ?? "—";
            editEl.disabled = false;
            editEl.classList.remove("opacity-50", "cursor-not-allowed", "bg-gray-50");
        }

        viewEl.classList.toggle("hidden", active);
        editEl.classList.toggle("hidden", !active);

        renderSpecs();
        if (!active) renderMap();
    });

    // Toast al entrar a editar si tiene requests activas
    if (active && hasActiveRequests && !isCreateMode) {
        showToast(["Este consignatario tiene solicitudes de tarima activas o pendientes. Las especificaciones no pueden modificarse."], "warning");
    }

    if (!active && (isCreateMode || !editMode)) {
        if (!validarCampos()) {
            editMode = true;
            toggleEdit(true);
            return;
        }
        if (isCreateMode) {
            const nuevo = await saveNewConsignee();

            consignee    = nuevo;
            isCreateMode = false;

            $("upperConsigneeId").textContent = nuevo.name;

            deleteBtn.classList.remove("hidden");
            window.history.replaceState({}, "", `?id=${nuevo.id}&idCus=${customer.id}`);
        } else if (!editMode) {
            const updatedCustomer = await saveEditedConsignee();
            $("upperConsigneeId").textContent = updatedCustomer.name;
        }
        editMode = false;
    }
}

// --- Guardar Consignee ---
async function saveNewConsignee() {
    const newConsignee = {
        id_customer: customer.id,
        name: $("consigneeName-edit").value.trim(),
        address: $("consigneeAddress-edit").value.trim(),
        status: $("consigneeStatus-edit").value === "1",
        max_load: Number($("maxLoad-edit").value.trim()),
        min_load: Number($("minLoad-edit").value.trim()),
        max_pieces_number: Number($("maxPieces-edit").value.trim()),
        preferred_dispatch: $("packaging-edit").value.trim(),
        max_width: Number($("maxWidth-edit").value.trim()),
        max_length: Number($("maxHeight-edit").value.trim()),
        max_internal_diameter: Number($("intDiameter-edit").value.trim()),
        max_external_diameter: Number($("extDiameter-edit").value.trim()),
        additional_instructions: $("instructions-edit").value.trim(),
    }

    try {
        const res = await axios.post('http://localhost:3000/api/consignees', newConsignee);
    } catch (err) {
        console.error(err.response?.data || err.message);
    }
    return newConsignee;
}

async function saveEditedConsignee(){
    const newConsignee = {
        id_customer: customer.id,
        name: $("consigneeName-edit").value.trim(),
        address: $("consigneeAddress-edit").value.trim(),
        status: $("consigneeStatus-edit").value === "1",
        max_load: Number($("maxLoad-edit").value.trim()),
        min_load: Number($("minLoad-edit").value.trim()),
        max_pieces_number: Number($("maxPieces-edit").value.trim()),
        preferred_dispatch: $("packaging-edit").value.trim(),
        max_width: Number($("maxWidth-edit").value.trim()),
        max_length: Number($("maxHeight-edit").value.trim()),
        max_internal_diameter: Number($("intDiameter-edit").value.trim()),
        max_external_diameter: Number($("extDiameter-edit").value.trim()),
        additional_instructions: $("instructions-edit").value.trim(),
    }

    try {
        const res = await axios.put(`http://localhost:3000/api/consignees/${id}`, newConsignee);
    } catch (err) {
        console.error(err.response?.data || err.message);
    }
    return newConsignee;
}

// --- Eliminar Consignee ---
async function deleteConsignee() {
    await axios.delete(`http://localhost:3000/api/consignees/${id}`);
}

// --- Event Listeners ---
editButton.addEventListener("click", () => { editMode = !editMode; toggleEdit(editMode); });

document.querySelectorAll(".edit").forEach(el =>
    el.addEventListener("input", () => el.classList.remove("border-red-400"))
);

deleteBtn.addEventListener("click", () => modal.classList.remove("hidden"));
cancelBtn.addEventListener("click", () => modal.classList.add("hidden"));
confirmBtn.addEventListener("click", async () => {
    await deleteConsignee();
    window.location.href = `/frontend/src/shared/list_view.html?type=consignees&id=${customer.id}`;
});

// --- Init ---
renderCampos();
renderSpecs();
renderMap();

if (createMode) {
    editMode = true;
    toggleEdit(true);
} else {
    deleteBtn.classList.remove("hidden");
}