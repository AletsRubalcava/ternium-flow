const customers = [
    { id: 1, name: "Aceros Industriales S.A.", rfc: "AIN890123H56", contact: "Juan Pérez", status: true, address: "Av. Industrias 4500, Parque Industrial Bernardo Reyes, Monterrey, NL, CP 64280" },
    { id: 2, name: "Constructora del Norte", rfc: "CDN990812KL9", contact: "Maria Lopez", status: true, address: "Av. Fidel Velázquez 1200, Col. Central, Monterrey, NL, CP 64190" },
    { id: 3, name: "Metalúrgica Global", rfc: "MGL770304TY1", contact: "Carlos Ruiz", status: false, address: "Av. Ruiz Cortines 3200, Col. Moderna, Monterrey, NL, CP 64530" },
    { id: 4, name: "Distribuidora de Hierro", rfc: "DHI010101AB1", contact: "Ana Gomez", status: true, address: "Av. Churubusco 1800, Col. Fierro, Monterrey, NL, CP 64590" },
    { id: 5, name: "Proyectos Civiles MX", rfc: "PCM880202CD2", contact: "Roberto Diaz", status: false, address: "Av. Constitución 4100, Col. Obispado, Monterrey, NL, CP 64060" },
    { id: 6, name: "Aluminios y Mas", rfc: "AYM121212EF3", contact: "Sofia Martinez", status: true, address: "Av. Lincoln 5400, Col. Mitras Norte, Monterrey, NL, CP 64320" },
    { id: 7, name: "Grupo Constructor Alpha", rfc: "GCA909090GH4", contact: "Luis Torres", status: true, address: "Av. Gonzalitos 2200, Col. Vista Hermosa, Monterrey, NL, CP 64620" }
];

const dispatchPackaging = [
    { id: 1, name: "Tarima Industrial Reforzada" },
    { id: 2, name: "Huacal de Madera Exportación" },
    { id: 3, name: "Slingas de Nylon" },
    { id: 4, name: "Sin Embalaje (A Granel)" },
    { id: 5, name: "Pallet Madera" },
    { id: 6, name: "Rack Metálico" },
]

const consignees = [
    {
        id: 1,
        idCustomer: 1,
        name: "Centro de Distribución Bajío",
        address: "Carretera Qro-Celaya Km 12.5, Gto.",
        maxLoad: 1500.50,
        minLoad: 100.00,
        maxPieces: 50,
        prefDispatchPackagingID: 5,
        maxWidth: 1.20,
        maxHeight: 1.80,
        internalDiameter: 0.75,
        externalDiameter: 1.10,
        instructions: "",
        createdAt: "2024-01-15T08:30:00Z",
        updatedAt: "2024-03-20T10:00:00Z",
        status: true
    },
    {
        id: 2,
        idCustomer: 1,
        name: "Planta Norte",
        address: "Zona Industrial Escobedo, NL.",
        maxLoad: 3000.00,
        minLoad: 500.00,
        maxPieces: 20,
        prefDispatchPackagingID: 6,
        maxWidth: 2.50,
        maxHeight: 2.20,
        internalDiameter: 1.00,
        externalDiameter: 2.40,
        instructions: "",
        createdAt: "2024-02-10T09:15:00Z",
        updatedAt: "2024-02-10T09:15:00Z",
        status: true
    },
    {
        id: 3,
        idCustomer: 1,
        name: "Almacén Central - Bodega 4",
        address: "Av. Ferrocarriles S/N, SLP.",
        maxLoad: 800.00,
        minLoad: 50.00,
        maxPieces: 100,
        prefDispatchPackagingID: 1,
        maxWidth: 0.80,
        maxHeight: 0.80,
        internalDiameter: 0.00,
        externalDiameter: 0.00,
        instructions: "",
        createdAt: "2024-03-01T14:20:00Z",
        updatedAt: "2024-03-25T11:45:00Z",
        status: false
    },
    {
        id: 4,
        idCustomer: 1,
        name: "Sucursal Occidente",
        address: "Parque Industrial El Salto, Jal.",
        maxLoad: 1200.00,
        minLoad: 200.00,
        maxPieces: 30,
        prefDispatchPackagingID: 2,
        maxWidth: 1.10,
        maxHeight: 1.50,
        internalDiameter: 0.50,
        externalDiameter: 0.90,
        instructions: "",
        createdAt: "2024-03-05T10:00:00Z",
        updatedAt: "2024-03-05T10:00:00Z",
        status: true
    },
    {
        id: 5,
        idCustomer: 2,
        name: "Sucursal Occidente",
        address: "Parque Industrial El Salto, Jal.",
        maxLoad: 1200.00,
        minLoad: 200.00,
        maxPieces: 30,
        prefDispatchPackagingID: 2,
        maxWidth: 1.10,
        maxHeight: 1.50,
        internalDiameter: 0.50,
        externalDiameter: 0.90,
        instructions: "",
        createdAt: "2024-03-12T16:40:00Z",
        updatedAt: "2024-03-20T09:00:00Z",
        status: false
    }
];

