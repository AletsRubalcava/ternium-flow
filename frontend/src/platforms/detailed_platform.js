import { setActiveNav } from "../shared/utils/nav.js";
import { getAppContext, roles } from "../shared/app_context.js";
import { renderHeader } from "../shared/components/header.js";
import { navIds } from "../../../shared/navigation.js";
import { api } from "../shared/api/api_routes.js";

const context = getAppContext();
renderHeader(context);

const $ = id => document.getElementById(id);
const editButton = $("editButton");
const actionBtn2 = $("actionButton2");
const modal      = $("deleteModal");
const cancelBtn  = $("cancelDelete");
const confirmBtn = $("confirmDelete");
const rejectModal      = $("rejectModal");
const cancelRejectBtn  = $("cancelReject");
const confirmRejectBtn = $("confirmReject");

const params       = new URLSearchParams(window.location.search);
const id           = params.get("id");
const requestId    = params.get("requestId");
const createMode   = params.get("create") === "true";
const type         = params.get("section");
const isPresetSection = type === navIds.presets;
const isCommercial = type === navIds.commercial;

(context.role == roles.customer) ? setActiveNav(navIds.platforms) : setActiveNav(type);

let platform = createMode
    ? { name: "", description: "", type: "Custom", status: false, width: "", height: "", length: "", id_dispatch_packaging: null }
    : (await axios.get(api.platforms.getByID(id))).data;

const resPlatformRequests = await axios.get(api.platform_request.getAll());

const hasActiveRequests = isPresetSection && !createMode
    ? resPlatformRequests.data.some(
        pr => pr.id_platform == id && pr.status !== "Rechazada"
    )
    : false;

const platformRequest = requestId
    ? resPlatformRequests.data.find(pr => pr.id == requestId)
    : resPlatformRequests.data.find(pr => pr.id_platform == id);
    
const { data: dispatchPackaging } = await axios.get(api.dispatch.getAll());
const { data: products }          = await axios.get(api.products.getAll()); 
const { data: productLoad }       = await axios.get(api.platform_items.getAll());
const { data: allCustomers }      = await axios.get(api.customers.getAll());
const { data: allConsignees }     = await axios.get(api.consignees.getAll());
const { data: allPlatforms }      = await axios.get(api.platforms.getAll());

const presetPlatforms = allPlatforms.filter(p => p.type === "Preset");

let customer  = null;
let consignee = null;
let piecesNumber = platform.number_of_pieces ?? 0;
let weight       = platform.weight ?? 0;

if (!createMode && !isPresetSection) {
    consignee = (await axios.get(api.consignees.getByID(platformRequest.id_consignee))).data;
    customer  = allCustomers.find(c => c.id == consignee.id_customer);
}

let currentProductLoad = createMode
    ? []
    : productLoad.filter(pl => pl.id_platform == platform?.id).map(pl => ({ ...pl }));

if (currentProductLoad.length > 0) calcSpecs();

let editMode         = false;
let isCreateMode     = createMode;
let isPresetMode     = false;
let selectedPresetName = "";


const badges = {
    type:   v => `<span class="${v == "Custom" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v == "Custom" ? "Personalizada" : "Preestablecido"}</span>`,
    status: v => `<span class="${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ? "Activo" : "Inactivo"}</span>`,
    pending: `<span class="bg-yellow-100 text-yellow-800 px-2 inline-flex text-xs font-semibold rounded-full">Pendiente</span>`
};

// ── Botones según contexto ───────────────────────────────────────────────────
if (isCommercial && !createMode) {
    editButton.innerHTML = `<span class="material-symbols-outlined text-sm">check_circle</span> Aceptar`;
    editButton.classList.remove("border-primary", "text-primary", "hover:bg-orange-50");
    editButton.classList.add("bg-green-500", "hover:bg-green-600", "text-white", "border-green-500");
    actionBtn2.innerHTML = `<span class="material-symbols-outlined text-sm">cancel</span> Rechazar`;
    actionBtn2.classList.remove("hidden");
} else if (isCommercial && createMode) {
    // solo Guardar, actionBtn2 permanece oculto
} else {
    actionBtn2.innerHTML = `<span class="material-symbols-outlined text-sm">delete</span> Eliminar`;
}

// ── Navigation ───────────────────────────────────────────────────────────────
if (type == navIds.presets) {
    $("returnListView").innerText = "PAQUETES";
    $("returnListView").href = `/frontend/src/shared/list_view.html?type=presets`;
} else if (type == navIds.commercial) {
    $("returnListView").innerText = "COMERCIAL";
    $("returnListView").href = `/frontend/src/shared/list_view.html?type=commercial`;
} else if (type == navIds.customers) {
    $("returnListView").innerText = "TARIMAS";
    $("returnListView").href = `/frontend/src/shared/list_view.html?type=platforms&id=${context.entityId}`;
}

// ── Populate selects ─────────────────────────────────────────────────────────
$("spec-pack-edit").innerHTML = dispatchPackaging.map(d =>
    `<option value="${d.id}">${d.name}</option>`
).join("");

$("addProductSKU").innerHTML = `<option value="">Selecciona un producto</option>` +
    products.map(p =>
        `<option value="${p.id}">${p.name} (${p.family ?? ""})</option>`
    ).join("");

