import { renderHeader } from "../shared/components/header.js";
import { getAppContext } from "../shared/app_context.js";
import { setActiveNav } from "../shared/utils/nav.js";
import { navIds } from "../../../shared/navigation.js";
import { api } from "../shared/api/api_routes.js";
import { timeAgo } from "../shared/utils/time_ago.js";
import { emptyWidget } from "../shared/components/empty_widget.js";

const context = getAppContext();
renderHeader(context);
setActiveNav(navIds.customers)

// --- Shortcuts ---
const $ = id => document.getElementById(id);
const editButton  = $("editButton");
const deleteBtn   = $("deleteButton");

const modal       = $("deleteModal");
const cancelBtn   = $("cancelDelete");
const confirmBtn  = $("confirmDelete");

const deleteContactModal  = $("deleteContactModal");
const confirmContactModal = $("confirmContactDelete");
const cancelContactModal  = $("cancelContactDelete");

const params     = new URLSearchParams(window.location.search);
let id         = params.get("id");
const createMode = params.get("create") === "true";

let customer;
let consignees;

if (id) {
    const resCustomers = await axios.get(api.customers.getByID(id));
    customer = resCustomers.data;

    const resConsignees = await axios.get(api.consignees.getAll());
    consignees = resConsignees.data.filter(c => c.id_customer == id);
} else {
    customer  = { status: false };
    consignees = [];
}

const resPlatforms        = await axios.get(api.platforms.getAll());
const resPlatformRequests = await axios.get(api.platform_request.getAll());

const platformRequests = resPlatformRequests.data.filter(pr =>
    consignees.some(c => c.id === pr.id_consignee)
);

const platforms = resPlatforms.data.filter(p =>
    platformRequests.some(pr => pr.id_platform === p.id && pr.status === "Aceptada")
);

const { data: followUps } = await axios.get(api.followUps.getAll());
const consigneeIds = new Set(consignees.map(c => c.id));

const contactModal     = $("contactModal");
const saveContactBtn   = $("saveContact");
const cancelContactBtn = $("cancelContact");
const contactErrorMsg  = $("contactError");

let editingContact    = null;
let editMode          = false;
let selectedItem      = null;
let selectedContactId = null;
let localContacts     = [];
let originalContacts  = [];

// --- Badges ---
const badges = {
    status: v => `<span class="${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ? "Activo" : "Inactivo"}</span>`
};

// --- Fetch contacts ---
async function fetchContacts() {
    const { data } = await axios.get(api.contacts.getAll());
    return data.filter(c => c.id_customer == customer.id);
}

// --- Render Campos ---
function renderCampos() {
    if (createMode) {
        $("upperClientId").textContent = "Nuevo";
        $("customerStatus").innerHTML  = badges.status(false);
    } else {
        const fields = {
            upperClientId:   customer.name,
            idCustomer:      customer.id_customer,
            customerName:    customer.name,
            customerRFC:     customer.rfc,
            customerAddress: customer.tax_address,
        };
        Object.entries(fields).forEach(([k, v]) => $(k).textContent = v);
        $("customerStatus").innerHTML = badges.status(customer.status);
    }

    $("activeConsignees").textContent = `(${consignees.length} activos)`;
}

// --- Validar Campos ---
function validarCampos() {
    let valid = true;
    ["idCustomer-edit", "customerName-edit"].forEach(fieldId => {
        const input = $(fieldId);
        if (!input.value.trim()) {
            input.classList.add("border-red-400");
            valid = false;
        }
    });
    return valid;
}

// --- Sync contacts to API ---
async function syncContacts() {
    const { data } = await axios.get(api.contacts.getAll());
    const remoteContacts = data.filter(c => c.id_customer == customer.id);

    // Borrar los que ya no están en localContacts
    const toDelete = remoteContacts.filter(r => !localContacts.some(l => l.id === r.id && !l._new));
    await Promise.all(toDelete.map(c => axios.delete(api.contacts.delete(c.id))));

    // Crear los nuevos
    const toCreate = localContacts.filter(c => c._new);
    await Promise.all(toCreate.map(c => {
        const { _new, id, ...payload } = c;
        console.log(payload)
        return axios.post(api.contacts.getAll(), payload);
    }));

    // Actualizar los editados
    const toUpdate = localContacts.filter(c => !c._new && c._edited);
    await Promise.all(toUpdate.map(c => {
        const { _edited, ...payload } = c;
        return axios.put(api.contacts.update(c.id), payload);
    }));

    // Recargar localContacts limpio
    localContacts = await fetchContacts();
}

