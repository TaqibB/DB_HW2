
const express = require("express");
const router = express.Router();

const { processCheckout } = require("../services/checkoutService");

// POST /api/checkout/test
router.post("/test", async (req, res) => {
    try {
        const result = await processCheckout({
            storeId: 1,
            customerId: 1,
            accountId: req.body?.account_id ?? 1,
            paymentMethod: "CARD",
            items: [
                { sku: "1003", quantity: 1 },
                { sku: "1009", quantity: 2 }
            ]
        });

        res.json(result);

    } catch (error) {
        console.error("Checkout failed:", error.message);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