$("platformPreset-edit").innerHTML = `<option value="">Selecciona un preestablecido</option>` +
    presetPlatforms.map(p => `<option value="${p.id}">${p.name}</option>`).join("");

// ── Preset select handler ────────────────────────────────────────────────────
$("platformPreset-edit").addEventListener("change", () => {
    const selectedId = $("platformPreset-edit").value;
    if (!selectedId) {
        selectedPresetName = "";
        return;
    }

    const selected = presetPlatforms.find(p => p.id == selectedId);
    if (!selected) return;

    // Guardar nombre en variable, no depender del input deshabilitado
    selectedPresetName = selected.name;
    console.log(selectedPresetName)

    const presetItems = productLoad.filter(pl => pl.id_platform == selected.id).map(pl => ({ ...pl }));
    currentProductLoad = presetItems;

    platform.width                 = selected.width;
    platform.height                = selected.height;
    platform.length                = selected.length;
    platform.id_dispatch_packaging = selected.id_dispatch_packaging;
    platform.description           = selected.description ?? "";

    $("platformDescription-edit").value  = selected.description ?? "";
    $("platformDescription").textContent = selected.description ?? "—";
    $("spec-length-edit").value          = selected.length ?? "";
    $("spec-width-edit").value           = selected.width  ?? "";
    $("spec-height-edit").value          = selected.height ?? "";
    $("spec-pack-edit").value            = selected.id_dispatch_packaging ?? "";

    calcSpecs();
    renderProductTable();
    renderSpecs();
});

// ── Customer / Consignee selects (solo createMode) ───────────────────────────
function initCustomerConsigneeSelects() {
    if (!createMode || isPresetSection) return;
    if (!createMode) return;

    const customerSelect  = $("platformCustomer-edit");
    const consigneeSelect = $("platformConsignee-edit");

    customerSelect.innerHTML = `<option value="">Selecciona un cliente</option>` +
        allCustomers.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

    consigneeSelect.innerHTML = `<option value="">Primero selecciona un cliente</option>`;
    consigneeSelect.disabled  = true;

    customerSelect.addEventListener("change", () => {
        const selectedCustomerId = customerSelect.value;
        customer  = allCustomers.find(c => c.id == selectedCustomerId) ?? null;
        consignee = null;

        customerSelect.style.borderColor  = "";
        consigneeSelect.style.borderColor = "";

        if (!selectedCustomerId) {
            consigneeSelect.innerHTML = `<option value="">Primero selecciona un cliente</option>`;
            consigneeSelect.disabled  = true;
            return;
        }

        const filtered = allConsignees.filter(cn => cn.id_customer == selectedCustomerId);
        consigneeSelect.innerHTML = `<option value="">Selecciona un consignatario</option>` +
            filtered.map(cn => `<option value="${cn.id}">${cn.name}</option>`).join("");
        consigneeSelect.disabled = false;

        $("platformCustomer").textContent  = customer?.name ?? "—";
        $("platformConsignee").textContent = "—";
    });

    consigneeSelect.addEventListener("change", () => {
        const selectedConsigneeId = consigneeSelect.value;
        consignee = allConsignees.find(cn => cn.id == selectedConsigneeId) ?? null;
        consigneeSelect.style.borderColor  = "";
        $("platformConsignee").textContent = consignee?.name ?? "—";
    });
}

// ── Type select handler ──────────────────────────────────────────────────────
function handleTypeChange(value) {
    console.log(value)
    const nameView  = $("platformName");
    const nameInput = $("platformName-edit");
    const presetSel = $("platformPreset-edit");

    if (value == "Preset") {
        isPresetMode = true;

        nameInput.classList.add("hidden");
        presetSel.classList.remove("hidden");
        nameView.classList.add("hidden");

        setNonTypeFieldsDisabled(true);

        currentProductLoad = [];
        selectedPresetName = "";
        renderProductTable();
        renderSpecs();
    } else {
        isPresetMode       = false;
        selectedPresetName = "";

        nameInput.classList.remove("hidden");
        presetSel.classList.add("hidden");
        presetSel.value = "";
        nameView.classList.add("hidden");

        setNonTypeFieldsDisabled(false);

        platform.width  = "";
        platform.height = "";
        platform.length = "";
        $("spec-length-edit").value = "";
        $("spec-width-edit").value  = "";
        $("spec-height-edit").value = "";
        currentProductLoad = [];
        renderProductTable();
        renderSpecs();
    }
}

function setNonTypeFieldsDisabled(disabled) {
    ["platformName-edit", "platformDescription-edit", "platformStatus-edit", "spec-length-edit", "spec-width-edit", "spec-height-edit", "spec-pack-edit"
    ].forEach(fid => {
        const el = $(fid);
        if (el) el.disabled = disabled;
    });
}

// ── Auto-calculate specs ─────────────────────────────────────────────────────
function calcSpecs() {
    if (currentProductLoad.length === 0) {
        piecesNumber = 0;
        weight       = 0;
        return;
    }
    let totalPieces = 0;
    let totalWeight = 0;
    currentProductLoad.forEach(row => {
        const product = products.find(p => p.id == row.id_product);
        if (!product) return;
        totalPieces += row.quantity ?? 0;
        totalWeight += (product.unit_weight ?? 0) * (row.quantity ?? 0);
    });
    piecesNumber = totalPieces;
    weight       = Math.round(totalWeight * 100) / 100;
}