// --- Toggle Edit ---
async function toggleEdit(active) {
    if (active) {
        // Snapshot al entrar a editar
        originalContacts = localContacts.map(c => ({ ...c }));
    }

    editButton.querySelector("span").textContent = active ? "save" : "edit";
    editButton.childNodes[2].textContent         = active ? " Guardar" : " Editar";

    document.querySelectorAll(".editable").forEach(f => {
        const view  = f.querySelector(".view");
        const input = f.querySelector(".edit");
        if (active) input.value = view.textContent.trim(); else view.textContent = input.value;
        view.classList.toggle("hidden", active);
        input.classList.toggle("hidden", !active);
    });

    const statusView   = $("customerStatus");
    const statusSelect = $("customerStatus-edit");
    if (active) {
        statusSelect.value = customer.status ? "1" : "0";
        statusView.classList.add("hidden");
        statusSelect.classList.remove("hidden");
    } else {
        customer.status = statusSelect.value === "1";
        statusView.innerHTML = badges.status(!!customer.status);
        statusView.classList.remove("hidden");
        statusSelect.classList.add("hidden");
    }

    $("addContactBtn").classList.toggle("hidden", !active);
    document.querySelectorAll(".editContactBtn, .deleteContactBtn")
        .forEach(btn => btn.classList.toggle("hidden", !active));

    if (!active && (createMode || !editMode)) {
        if (!validarCampos()) {
            // Revertir contactos si falla validación
            localContacts = originalContacts.map(c => ({ ...c }));
            renderContacts();
            editMode = true;
            await toggleEdit(true);
            return;
        }

        if (createMode) {
            const newCustomer = await saveNewCustomer();
            console.log(newCustomer);
            id = newCustomer.id;
            $("idCustomer").textContent = $("upperClientId").textContent = newCustomer.id_customer;
            deleteBtn.classList.remove("hidden");
            document.querySelectorAll(".viewAll").forEach(b => b.classList.remove("hidden"));
            window.history.replaceState({}, "", `?id=${newCustomer.id}`);
        } else {
            await saveEditedCustomer();
        }

        await syncContacts();

        editMode = false;
        originalContacts = localContacts.map(c => ({ ...c }));
    }
}

// --- Guardar Customer ---
async function saveNewCustomer() {
    const newCustomer = {
        id_customer: $("idCustomer-edit").value.trim(),
        name:        $("customerName-edit").value.trim(),
        rfc:         $("customerRFC-edit").value.trim() || null,
        tax_address: $("customerAddress-edit").value.trim() || null,
        status:      $("customerStatus-edit").value === "1",
    };
    try {
        const res = await axios.post(api.customers.create(), newCustomer);
        return res.data;
    } catch (err) {
        return console.error(err.response?.data || err.message);
    }
}

async function saveEditedCustomer() {
    const updatedCustomer = {
        id_customer: $("idCustomer-edit").value.trim(),
        name:        $("customerName-edit").value.trim(),
        rfc:         $("customerRFC-edit").value.trim() || null,
        tax_address: $("customerAddress-edit").value.trim() || null,
        status:      $("customerStatus-edit").value === "1",
    };
    try {
        const res = await axios.put(api.customers.update(id), updatedCustomer);
        return res.data;
    } catch (err) {
        return console.error(err.response?.data || err.message);
    }
}

// --- Render Consignatarios ---
function renderConsignees() {
    $("activeConsignees").textContent = `(${consignees.length} activos)`;

    $("consigneeWidget").innerHTML = consignees.length === 0
        ? emptyWidget("Sin consignatarios")
        : consignees.map(c => `
            <div class="consigneeTuple group cursor-pointer p-3 rounded-lg border border-border-light hover:border-primary/50 transition-all flex justify-between items-center" data-id="${c.id}">
                <div>
                    <div class="text-sm font-medium text-text-primary-light">${c.name}</div>
                    <div class="text-[10px] text-text-secondary-light">${c.address}</div>
                </div>
                <span data-id="${c.id}" class="redirectConsignee text-[20px] material-symbols-outlined text-gray-300 group-hover:text-primary">open_in_new</span>
            </div>`).join("");

    document.querySelectorAll(".consigneeTuple").forEach(el => {
        const cData = consignees.find(c => c.id == el.dataset.id);
        el.addEventListener("click", (e) => {
            if (e.target.classList.contains("redirectConsignee")) return;
            selectItem("consignee", cData, el);
        });
    });

    document.querySelectorAll(".redirectConsignee").forEach(c => {
        c.addEventListener("click", () => {
            window.location.href = `/frontend/src/consignees/detailed_consignee.html?id=${c.dataset.id}`;
        });
    });
}

