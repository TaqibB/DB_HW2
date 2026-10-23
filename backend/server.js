const express = require("express");
const cors = require("cors");
const pool = require("./db");

// route imports
const storeRoutes = require("./routes/stores");
const productRoutes = require("./routes/products");
const inventoryRoutes = require("./routes/inventory");
const reportRoutes = require("./routes/reports");
const adminRoutes = require("./routes/admin");
const tableRoutes = require("./routes/tables");
const simulationRoutes = require("./routes/simulation");
const checkoutRoutes = require("./routes/checkout");

// create app that handles http req's
const app = express();


// middleware: enables express to interpret frontend JSONs
app.use(cors());
app.use(express.json());

// endpoint: enables express to return JSON response to...
// GET request to /api/health
app.get("/api/health", (req, res) => {
	res.json({
		success: true,
		message: "Supermarket backend running."
	
	});
});

// test PostgreSQL connection
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database(), NOW() AS server_time"
        );

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

const PORT = 3000;

// route registrations
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/db", adminRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/checkout", checkoutRoutes);

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});