// ── Render general info ──────────────────────────────────────────────────────
function renderCampos() {
    const customerRow  = document.querySelector(".commercial-editable");
    const consigneeRow = document.querySelector(".consignee-field");

    if (isPresetSection) {
        customerRow?.classList.add("hidden");
        consigneeRow?.classList.add("hidden");
    }

    if (createMode) {
        $("upperId").textContent             = "Nuevo";
        $("platformName").textContent        = "";
        if (!isPresetSection) {
            $("platformCustomer").textContent  = "—";
            $("platformConsignee").textContent = "—";
        }
        $("platformDescription").textContent = "";
        $("platformType").innerHTML          = badges.type(isPresetSection ? "Preset" : "Custom");
        $("platformStatus").innerHTML        = badges.status(false);
    } else {
        $("upperId").textContent             = platform.name;
        $("platformName").textContent        = platform.name        ?? "—";
        if (!isPresetSection) {
            $("platformCustomer").textContent  = customer?.name     ?? "—";
            $("platformConsignee").textContent = consignee?.name    ?? "—";
        }
        $("platformDescription").textContent = platform.description ?? "—";
        $("platformType").innerHTML          = badges.type(platform.type);
        $("platformStatus").innerHTML        = isPresetSection
            ? badges.status(platform.status)
            : (platformRequest?.status == "Aceptada"
                ? badges.status(platform.status)
                : badges.pending);
    }
}

// ── Render spec sidebar ──────────────────────────────────────────────────────
function renderSpecs() {
    $("spec-pieces-view").textContent = piecesNumber    ?? "—";
    $("spec-weight-view").textContent = weight          ?? "—";
    $("spec-width-view").textContent  = platform.width  ?? "—";
    $("spec-height-view").textContent = platform.height ?? "—";
    $("spec-length-view").textContent = platform.length ?? "—";
    const pkg = dispatchPackaging.find(d => d.id == (platform.id_dispatch_packaging ?? $("spec-pack-edit").value));
    $("spec-pack-view").textContent = pkg?.name ?? "—";
}

// ── Render product load table ────────────────────────────────────────────────
function renderProductTable() {
    const tbody  = $("productTableBody");
    const footer = $("productTableFooter");

    const totalPieces = currentProductLoad.reduce((sum, row) => sum + (row.quantity ?? 0), 0);
    $("totalPieces").textContent = `Total Piezas: ${totalPieces}`;

    if (currentProductLoad.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${editMode && !isPresetMode ? 5 : 4}" class="px-6 py-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Sin productos cargados.
                </td>
            </tr>`;
    } else {
        tbody.innerHTML = currentProductLoad.map((row, idx) => {
            const product = products.find(p => p.id == row.id_product);
            return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group" data-idx="${idx}">
                <td class="px-6 py-4 text-sm font-bold text-text-primary-light dark:text-text-primary-dark group-hover:text-primary transition-colors">
                    ${product?.part_number ?? row.id_product}
                </td>
                <td class="px-6 py-4 text-sm text-text-primary-light dark:text-text-primary-dark">
                    <div class="font-medium">${product?.name ?? "Desconocido"}</div>
                    <div class="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">${product?.family ?? ""}</div>
                </td>
                <td class="px-6 py-4 text-sm font-bold text-center bg-gray-50/50 dark:bg-white/5">
                    ${editMode && !isPresetMode
                        ? `<input type="number" min="1" value="${row.quantity}"
                                onchange="updateQuantity(${idx}, this.value)"
                                class="w-16 text-center border border-border-light rounded px-1 py-0.5 text-xs font-bold" />`
                        : row.quantity}
                </td>
                <td class="px-6 py-4 text-sm text-text-primary-light dark:text-text-primary-dark">
                    <div class="font-medium">${product?.internal_diameter + " cm"  ?? "Desconocido"}</div>
                </td>
                <td class="px-6 py-4 text-sm text-text-primary-light dark:text-text-primary-dark">
                    <div class="font-medium">${product?.external_diameter + " cm"  ?? "Desconocido"}</div>
                </td>
                <td class="px-6 py-4 text-sm text-right font-medium">
                    ${product?.unit_weight != null ? product.unit_weight + " kg" : "—"}
                </td>
                ${editMode && !isPresetMode ? `
                <td class="px-6 py-4 text-right">
                    <button onclick="removeProduct(${idx})" class="text-text-secondary-light hover:text-red-600 transition-colors p-1">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </td>` : ""}
            </tr>`;
        }).join("");
    }

    footer.innerHTML = `
        <tr>
            <td colspan="${editMode && !isPresetMode ? 5 : 4}" class="px-6 py-3">
                ${editMode && !isPresetMode ? `
                <button onclick="openAddProduct()"
                    class="w-full py-2 border border-dashed border-border-light dark:border-border-dark rounded text-xs font-bold text-text-secondary-light hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-sm">add</span> AGREGAR PRODUCTO
                </button>` : ""}
            </td>
        </tr>`;
    calcSpecs();
    renderSpecs();
}

// ── Add / remove product helpers ─────────────────────────────────────────────
window.openAddProduct = function () {
    $("addProductModal").classList.remove("hidden");
    $("addProductSKU").value = "";
    $("addProductQty").value = "";
    $("addProductSKU").style.borderColor = "";
    $("addProductQty").style.borderColor = "";
};