// --- Render Platforms ---
function renderPlatforms() {
    const acceptedRequests = platformRequests.filter(pr => pr.status === "Aceptada");

    $("activePlatforms").textContent = `(${acceptedRequests.length} activas)`;

    if (acceptedRequests.length === 0) {
        $("platformWidget").innerHTML = emptyWidget("Sin tarimas");
        return;
    }

    $("platformWidget").innerHTML = acceptedRequests.map(pr => {
        const platform  = resPlatforms.data.find(p => p.id === pr.id_platform);
        const consignee = consignees.find(c => c.id === pr.id_consignee);
        if (!platform) return "";

        return `
            <div class="platformTuple group cursor-pointer p-3 rounded-lg border border-border-light hover:border-primary/50 transition-all flex justify-between items-center"
                data-platform-id="${platform.id}" data-request-id="${pr.id}">
                <div class="flex items-center gap-3">
                    <div>
                        <div class="text-sm font-medium text-text-primary-light">${platform.name}</div>
                        <div class="text-[10px] text-text-secondary-light">${consignee?.name ?? "—"} · ${platform.weight}kg</div>
                    </div>
                </div>
                <span data-platform-id="${platform.id}" data-request-id="${pr.id}"
                    class="redirectPlatform text-[20px] material-symbols-outlined text-gray-300 group-hover:text-primary">
                    open_in_new
                </span>
            </div>`;
    }).join("");

    document.querySelectorAll(".platformTuple").forEach(el => {
        const platformId = el.dataset.platformId;
        const requestId  = el.dataset.requestId;
        const platform   = resPlatforms.data.find(p => p.id == platformId);

        el.addEventListener("click", (e) => {
            if (e.target.classList.contains("redirectPlatform")) return;
            selectItem("platform", platform, el);
        });
    });

    document.querySelectorAll(".redirectPlatform").forEach(btn => {
        btn.addEventListener("click", () => {
            const platformId = btn.dataset.platformId;
            const requestId  = btn.dataset.requestId;
            window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${platformId}&requestId=${requestId}&section=customers`;
        });
    });
}

// --- Render Follow Ups ---
async function renderFollowUps() {
    const thead = $("followUpsThead");
    const tbody = $("followUpsBody");

    const attributes = [
        "Clave Seguimiento",
        "Tarima",
        "Dir. Envío",
        "Estado",
        "Última Actualización",
    ];

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display">
            ${a}
        </th>
    `).join("");

    const { data: requests }     = await axios.get(api.platform_request.getAll());
    const { data: allPlatforms } = await axios.get(api.platforms.getAll());

    const clientRequestIds = new Set(
        requests
            .filter(r => consignees.some(c => c.id === r.id_consignee))
            .map(r => r.id)
    );

    const followUpsFiltered = followUps.filter(f =>
        clientRequestIds.has(f.id_request)
    );

    const followUpsEmpty = $("followUpsEmpty");
    if (followUpsFiltered.length === 0) {
        followUpsEmpty.classList.remove("hidden");
        followUpsEmpty.innerHTML = emptyWidget("Sin Seguimientos");
        return
    }

    followUpsEmpty.classList.add("hidden");

    const followUpsEnriched = followUpsFiltered.map(f => {
        const request   = requests.find(r => r.id === f.id_request);
        const consignee = consignees.find(c => c.id === request?.id_consignee);
        const platform  = allPlatforms.find(p => p.id === request?.id_platform);

        return {
            ...f,
            consigneeAddress: consignee?.address ?? "—",
            platformName:     platform?.name     ?? "—",
        };
    });

    const statusMap = {
        pending:       { label: "Pendiente",   cls: "bg-yellow-100 text-yellow-800"  },
        inPreparation: { label: "Preparación", cls: "bg-blue-100 text-blue-800"      },
        inTransit:     { label: "En tránsito", cls: "bg-purple-100 text-purple-800"  },
        delivered:     { label: "Entregado",   cls: "bg-green-100 text-green-800"    },
        dismantled:    { label: "Desarmada",   cls: "bg-gray-100 text-gray-700"      },
    };

    const statusBadge = value => {
        const s = statusMap[value] ?? { label: value, cls: "bg-gray-100 text-gray-700" };
        return `<span class="${s.cls} px-2 inline-flex text-xs font-semibold rounded-full">${s.label}</span>`;
    };

    tbody.innerHTML = followUpsEnriched.map(f => `
        <tr data-id="${f.id}" class="followUpTuple bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer">
            <td class="px-6 py-4 text-sm font-medium">${f.tracking_key}</td>
            <td class="px-6 py-4 text-sm">${f.platformName}</td>
            <td class="px-6 py-4 text-sm">${f.consigneeAddress}</td>
            <td class="px-6 py-4">${statusBadge(f.status)}</td>
            <td class="px-6 py-4 text-sm text-text-secondary-light">${timeAgo(f.updated_at) ?? "—"}</td>
        </tr>
    `).join("");

    document.querySelectorAll(".followUpTuple").forEach(row => {
        row.addEventListener("click", () => {
            window.location.href = `/frontend/src/followUps/detailed_followUp.html?id=${row.dataset.id}`;
        });
    });
}

// --- Render Contacts ---
function renderContacts() {
    const container = document.querySelector(".contactsContainer");
    const contacts  = localContacts;

    if (contacts.length === 0) {
        container.innerHTML = emptyWidget("Sin contactos");
        return;
    }

    container.innerHTML = contacts.map(c => `
        <div class="contactWidget flex gap-4 p-3 rounded-lg bg-gray-50 border border-border-light">
            <div class="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                ${c.name[0] ?? "?"}
            </div>
            <div class="flex-grow">
                <div class="text-md font-bold">${c.name}</div>
                <div class="text-[12px] text-gray-500 mb-1">${c.position ?? ""}</div>
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

    document.querySelectorAll(".editContactBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const c = localContacts.find(c => c.id == btn.dataset.id);
            if (!c) return;
            editingContact         = c;
            $("contactName").value     = c.name;
            $("contactPosition").value = c.position || "";
            $("contactEmail").value    = c.email || "";
            $("contactPhone").value    = c.phone || "";
            contactModal.classList.remove("hidden");
        });
    });

    document.querySelectorAll(".deleteContactBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            deleteContactModal.classList.remove("hidden");
            selectedContactId = btn.dataset.id;
        });
    });
}

// --- Eliminar Customer ---
async function eliminarCustomer() {
    try {
        await axios.delete(api.customers.delete(id));
    } catch (err) {
        console.error(err.response?.data || err.message);
    }
}

// --- Validar Contacto ---
function validateContact() {
    const name  = $("contactName").value.trim();
    const email = $("contactEmail").value.trim();
    const phone = $("contactPhone").value.trim();

    contactErrorMsg.classList.add("hidden");

    if (!name) {
        contactErrorMsg.innerText = "Debes ingresar el nombre del contacto.";
        contactErrorMsg.classList.remove("hidden");
        return false;
    }

    if (!email && !phone) {
        contactErrorMsg.innerText = "Debe haber al menos un teléfono o correo.";
        contactErrorMsg.classList.remove("hidden");
        return false;
    }

    return true;
}

function getErrorMessage(errorCode) {
    const messages = {
        MISSING_REQUIRED_FIELDS: "Faltan campos obligatorios",
        INVALID_EMAIL_TYPE:      "Correo inválido",
        CONTACT_NOT_FOUND:       "Contacto no encontrado",
        INTERNAL_SERVER_ERROR:   "Algo salió mal. Intenta de nuevo",
        VALIDATION_ERROR:        "Correo inválido",
        DUPLICATE_ENTRY:         "Este contacto ya existe",
    };
    return messages[errorCode] || "Error desconocido";
}

function limpiarFormulario() {
    ["contactName", "contactPosition", "contactEmail", "contactPhone"]
        .forEach(id => $(id).value = "");
}

// --- Save contact (solo en local) ---
saveContactBtn.addEventListener("click", () => {
    if (!validateContact()) return;
    contactErrorMsg.classList.add("hidden");

    const contact = {
        id_customer: customer.id,
        name:        $("contactName").value.trim(),
        position:    $("contactPosition").value.trim(),
        email:       $("contactEmail").value.trim(),
        phone:       $("contactPhone").value.trim(),
    };

    if (editingContact) {
        const idx = localContacts.findIndex(c => c.id === editingContact.id);
        if (idx !== -1) localContacts[idx] = { ...localContacts[idx], ...contact, _edited: true };
    } else {
        localContacts.push({ ...contact, id: `_tmp_${Date.now()}`, _new: true });
    }

    editingContact = null;
    contactModal.classList.add("hidden");
    limpiarFormulario();
    renderContacts();
});

cancelContactBtn.addEventListener("click", () => {
    editingContact = null;
    contactModal.classList.add("hidden");
    contactErrorMsg.classList.add("hidden");
    limpiarFormulario();
});

// --- Delete contact (solo en local) ---
cancelContactModal.addEventListener("click", () => deleteContactModal.classList.add("hidden"));
confirmContactModal.addEventListener("click", () => {
    localContacts = localContacts.filter(c => c.id != selectedContactId);
    deleteContactModal.classList.add("hidden");
    renderContacts();
});

// --- Add Contact button ---
$("addContactBtn").addEventListener("click", () => {
    editingContact = null;
    limpiarFormulario();
    contactModal.classList.remove("hidden");
});

// --- Render Specs ---
async function renderSpecs() {
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

    const { data: dispatches } = await axios.get(api.dispatch.getAll());

    if (type === "consignee") {
        subtitle.textContent = "Configuración de Consignatario";
        content.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                ${field("Carga Máxima (kg)", data.max_load)}
                ${field("Carga Mínima (kg)", data.min_load)}
                ${field("Máx. Piezas", data.max_pieces_number)}
                ${field("Embalaje Preferido", dispatches.find(d => d.id == data.preferred_dispatch)?.name ?? "—")}
                ${field("Ancho Máx (cm)", data.max_width)}
                ${field("Largo Máx (cm)", data.max_length)}
                ${field("Ø Interno Máximo (cm)", data.max_internal_diameter)}
                ${field("Ø Externo Máximo (cm)", data.max_external_diameter)}
            </div>
            <div>
                <label class="field-label">Instrucciones Adicionales</label>
                <p class="text-xs text-text-secondary-light leading-relaxed italic">
                    ${data.additional_instructions ?? "Sin instrucciones especiales."}
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
                ${field("Piezas", data.number_of_pieces)}
                ${field("Altura (cm)", data.height)}
                ${field("Ancho (cm)", data.width)}
                ${field("Largo (cm)", data.length)}
                ${field("Embalaje de Despacho", dispatches.find(d => d.id == data.id_dispatch_packaging)?.name ?? "—")}
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

    $("specsNavBtn").addEventListener("click", () => {
        const base = type === "consignee"
            ? "/frontend/src/consignees/detailed_consignee.html"
            : "/frontend/src/platforms/detailed_platform.html";
        window.location.href = `${base}?id=${data.id}`;
    });
}

function selectItem(type, data, element) {
    document.querySelectorAll(".consigneeTuple, .platformTuple").forEach(el => {
        el.classList.remove("border-primary", "bg-orange-50");
        el.classList.add("border-border-light");
    });

    if (selectedItem?.data?.id === data.id && selectedItem?.type === type) {
        selectedItem = null;
        renderSpecs();
        return;
    }

    element.classList.add("border-primary", "bg-orange-50");
    element.classList.remove("border-border-light");

    selectedItem = { type, data };
    renderSpecs();
}

// --- Event Listeners ---
editButton.addEventListener("click", () => { editMode = !editMode; toggleEdit(editMode); });

document.querySelectorAll(".edit").forEach(input => {
    input.addEventListener("input", () => input.classList.remove("border-red-400"));
});

$("viewAllConsignees").onclick = () => window.location.href = `/frontend/src/shared/list_view.html?type=consignees&id=${id}`;
$("viewAllPlatforms").onclick  = () => window.location.href = `/frontend/src/shared/list_view.html?type=platforms&id=${id}`;
$("viewAllFollowUps").onclick  = () => window.location.href = `/frontend/src/shared/list_view.html?type=followUps&id=${id}`;

deleteBtn.addEventListener("click",  () => modal.classList.remove("hidden"));
cancelBtn.addEventListener("click",  () => modal.classList.add("hidden"));
confirmBtn.addEventListener("click", async () => {
    await eliminarCustomer();
    window.location.href = "/frontend/src/shared/list_view.html?type=customers";
});

// --- Init ---
localContacts    = await fetchContacts();
originalContacts = localContacts.map(c => ({ ...c }));

renderCampos();
renderConsignees();
renderPlatforms();
renderFollowUps();
renderContacts();
await renderSpecs();

if (createMode) {
    editMode = true;
    toggleEdit(true);
} else {
    deleteBtn.classList.remove("hidden");
    document.querySelectorAll(".viewAll").forEach(b => b.classList.remove("hidden"));
}