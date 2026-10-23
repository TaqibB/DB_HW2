
const express = require("express");
const router = express.Router();

const fs = require("fs/promises");
const path = require("path");

const pool = require("../db");

// Locate the shared database folder
const DATABASE_DIR = path.join(
    __dirname,
    "../../database"
);

// Execute a trusted SQL script in a transaction
async function executeScript(filename) {
    const filePath = path.join(DATABASE_DIR, filename);

    const sql = await fs.readFile(filePath, "utf8");

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(sql);

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

// POST /api/db/init
router.post("/init", async (req, res) => {
    try {
        await executeScript("schema.sql");

        res.json({
            success: true,
            message: "Database tables created successfully"
        });

    } catch (error) {
        console.error("Initialization error:", error);

        res.status(500).json({
            success: false,
            message: "Database initialization failed"
        });
    }
});

// POST /api/db/seed
router.post("/seed", async (req, res) => {
    try {
        await executeScript("seed.sql");

        res.json({
            success: true,
            message: "Database seeded successfully"
        });

    } catch (error) {
        console.error("Seeding error:", error);

        res.status(500).json({
            success: false,
            message: "Database seeding failed"
        });
    }
});

// POST /api/db/reset
router.post("/reset", async (req, res) => {
    if (req.body?.confirm !== true) {
        return res.status(400).json({
            success: false,
            message: "Explicit confirmation required"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
            TRUNCATE TABLE
                public.purchase_item,
                public.purchase,
                public.inventory,
                bank.bank_account,
                public.customer,
                public.product,
                public.aisle,
                public.store,
                public.state_tax
            RESTART IDENTITY CASCADE
        `);

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "All application data cleared"
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Reset error:", error);

        res.status(500).json({
            success: false,
            message: "Database reset failed"
        });

    } finally {
        client.release();
    }
});

module.exports = router;
