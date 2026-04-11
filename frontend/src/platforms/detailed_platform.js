import { setActiveNav } from "../shared/page_directory.js";

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
const type       = params.get("type");

(type == "preset") ? setActiveNav("presets") : setActiveNav("customers");

let { data: platform }  = createMode ? {} : await axios.get(`http://localhost:3000/api/platforms/${id}`);
const resPlatformRequests = await axios.get("http://localhost:3000/api/platform_request");
const platformRequest = resPlatformRequests.data.find(pr => pr.id_platform == id && pr.status === 'Aceptada');
const { data: dispatchPackaging } = await axios.get("http://localhost:3000/api/dispatch");
const { data: products } = await axios.get("http://localhost:3000/api/products"); 
const { data: productLoad } = await axios.get("http://localhost:3000/api/items");

let customer;
let consignee;

if(createMode){
    consignee = null;
} else {
    ({ data: consignee } = await axios.get(`http://localhost:3000/api/consignees/${platformRequest.id_consignee}`));
}

if (idCus) {
    const resCustomers = await axios.get(`http://localhost:3000/api/customers/${idCus}`);
    customer = resCustomers.data;
} else {
    const resCustomer = await axios.get("http://localhost:3000/api/customers");
    customer = resCustomer.data.find(c => c.id == consignee.id_customer);
}

let piecesNumber = platform.number_of_pieces;
let weight = platform.weight;

let currentProductLoad = createMode
    ? []
    : productLoad.filter(pl => pl.id_platform == platform?.id).map(pl => ({ ...pl }));

if (currentProductLoad.length > 0) calcSpecs();

let editMode     = false;
let isCreateMode = createMode;

const badges = {
    type: v => `<span class="${v == "Custom" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v == "Custom" ? "Personalizada" : "Preestablecido"}</span>`,
    status: v => `<span class="${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ? "Activo" : "Inactivo"}</span>`
};

// ── Navigation ───────────────────────────────────────────────────────────────
if (customer) {
    if (type == "preset") {
        $("returnListView").innerText = "PAQUETES";
        $("returnListView").href = `/frontend/src/shared/list_view.html?type=presets`;
    } else {
        $("returnListView").innerText = "TARIMAS";
        $("returnListView").href = `/frontend/src/shared/list_view.html?type=platforms&id=${customer.id}`;
    }
}

// ── Populate selects ─────────────────────────────────────────────────────────
$("spec-pack-edit").innerHTML = dispatchPackaging.map(d =>
    `<option value="${d.id}">${d.name}</option>`
).join("");

$("addProductSKU").innerHTML = `<option value=""Selecciona un producto/option>` +
    products.map(p =>
        `<option value="${p.id}">${p.name} (${p.family ?? ""})</option>`
    ).join("");

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
    if (createMode) {
        $("upperId").textContent             = "Nuevo";
        $("platformName").textContent        = "";
        $("platformCustomer").textContent   = "—";
        $("platformConsignee").textContent   = "—";
        $("platformDescription").textContent = "";
        $("platformType").innerHTML = badges.type("Custom") ?? "—";
        $("platformStatus").innerHTML        = badges.status(false);
    } else {
        $("upperId").textContent = platform.name;
        $("platformName").textContent        = platform.name        ?? "—";
        $("platformCustomer").textContent   = customer?.name      ?? "—";
        $("platformConsignee").textContent   = consignee?.name      ?? "—";
        $("platformDescription").textContent = platform.description ?? "—";
        $("platformType").innerHTML = badges.type(platform.type) ?? "—";
        $("platformStatus").innerHTML = badges.status(platform.status);
    }
}

