// GET /api/platforms/:id/visualization
// Devuelve el JSON que Unity consume para generar la simulación 3D.

import { Router } from "express";
import platforms      from "./platforms.model.js";
import products       from "../products/products.model.js";
// ↓ CRÍTICO: aunque no se use directamente, este import registra
//   las asociaciones belongsToMany en ambos modelos.
//   Sin él, platform.loaded_products no existe.
import platform_items from "../platform_items/platform_items.model.js";

const router = Router();

router.get("/platforms/:id/visualization", async (req, res) => {
    const { id } = req.params;

    if (!id || id === "null") {
        return res.status(400).json({ error: "INVALID_ID" });
    }

    try {
        const platform = await platforms.findByPk(req.params.id);

        if (!platform) {
            return res.status(404).json({ error: "Platform no encontrada" });
        }

        // Query directo a platform_items para garantizar la quantity correcta
        const items = await platform_items.findAll({
            where: { id_platform: req.params.id },
            include: [
                {
                    model: products,
                    as: "product",  // belongsTo definido en platform_items.model.js
                    attributes: [
                        "id",
                        "name",
                        "part_number",
                        "internal_diameter",
                        "external_diameter",
                        "width",
                    ],
                    required: true,
                },
            ],
        });

        if (items.length === 0) {
            return res.status(200).json({
                anchoCamion: parseFloat(platform.width),
                largoCamion: parseFloat(platform.length),
                grupos: [],
                _warning: "Esta platform no tiene productos asociados",
            });
        }

        const grupos = items.map((item) => {
            const product = item.product;

            return {
                numeroPiezas:    item.quantity,
                diametroInterno: parseFloat(product.internal_diameter),
                diametroExterno: parseFloat(product.external_diameter),
                anchoRollo:      parseFloat(product.width),
                _id:             product.id,
                _nombre:         product.name,
                _partNumber:     product.part_number,
            };
        });

        return res.json({
            anchoCamion: parseFloat(platform.width),
            largoCamion: parseFloat(platform.length),
            grupos,
        });

    } catch (error) {
        console.error("[visualization] Error completo:", error);
        return res.status(500).json({
            error:   "Error al generar datos de visualización",
            detalle: error.message,
        });
    }
});

router.get("/products/:id/visualization", async (req, res) => {
    try {
        const product = await products.findByPk(req.params.id, {
            attributes: [
                "part_number",
                "internal_diameter",
                "external_diameter",
                "width",
            ],
        });

        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        return res.json({
            partNumber:      product.part_number,
            diametroInterno: parseFloat(product.internal_diameter),
            diametroExterno: parseFloat(product.external_diameter),
            anchoRollo:      parseFloat(product.width),
        });

    } catch (error) {
        console.error("[product visualization] Error:", error);
        return res.status(500).json({
            error:   "Error al generar datos de visualización",
            detalle: error.message,
        });
    }
});


export default router;