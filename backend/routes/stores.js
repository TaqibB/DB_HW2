const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/stores
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT store_id, name, address, city, state, zip
            FROM public.store
            ORDER BY store_id
            LIMIT 100
        `);

        res.json({
            success: true,
            count: result.rowCount,
            stores: result.rows
        });

    } catch (error) {
        console.error("Error retrieving stores:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve stores"
        });
    }
});

module.exports = router;