// ── Render spec sidebar ──────────────────────────────────────────────────────
function renderSpecs() {
    $("spec-pieces-view").textContent = piecesNumber ?? "—";
    $("spec-weight-view").textContent = weight       ?? "—";
    $("spec-width-view").textContent  = platform.width        ?? "—";
    $("spec-height-view").textContent = platform.height       ?? "—";
    $("spec-length-view").textContent = platform.length       ?? "—";

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
                <td colspan="${editMode ? 5 : 4}" class="px-6 py-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
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
                    ${editMode
                        ? `<input type="number" min="1" value="${row.quantity}"
                                onchange="updateQuantity(${idx}, this.value)"
                                class="w-16 text-center border border-border-light rounded px-1 py-0.5 text-xs font-bold" />`
                        : row.quantity}
                </td>
                <td class="px-6 py-4 text-sm text-right font-medium">
                    ${product?.unit_weight != null ? product.unit_weight + " kg" : "—"}
                </td>
                ${editMode ? `
                <td class="px-6 py-4 text-right">
                    <button onclick="removeProduct(${idx})" class="text-text-secondary-light hover:text-red-600 transition-colors p-1">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </td>` : ""}
            </tr>`;
        }).join("");
    }

    // Botón "Agregar producto" solo visible en edit mode
    footer.innerHTML = `
        <tr>
            <td colspan="${editMode ? 5 : 4}" class="px-6 py-3">
                ${editMode ? `
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
    $("addProductSKU").classList.remove("border-red-400");
    $("addProductQty").classList.remove("border-red-400");
};

window.closeAddProduct = function () {
    $("addProductModal").classList.add("hidden");
};

window.confirmAddProduct = function () {
    const productID = $("addProductSKU").value;
    const qty = Number($("addProductQty").value);
    let valid = true;

    if (!productID)             { $("addProductSKU").classList.add("border-red-400"); valid = false; }
    if (!qty || qty <= 0) { $("addProductQty").classList.add("border-red-400"); valid = false; }
    if (!valid) return;

    const existing = currentProductLoad.find(r => r.id_product == productID);
    if (existing) {
        existing.quantity += qty;
    } else {
        currentProductLoad.push({ idPlatform: platform.id ?? null, id_product: productID, quantity: qty });
    }

    closeAddProduct();
    renderProductTable();
    console.log("updated")
    $("productTableError").classList.add("hidden");
};

window.removeProduct = function (idx) {
    currentProductLoad.splice(idx, 1);
    renderProductTable();
};

window.updateQuantity = function (idx, val) {
    const n = Number(val);
    if (n > 0) {
        currentProductLoad[idx].quantity = n;
        renderSpecs();
    }
};

// ── Validación ───────────────────────────────────────────────────────────────
function validarCampos() {
    let valid = true;

    ["platformName-edit", "platformDescription-edit"].forEach(fid => {
        const el = $(fid);
        if (!el.value.trim()) {
            el.classList.add("border-red-400");
            valid = false;
        }
    });

    /*if (currentProductLoad.length === 0) {
        $("productTableError").classList.remove("hidden");
        valid = false;
    } else {
        $("productTableError").classList.add("hidden");
    }*/

    return valid;
}

document.querySelectorAll(".edit").forEach(el =>
    el.addEventListener("input", () => el.classList.remove("border-red-400"))
);

// ── Toggle edit mode ─────────────────────────────────────────────────────────
function toggleEdit(active) {
    // Si se intenta guardar, validar antes de continuar
    if (!active) {
        if (!validarCampos()) {
            // Validación falló — mantenemos edit mode visualmente y en estado
            editMode = true;
            editButton.querySelector("span").textContent = "save";
            editButton.childNodes[2].textContent         = " Guardar";
            return;
        }
        // Validación OK — confirmar salida de edit mode
        editMode = false;
    }

    editButton.querySelector("span").textContent = active ? "save" : "edit";
    editButton.childNodes[2].textContent         = active ? " Guardar" : " Editar";

    // Campos de texto
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
            platform[key]    = input.value;
            view.textContent = input.value || "—";
        }
        view.classList.toggle("hidden", active);
        input.classList.toggle("hidden", !active);
    });

    // Type
    const typeView = $("platformType");
    const typeSelect = $("platformType-edit");
    if (active) {
        typeSelect.value = platform.type == "Custom" ? "Custom" : "Preset";
    } else {
        platform.type = typeSelect.value == "Custom" ? "Custom" : "Preset";
        typeView.innerHTML = badges.type(platform.type);
    }
    typeView.classList.toggle("hidden", active);
    typeSelect.classList.toggle("hidden", !active);

    // Status
    const statusView   = $("platformStatus");
    const statusSelect = $("platformStatus-edit");
    if (active) {
        statusSelect.value = platform.status ? "1" : "0";
    } else {
        platform.status      = statusSelect.value === "1";
        statusView.innerHTML = badges.status(platform.status);
    }
    statusView.classList.toggle("hidden", active);
    statusSelect.classList.toggle("hidden", !active);

    // Dispatch packaging
    const packView = $("spec-pack-view");
    const packSel  = $("spec-pack-edit");
    if (active) {
        packSel.value = platform.id_dispatch_packaging ?? dispatchPackaging[0]?.id ?? "";
    } else {
        platform.id_dispatch_packaging = packSel.value;
    }
    packView.classList.toggle("hidden", active);
    packSel.classList.toggle("hidden", !active);

    if (!active) renderSpecs();

    // Commit al guardar
    if (!active) {
        const newPlatform = savePlatform();
        if (isCreateMode) {
            platform     = newPlatform;
            isCreateMode = false;

            $("platformID").textContent = newPlatform.id;
            
            deleteBtn.classList.remove("hidden");
            window.history.replaceState({}, "", `?id=${nuevo.id}`);
        }
        $("upperId").textContent = newPlatform.name;
    }

    renderProductTable();
}

// ── Save new platform ────────────────────────────────────────────────────────
async function savePlatform() {
    calcSpecs();
    const newPlatform = {
        name:              $("platformName-edit").value.trim(),
        type:              $("platformType-edit").value.trim(),
        description:       $("platformDescription-edit").value.trim(),
        status:            $("platformStatus-edit").value === "1",
        id_dispatch_packaging: $("spec-pack-edit").value.trim(),
        number_of_pieces:  piecesNumber,
        weight:            weight,
        width:             Number($("spec-width-edit").value),
        height:            Number($("spec-height-edit").value),
        length:            Number($("spec-length-edit").value),
    };

    console.log(newPlatform)
    
    if (createMode) {
        await axios.post(`http://localhost:3000/api/platforms`, newPlatform)
    } else {
        await axios.put(`http://localhost:3000/api/platforms/${id}`, newPlatform);
    }

    return newPlatform;
}

