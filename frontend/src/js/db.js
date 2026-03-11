const customers = [
    { id: "00124", name: "Aceros Industriales S.A.", rfc: "AIN890123H56", contact: "Juan Pérez", status: 1, address: "Av. Industrias 4500, Parque Industrial Bernardo Reyes, Monterrey, NL, CP 64280" },
    { id: "00125", name: "Constructora del Norte", rfc: "CDN990812KL9", contact: "Maria Lopez", status: 1, address: "Av. Fidel Velázquez 1200, Col. Central, Monterrey, NL, CP 64190" },
    { id: "00126", name: "Metalúrgica Global", rfc: "MGL770304TY1", contact: "Carlos Ruiz", status: 0, address: "Av. Ruiz Cortines 3200, Col. Moderna, Monterrey, NL, CP 64530" },
    { id: "00127", name: "Distribuidora de Hierro", rfc: "DHI010101AB1", contact: "Ana Gomez", status: 1, address: "Av. Churubusco 1800, Col. Fierro, Monterrey, NL, CP 64590" },
    { id: "00128", name: "Proyectos Civiles MX", rfc: "PCM880202CD2", contact: "Roberto Diaz", status: 0, address: "Av. Constitución 4100, Col. Obispado, Monterrey, NL, CP 64060" },
    { id: "00129", name: "Aluminios y Mas", rfc: "AYM121212EF3", contact: "Sofia Martinez", status: 1, address: "Av. Lincoln 5400, Col. Mitras Norte, Monterrey, NL, CP 64320" },
    { id: "00130", name: "Grupo Constructor Alpha", rfc: "GCA909090GH4", contact: "Luis Torres", status: 1, address: "Av. Gonzalitos 2200, Col. Vista Hermosa, Monterrey, NL, CP 64620" }
];

const consignees = [
    { id: 1, idCustomer: "00124", name: "Centro de Distribución Bajío", address: "Carretera Qro-Celaya Km 12.5, Gto." },
    { id: 2, idCustomer: "00124", name: "Planta Norte", address: "Zona Industrial Escobedo, NL." },
    { id: 3, idCustomer: "00124", name: "Almacén Central - Bodega 4", address: "Av. Ferrocarriles S/N, SLP." },
    { id: 4, idCustomer: "00124", name: "Sucursal Occidente", address: "Parque Industrial El Salto, Jal." },
    { id: 5, idCustomer: "00125", name: "Sucursal Occidente", address: "Parque Industrial El Salto, Jal." },
];

const platforms = [
    { id: 1, idConsignee: 1, name: "Estándar 40x48 - Tratada HT", description: "Madera Certificada, Cap.", weight: 1500 }, 
    { id: 2, idConsignee: 2, name: "Industrial Reforzada", description: "Estándar 40x48 - Tratada HT", weight: 2000 }, 
    { id: 3, idConsignee: 3, name: "Plástico Higiénica", description: "HDPE, Grado alimenticio, Azul", weight: 1700 }, 
    { id: 4, idConsignee: 4, name: "Preestablecido 8", description: "Rollos de aceros asegurados", weight: 1300 }, 
];

const followUps = [
    { id: "ORD-88291", date: "24 Oct, 2023", weight: 12500, idConsignee: 1, status: "Entregado"},
    { id: "ORD-88305", date: "27 Oct, 2023", weight: 8000, idConsignee: 2, status: "En tránsito"},
    { id: "ORD-88291", date: "Hoy, 09:30", weight: 15000, idConsignee: 3, status: "Procesando"},
];

const products = [
    { sku: "PRD-1001", producto: "Lámina Rolada en Caliente", tipo: "Acero", unidad: "Toneladas", peso: 1200 },
    { sku: "PRD-1002", producto: "Lámina Galvanizada", tipo: "Acero", unidad: "Toneladas", peso: 950 },
    { sku: "PRD-1003", producto: "Placa Estructural", tipo: "Acero", unidad: "Toneladas", peso: 1500 },
    { sku: "PRD-1004", producto: "Perfil HSS", tipo: "Perfil", unidad: "Piezas", peso: 320 },
    { sku: "PRD-1005", producto: "Viga IPR", tipo: "Perfil", unidad: "Piezas", peso: 780 },
    { sku: "PRD-1006", producto: "Bobina de Acero", tipo: "Acero", unidad: "Toneladas", peso: 2000 },
    { sku: "PRD-1007", producto: "Lámina Pintada", tipo: "Acero", unidad: "Toneladas", peso: 670 },
    { sku: "PRD-1008", producto: "Tubo Estructural", tipo: "Perfil", unidad: "Piezas", peso: 410 }
];

export {customers, consignees, platforms, followUps, products};