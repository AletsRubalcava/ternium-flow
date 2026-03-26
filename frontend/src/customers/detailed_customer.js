import { customers, consignees, platforms, followUps, contacts} from "../shared/db.js";
import { setActiveNav } from "../shared/page_directory.js";

setActiveNav("customers");

// --- Shortcuts ---
const $ = id => document.getElementById(id);
const editButton  = $("editButton");
const deleteBtn   = $("deleteButton");
const modal       = $("deleteModal");
const cancelBtn   = $("cancelDelete");
const confirmBtn  = $("confirmDelete");

const params     = new URLSearchParams(window.location.search);
const id         = params.get("id");
const createMode = params.get("create") === "true";
const customer   = createMode ? {} : customers.find(c => c.id == id);
const consignee  = createMode ? [] : consignees.filter(c => c.idCustomer == customer.id);
const platformCustomer = createMode ? [] : platforms.filter(p => consignee.some(c => c.id == p.idConsignee));
const followUp   = createMode ? [] : followUps.filter(f => consignee.some(c => c.id == f.idConsignee));

const contactModal = $("contactModal");
const saveContactBtn = $("saveContact");
const cancelContactBtn = $("cancelContact");
const nameErrorMsg = $("nameError");
const contactErrorMsg = $("contactError");

let editingContact = null;
let editMode = false;
let selectedItem = null; // { type: 'consignee' | 'platform', data: {...} }

// --- Badges ---
const badges = {
    status: v => `<span class="${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ? "Activo" : "Inactivo"}</span>`
};

// --- Empty state widget ---
function emptyWidget(mensaje) {
    return `
        <div class="py-10 w-full h-full flex items-center justify-center">
            <div class="flex flex-col justify-center items-center gap-2">
                <div class="size-20 rounded-full bg-slate-100 flex items-center justify-center">
                    <span class="material-symbols-outlined text-5xl text-slate-400">playlist_remove</span>
                </div>
                <p class="text-slate-400">${mensaje}</p>
            </div>
        </div>`;
}

// --- Render Campos ---
function renderCampos() {
    if (createMode) {
        $("upperClientId").textContent  = "Nuevo";
        $("idCustomer").textContent     = id;
        $("customerStatus").innerHTML   = badges.status(false);
    } else {
        const fields = {
            upperClientId:   id,
            idCustomer:      customer.id,
            customerName:    customer.name,
            customerRFC:     customer.rfc,
            customerAddress: customer.address,
        };
        Object.entries(fields).forEach(([k, v]) => $(k).textContent = v);
        $("customerStatus").innerHTML = badges.status(customer.status);
    }

    $("activeConsignees").textContent = `(${consignee.length} activos)`;
}