window.closeAddProduct = function () {
    $("addProductModal").classList.add("hidden");
};

window.confirmAddProduct = function () {
    const productID = $("addProductSKU").value;
    const qty = Number($("addProductQty").value);
    let valid = true;

    if (!productID)       { $("addProductSKU").style.borderColor = "#f87171"; valid = false; }
    if (!qty || qty <= 0) { $("addProductQty").style.borderColor = "#f87171"; valid = false; }
    if (!valid) return;

    const existing = currentProductLoad.find(r => r.id_product == productID);
    if (existing) {
        existing.quantity += qty;
    } else {
        currentProductLoad.push({ id_platform: platform.id ?? null, id_product: productID, quantity: qty });
    }

    closeAddProduct();
    renderProductTable();
    $("productTableError").classList.add("hidden");
};

window.removeProduct = function (idx) {
    currentProductLoad.splice(idx, 1);
    renderProductTable();
};

window.updateQuantity = function (idx, val) {
    const n = Number(val);
    currentProductLoad[idx].quantity = n;
    const input = document.querySelector(`tr[data-idx="${idx}"] input[type="number"]`);
    if (input) input.style.borderColor = n <= 0 ? "#f87171" : "";
    calcSpecs();   // ← agregar esto
    renderSpecs();
};

// ── Validación ───────────────────────────────────────────────────────────────
function validarCampos() {
    let valid = true;

    if (isPresetMode) {
        const presetSel = $("platformPreset-edit");
        if (!presetSel.value) {
            presetSel.style.borderColor = "#f87171";
            valid = false;
        }
    } else {
        ["platformName-edit", "platformDescription-edit"].forEach(fid => {
            const el = $(fid);
            if (!el.value.trim()) { el.style.borderColor = "#f87171"; valid = false; }
        });
        ["spec-length-edit", "spec-width-edit", "spec-height-edit"].forEach(fid => {
            const el = $(fid);
            if (!el.value.trim() || Number(el.value) <= 0) { el.style.borderColor = "#f87171"; valid = false; }
        });
    }

    if (isCreateMode && !isPresetSection) {
        const customerSelect  = $("platformCustomer-edit");
        const consigneeSelect = $("platformConsignee-edit");
        if (!customerSelect.value)  { customerSelect.style.borderColor  = "#f87171"; valid = false; }
        if (!consigneeSelect.value) { consigneeSelect.style.borderColor = "#f87171"; valid = false; }
    }

    if (currentProductLoad.length === 0) {
        $("productTableError").textContent = "⚠ Debes agregar al menos un producto a la tarima.";
        $("productTableError").classList.remove("hidden");
        valid = false;
    } else {
        let hasInvalidQty = false;
        currentProductLoad.forEach((row, idx) => {
            if (!row.quantity || row.quantity <= 0) {
                hasInvalidQty = true;
                const input = document.querySelector(`tr[data-idx="${idx}"] input[type="number"]`);
                if (input) input.style.borderColor = "#f87171";
            }
        });
        if (hasInvalidQty) {
            $("productTableError").textContent = "⚠ Todos los productos deben tener una cantidad mayor a 0.";
            $("productTableError").classList.remove("hidden");
            valid = false;
        } else {
            $("productTableError").classList.add("hidden");
        }
    }

    return valid;
}

document.querySelectorAll(".edit").forEach(el =>
    el.addEventListener("input", () => el.style.borderColor = "")
);

