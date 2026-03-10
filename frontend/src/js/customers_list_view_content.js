const attributes = [
    "ID",
    "Razón Social",
    "RFC",
    "CONTACTO",
    "ESTADO",
    "ACCIONES"
];

const customers = [
    { id: "00124", name: "Aceros Industriales S.A.", rfc: "AIN890123H56", contact: "Juan Pérez", status: "Activo" },
    { id: "00125", name: "Constructora del Norte", rfc: "CDN990812KL9", contact: "Maria Lopez", status: "Activo" },
    { id: "00126", name: "Metalúrgica Global", rfc: "MGL770304TY1", contact: "Carlos Ruiz", status: "Inactivo" },
    { id: "00127", name: "Distribuidora de Hierro", rfc: "DHI010101AB1", contact: "Ana Gomez", status: "Activo" },
    { id: "00128", name: "Proyectos Civiles MX", rfc: "PCM880202CD2", contact: "Roberto Diaz", status: "Inactivo" },
    { id: "00129", name: "Aluminios y Mas", rfc: "AYM121212EF3", contact: "Sofia Martinez", status: "Activo" },
    { id: "00130", name: "Grupo Constructor Alpha", rfc: "GCA909090GH4", contact: "Luis Torres", status: "Activo" }
];

export function loadClientes(){
    const title = document.getElementById("pageTitle");
    const search = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead = document.getElementById("listViewThead");
    const tbody = document.getElementById("listViewBody");

    title.innerHTML = "CLIENTES";

    search.placeholder = "Buscar Clientes...";

    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
            Nuevo Cliente`;

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    tbody.innerHTML = customers.map(c => `
        <tr
        class="bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors">
        <td
            class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light dark:text-text-primary-dark">${c.id}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-primary-light dark:text-text-primary-dark font-medium">${c.name}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">${c.rfc}</td>
        <td
            class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">${c.contact}</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span
                class=" ${c.status == 'Activo' ? "bg-green-100 text-green-800": "bg-red-100 text-red-800"} px-2 inline-flex text-xs leading-5 font-semibold rounded-full">${c.status}</span>
        </td>
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