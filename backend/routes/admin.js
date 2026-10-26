
const express = require("express");
const router = express.Router();

const fs = require("fs/promises");
const path = require("path");
const pool = require("../db");

const DATABASE_DIR = path.join(__dirname, "../../database");

// Only our application's tables are included here.
// Order matters for dropping tables with foreign keys.
const DROP_TABLES_SQL = `
    DROP TABLE IF EXISTS
        public.purchase_item,
        public.purchase,
        public.inventory,
        bank.bank_account,
        public.aisle,
        public.product,
        public.store,
        public.customer,
        public.state_tax
    CASCADE;
`;

// Used by Seed and Reset.
// TRUNCATE clears data but preserves table definitions.
const CLEAR_DATA_SQL = `
    TRUNCATE TABLE
        public.purchase_item,
        public.purchase,
        public.inventory,
        bank.bank_account,
        public.aisle,
        public.product,
        public.store,
        public.customer,
        public.state_tax
    RESTART IDENTITY CASCADE;
`;

async function readScript(filename) {
    return fs.readFile(
        path.join(DATABASE_DIR, filename),
        "utf8"
    );
}

// POST /api/db/init
router.post("/init", async (req, res) => {
    let client;

    try {
        const schemaSQL = await readScript("schema.sql");

        client = await pool.connect();
        await client.query("BEGIN");

        // Remove existing application tables.
        await client.query(DROP_TABLES_SQL);

        // schema.sql currently uses CREATE SCHEMA bank,
        // so remove the now-empty bank schema as well.
        // This intentionally does NOT use CASCADE.
        await client.query("DROP SCHEMA IF EXISTS bank");

        // Recreate tables and foreign keys.
        await client.query(schemaSQL);

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Database tables recreated successfully"
        });

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK").catch(console.error);
        }

        console.error("Database init error:", error);

        res.status(500).json({
            success: false,
            message: "Database initialization failed"
        });

    } finally {
        if (client) client.release();
    }
});

// POST /api/db/seed
router.post("/seed", async (req, res) => {
    let client;

    try {
        const seedSQL = await readScript("seed.sql");

        client = await pool.connect();
        await client.query("BEGIN");

        // Clear old data and reset generated IDs.
        await client.query(CLEAR_DATA_SQL);

        // Populate with the original sample records.
        await client.query(seedSQL);

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Database cleared and seeded successfully"
        });

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK").catch(console.error);
        }

        console.error("Database seed error:", error);

        res.status(500).json({
            success: false,
            message: "Database seeding failed"
        });

    } finally {
        if (client) client.release();
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

    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        await client.query(CLEAR_DATA_SQL);

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "All application data cleared"
        });

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK").catch(console.error);
        }

        console.error("Database reset error:", error);

        res.status(500).json({
            success: false,
            message: "Database reset failed"
        });

    } finally {
        if (client) client.release();
    }
});

module.exports = router;