// ── Validación contra especificaciones del consignatario ─────────────────────
function validarEspecificacionesConsignatario() {
    if (!consignee || isPresetSection) return { valid: true, warnings: [], violations: [] };

    const violations = []; // bloquean
    const warnings   = []; // solo avisan

    // ── Peso ────────────────────────────────────────────────────────────────
    if (consignee.max_load != null && weight > Number(consignee.max_load)) {
        violations.push(`Peso (${weight} kg) excede la carga máxima del consignatario (${consignee.max_load} kg).`);
        $("spec-weight-view").classList.add("!border-red-400", "border-red-400");
    }
    if (consignee.min_load != null && weight < Number(consignee.min_load)) {
        violations.push(`Peso (${weight} kg) es menor a la carga mínima del consignatario (${consignee.min_load} kg).`);
        $("spec-weight-view").classList.add("!border-red-400", "border-red-400");
    }

    // ── Piezas ──────────────────────────────────────────────────────────────
    if (consignee.max_pieces_number != null && piecesNumber > Number(consignee.max_pieces_number)) {
        violations.push(`Número de piezas (${piecesNumber}) excede el máximo del consignatario (${consignee.max_pieces_number}).`);
        $("spec-pieces-view").classList.add("!border-red-400", "border-red-400");
    }

    // ── Dimensiones de tarima ───────────────────────────────────────────────
    if (consignee.max_width != null && Number(platform.width) > Number(consignee.max_width)) {
        violations.push(`Ancho (${platform.width} m) excede el máximo del consignatario (${consignee.max_width} m).`);
        $("spec-width-view").classList.add("!border-red-400", "border-red-400");
        $("spec-width-edit").style.borderColor = "#f87171";
    }
    if (consignee.max_height != null && Number(platform.height) > Number(consignee.max_height)) {
        violations.push(`Altura (${platform.height} m) excede el máximo del consignatario (${consignee.max_height} m).`);
        $("spec-height-view").classList.add("!border-red-400", "border-red-400");
        $("spec-height-edit").style.borderColor = "#f87171";
    }

    // ── Embalaje (advertencia, no bloquea) ──────────────────────────────────
    const currentPack = platform.id_dispatch_packaging ?? $("spec-pack-edit").value;
    if (consignee.preferred_dispatch != null && currentPack != consignee.preferred_dispatch) {
        const preferredName = dispatchPackaging.find(d => d.id == consignee.preferred_dispatch)?.name ?? "desconocido";
        warnings.push(`El embalaje seleccionado no es el preferido del consignatario (${preferredName}).`);
    }

    // ── Diámetros por producto ──────────────────────────────────────────────
    let someProductExceedsDiameter = false;
    currentProductLoad.forEach((row, idx) => {
        const product = products.find(p => p.id == row.id_product);
        if (!product) return;

        let productViolated = false;

        if (consignee.max_internal_diameter != null &&
            Number(product.internal_diameter) > Number(consignee.max_internal_diameter)) {
            productViolated = true;
        }
        if (consignee.max_external_diameter != null &&
            Number(product.external_diameter) > Number(consignee.max_external_diameter)) {
            productViolated = true;
        }

        if (productViolated) {
            someProductExceedsDiameter = true;
            // Marcar la fila del producto en rojo
            const row_el = document.querySelector(`#productTableBody tr[data-idx="${idx}"]`);
            if (row_el) row_el.classList.add("bg-red-50", "!hover:bg-red-100");
        }
    });

    if (someProductExceedsDiameter) {
        violations.push("Uno o más productos exceden los diámetros máximos definidos por el consignatario.");
    }

    return {
        valid:      violations.length === 0,
        violations,
        warnings,
    };
}

