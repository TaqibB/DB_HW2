
const express = require("express");
const router = express.Router();
const pool = require("../db");

const {
    processCheckout
} = require("../services/checkoutService");

// Random integer between min and max, inclusive
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// POST /api/simulation/checkout
router.post("/checkout", async (req, res) => {
    try {
        const body = req.body || {};

        const storeId = body.store_id ?? 1;
        const itemCount = body.item_count ?? randomInt(10, 20);
        const paymentMethod = body.payment_method ?? "CARD";

        if (!Number.isSafeInteger(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID"
            });
        }

        if (!Number.isSafeInteger(itemCount) ||
            itemCount < 10 || itemCount > 20) {
            return res.status(400).json({
                success: false,
                message: "Item count must be between 10 and 20"
            });
        }

        if (!["CARD", "CASH"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
            });
        }

        let customerId = body.customer_id ?? null;
        let accountId = body.account_id ?? null;

        // Choose a valid bank account when paying by card
        if (paymentMethod === "CARD") {
            const accountResult = await pool.query(`
                SELECT account_id, customer_id
                FROM bank.bank_account
                WHERE ($1::integer IS NULL
                       OR customer_id = $1)
                  AND ($2::integer IS NULL
                       OR account_id = $2)
                ORDER BY random()
                LIMIT 1
            `, [customerId, accountId]);

            if (accountResult.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No matching bank account found"
                });
            }

            const account = accountResult.rows[0];
            customerId = account.customer_id;
            accountId = account.account_id;
        } else {
            accountId = null;
        }

        // Retrieve available products at the selected store
        const inventoryResult = await pool.query(`
            SELECT
                i.sku,
                i.quantity AS stock,
                p.name,
                p.by_weight
            FROM public.inventory i
            JOIN public.product p
                ON i.sku = p.sku
            WHERE i.store_id = $1
              AND i.quantity > 0
            ORDER BY i.sku
        `, [storeId]);

        const products = inventoryResult.rows;

        if (products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No inventory available at this store"
            });
        }

        // Generate random selections, allowing repeated SKUs
        const quantities = new Map();

        for (let i = 0; i < itemCount; i++) {
            const eligible = products.filter(p => {
                const alreadySelected = quantities.get(p.sku) || 0;
                const minimum = p.by_weight ? 0.25 : 1;

                return Number(p.stock) - alreadySelected >= minimum;
            });

            if (eligible.length === 0) {
                break;
            }

            const product = eligible[randomInt(0, eligible.length - 1)];
            const alreadySelected = quantities.get(product.sku) || 0;
            const remaining = Number(product.stock) - alreadySelected;

            let quantity;

            if (product.by_weight) {
                // Generate quantities in 0.25-weight-unit increments
                const maxSteps = Math.min(
                    8,
                    Math.floor((remaining + 1e-9) * 4)
                );

                quantity = randomInt(1, maxSteps) / 4;
            } else {
                quantity = randomInt(
                    1,
                    Math.min(2, Math.floor(remaining))
                );
            }

            quantities.set(
                product.sku,
                Math.round((alreadySelected + quantity) * 100) / 100
            );
        }

        const items = Array.from(quantities, ([sku, quantity]) => ({
            sku,
            quantity
        }));

        if (items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Unable to generate checkout items"
            });
        }

        // Execute the actual atomic database transaction
        const receipt = await processCheckout({
            storeId,
            customerId,
            accountId,
            paymentMethod,
            items
        });

        // Match the frontend's expected response format
        return res.json({
            success: true,
            simulations: [receipt]
        });

    } catch (error) {
        console.error("Simulation error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