const platforms = [
    { 
        id: 1, 
        idConsignee: 1, 
        idProductLoad: 101,
        name: "Estándar 40x48 - Tratada HT", 
        description: "Madera Certificada, Cap.", 
        weight: 1500,
        dispatchPackaging: "Pallet Madera",
        internalDiameter: 0.00,
        externalDiameter: 0.00,
        width: 1.01,
        height: 0.15,
        piecesNumber: 1,
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
        status: true 
    }, 
    { 
        id: 2, 
        idConsignee: 2, 
        idProductLoad: 102,
        name: "Industrial Reforzada", 
        description: "Estándar 40x48 - Tratada HT", 
        weight: 2000,
        dispatchPackaging: "Rack Metálico",
        internalDiameter: 0.80,
        externalDiameter: 1.20,
        width: 1.20,
        height: 0.20,
        piecesNumber: 5,
        createdAt: "2024-02-15T11:30:00Z",
        updatedAt: "2024-02-18T09:00:00Z",
        status: true 
    }, 
    { 
        id: 3, 
        idConsignee: 3, 
        idProductLoad: 103,
        name: "Plástico Higiénica", 
        description: "HDPE, Grado alimenticio, Azul", 
        weight: 1700,
        dispatchPackaging: "Caja Cartón Reforzada",
        internalDiameter: 0.00,
        externalDiameter: 0.00,
        width: 1.00,
        height: 0.12,
        piecesNumber: 12,
        createdAt: "2024-03-05T08:00:00Z",
        updatedAt: "2024-03-05T08:00:00Z",
        status: false 
    }, 
    { 
        id: 4, 
        idConsignee: 4, 
        idProductLoad: 104,
        name: "Preestablecido 8", 
        description: "Rollos de aceros asegurados", 
        weight: 1300,
        dispatchPackaging: "Pallet Plástico",
        internalDiameter: 0.50,
        externalDiameter: 0.90,
        width: 1.10,
        height: 0.18,
        piecesNumber: 8,
        createdAt: "2024-03-10T14:20:00Z",
        updatedAt: "2024-03-12T16:45:00Z",
        status: true 
    }
];

const followUps = [
    { id: "ORD-88291", date: "24 Oct, 2023", weight: 12500, idConsignee: 1, status: "Entregado"},
    { id: "ORD-88305", date: "27 Oct, 2023", weight: 8000, idConsignee: 2, status: "En tránsito"},
    { id: "ORD-88291", date: "Hoy, 09:30", weight: 15000, idConsignee: 3, status: "Procesando"},
    { id: "ORD-88291", date: "Hoy, 09:30", weight: 15000, idConsignee: 3, status: "Procesando"},
    { id: "ORD-88291", date: "Hoy, 09:30", weight: 15000, idConsignee: 3, status: "Procesando"},
    { id: "ORD-88291", date: "Hoy, 09:30", weight: 15000, idConsignee: 3, status: "Procesando"},
    { id: "ORD-88291", date: "Hoy, 09:30", weight: 15000, idConsignee: 3, status: "Procesando"},
    { id: "ORD-88291", date: "Hoy, 09:30", weight: 15000, idConsignee: 3, status: "Procesando"},
    { id: "ORD-88291", date: "Hoy, 09:30", weight: 15000, idConsignee: 3, status: "Procesando"},
    { id: "ORD-88291", date: "Hoy, 09:30", weight: 15000, idConsignee: 3, status: "Procesando"},
];

