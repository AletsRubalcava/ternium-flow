import { getAppContext } from "../shared/app_context.js";
import { renderHeader }   from "../shared/components/header.js";
import { setActiveNav }   from "../shared/utils/nav.js";
import { navIds }         from "../../../shared/navigation.js";
import { api }            from "../shared/api/api_routes.js";

const context = getAppContext();
renderHeader(context);
setActiveNav(navIds.followUps);

// ── Helpers ───────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const params     = new URLSearchParams(window.location.search);
const id         = params.get("id");
const createMode = params.get("create") === "true";

// ── Buttons ───────────────────────────────────────────────────────────────────
const editButton       = $("editButton");
const saveButton       = $("saveButton");
const actionBtn2       = $("actionButton2");
const deleteModal      = $("deleteModal");
const cancelDelete     = $("cancelDelete");
const confirmDeleteBtn = $("confirmDelete");

// ── Navigation ────────────────────────────────────────────────────────────────
$("returnListView").href      = `/frontend/src/shared/list_view.html?type=followUps`;
$("returnListView").innerText = "Seguimientos";

// ── Data fetching ─────────────────────────────────────────────────────────────
const { data: allCustomers }  = await axios.get(api.customers.getAll());
const { data: allConsignees } = await axios.get(api.consignees.getAll());
const { data: allPlatforms }  = await axios.get(api.platforms.getAll());
const { data: allRequests }   = await axios.get(api.platform_request.getAll());
const { data: products }      = await axios.get(api.products.getAll());
const { data: productLoad }   = await axios.get(api.platform_items.getAll());

// Solo para view/edit mode
let followUp        = null;
let platformRequest = null;
let platform        = null;
let consignee       = null;
let customer        = null;
let currentProductLoad = [];

if (!createMode) {
    const res = await axios.get(api.followUps.getByID(id));
    followUp  = res.data;

    const reqRes    = await axios.get(api.platform_request.getByID(followUp.id_request));
    platformRequest = reqRes.data;

    platform  = allPlatforms.find(p => p.id == platformRequest.id_platform)  ?? null;
    consignee = allConsignees.find(c => c.id == platformRequest.id_consignee) ?? null;
    customer  = consignee ? allCustomers.find(c => c.id == consignee.id_customer) ?? null : null;

    currentProductLoad = platform
        ? productLoad.filter(pl => pl.id_platform == platform.id)
        : [];
}

let editMode = false;

// ── Status map ────────────────────────────────────────────────────────────────
const statusMap = {
    pending:       { label: "Pendiente",   cls: "bg-yellow-100 text-yellow-800" },
    inPreparation: { label: "Preparación", cls: "bg-blue-100 text-blue-800"     },
    inTransit:     { label: "En tránsito", cls: "bg-purple-100 text-purple-800" },
    delivered:     { label: "Entregado",   cls: "bg-green-100 text-green-800"   },
    dismantled:    { label: "Desarmada",   cls: "bg-gray-100 text-gray-700"     },
};

function statusBadge(value) {
    const s = statusMap[value] ?? { label: value, cls: "bg-gray-100 text-gray-700" };
    return `<span class="${s.cls} px-2 inline-flex text-xs font-semibold rounded-full">${s.label}</span>`;
}

