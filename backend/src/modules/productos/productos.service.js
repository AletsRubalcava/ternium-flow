import Producto from "./productos.model.js";

export async function createProducto(data) {
    const producto = await Producto.create({
        cliente_id: data.cliente_id,
        nombre: data.nombre.trim(),
        embalaje: data.embalaje,
        calibre: data.calibre,
        espesor: data.espesor,
        no_parte: data.no_parte,
        largo: data.largo,
        peso_unit: data.peso_unit,
        familia: data.familia,
        estado: data.estado
    });
    return producto;
}

export async function getAllProductos() {
    const productos = await Producto.findAll();
    return productos;
}

export async function getProductoById(id) {
    const producto = await Producto.findByPk(id);
    return producto;
}

export async function updateProducto(id, data) {
    const producto = await Producto.findByPk(id);
    if (!producto) {
        throw new Error("Producto no encontrado");
    }

    await producto.update({
        cliente_id: data.cliente_id,
        nombre: data.nombre.trim(),
        embalaje: data.embalaje,
        calibre: data.calibre,
        espesor: data.espesor,
        no_parte: data.no_parte,
        largo: data.largo,
        peso_unit: data.peso_unit,
        familia: data.familia,
        estado: data.estado
    });

    return producto;
}
