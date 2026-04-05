import { setActiveNav } from "../shared/page_directory.js";
import { products } from "../shared/db.js";

setActiveNav("products");

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

let product  = createMode ? {} : products.find(p => p.id == id);
let editMode = false;

// --- Badges ---
const badges = {
    status: v => `<span class="${v === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ?? "Inactivo"}</span>`
};

// --- Navigation ---
$("returnListView").href = `/frontend/src/shared/list_view.html?type=products`;

// --- Render Campos ---
function renderCampos() {
    if (createMode) {
        $("upperID").textContent              = "Nuevo";
        $("productID").textContent              = id;
        $("productSKU").textContent           = "—";
        $("productName").textContent          = "";
        $("productFamilia").textContent       = "";
        $("productStatus").innerHTML          = badges.status("Inactivo");
        $("productCalibro").textContent       = "";
        $("productEspesor").textContent       = "";
        $("productLargo").textContent         = "";
        $("productPeso").textContent          = "";
        $("productDiametroInt").textContent   = "";
        $("productDiametroExt").textContent   = "";
    } else {
        $("upperID").textContent              = id;
        $("productID").textContent           = id ?? "—";
        $("productSKU").textContent           = product.numeroDeParte ?? "—";
        $("productName").textContent          = product.producto          ?? "—";
        $("productFamilia").textContent       = product.familia         ?? "—";
        $("productStatus").innerHTML          = badges.status(product.estado);
        $("productCalibro").textContent       = product.calibre         ?? "—";
        $("productEspesor").textContent       = product.espesor         ?? "—";
        $("productLargo").textContent         = product.largo           ?? "—";
        $("productPeso").textContent          = product.pesoUnitario    ?? "—";
        $("productDiametroInt").textContent   = product.diametroInterno ?? "—";
        $("productDiametroExt").textContent   = product.diametroExterno ?? "—";
    }
}

// --- Validar Campos ---
function validarCampos() {
    let valid = true;

    // Campos de texto obligatorios
    ["productSKU-edit", "productName-edit", "productFamilia-edit"].forEach(fid => {
        const el = $(fid);
        if (!el.value.trim()) {
            el.classList.add("border-red-400");
            valid = false;
        }
    });

    // Campos numéricos obligatorios (deben ser > 0)
    ["productCalibro-edit", "productEspesor-edit", "productLargo-edit", "productPeso-edit",  "productDiametroInt-edit", "productDiametroExt-edit"].forEach(fid => {
        const el  = $(fid);
        const val = Number(el.value);
        if (el.value === "" || isNaN(val) || val <= 0) {
            el.classList.add("border-red-400");
            valid = false;
        }
    });

    return valid;
}

document.querySelectorAll(".edit").forEach(el =>
    el.addEventListener("input", () => el.classList.remove("border-red-400"))
);

// --- Toggle Edit ---
function toggleEdit(active) {
    // Si se intenta guardar, validar antes de continuar
    if (!active) {
        if (!validarCampos()) {
            editMode = true;
            editButton.querySelector("span").textContent = "save";
            editButton.childNodes[2].textContent         = " Guardar";
            return;
        }
    }

    editButton.querySelector("span").textContent = active ? "save" : "edit";
    editButton.childNodes[2].textContent         = active ? " Guardar" : " Editar";

    // Campos editables genéricos (.editable con .view / .edit)
    document.querySelectorAll(".editable").forEach(f => {
        const view  = f.querySelector(".view");
        const input = f.querySelector(".edit");
        if (!view || !input) return;
        if (active) {
            input.value = view.textContent.trim() === "—" ? "" : view.textContent.trim();
        } else {
            view.textContent = input.value || "—";
        }
        view.classList.toggle("hidden", active);
        input.classList.toggle("hidden", !active);
    });

    // Status select
    const statusView   = $("productStatus");
    const statusSelect = $("productStatus-edit");
    if (active) {
        statusSelect.value = product.estado ?? "Activo";
    } else {
        product.estado       = statusSelect.value;
        statusView.innerHTML = badges.status(product.estado);
    }
    statusView.classList.toggle("hidden", active);
    statusSelect.classList.toggle("hidden", !active);

    // Commit al guardar
    if (!active) {
        product.producto           = $("productName-edit").value.trim();
        product.familia          = $("productFamilia-edit").value.trim();
        product.calibre          = $("productCalibro-edit").value.trim();
        product.espesor          = Number($("productEspesor-edit").value);
        product.largo            = Number($("productLargo-edit").value);
        product.pesoUnitario     = Number($("productPeso-edit").value);
        product.diametroInterno  = Number($("productDiametroInt-edit").value);
        product.diametroExterno  = Number($("productDiametroExt-edit").value);
        product.fechaActualizacion = new Date().toISOString().split("T")[0];

        if (createMode && !product.id) {
            // Guardar nuevo producto
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            product.id                = newId;
            product.fechaCreacion     = new Date().toISOString().split("T")[0];
            products.push({ ...product });

            $("productID").textContent = newId;
            $("upperID").textContent   = product.numeroDeParte ?? newId;
            $("productFechaCreacion").textContent     = product.fechaCreacion;
            $("productFechaActualizacion").textContent = product.fechaActualizacion;

            deleteBtn.classList.remove("hidden");
            window.history.replaceState({}, "", `?id=${newId}`);
        } else {
            // Actualizar existente
            const idx = products.findIndex(p => p.id == product.id);
            if (idx !== -1) products[idx] = { ...product };
            $("productFechaActualizacion").textContent = product.fechaActualizacion;
        }
    }
}

// --- Eliminar ---
function eliminarProducto() {
    const idx = products.findIndex(p => p.id == product.id);
    if (idx !== -1) products.splice(idx, 1);
}

// --- Event Listeners ---
editButton.addEventListener("click", () => {
    editMode = !editMode;
    toggleEdit(editMode);
});

deleteBtn.addEventListener("click",  () => modal.classList.remove("hidden"));
cancelBtn.addEventListener("click",  () => modal.classList.add("hidden"));
confirmBtn.addEventListener("click", () => {
    eliminarProducto();
    window.location.href = `/frontend/src/shared/list_view.html?type=products`;
});

// --- Init ---
renderCampos();

if (createMode) {
    editMode = true;
    toggleEdit(true);
} else {
    deleteBtn.classList.remove("hidden");
}