import { createProducto, getAllProductos, getProductoById, updateProducto } from './productos.service.js';

export async function createProductoHandler(req, res) {
    const data = req.body;

    if (!data.cliente_id || !data.nombre || !data.embalaje || data.calibre == null || data.espesor == null || !data.no_parte || data.largo == null || data.peso_unit == null || !data.familia || !data.estado) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    if (data.calibre <= 0 || data.espesor <= 0 || data.largo <= 0 || data.peso_unit <= 0) {
        return res.status(400).json({ message: "Los valores numéricos deben ser mayores a 0" });
    }

    try {
        const producto = await createProducto(data);
        res.status(201).json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el producto" });
    }
}

export async function getAllProductosHandler(req, res) {
    try {
        const productos = await getAllProductos();
        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los productos" });
    }
}

export async function getProductoByIdHandler(req, res) {
    const { id } = req.params;
    try {
        const producto = await getProductoById(id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.status(200).json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el producto" });
    }
}

export async function updateProductoHandler(req, res) {
    const { id } = req.params;
    const data = req.body;

    
    if (!data.cliente_id || !data.nombre || !data.embalaje || data.calibre == null || data.espesor == null || !data.no_parte || data.largo == null || data.peso_unit == null || !data.familia || !data.estado) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    if (data.calibre <= 0 || data.espesor <= 0 || data.largo <= 0 || data.peso_unit <= 0) {
        return res.status(400).json({ message: "Los valores numéricos deben ser mayores a 0" });
    }



    try {
        const producto = await updateProducto(id, data);
        res.status(200).json(producto);
    } catch (error) {
        if (error.message === "Producto no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el producto" });
    }
}