function formatDate(dateStr) {
    if (!dateStr) return "—";

    const d = new Date(dateStr);

    return isNaN(d)
        ? dateStr
        : d.toLocaleString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE MODE
// ─────────────────────────────────────────────────────────────────────────────
function initCreateMode() {
    // Mostrar botón Guardar, ocultar los de view
    saveButton.classList.remove("hidden");
    editButton.classList.add("hidden");

    $("upperId").textContent = "Nuevo";

    // Estado inicial fijo: pending
    $("status").innerHTML = statusBadge("pending");

    // Mostrar selects, ocultar spans
    $("platformCustomer").classList.add("hidden");
    $("customer-select").classList.remove("hidden");
    $("platformConsignee").classList.add("hidden");
    $("consignee-select").classList.remove("hidden");
    $("platformName").classList.add("hidden");
    $("platform-select").classList.remove("hidden");

    // Poblar clientes
    $("customer-select").innerHTML =
        `<option value="">Selecciona un cliente</option>` +
        allCustomers.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

    // Cliente seleccionado → filtrar consignatarios
    $("customer-select").addEventListener("change", () => {
        const cid = $("customer-select").value;
        resetFrom("consignee");

        if (!cid) return;

        const filtered = allConsignees.filter(c => c.id_customer == cid && c.status);
        const sel = $("consignee-select");

        sel.innerHTML =
            `<option value="">Selecciona un consignatario</option>` +
            filtered.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

        enableSelect("consignee-select");
    });

    // Consignatario seleccionado → filtrar tarimas aprobadas
    $("consignee-select").addEventListener("change", () => {
        const cnid = $("consignee-select").value;
        resetFrom("platform");

        if (!cnid) return;

        // Tarimas aprobadas = requests con status "Aceptada" para ese consignatario
        const approvedPlatformIds = allRequests
            .filter(r => r.id_consignee == cnid && r.status === "Aceptada")
            .map(r => r.id_platform);

        const filtered = allPlatforms.filter(p => approvedPlatformIds.includes(p.id));
        const sel = $("platform-select");

        sel.innerHTML =
            `<option value="">Selecciona una tarima</option>` +
            filtered.map(p => `<option value="${p.id}">${p.name}</option>`).join("");

        enableSelect("platform-select");
    });

    // Tarima seleccionada → cargar toda la info
    $("platform-select").addEventListener("change", () => {
        const pid = $("platform-select").value;

        // Resetear info cargada previamente
        $("address").textContent  = "—";
        $("comment").textContent  = "";
        $("createdAt").textContent = "—";
        renderProductTable([]);

        if (!pid) return;

        const selConsignee = allConsignees.find(c => c.id == $("consignee-select").value) ?? null;
        const selPlatform  = allPlatforms.find(p => p.id == pid) ?? null;

        // Dirección viene del consignatario
        $("address").textContent = selConsignee?.address ?? "—";

        // Cargar productos de la tarima
        const items = productLoad.filter(pl => pl.id_platform == pid);
        renderProductTable(items);

        // Mostrar enlace a la tarima
        $("redirectPlatformBtn").classList.remove("hidden");
        $("redirectPlatformBtn").classList.add("flex");
    });
}

function enableSelect(selectId) {
    const sel = $(selectId);
    sel.disabled = false;
    sel.classList.remove("select-disabled");
}

function disableSelect(selectId, placeholder) {
    const sel = $(selectId);
    sel.disabled = true;
    sel.classList.add("select-disabled");
    sel.innerHTML = `<option value="">${placeholder}</option>`;
}

// Resetea todo a partir del nivel indicado
function resetFrom(level) {
    if (level === "consignee") {
        disableSelect("consignee-select", "Primero selecciona un cliente");
        disableSelect("platform-select", "Primero selecciona un consignatario");
    }

    if (level === "platform") {
        disableSelect("platform-select", "Primero selecciona un consignatario");
    }

    $("address").textContent = "—";
    renderProductTable([]);

    $("redirectPlatformBtn").classList.add("hidden");
    $("redirectPlatformBtn").classList.remove("flex");
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW / EDIT MODE
// ─────────────────────────────────────────────────────────────────────────────
function renderCampos() {
    const totalPieces = currentProductLoad.reduce((s, r) => s + (r.quantity ?? 0), 0);

    $("upperId").textContent           = followUp.tracking_key  ?? "—";
    $("followUpID").textContent        = followUp.tracking_key  ?? "—";
    $("platformCustomer").textContent  = customer?.name         ?? "—";
    $("platformConsignee").textContent = consignee?.name        ?? "—";
    $("platformName").textContent      = platform?.name         ?? "—";
    $("address").textContent           = consignee?.address     ?? "—";
    $("status").innerHTML              = statusBadge(followUp.status);
    $("createdAt").textContent         = formatDate(followUp.created_at);
    $("updatedAt").textContent         = formatDate(followUp.updated_at);
    $("comment").textContent           = followUp.comment       ?? "";

    $("totalPieces").textContent = `Total Piezas: ${totalPieces}`;

    $("redirectPlatformBtn").classList.remove("hidden");
    $("redirectPlatformBtn").classList.add("flex");
}

function toggleEdit(active) {
    editMode = active;

    editButton.querySelector("span").textContent = active ? "save" : "edit";
    editButton.childNodes[2].textContent         = active ? " Guardar" : " Editar";

    const statusView   = $("status");
    const statusSelect = $("status-edit");

    if (active) statusSelect.value = followUp.status ?? "pending";
    else        statusView.innerHTML = statusBadge(followUp.status);

    statusView.classList.toggle("hidden", active);
    statusSelect.classList.toggle("hidden", !active);

    const commentView = $("comment");
    const commentEdit = $("comment-edit");

    if (active) {
        commentEdit.value = followUp.comment ?? "";
    }

    commentView.classList.toggle("hidden", active);
    commentEdit.classList.toggle("hidden", !active);
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER TABLE (compartida entre create y view)
// ─────────────────────────────────────────────────────────────────────────────
function renderProductTable(items) {
    const tbody       = $("productTableBody");
    const totalPieces = items.reduce((s, r) => s + (r.quantity ?? 0), 0);
    $("totalPieces").textContent = `Total Piezas: ${totalPieces}`;

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-sm text-text-secondary-light">
                    ${createMode ? "Selecciona una tarima para ver su carga." : "Sin productos cargados."}
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = items.map(row => {
        const product = products.find(p => p.id == row.id_product);
        return `
        <tr class="hover:bg-gray-50 transition-colors group">
            <td class="px-6 py-4 text-sm font-bold text-text-primary-light group-hover:text-primary transition-colors">
                ${product?.part_number ?? row.id_product}
            </td>
            <td class="px-6 py-4 text-sm text-text-primary-light">
                <div class="font-medium">${product?.name ?? "Desconocido"}</div>
                <div class="text-[10px] text-text-secondary-light">${product?.family ?? ""}</div>
            </td>
            <td class="px-6 py-4 text-sm font-bold text-center bg-gray-50/50">
                ${row.quantity ?? "—"}
            </td>
            <td class="px-6 py-4 text-sm text-center">
                ${product?.internal_diameter != null ? product.internal_diameter + " cm" : "—"}
            </td>
            <td class="px-6 py-4 text-sm text-center">
                ${product?.external_diameter != null ? product.external_diameter + " cm" : "—"}
            </td>
            <td class="px-6 py-4 text-sm text-right font-medium">
                ${product?.unit_weight != null ? product.unit_weight + " kg" : "—"}
            </td>
        </tr>`;
    }).join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE
// ─────────────────────────────────────────────────────────────────────────────
async function saveNewFollowUp() {
    const cnid = $("consignee-select").value;
    const pid  = $("platform-select").value;

    if (!cnid || !pid) {
        if (!cnid) $("consignee-select").style.borderColor = "#f87171";
        if (!pid)  $("platform-select").style.borderColor  = "#f87171";
        return;
    }

    // Buscar el platform_request aprobado que corresponde a consignatario + tarima
    const req = allRequests.find(
        r => r.id_consignee == cnid && r.id_platform == pid && r.status === "Aceptada"
    );

    if (!req) {
        console.error("No se encontró una solicitud aprobada para esta combinación.");
        return;
    }

    const payload = {
        id_request: req.id,
        status:     "pending",
    };

    const { data: created } = await axios.post(api.followUps.create(), payload);

    // Redirigir al detalle recién creado
    window.location.href = `?id=${created.id}`;
}

async function saveEditFollowUp() {
    followUp.status  = $("status-edit").value;
    followUp.comment = $("comment-edit").value;

    await axios.patch(api.followUps.update(followUp.id), {
        status: followUp.status,
        comment: followUp.comment
    });

    const res = await axios.get(api.followUps.getByID(followUp.id));
    followUp = res.data;

    renderCampos();
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────────────────────────────────────

// Create mode: Guardar
saveButton.addEventListener("click", async () => {
    try {
        await saveNewFollowUp();
    } catch (err) {
        console.error("Error al crear el seguimiento:", err);
    }
});

// View/edit mode: Editar ↔ Guardar
editButton.addEventListener("click", async () => {
    if (editMode) {
        try {
            await saveEditFollowUp();
            toggleEdit(false);
        } catch (err) {
            console.error("Error al guardar:", err);
        }
    } else {
        toggleEdit(true);
    }
});

// Limpiar borde rojo al cambiar selects en create mode
["customer-select", "consignee-select", "platform-select"].forEach(sid => {
    $(sid)?.addEventListener("change", () => { $(sid).style.borderColor = ""; });
});

const redirectPlatformBtn = $("redirectPlatformBtn");

redirectPlatformBtn.addEventListener("click", () => {
    if (!platform?.id) return;

    window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${platform.id}&requestId=${platformRequest.id}&section=${navIds.customers}`;
});

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
if (createMode) {
    initCreateMode();
    renderProductTable([]);
} else {
    renderCampos();
    renderProductTable(currentProductLoad);
}