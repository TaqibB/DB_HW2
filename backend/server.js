const express = require("express");
const cors = require("cors");

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

const PORT = 3000;

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});