// ── Delete ───────────────────────────────────────────────────────────────────
function deletePlatform() {
    const idx = platforms.findIndex(p => p.id == platform.id);
    if (idx !== -1) platforms.splice(idx, 1);

    const toRemove = productLoad.reduce((acc, row, i) => {
        if (row.idPlatform == platform.id) acc.push(i);
        return acc;
    }, []);
    toRemove.reverse().forEach(i => productLoad.splice(i, 1));
}

// ── Event listeners ──────────────────────────────────────────────────────────
editButton.addEventListener("click", () => {
    if (editMode) {
        // Intentando guardar — toggleEdit decide si puede salir
        toggleEdit(false);
    } else {
        // Entrando a editar
        editMode = true;
        toggleEdit(true);
    }
});

deleteBtn.addEventListener("click",  () => modal.classList.remove("hidden"));
cancelBtn.addEventListener("click",  () => modal.classList.add("hidden"));
confirmBtn.addEventListener("click", () => {
    deletePlatform();
    window.location.href = `/frontend/src/shared/list_view.html?type=platforms&id=${customer?.id}`;
});

// ── Init ─────────────────────────────────────────────────────────────────────
renderCampos();
renderProductTable();
renderSpecs();


if (createMode) {
    editMode = true;
    toggleEdit(true);
} else {
    deleteBtn.classList.remove("hidden");
}