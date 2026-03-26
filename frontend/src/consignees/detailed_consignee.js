import { customers, consignees, dispatchPackaging } from '../shared/db.js';
import { setActiveNav } from '../shared/page_directory.js';
import { apiKey } from '../shared/keys.js';

setActiveNav("customers");

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

const consignee = createMode ? {} : consignees.find(c => c.id == id);
const customer  = idCus
    ? customers.find(c => c.id == idCus)
    : customers.find(c => c.id == consignee?.idCustomer);

const consigneeAddress = encodeURIComponent(consignee.address);

let editMode = false;

// Mapa de campos de especificaciones: id -> propiedad en consignee
const specFields = [
    { view: "maxLoad-view",      edit: "maxLoad-edit",      key: "maxLoad",                  type: "number" },
    { view: "minLoad-view",      edit: "minLoad-edit",      key: "minLoad",                  type: "number" },
    { view: "maxPieces-view",    edit: "maxPieces-edit",    key: "maxPieces",                type: "number" },
    { view: "packaging-view",    edit: "packaging-edit",    key: "prefDispatchPackagingID",  type: "select" },
    { view: "maxWidth-view",     edit: "maxWidth-edit",     key: "maxWidth",                 type: "number" },
    { view: "maxHeight-view",    edit: "maxHeight-edit",    key: "maxHeight",                type: "number" },
    { view: "intDiameter-view",  edit: "intDiameter-edit",  key: "internalDiameter",         type: "number" },
    { view: "extDiameter-view",  edit: "extDiameter-edit",  key: "externalDiameter",         type: "number" },
    { view: "instructions-view", edit: "instructions-edit", key: "instructions",             type: "textarea" },
];

const badges = {
    status: v => `<span class="${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ? "Activo" : "Inactivo"}</span>`
};

$("returnListView").href = `/frontend/src/shared/list_view.html?type=consignees&id=${customer.id}`;

// --- Render Campos ---
function renderCampos() {
    if (createMode) {
        $("upperConsigneeId").textContent = "Nuevo";
        $("consigneeID").textContent      = id;
        $("consigneeStatus").innerHTML    = badges.status(false);
    } else {
        Object.entries({
            upperConsigneeId: id,
            consigneeID:      consignee.id,
            consigneeCustomer: customer.name,
            consigneeName:    consignee.name,
            consigneeAddress: consignee.address,
        }).forEach(([k, v]) => $(k).textContent = v);
        $("consigneeStatus").innerHTML = badges.status(consignee.status);
    }
}

// --- Fill Dispatch Options
$("packaging-edit").innerHTML = dispatchPackaging.map(c => `
    <option value="${c.id}">${c.name}</option>
    `).join("");

// --- Render Specs (vista) ---
function renderSpecs() {
    specFields.forEach(({ view, key }) => {
        const el = $(view);
        if (!el) return;

        if (key === "prefDispatchPackagingID") {
            const packaging = dispatchPackaging.find(d => d.id == consignee[key]);
            el.textContent = packaging?.name ?? "—";
        } else {
            el.textContent = consignee[key] ?? "—";
        }
    });
}

// --- Validar Campos ---
function validarCampos() {
    let valido = true;
    ["consigneeName-edit", "consigneeAddres-edit"].forEach(fieldId => {
        const input = $(fieldId);
        if (input && !input.value.trim()) {
            input.classList.add("border-red-400");
            valido = false;
        }
    });
    return valido;
}

// --- Toggle Edit ---
function toggleEdit(active) {
    editButton.querySelector("span").textContent = active ? "save" : "edit";
    editButton.childNodes[2].textContent         = active ? " Guardar" : " Editar";

    // Campos de info general
    document.querySelectorAll(".editable").forEach(f => {
        const view  = f.querySelector(".view");
        const input = f.querySelector(".edit");
        if (active) input.value = view.textContent.trim(); else view.textContent = input.value;
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
        } else {
            consignee[key]    = editEl.type === "number" ? Number(editEl.value) : editEl.value;
            viewEl.textContent = consignee[key] ?? "—";
        }

        viewEl.classList.toggle("hidden", active);
        editEl.classList.toggle("hidden", !active);

        renderSpecs();
    });

    if (!active && (createMode || editMode)) {
        if (!validarCampos()) { editMode = true; toggleEdit(true); return; }
        if (createMode) {
            const nuevo = guardarConsignee();
            $("consigneeID").textContent = $("upperConsigneeId").textContent = nuevo.id;
            deleteBtn.classList.remove("hidden");
            window.history.replaceState({}, "", `?id=${nuevo.id}&idCus=${customer.id}`);
        }
    }
}

// --- Guardar Consignee ---
function guardarConsignee() {
    const nuevo = {
        id:         Number(id),
        idCustomer: customer.id,
        name:       $("consigneeName-edit").value.trim(),
        address:    $("consigneeAddres-edit").value.trim(),
        status:     $("consigneeStatus-edit").value === "1",
    };

    specFields.forEach(({ edit, key }) => {
        const el = $(edit);
        if (!el) return;
        nuevo[key] = key === "prefDispatchPackagingID"
        ? Number(el.value)
        : el.type === "number"
            ? Number(el.value)
            : el.value;
    });

    consignees.push(nuevo);
    return nuevo;
}

// --- Eliminar Consignee ---
function deleteConsignee() {
    const idx = consignees.findIndex(c => c.id == consignee.id);
    if (idx !== -1) consignees.splice(idx, 1);
}

// --- Event Listeners ---
editButton.addEventListener("click", () => { editMode = !editMode; toggleEdit(editMode); });

document.querySelectorAll(".edit").forEach(el =>
    el.addEventListener("input", () => el.classList.remove("border-red-400"))
);

deleteBtn.addEventListener("click", () => modal.classList.remove("hidden"));
cancelBtn.addEventListener("click", () => modal.classList.add("hidden"));
confirmBtn.addEventListener("click", () => {
    deleteConsignee();
    window.location.href = `/frontend/src/shared/list_view.html?type=consignees&id=${customer.id}`;
});

$("consigneeMap").src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${consigneeAddress}`;

// --- Init ---
renderCampos();
renderSpecs();

if (createMode) {
    editMode = true;
    toggleEdit(true);
} else {
    deleteBtn.classList.remove("hidden");
}