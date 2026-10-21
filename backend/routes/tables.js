
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Only allow specific tables
// apparently this needs to be done to avoid SQL injection or something idk.
const allowedTables = {
    stores: "public.store",
    aisles: "public.aisle",
    products: "public.product",
    inventory: "public.inventory",
    customers: "public.customer",
    purchases: "public.purchase",
    purchase_items: "public.purchase_item",
    state_tax: "public.state_tax",
    bank_accounts: "bank.bank_account"
};

// GET /api/tables/:selectedTable
router.get("/:selectedTable", async (req, res) => {
    const selectedTable = req.params.selectedTable;
    const tableName = allowedTables[selectedTable];

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
            table: selectedTable,
            count: result.rows.length,
            rows: result.rows
        });

    } catch (error) {
        console.error("Table browsing error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve table records"
        });
    }
});

module.exports = router;
