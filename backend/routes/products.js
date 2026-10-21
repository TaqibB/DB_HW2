const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/products
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT sku, name, price, taxable, by_weight
            FROM public.product
            ORDER BY name
            LIMIT 100
        `);

        res.json({
            success: true,
            count: result.rowCount,
            products: result.rows
        });

    } catch (error) {
        console.error("Error retrieving products:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve stores"
        });
    }
});

module.exports = router;