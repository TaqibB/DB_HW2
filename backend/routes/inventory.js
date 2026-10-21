const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/inventory/:storeId
router.get("/:storeId", async (req, res) => {
    const storeId = Number(req.params.storeId);

    if (!Number.isSafeInteger(storeId) || storeId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid store ID"
        });
    }

    try {
        const result = await pool.query(`
            SELECT
                i.store_id,
                i.sku,
                p.name,
                p.price,
                p.taxable,
                p.by_weight,
                i.aisle_number,
                i.quantity
            FROM public.inventory AS i
            JOIN public.product AS p
                ON i.sku = p.sku
            WHERE i.store_id = $1
            ORDER BY p.name
            LIMIT 100
        `, [storeId]);

        res.json({
            success: true,
            store_id: storeId,
            count: result.rowCount,
            inventory: result.rows
        });

    } catch (error) {
        console.error("Error retrieving inventory:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve inventory"
        });
    }
});

module.exports = router;