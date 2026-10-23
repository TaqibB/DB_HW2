
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Report 1: Sales totals by store
router.get("/store-sales", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                s.store_id,
                s.name AS store_name,
                COUNT(p.purchase_id) AS purchase_count,
                COALESCE(SUM(p.total), 0) AS total_sales
            FROM public.store s
            LEFT JOIN public.purchase p
                ON s.store_id = p.store_id
            GROUP BY s.store_id, s.name
            ORDER BY total_sales DESC
        `);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Store sales report:", error.message);
        res.status(500).json({
            success: false,
            message: "Store sales report failed"
        });
    }
});

// Report 2: Best-selling products
router.get("/top-products", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                pr.sku,
                pr.name,
                COALESCE(SUM(pi.quantity), 0) AS quantity_sold,
                COALESCE(
                    SUM(pi.quantity * pi.unit_price), 0
                ) AS revenue
            FROM public.product pr
            LEFT JOIN public.purchase_item pi
                ON pr.sku = pi.sku
            GROUP BY pr.sku, pr.name
            ORDER BY quantity_sold DESC
        `);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Top products report:", error.message);
        res.status(500).json({
            success: false,
            message: "Top products report failed"
        });
    }
});

// Report 3: Low inventory by aisle
router.get("/low-stock", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                s.name AS store_name,
                a.aisle_number,
                a.category,
                pr.sku,
                pr.name AS product_name,
                i.quantity
            FROM public.inventory i
            JOIN public.store s
                ON i.store_id = s.store_id
            JOIN public.product pr
                ON i.sku = pr.sku
            JOIN public.aisle a
                ON i.store_id = a.store_id
                AND i.aisle_number = a.aisle_number
            WHERE i.quantity < 50
            ORDER BY s.store_id, a.aisle_number, i.quantity
        `);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Low-stock report:", error.message);
        res.status(500).json({
            success: false,
            message: "Low-stock report failed"
        });
    }
});

module.exports = router;
