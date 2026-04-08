import { consignees } from '../shared/db.js';
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
    { view: "maxHeight-view",    edit: "maxHeight-edit",    key: "max_height",               type: "number" },
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

$("packaging-edit").innerHTML = dispatches.data.map(c => `
    <option value="${c.id}">${c.name}</option>
    `).join("");

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

    // Campos de especificaciones
    specFields
        .filter(f => f.key !== "additional_instructions")
        .forEach(({ edit, type }) => {
            const input = $(edit);
            if (!input) return;

            let invalido = false;

            if (input.tagName === "SELECT") {
                invalido = !input.value;
            } 
            else if (type === "number") {
                const value = input.value;

                if (value === "") {
                    invalido = true; // vacío
                } else {
                    const num = Number(value);
                    invalido = num <= 0 || isNaN(num); // 👈 clave
                }
            } 
            else {
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

function renderMap(){
    if (consignee?.address) {
        const encoded = encodeURIComponent(consignee.address);
        $("consigneeMap").src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encoded}`;
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

            // 👇 AQUÍ está la magia
            if (input.id === "consigneeName-edit") {
                consignee.name = input.value;
            }
            if (input.id === "consigneeAddress-edit") {
                consignee.address = input.value;
            }
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
        } else {
            consignee[key]    = editEl.type === "number" ? Number(editEl.value) : editEl.value;
            viewEl.textContent = consignee[key] ?? "—";
        }

        viewEl.classList.toggle("hidden", active);
        editEl.classList.toggle("hidden", !active);

        renderSpecs();
        if(!active) renderMap();
    });

    if (!active && (isCreateMode || !editMode)) {
        if (!validarCampos()) { 
            editMode = true; 
            toggleEdit(true); 
            return; 
        }
        if (isCreateMode) {
            const nuevo = await saveNewConsignee();

            consignee = nuevo;
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
        max_height: Number($("maxHeight-edit").value.trim()),
        max_internal_diameter: Number($("intDiameter-edit").value.trim()),
        max_external_diameter: Number($("extDiameter-edit").value.trim()),
        additional_instructions: $("instructions-edit").value.trim(),
    }

    try {
        const res = await axios.post('http://localhost:3000/api/consignees', newConsignee);
        console.log(res.data);
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
        max_height: Number($("maxHeight-edit").value.trim()),
        max_internal_diameter: Number($("intDiameter-edit").value.trim()),
        max_external_diameter: Number($("extDiameter-edit").value.trim()),
        additional_instructions: $("instructions-edit").value.trim(),
    }

    try {
        const res = await axios.put(`http://localhost:3000/api/consignees/${id}`, newConsignee);
        console.log(res.data);
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