// --- Validar Campos ---
function validarCampos() {
    let valido = true;
    ["customerName-edit", "customerRFC-edit", "customerAddress-edit"].forEach(fieldId => {
        const input = $(fieldId);
        if (!input.value.trim()) {
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

    document.querySelectorAll(".editable").forEach(f => {
        const view  = f.querySelector(".view");
        const input = f.querySelector(".edit");
        if (active) input.value = view.textContent.trim(); else view.textContent = input.value;
        view.classList.toggle("hidden", active);
        input.classList.toggle("hidden", !active);
    });

    // Status select
    const statusView   = $("customerStatus");
    const statusSelect = $("customerStatus-edit");
    if (active) {
        statusSelect.value = customer.status ? "1" : "0";
        statusView.classList.add("hidden");
        statusSelect.classList.remove("hidden");
    } else {
        customer.status      = statusSelect.value === "1";
        statusView.innerHTML = badges.status(customer.status);
        statusView.classList.remove("hidden");
        statusSelect.classList.add("hidden");
    }

    document.querySelectorAll(".contactWidget").forEach(c => {
        if(active){
            c.querySelector(".editContactBtn").classList.remove("hidden");
            c.querySelector(".deleteContactBtn").classList.remove("hidden");
        }else{
            c.querySelector(".editContactBtn").classList.add("hidden");
            c.querySelector(".deleteContactBtn").classList.add("hidden");
        }
    });

    const addContactBtn = $("addContactBtn");

    if(active) addContactBtn.classList.remove("hidden");
    else addContactBtn.classList.add("hidden");

    if (!active && (createMode || editMode)) {
        if (!validarCampos()) { editMode = true; toggleEdit(true); return; }
        if (createMode) {
            const nuevo = guardarCustomer();
            $("idCustomer").textContent = $("upperClientId").textContent = nuevo.id;
            deleteBtn.classList.remove("hidden");
            window.history.replaceState({}, "", `?id=${nuevo.id}`);
        }
    }
}

// --- Guardar Customer ---
function guardarCustomer() {
    const nuevoCustomer = {
        id:      Number(id),
        name:    $("customerName-edit").value.trim(),
        rfc:     $("customerRFC-edit").value.trim(),
        address: $("customerAddress-edit").value.trim(),
        status:  $("customerStatus-edit").value === "1",
    };
    customers.push(nuevoCustomer);
    return nuevoCustomer;
}

// --- Render Consignatarios ---
function renderConsignees() {
    $("activeConsignees").textContent = `(${consignee.length} activos)`;

    $("consigneeWidget").innerHTML = consignee.length === 0
        ? emptyWidget("Sin consignatarios")
        : consignee.map(c => `
            <div class="consigneeTuple group cursor-pointer p-3 rounded-lg border border-border-light hover:border-primary/50 transition-all flex justify-between items-center" data-id="${c.id}"><div>
                    <div class="text-sm font-medium text-text-primary-light">${c.name}</div>
                    <div class="text-[10px] text-text-secondary-light">${c.address}</div>
                </div>
                <span data-id="${c.id}" class="redirectConsignee text-[20px] material-symbols-outlined text-gray-300 group-hover:text-primary">open_in_new</span>
            </div>`).join("");

    document.querySelectorAll(".consigneeTuple").forEach(el => {
        const cData = consignee.find(c => c.id == el.dataset.id);
        el.addEventListener("click", (e) => {
            // Evitar que el click en el botón de redirect active la selección
            if (e.target.classList.contains("redirectConsignee")) return;
            selectItem("consignee", cData, el);
        });
    });

    document.querySelectorAll(".redirectConsignee").forEach(c => {
        c.addEventListener("click", () => {
            window.location.href = `/frontend/src/consignees/detailed_consignee.html?id=${c.dataset.id}`
        });
    });
}

// --- Render Platforms ---
function renderPlatforms() {
    $("activePlatforms").textContent = `(${platformCustomer.length} activas)`;

    $("platformWidget").innerHTML = platformCustomer.length === 0
        ? emptyWidget("Sin tarimas")
        : platformCustomer.map(p => `
            <div class="platformTuple group cursor-pointer p-3 rounded-lg border border-border-light hover:border-primary/50 transition-all flex justify-between items-center" data-id="${p.id}"><div class="flex items-center gap-3">
                    <div>
                        <div class="text-sm font-medium text-text-primary-light">${p.name}</div>
                        <div class="text-[10px] text-text-secondary-light">${p.description}, ${p.weight}kg</div>
                    </div>
                </div>
                <span data-id="${p.id}" class="redirectPlatform text-[20px] material-symbols-outlined text-gray-300 group-hover:text-primary">open_in_new</span>
            </div>`).join("");

    document.querySelectorAll(".platformTuple").forEach(el => {
        const pData = platformCustomer.find(p => p.id == el.dataset.id);
        el.addEventListener("click", (e) => {
            if (e.target.classList.contains("redirectPlatform")) return;
            selectItem("platform", pData, el);
        });
    });

    document.querySelectorAll(".redirectPlatform").forEach(p => {
        p.addEventListener("click", () => {
            window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${p.dataset.id}`;
        });
    });
}

// --- Render Follow Ups ---
function renderFollowUps() {
    const thead = $("followUpsThead");
    const tbody = $("followUpsBody");

    if (followUp.length === 0) {
        thead.innerHTML = "";
        tbody.innerHTML = emptyWidget("Sin seguimientos");
        return;
    }

    const statusClass = {
        "Entregado":   "bg-green-100 text-green-800",
        "En tránsito": "bg-orange-100 text-orange-800",
        "Procesando":  "bg-blue-100 text-blue-800",
        "Cancelado":   "bg-red-100 text-red-800",
    };

    tbody.innerHTML = followUp.map(f => `
        <tr data-id="${f.id}" class="followUpTuple hover:bg-gray-200 transition-colors">
            <td class="px-6 py-4 text-sm font-bold text-text-primary-light">${f.id}</td>
            <td class="px-6 py-4 text-xs text-text-secondary-light">${f.date}</td>
            <td class="px-6 py-4 text-sm font-medium">${f.weight} kg</td>
            <td class="px-6 py-4 text-xs text-text-secondary-light">${consignee.find(c => c.id == f.idConsignee)?.name ?? '—'}</td>
            <td class="px-6 py-4 text-right">
                <span class="${statusClass[f.status] ?? "bg-gray-100 text-gray-800"} px-2 py-1 text-[10px] font-bold rounded-full">${f.status}</span>
            </td>
        </tr>`).join("");

        document.querySelectorAll(".followUpTuple").forEach(f => {
            f.addEventListener("click", () => {
                window.location.href = `/frontend/src/followUps/detailed_followUp.html?id=${f.dataset.id}`;
            });
        });
}

// --- Eliminar Customer ---
function eliminarCustomer() {
    const idx = customers.findIndex(c => c.id == customer.id);
    if (idx !== -1) customers.splice(idx, 1);
}

// --- Event Listeners ---
editButton.addEventListener("click", () => { editMode = !editMode; toggleEdit(editMode); });

document.querySelectorAll(".edit").forEach(input => {
    input.addEventListener("input", () => input.classList.remove("border-red-400"));
});

$("viewAllConsignees").onclick = () => window.location.href = `/frontend/src/shared/list_view.html?type=consignees&id=${id}`;
$("viewAllPlatforms").onclick  = () => window.location.href = `/frontend/src/shared/list_view.html?type=platforms&id=${id}`;
$("viewAllFollowUps").onclick  = () => window.location.href = `/frontend/src/shared/list_view.html?type=followUps&id=${id}`;

deleteBtn.addEventListener("click", () => modal.classList.remove("hidden"));
cancelBtn.addEventListener("click", () => modal.classList.add("hidden"));
confirmBtn.addEventListener("click", () => {
    eliminarCustomer();
    window.location.href = "/frontend/src/shared/list_view.html?type=customers";
});

$("addContactBtn").addEventListener("click", () => {
    editingContact = null;
    contactModal.classList.remove("hidden");
});

// --- Add Contact
function validarContacto() {
    const name  = $("contactName").value.trim();
    const email = $("contactEmail").value.trim();
    const phone = $("contactPhone").value.trim();

    let valido = true;

    // Nombre obligatorio
    if (!name) {
        nameErrorMsg.classList.remove("hidden");
        valido = false;
    } else {
        nameErrorMsg.classList.add("hidden");
    }

    // Email o teléfono (al menos uno)
    if (!email && !phone) {
        contactErrorMsg.classList.remove("hidden");
        valido = false;
    } else {
        contactErrorMsg.classList.add("hidden");
    }

    return valido;
}

saveContactBtn.addEventListener("click", () => {
    if (!validarContacto()) return;

    const nuevo = {
        id: Date.now(),
        idCustomer: Number(id),
        name: $("contactName").value.trim(),
        workstation: $("contactWorkstation").value.trim(),
        email: $("contactEmail").value.trim(),
        phone: $("contactPhone").value.trim(),
    };

    if (editingContact) {
        Object.assign(editingContact, nuevo);
    } else {
        contacts.push(nuevo);
    }

    contactModal.classList.add("hidden");
    limpiarFormulario();
    renderContacts();
});

function limpiarFormulario() {
    ["contactName", "contactWorkstation", "contactEmail", "contactPhone"]
        .forEach(id => $(id).value = "");
}

cancelContactBtn.addEventListener("click", () => {
    contactModal.classList.add("hidden");
    limpiarFormulario();
});

// --- Render Contacts
function renderContacts() {
    const container = document.querySelector(".contactsContainer");
    const customerContacts = contacts.filter(c => c.idCustomer == id);

    if (customerContacts.length === 0) {
        container.innerHTML = emptyWidget("Sin contactos");
        return;
    }

    container.innerHTML = customerContacts.map(c => `
        <div class="contactWidget flex gap-4 p-3 rounded-lg bg-gray-50 border border-border-light">
            <div class="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                ${c.name[0] ?? "?"}
            </div>
            <div class="flex-grow">
                <div class="text-md font-bold">${c.name}</div>
                <div class="text-[12px] text-gray-500 mb-1">${c.workstation ?? ""}</div>
                ${c.email ? `<div class="text-xs flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">mail</span>${c.email}</div>` : ""}
                ${c.phone ? `<div class="text-xs flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">call</span>${c.phone}</div>` : ""}
            </div>
            <div class="flex flex-col gap-1 my-auto">
                <button data-id="${c.id}" class="editContactBtn ${editMode ? "" : "hidden"} text-primary">
                    <span class="material-symbols-outlined text-sm">edit</span>
                </button>
                <button data-id="${c.id}" class="deleteContactBtn ${editMode ? "" : "hidden"} text-primary">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        </div>`).join("");

    // Listeners después de renderizar
    document.querySelectorAll(".editContactBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const c = contacts.find(c => c.id == btn.dataset.id);
            if (!c) return;
            editingContact = c;
            $("contactName").value        = c.name;
            $("contactWorkstation").value = c.workstation || "";
            $("contactEmail").value       = c.email || "";
            $("contactPhone").value       = c.phone || "";
            contactModal.classList.remove("hidden");
        });
    });

    document.querySelectorAll(".deleteContactBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = contacts.findIndex(c => c.id == btn.dataset.id);
            if (idx !== -1) contacts.splice(idx, 1);
            renderContacts();
        });
    });
}

function renderSpecs() {
    const content  = $("specsContent");
    const subtitle = $("specsSubtitle");

    if (!selectedItem) {
        content.innerHTML = emptyWidget("Selecciona un consignatario o tarima");
        subtitle.textContent = "";
        return;
    }

    const { type, data } = selectedItem;

    const field = (label, value) => `
        <div>
            <label class="field-label">${label}</label>
            <div class="field-value">${value ?? "—"}</div>
        </div>`;

    if (type === "consignee") {
        subtitle.textContent = "Configuración de Consignatario";
        content.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                ${field("Carga Máxima (kg)", data.maxLoad)}
                ${field("Carga Mínima (kg)", data.minLoad)}
                ${field("Máx. Piezas", data.maxPieces)}
                ${field("Embalaje Preferido", data.prefDispatchPackaging)}
                ${field("Ancho Máx (cm)", data.maxWidth)}
                ${field("Altura Máx (cm)", data.maxHeight)}
                ${field("Ø Interno (cm)", data.internalDiameter)}
                ${field("Ø Externo (cm)", data.externalDiameter)}
            </div>
            <div>
                <label class="field-label">Instrucciones Adicionales</label>
                <p class="text-xs text-text-secondary-light leading-relaxed italic">
                    ${data.instructions ?? "Sin instrucciones especiales."}
                </p>
            </div>
            <div class="pt-4">
                <button id="specsNavBtn"
                    class="w-full bg-primary hover:bg-primary-hover text-white font-display font-bold uppercase text-sm px-6 py-4 rounded shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-3 group">
                    Ver Detalles de Consignatario
                    <span class="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </div>`;

    } else if (type === "platform") {
        subtitle.textContent = "Configuración de Tarima";
        content.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                ${field("Peso Estimado (kg)", data.weight)}
                ${field("Piezas", data.piecesNumber)}
                ${field("Altura (cm)", data.height)}
                ${field("Ancho (cm)", data.width)}
                ${field("Ø Interno (cm)", data.internalDiameter)}
                ${field("Ø Externo (cm)", data.externalDiameter)}
                <div class="col-span-2">
                    ${field("Embalaje de Despacho", data.dispatchPackaging)}
                </div>
            </div>
            <div>
                <label class="field-label">Descripción</label>
                <p class="text-xs text-text-secondary-light leading-relaxed italic">
                    ${data.description ?? "Sin descripción."}
                </p>
            </div>
            <div class="pt-4">
                <button id="specsNavBtn"
                    class="w-full bg-primary hover:bg-primary-hover text-white font-display font-bold uppercase text-sm px-6 py-4 rounded shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-3 group">
                    Ver Detalles de Tarima
                    <span class="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </div>`;
    }

    // Listener del botón de navegación
    $("specsNavBtn").addEventListener("click", () => {
        const base = type === "consignee"
            ? "/frontend/src/consignees/detailed_consignee.html"
            : "/frontend/src/platforms/detailed_platform.html";
        window.location.href = `${base}?id=${data.id}`;
    });
}

function selectItem(type, data, element) {
    // Quitar selección visual anterior
    document.querySelectorAll(".consigneeTuple, .platformTuple").forEach(el => {
        el.classList.remove("border-primary", "bg-orange-50");
        el.classList.add("border-border-light");
    });

    // Si ya estaba seleccionado el mismo, deseleccionar
    if (selectedItem?.data?.id === data.id && selectedItem?.type === type) {
        selectedItem = null;
        renderSpecs();
        return;
    }

    // Aplicar selección visual al nuevo
    element.classList.add("border-primary", "bg-orange-50");
    element.classList.remove("border-border-light");

    selectedItem = { type, data };
    renderSpecs();
}

// --- Init ---
renderCampos();
renderConsignees();
renderPlatforms();
renderFollowUps();
renderContacts();
renderSpecs(); // estado vacío inicial

if (createMode) {
    editMode = true;
    toggleEdit(true);
} else {
    deleteBtn.classList.remove("hidden");
}