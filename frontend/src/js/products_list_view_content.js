const attributes = [
    "SKU",
    "PRODUCTO",
    "TIPO",
    "UNIDAD",
    "PESO",
    "Acciones"
];

const products = [
    {
        sku: "PRD-1001",
        producto: "Lámina Rolada en Caliente",
        tipo: "Acero",
        unidad: "Toneladas",
        peso: 1200,
    },
    {
        sku: "PRD-1002",
        producto: "Lámina Galvanizada",
        tipo: "Acero",
        unidad: "Toneladas",
        peso: 950,
    },
    {
        sku: "PRD-1003",
        producto: "Placa Estructural",
        tipo: "Acero",
        unidad: "Toneladas",
        peso: 1500,
    },
    {
        sku: "PRD-1004",
        producto: "Perfil HSS",
        tipo: "Perfil",
        unidad: "Piezas",
        peso: 320,
    },
    {
        sku: "PRD-1005",
        producto: "Viga IPR",
        tipo: "Perfil",
        unidad: "Piezas",
        peso: 780,
    },
    {
        sku: "PRD-1006",
        producto: "Bobina de Acero",
        tipo: "Acero",
        unidad: "Toneladas",
        peso: 2000,
    },
    {
        sku: "PRD-1007",
        producto: "Lámina Pintada",
        tipo: "Acero",
        unidad: "Toneladas",
        peso: 670,
    },
    {
        sku: "PRD-1008",
        producto: "Tubo Estructural",
        tipo: "Perfil",
        unidad: "Piezas",
        peso: 410,
    }
];

export function loadProductos(){
    const title = document.getElementById("pageTitle");
    const search = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead = document.getElementById("listViewThead");
    const tbody = document.getElementById("listViewBody");

    title.innerHTML = "PRODUCTOS";

    search.placeholder = "Buscar Productos...";

    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
            Nuevo Producto`;

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    tbody.innerHTML = products.map(p => `
        <tr
        class="bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors">
        <td
            class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light dark:text-text-primary-dark">${p.sku}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-primary-light dark:text-text-primary-dark font-medium">${p.producto}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">${p.tipo}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">${p.unidad}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">${p.peso}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
                class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary mx-2"><span
                    class="material-icons text-lg">edit</span></button>
            <button
                class="text-text-secondary-light dark:text-text-secondary-dark hover:text-red-600 dark:hover:text-red-400 mx-2"><span
                    class="material-icons text-lg">delete</span></button>
        </td>
    </tr>
    `).join("");
}