const contacts = [
    { id: 1, idCustomer: 1, name: "Ricardo Morales", workstation: "Gerente de Compras", email: "r.morales@acerosind.com", phone: "+528188224433"},
    { id: 2, idCustomer: 1, name: "Sofia Garcia", workstation: "Coordinadora Logística", email: "s.garcia@acerosind.com", phone: "+52818822443"},
    { id: 3, idCustomer: 2, name: "Juan Lozano", workstation: "Gerente de Envíos", email: "j.lozano@acerosind.com", phone: "+528188674433"},
]

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

const roles = [
    {id: 1, rol: "Administrador"},
    {id: 2, rol: "Operador Logístico"},
    {id: 3, rol: "Gestión de Clientes"},
    {id: 4, rol: "Personalizado"},
]

const users = [
    {id: 1, idRol: 1, vistaCliente: false, nombre: "Juan", apellidoP: "Perez", apellidoM: "Ramírez", correo: "juanperez@gmail.com", contraseña: "juan123", estado: true },
    {id: 2, idRol: 2, vistaCliente: true, nombre: "María", apellidoP: "González", apellidoM: "López", correo: "maria.gonzalez@gmail.com", contraseña: "maria123", estado: true },
    {id: 3, idRol: 1, vistaCliente: false, nombre: "Carlos", apellidoP: "Hernández", apellidoM: "Soto", correo: "carlos.hdz@gmail.com", contraseña: "carlos123", estado: true },
    {id: 4, idRol: 3, vistaCliente: true, nombre: "Ana", apellidoP: "Martínez", apellidoM: "Ruiz", correo: "ana.mtz@gmail.com", contraseña: "ana123", estado: false },
    {id: 5, idRol: 2, vistaCliente: true, nombre: "Luis", apellidoP: "Torres", apellidoM: "Vega", correo: "luis.torres@gmail.com", contraseña: "luis123", estado: true },
    {id: 6, idRol: 1, vistaCliente: false, nombre: "Sofía", apellidoP: "Ramírez", apellidoM: "Cruz", correo: "sofia.ramirez@gmail.com", contraseña: "sofia123", estado: true },
    {id: 7, idRol: 3, vistaCliente: true, nombre: "Diego", apellidoP: "Flores", apellidoM: "Morales", correo: "diego.flores@gmail.com", contraseña: "diego123", estado: false },
    {id: 8, idRol: 2, vistaCliente: true, nombre: "Valeria", apellidoP: "Ortega", apellidoM: "Navarro", correo: "valeria.ortega@gmail.com", contraseña: "vale123", estado: true },
    {id: 9, idRol: 1, vistaCliente: false, nombre: "Jorge", apellidoP: "Castro", apellidoM: "Mendoza", correo: "jorge.castro@gmail.com", contraseña: "jorge123", estado: true },
    {id: 10, idRol: 3, vistaCliente: true, nombre: "Fernanda", apellidoP: "Silva", apellidoM: "Rojas", correo: "fernanda.silva@gmail.com", contraseña: "fer123", estado: true },
];

const entities = [
    {id: 1, name: "Cliente"},
    {id: 2, name: "Consignatario"},
    {id: 3, name: "Tarimas Aprovadas"},
    {id: 4, name: "Tarimas Rechazadas"},
    {id: 5, name: "Tarimas"},
    {id: 6, name: "Carga Tarima"},
    {id: 7, name: "Seguimiento Tarima"},
    {id: 8, name: "Productos"},
    {id: 9, name: "Usuarios"},
    {id: 10, name: "Permisos Usuario"},
]

const changes = [
    {
        id: 1,
        idEntityCatalog: 9,
        idEntity: 1,
        idUser: 1,
        originalValues: {
        "nombre": "Juan",
        "correo": "juan@mail.com",
        },
        changedValues: {
        "nombre": "Juan Carlos",
        "correo": "jcarlos@mail.com"
        },
        timeStamp:"2026-03-09T11:29:58Z"
    }
]

export {customers, consignees, platforms, followUps, products, users, changes, entities, roles, contacts, dispatchPackaging};