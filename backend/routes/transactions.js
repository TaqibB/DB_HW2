
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/transactions/history
router.get("/history", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                p.purchase_id,
                p.store_id,
                s.name AS store_name,
                p.customer_id,
                c.first_name,
                c.last_name,
                p.purchase_date,
                p.payment_method,
                p.account_id,
                p.total
            FROM public.purchase p
            JOIN public.store s
                ON p.store_id = s.store_id
            LEFT JOIN public.customer c
                ON p.customer_id = c.customer_id
            ORDER BY p.purchase_date DESC, p.purchase_id DESC
            LIMIT 100
        `);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Transaction history error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve transaction history"
        });
    }
});

module.exports = router;
