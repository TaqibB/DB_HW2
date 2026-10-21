const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/reports/sales
// Rrevenue and purchase counts measured per store
router.get("/sales", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                s.store_id,
                s.name AS store_name,
                COUNT(p.purchase_id) AS total_purchases,
                COALESCE(SUM(p.total), 0) AS total_revenue
            FROM public.store AS s
            LEFT JOIN public.purchase AS p
                ON s.store_id = p.store_id
            GROUP BY s.store_id, s.name
            ORDER BY total_revenue DESC
        `);

        res.json({
            success: true,
            report: "sales_by_store",
            data: result.rows
        });

    } catch (error) {
        console.error("Sales report error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to generate sales report"
        });
    }
});

// GET /api/reports/products
// best selling products measured by revenue and quantity
router.get("/products", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                p.sku,
                p.name,
                COUNT(DISTINCT pi.purchase_id) AS purchase_count,
                COALESCE(SUM(pi.quantity), 0) AS units_sold,
                COALESCE(
                    SUM(pi.quantity * pi.unit_price),
                    0
                ) AS revenue
            FROM public.product AS p
            LEFT JOIN public.purchase_item AS pi
                ON p.sku = pi.sku
            GROUP BY p.sku, p.name
            ORDER BY revenue DESC
        `);

        res.json({
            success: true,
            report: "product_sales",
            data: result.rows
        });

    } catch (error) {
        console.error("Product report error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to generate product report"
        });
    }
});

// GET /api/reports/customers
// Purchase history for customers
router.get("/customers", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                c.customer_id,
                c.first_name,
                c.last_name,
                p.purchase_id,
                p.purchase_date,
                p.total,
                s.name AS store_name
            FROM public.customer AS c
            JOIN public.purchase AS p
                ON c.customer_id = p.customer_id
            JOIN public.store AS s
                ON p.store_id = s.store_id
            ORDER BY p.purchase_date DESC
            LIMIT 100
        `);

        res.json({
            success: true,
            report: "customer_purchases",
            data: result.rows
        });

    } catch (error) {
        console.error("Customer report error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to generate customer report"
        });
    }
});

module.exports = router;