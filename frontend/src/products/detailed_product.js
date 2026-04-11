import { setActiveNav } from "../shared/page_directory.js";

setActiveNav("products");

// --- Shortcuts ---
const $ = id => document.getElementById(id);
const editButton = $("editButton");
const deleteBtn  = $("deleteButton");
const modal      = $("deleteModal");
const cancelBtn  = $("cancelDelete");
const confirmBtn = $("confirmDelete");
const specsErrorMsg = $("specsErrorMsg");
const specsErrorBox = $("specsErrorBox");

const params     = new URLSearchParams(window.location.search);
let id         = params.get("id");
let createMode = params.get("create") === "true";

const { data: products } = await axios.get("http://localhost:3000/api/products")
let product  = createMode ? {} : products.find(p => p.id == id);
let editMode = false;

// --- Badges ---
const badges = {
    status: v => `<span class="${v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs font-semibold rounded-full">${v ? "Activo" : "Inactivo"}</span>`
};

// --- Navigation ---
$("returnListView").href = `/frontend/src/shared/list_view.html?type=products`;

// --- Render Campos ---
function renderCampos() {
    if (createMode) {
        $("upperID").textContent            = "Nuevo";
        $("productSKU").textContent         = "";
        $("productName").textContent        = "";
        $("productFamilia").textContent     = "";
        $("productStatus").innerHTML        = badges.status(false);
        $("productCalibro").textContent     = "";
        $("productEspesor").textContent     = "";
        $("productLargo").textContent       = "";
        $("productPeso").textContent        = "";
        $("productDiametroInt").textContent = "";
        $("productDiametroExt").textContent = "";
    } else {
        $("upperID").textContent            = product.name;
        $("productSKU").textContent         = product.part_number        ?? "";
        $("productName").textContent        = product.name               ?? "—";
        $("productFamilia").textContent     = product.family              ?? "N/A";
        $("productStatus").innerHTML        = badges.status(product.status);
        $("productCalibro").textContent     = product.caliber             ?? "N/A";
        $("productEspesor").textContent     = product.thickness           ?? "—";
        $("productLargo").textContent       = product.length              ?? "—";
        $("productPeso").textContent        = product.unit_weight         ?? "—";
        $("productDiametroInt").textContent = product.internal_diameter   ?? "—";
        $("productDiametroExt").textContent = product.external_diameter   ?? "—";
    }
}

// --- Validar Campos ---
function validarCampos() {
    let valid = true;

    ["productSKU-edit", "productName-edit"].forEach(fid => {
        const el = $(fid);
        if (!el.value.trim()) {
            el.classList.add("border-red-400");
            valid = false;
        }
    });

    ["productEspesor-edit", "productLargo-edit", "productPeso-edit", "productDiametroInt-edit", "productDiametroExt-edit"].forEach(fid => {
        const el  = $(fid);
        const val = Number(el.value);
        if (el.value === "" || isNaN(val) || val <= 0) {
            el.classList.add("border-red-400");
            valid = false;
        }
    });

    const internalDiameter = Number($("productDiametroInt-edit").value);
    const externalDiameter = Number($("productDiametroExt-edit").value);

    // Reset error state
    specsErrorMsg.classList.add("opacity-0", "translate-y-1");
    specsErrorMsg.classList.remove("opacity-100", "translate-y-0");
    specsErrorBox.classList.remove("ring-2", "ring-red-400", "ring-offset-4", "ring-offset-white");

    if (internalDiameter > 0 && externalDiameter > 0 && internalDiameter >= externalDiameter) {
        specsErrorMsg.classList.remove("opacity-0", "translate-y-1");
        specsErrorMsg.classList.add("opacity-100", "translate-y-0");
        specsErrorBox.classList.add("ring-2", "ring-red-400", "ring-offset-4", "ring-offset-white");
        valid = false;
    }

    return valid;
}

document.querySelectorAll(".edit").forEach(el =>
    el.addEventListener("input", () => el.classList.remove("border-red-400"))
);

// --- Toggle Edit ---
async function toggleEdit(active) {
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

    document.querySelectorAll(".editable").forEach(f => {
        const view  = f.querySelector(".view");
        const input = f.querySelector(".edit");
        if (!view || !input) return;
        if (active) {
            input.value = view.textContent.trim() === "N/A" ? "" : view.textContent.trim();
        } else {
            view.textContent = input.value || "N/A";
        }
        view.classList.toggle("hidden", active);
        input.classList.toggle("hidden", !active);
    });

    // Reset error al salir de edit mode
    if (!active) {
        specsErrorMsg.classList.add("opacity-0", "translate-y-1");
        specsErrorMsg.classList.remove("opacity-100", "translate-y-0");
        specsErrorBox.classList.remove("ring-2", "ring-red-400", "ring-offset-4", "ring-offset-white");
    }

    const statusView   = $("productStatus");
    const statusSelect = $("productStatus-edit");

    if (active) {
        statusSelect.value = product.status ? "true" : "false";
    } else {
        product.status       = statusSelect.value === "true";
        statusView.innerHTML = badges.status(product.status);
    }

    statusView.classList.toggle("hidden", active);
    statusSelect.classList.toggle("hidden", !active);

    if (!active) {
        const newProduct = await saveProduct();
        $("upperID").textContent = newProduct.name;

        if (createMode) {
            deleteBtn.classList.remove("hidden");
            id = newProduct.id;
            window.history.replaceState({}, "", `?id=${newProduct.id}`);
            createMode = false;
        }
    }
}

async function saveProduct() {
    const newProduct = {
        name:              $("productName-edit").value.trim(),
        part_number:       $("productSKU-edit").value.trim(),
        family:            $("productFamily-edit").value.trim() || null,
        status:            $("productStatus-edit").value === "true",
        caliber:           $("productCalibro-edit").value.trim() || null,
        thickness:         Number($("productEspesor-edit").value),
        length:            Number($("productLargo-edit").value),
        unit_weight:       Number($("productPeso-edit").value),
        internal_diameter: Number($("productDiametroInt-edit").value),
        external_diameter: Number($("productDiametroExt-edit").value),
    };

    if (createMode) {
        try {
            const res = await axios.post(`http://localhost:3000/api/products`, newProduct);
            return res.data;
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    } else {
        try {
            const res = await axios.put(`http://localhost:3000/api/products/${id}`, newProduct);
            return res.data;
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    }
    return newProduct;
}

// --- Eliminar ---
async function deleteProduct() {
    await axios.delete(`http://localhost:3000/api/products/${id}`);
}

// --- Event Listeners ---
editButton.addEventListener("click", () => {
    editMode = !editMode;
    toggleEdit(editMode);
});

deleteBtn.addEventListener("click",  () => modal.classList.remove("hidden"));
cancelBtn.addEventListener("click",  () => modal.classList.add("hidden"));
confirmBtn.addEventListener("click", () => {
    deleteProduct();
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