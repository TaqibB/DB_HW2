
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Map frontend names to actual PostgreSQL tables
const allowedTables = {
    state_tax: "public.state_tax",
    store: "public.store",
    aisle: "public.aisle",
    inventory: "public.inventory",
    customer: "public.customer",
    product: "public.product",
    purchase_item: "public.purchase_item",
    purchase: "public.purchase",
    bank_account: "bank.bank_account"
};

// GET /api/tables/:selectedTable
router.get("/:selectedTable", async (req, res) => {
    const tableName = allowedTables[req.params.selectedTable];

    if (!tableName) {
        return res.status(400).json({
            success: false,
            message: "Invalid table selection"
        });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM ${tableName} LIMIT 20`
        );

        res.json({
            success: true,
            table: req.params.selectedTable,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Table browsing error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve table"
        });
    }
});

module.exports = router;