// ── Toast de notificación ────────────────────────────────────────────────────
function showToast(items, type = "error") {
    const existing = document.getElementById("specToast");
    if (existing) existing.remove();

    const isError = type === "error";
    const color   = isError ? "red" : "yellow";
    const icon    = isError ? "error" : "warning";
    const title   = isError ? "Especificaciones inválidas" : "Advertencia";

    const toast = document.createElement("div");
    toast.id = "specToast";
    toast.className = `
        fixed bottom-6 right-6 z-50 max-w-sm w-full
        bg-white border border-${color}-200 rounded-xl shadow-lg
        p-4 flex gap-3 items-start
        animate-[fadeIn_0.2s_ease]
    `;
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
        </button>
    `;

    document.body.appendChild(toast);

    // Auto-dismiss después de 8s
    setTimeout(() => toast?.remove(), 8000);
}

function limpiarMarcasConsignatario() {
    ["spec-weight-view", "spec-pieces-view", "spec-width-view", "spec-height-view", "spec-width-edit", "spec-height-edit"].forEach(id => {
        const el = $(id);
        if (!el) return;
        el.classList.remove("!border-red-400", "border-red-400");
        el.style.borderColor = "";
    });
    document.querySelectorAll("#productTableBody tr").forEach(row => {
        row.classList.remove("bg-red-50", "!hover:bg-red-100");
    });
    document.getElementById("specToast")?.remove();
}

// ── Toggle edit mode ─────────────────────────────────────────────────────────
async function toggleEdit(active) {
    if (!active) {
        if (!validarCampos()) {
            editMode = true;
            editButton.querySelector("span").textContent = "save";
            editButton.childNodes[2].textContent         = " Guardar";
            return;
        }

        platform.name        = $("platformName-edit").value;
        platform.description = $("platformDescription-edit").value;
        platform.width       = Number($("spec-width-edit").value);
        platform.height      = Number($("spec-height-edit").value);
        platform.length      = Number($("spec-length-edit").value);
        platform.id_dispatch_packaging = $("spec-pack-edit").value;
        platform.status      = $("platformStatus-edit").value === "1";
        platform.type        = isPresetSection ? "Preset" : (isPresetMode ? "Preset" : $("platformType-edit").value);

        calcSpecs();
        limpiarMarcasConsignatario();
        const { valid, violations, warnings } = validarEspecificacionesConsignatario();

        if (!valid) {
            showToast(violations, "error");
            editMode = true;
            editButton.querySelector("span").textContent = "save";
            editButton.childNodes[2].textContent         = " Guardar";
            return;
        }

        if (warnings.length > 0) {
            showToast(warnings, "warning");
        }

        editMode = false;
    }

    editButton.querySelector("span").textContent = active ? "save" : "edit";
    editButton.childNodes[2].textContent         = active ? " Guardar" : " Editar";

    const textFields = [
        { viewId: "platformName",        editId: "platformName-edit",        key: "name"        },
        { viewId: "platformDescription", editId: "platformDescription-edit", key: "description" },
        { viewId: "spec-length-view",    editId: "spec-length-edit",         key: "length"      },
        { viewId: "spec-height-view",    editId: "spec-height-edit",         key: "height"      },
        { viewId: "spec-width-view",     editId: "spec-width-edit",          key: "width"       },
    ];

    textFields.forEach(({ viewId, editId, key }) => {
        const view  = $(viewId);
        const input = $(editId);

        if (active) {
            input.value = platform[key] ?? "";
        } else {
            view.textContent = platform[key] || "—";
        }

        // En preset section nunca usamos el select de preset, siempre el input de nombre
        if (key === "name" && active && isPresetMode && !isPresetSection) {
            view.classList.add("hidden");
            input.classList.add("hidden");
            $("platformPreset-edit").classList.remove("hidden");
            return;
        }

        view.classList.toggle("hidden", active);
        input.classList.toggle("hidden", !active);
    });

    // Al entrar a editar en preset section: ocultar preset select, mostrar nombre normal
    if (active && isPresetSection) {
        $("platformPreset-edit").classList.add("hidden");
        $("platformName-edit").classList.remove("hidden");
        setNonTypeFieldsDisabled(false);
    }

    // Al salir de edit en modo no-preset-section, limpiar estado de preset
    if (!active && !isPresetSection) {
        $("platformPreset-edit").classList.add("hidden");
        setNonTypeFieldsDisabled(false);
    }

    const customerView   = $("platformCustomer");
    const customerSelect = $("platformCustomer-edit");
    if (isCreateMode && !isPresetSection) {
        customerView.classList.toggle("hidden", active);
        customerSelect.classList.toggle("hidden", !active);
    } else if (isPresetSection) {
        customerView.classList.add("hidden");
        customerSelect.classList.add("hidden");
    }

    const consigneeView   = $("platformConsignee");
    const consigneeSelect = $("platformConsignee-edit");
    if (isCreateMode && !isPresetSection) {
        consigneeView.classList.toggle("hidden", active);
        consigneeSelect.classList.toggle("hidden", !active);
    } else if (isPresetSection) {
        consigneeView.classList.add("hidden");
        consigneeSelect.classList.add("hidden");
    }

    const typeView   = $("platformType");
    const typeSelect = $("platformType-edit");
    if (active) {
        typeSelect.value = isPresetSection ? "Preset" : (platform.type === "Custom" ? "Custom" : "Preset");

        if (isPresetSection) {
            typeSelect.disabled = true;
            typeSelect.onchange = null;
        } else {
            typeSelect.disabled = false;
            typeSelect.onchange = () => handleTypeChange(typeSelect.value);
        }
    } else {
        typeView.innerHTML  = badges.type(platform.type);
        typeSelect.onchange = null;
        typeSelect.disabled = false;
    }
    typeView.classList.toggle("hidden", active);
    typeSelect.classList.toggle("hidden", !active);

    const statusView   = $("platformStatus");
    const statusSelect = $("platformStatus-edit");
    if (active) {
        statusSelect.value = platform.status ? "1" : "0";
    } else {
        statusView.innerHTML = badges.status(platform.status);
    }
    statusView.classList.toggle("hidden", active);
    statusSelect.classList.toggle("hidden", !active);

    const packView = $("spec-pack-view");
    const packSel  = $("spec-pack-edit");
    if (active) {
        packSel.value = platform.id_dispatch_packaging ?? dispatchPackaging[0]?.id ?? "";
    }
    packView.classList.toggle("hidden", active);
    packSel.classList.toggle("hidden", !active);

    if (!active) renderSpecs();

    if (!active) {
        try {
            const newPlatform = await savePlatform();

            isPresetMode       = false;
            selectedPresetName = "";

            if (isCreateMode) {
                platform     = newPlatform;
                isCreateMode = false;

                if (!isPresetSection) {
                    customerSelect.classList.add("hidden");
                    customerView.classList.remove("hidden");
                    consigneeSelect.classList.add("hidden");
                    consigneeView.classList.remove("hidden");
                    customerView.textContent  = customer?.name  ?? "—";
                    consigneeView.textContent = consignee?.name ?? "—";
                }

                if (isCommercial) {
                    editButton.classList.add("hidden");
                    actionBtn2.classList.add("hidden");
                } else {
                    actionBtn2.classList.remove("hidden");
                }

                window.history.replaceState({}, "", `?id=${newPlatform.id}&section=${type}`);
            } else {
                Object.assign(platform, newPlatform);
            }

            $("upperId").textContent = platform.name;

        } catch (err) {
            revertToEditMode();
            return;
        }
    }

    renderProductTable();
}

// ── Revertir UI a estado editable ────────────────────────────────────────────
function revertToEditMode() {
    editMode = true;
    editButton.querySelector("span").textContent = "save";
    editButton.childNodes[2].textContent         = " Guardar";

    // Mostrar inputs, ocultar views
    ["platformName", "platformDescription", "spec-length-view", "spec-height-view", "spec-width-view"].forEach(viewId => {
        $(viewId)?.classList.add("hidden");
    });
    ["platformName-edit", "platformDescription-edit", "spec-length-edit", "spec-height-edit", "spec-width-edit"].forEach(editId => {
        $(editId)?.classList.remove("hidden");
    });

    // En preset mode, mostrar el select de preset
    if (isPresetMode) {
        $("platformName-edit")?.classList.add("hidden");
        $("platformPreset-edit")?.classList.remove("hidden");
        setNonTypeFieldsDisabled(true);
    }

    // Customer / consignee si es createMode
    if (isCreateMode) {
        $("platformCustomer")?.classList.add("hidden");
        $("platformCustomer-edit")?.classList.remove("hidden");
        $("platformConsignee")?.classList.add("hidden");
        $("platformConsignee-edit")?.classList.remove("hidden");
    }

    // Type y status
    $("platformType")?.classList.add("hidden");
    $("platformType-edit")?.classList.remove("hidden");
    $("platformStatus")?.classList.add("hidden");
    $("platformStatus-edit")?.classList.remove("hidden");

    // Pack
    $("spec-pack-view")?.classList.add("hidden");
    $("spec-pack-edit")?.classList.remove("hidden");

    renderProductTable();
}

// ── Save ─────────────────────────────────────────────────────────────────────
async function savePlatform() {
    calcSpecs();

    const name = isPresetMode && !isPresetSection
        ? selectedPresetName
        : $("platformName-edit").value.trim();

    // Preset section: crear tarima directamente, sin request ni consignatario
    if (isPresetSection) {
        const name = $("platformName-edit").value.trim(); // siempre del input, ignorar isPresetMode

        const newPlatform = {
            name,
            type:                  "Preset",
            description:           $("platformDescription-edit").value.trim(),
            status:                $("platformStatus-edit").value === "1",
            id_dispatch_packaging: $("spec-pack-edit").value.trim(),
            id_consignee:          null,
            number_of_pieces:      piecesNumber,
            weight,
            width:                 Number($("spec-width-edit").value),
            height:                Number($("spec-height-edit").value),
            length:                Number($("spec-length-edit").value),
        };

        const data = { platform: newPlatform, items: currentProductLoad, request: null };

        if (isCreateMode) {
            const res = await axios.post(api.platforms.create(), data);
            return res.data;
        } else {
            const res = await axios.put(api.platforms.update(id), data);
            return res.data;
        }
    }


    // ── Si es createMode + preset, solo crear el request directamente ────────
    if (isCreateMode && isPresetMode) {
        const selectedPresetId = $("platformPreset-edit").value;
        const requestData = {
            id_platform:  selectedPresetId,
            id_consignee: consignee?.id ?? null,
            comments:     null,
        };

        try {
            await axios.post(api.platform_request.create(), requestData);
        } catch (err) {
            if (err.response?.status === 409) {
                $("productTableError").textContent = "⚠ Ya existe una solicitud pendiente para este preset y consignatario.";
                $("productTableError").classList.remove("hidden");
                revertToEditMode();
            }
            if (err.response?.status === 422) {
                const violations = err.response.data.violations ?? [];
                showToast(violations, "error");
                revertToEditMode();
            }
            throw err;
        }

        return presetPlatforms.find(p => p.id == selectedPresetId);
    }

    // ── Flujo normal (Custom create o edit) ──────────────────────────────────
    const newPlatform = {
        name,
        type:                  isPresetMode ? "Preset" : $("platformType-edit").value.trim(),
        description:           $("platformDescription-edit").value.trim(),
        status:                $("platformStatus-edit").value === "1",
        id_dispatch_packaging: $("spec-pack-edit").value.trim(),
        id_consignee:          consignee?.id ?? null,
        number_of_pieces:      piecesNumber,
        weight,
        width:                 Number($("spec-width-edit").value),
        height:                Number($("spec-height-edit").value),
        length:                Number($("spec-length-edit").value),
    };

    const newRequest = { id_consignee: consignee?.id ?? null, comments: null };
    const data = { platform: newPlatform, items: currentProductLoad, request: newRequest };

    if (isCreateMode) {
        const res = await axios.post(api.platforms.create(), data);
        return res.data;
    } else {
        const res = await axios.put(api.platforms.update(id), data);
        return res.data;
    }
}

// ── Aceptar (commercial) ─────────────────────────────────────────────────────
async function acceptPlatform() {
    try {
        await axios.patch(api.platform_request.approve(platformRequest.id));
        window.location.href = `/frontend/src/shared/list_view.html?type=commercial`;
    } catch (error) {
        console.error("Error al aceptar:", error);
    }
}

// ── Rechazar (commercial) ────────────────────────────────────────────────────
async function rejectPlatform(comments) {
    try {
        await axios.patch(
            api.platform_request.reject(platformRequest.id),
            { comments }
        );
    } catch (error) {
        console.error("Error al rechazar:", error);
    }
}

// ── Delete ───────────────────────────────────────────────────────────────────
async function deletePlatform() {
    await axios.delete(api.platforms.delete(platform.id));
}

// ── Event listeners ──────────────────────────────────────────────────────────
editButton.addEventListener("click", () => {
    if (isCommercial && !isCreateMode) {
        acceptPlatform();
        return;
    }
    if (editMode) {
        toggleEdit(false);
    } else {
        editMode = true;
        toggleEdit(true);
    }
});

actionBtn2.addEventListener("click", () => {
    console.log(isCommercial)
    if (isCommercial) {
        rejectModal.classList.remove("hidden");
        $("rejectComments").value = "";
    } else {
        modal.classList.remove("hidden");
    }
});

confirmBtn.addEventListener("click", async () => {
    await deletePlatform();

    if (isPresetSection) {
        window.location.href = `/frontend/src/shared/list_view.html?type=presets`;
    } else {
        window.location.href = `/frontend/src/shared/list_view.html?type=platforms&id=${customer?.id}`;
    }
});

cancelBtn.addEventListener("click", () => modal.classList.add("hidden"));
cancelRejectBtn.addEventListener("click", () => {rejectModal.classList.add("hidden")});
confirmRejectBtn.addEventListener("click", async () => {
    const comments = $("rejectComments").value.trim();
    if (!comments) {
        $("rejectComments").style.borderColor = "#f87171";
        return;
    }
    rejectModal.classList.add("hidden");
    await rejectPlatform(comments);
    window.location.href = `/frontend/src/shared/list_view.html?type=commercial`;
});

// ── Predicción ───────────────────────────────────────────────────────────────
const predictBtn = $("predictBtn");
const clearBtn   = $("clearBtn");
const loadCurrentPlatformBtn = $("loadCurrentPlatformBtn");

function parseOptionalNumber(id) {
    const value = $(id)?.value?.trim() ?? "";
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function getPredictionFormData() {
    return {
        consignatario: $("predConsignee").value.trim(),
        numero_parte: $("predNumPart").value.trim(),
        espesor: parseOptionalNumber("predThickness"),
        ancho: parseOptionalNumber("predWidth"),
        largo: parseOptionalNumber("predLength"),
        peso: parseOptionalNumber("predWeight"),
        ubicacion: $("predLocation").value.trim(),
    };
}

function clearPredictionInputs() {
    [
        "predConsignee",
        "predNumPart",
        "predThickness",
        "predWidth",
        "predLength",
        "predWeight",
        "predLocation"
    ].forEach(id => {
        const el = $(id);
        if (el) el.value = "";
    });
}

function clearPredictionResults() {
    [
        "resPackaging",
        "resPieces",
        "resMaxWeight",
        "resConfidence",
        "resRisk",
        "resManual"
    ].forEach(id => {
        const el = $(id);
        if (el) el.textContent = "—";
    });
}

function setPredictionLoading(isLoading) {
    if (!predictBtn) return;
    predictBtn.disabled = isLoading;
    predictBtn.classList.toggle("opacity-60", isLoading);
    predictBtn.classList.toggle("cursor-not-allowed", isLoading);
    predictBtn.innerHTML = isLoading
        ? `<span class="material-symbols-outlined text-sm">hourglass_top</span> Prediciendo...`
        : `<span class="material-symbols-outlined text-sm">model_training</span> Predecir`;
}

function renderPredictionResults(result) {
    const confidence = Number(result.confianza);
    const confidenceText = Number.isFinite(confidence)
        ? `${(confidence * 100).toFixed(1)}%`
        : "—";

    const riskProbability = Number(result.riesgo_desarme);
    const riskText = Number.isFinite(riskProbability)
        ? `${result.nivel_riesgo ?? "—"} (${(riskProbability * 100).toFixed(1)}%)`
        : (result.nivel_riesgo ?? "—");

    $("resPackaging").textContent = result.embalaje_recomendado || "—";
    $("resPieces").textContent = result.piezas_por_paquete || "—";
    $("resMaxWeight").textContent = result.peso_maximo ? `${result.peso_maximo} kg` : "—";
    $("resConfidence").textContent = confidenceText;
    $("resRisk").textContent = riskText;
    $("resManual").textContent = result.requires_review ? "Sí" : "No";
}

async function requestPrediction() {
    const payload = getPredictionFormData();

    if (!payload.consignatario || !payload.numero_parte) {
        showToast(["Consignatario y Numero de Parte son obligatorios para predecir."], "error");
        return;
    }

    setPredictionLoading(true);
    try {
        const { data } = await axios.post(api.prediction(), payload);
        renderPredictionResults(data);

        if (data.explicacion_riesgo) {
            showToast([`Riesgo: ${data.explicacion_riesgo}`], "warning");
        }
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            "No se pudo obtener la prediccion en este momento.";
        showToast([message], "error");
    } finally {
        setPredictionLoading(false);
    }
}

function loadCurrentPlatformData() {
    const topRow = [...currentProductLoad].sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0))[0];
    const topProduct = topRow ? products.find(p => p.id == topRow.id_product) : null;

    $("predConsignee").value = consignee?.name ?? "";
    $("predNumPart").value = topProduct?.part_number ?? "";
    $("predThickness").value = topProduct?.thickness ?? "";
    $("predWidth").value = platform?.width ?? "";
    $("predLength").value = platform?.length ?? "";
    $("predWeight").value = weight ?? "";
    $("predLocation").value = customer?.name ?? "";
}

predictBtn?.addEventListener("click", requestPrediction);
clearBtn?.addEventListener("click", () => {
    clearPredictionInputs();
    clearPredictionResults();
});
loadCurrentPlatformBtn?.addEventListener("click", loadCurrentPlatformData);

// ── Init ─────────────────────────────────────────────────────────────────────
initCustomerConsigneeSelects();
renderCampos();
renderProductTable();
renderSpecs();

if (createMode) {
    editMode = true;
    toggleEdit(true);
} else {
    if (!isCommercial) actionBtn2.classList.remove("hidden");

    // Bloquear edición si preset tiene requests activas
    if (hasActiveRequests) {
        editButton.disabled = true;
        editButton.classList.add("opacity-50", "cursor-not-allowed");
        editButton.title = "No se puede editar: este preset tiene solicitudes activas o pendientes";
        showToast(["Este paquete tiene solicitudes de tarima activas o pendientes y no puede editarse."], "warning");
    }
}