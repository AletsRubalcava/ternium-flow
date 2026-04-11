import { DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";
import platforms from "../plaftforms/platforms.model.js"
import products from "../products/products.model.js"

const platform_items = sequelize.define("platform_items", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    id_platform: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
        model: "platforms",
        key: "id",
        },
    },
    id_product: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
        model: "products",
        key: "id",
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
        min: 1, // CHECK (quantity > 0)
        },
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: "platform_items",
    timestamps: false
});

platform_items.belongsTo(platforms, { foreignKey: "id_platform", onDelete: "CASCADE" });
platform_items.belongsTo(products, { foreignKey: "id_product", onDelete: "RESTRICT" });

platforms.belongsToMany(products, { 
    through: platform_items, 
    foreignKey: "id_platform",
    otherKey: "id_product",
    as: "loaded_products"
});

products.belongsToMany(platforms, { 
    through: platform_items, 
    foreignKey: "id_product",
    otherKey: "id_platform",
    as: "assigned_platforms"
});

export default platform_items;