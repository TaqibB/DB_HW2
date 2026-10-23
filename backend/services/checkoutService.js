
const pool = require("../db");

async function processCheckout({
    storeId,
    customerId = null,
    accountId = null,
    paymentMethod,
    items
}) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Validate the transaction inputs
        if (!Number.isSafeInteger(storeId) || storeId <= 0) {
            throw new Error("Invalid store ID");
        }

        if (!["CASH", "CARD"].includes(paymentMethod)) {
            throw new Error("Invalid payment method");
        }

        if (!Array.isArray(items) ||
            items.length < 1 || items.length > 100) {
            throw new Error("Checkout requires 1-100 items");
        }

        if (paymentMethod === "CARD" &&
            (!Number.isSafeInteger(customerId) ||
             !Number.isSafeInteger(accountId))) {
            throw new Error("Card payment requires customer and account");
        }

        // Combine repeated SKUs into one receipt line
        const quantities = new Map();

        for (const item of items) {
            if (
                typeof item.sku !== "string" ||
                !/^[A-Za-z0-9_-]{1,30}$/.test(item.sku) ||
                typeof item.quantity !== "number" ||
                !Number.isFinite(item.quantity) ||
                item.quantity <= 0 ||
                Math.round(item.quantity * 100) !== item.quantity * 100
            ) {
                throw new Error("Invalid product or quantity");
            }

            quantities.set(
                item.sku,
                (quantities.get(item.sku) || 0) + item.quantity
            );
        }

        // Lock inventory in a consistent order to reduce deadlocks
        const skus = [...quantities.keys()].sort();

        const inventoryResult = await client.query(`
            SELECT
                i.sku,
                i.quantity AS stock,
                p.name,
                p.price,
                p.taxable,
                p.by_weight,
                st.tax_rate
            FROM public.inventory i
            JOIN public.product p ON p.sku = i.sku
            JOIN public.store s ON s.store_id = i.store_id
            JOIN public.state_tax st ON st.state = s.state
            WHERE i.store_id = $1
              AND i.sku = ANY($2::varchar[])
            ORDER BY i.sku
            FOR UPDATE OF i
        `, [storeId, skus]);

        if (inventoryResult.rows.length !== skus.length) {
            throw new Error("One or more products unavailable");
        }

        const receiptItems = [];
        let subtotalCents = 0;
        let taxCents = 0;

        for (const product of inventoryResult.rows) {
            const quantity = quantities.get(product.sku);

            if (quantity > Number(product.stock)) {
                throw new Error(
                    `Insufficient inventory for ${product.name}`
                );
            }

            if (!product.by_weight && !Number.isInteger(quantity)) {
                throw new Error(
                    `${product.name} requires a whole-unit quantity`
                );
            }

            // Work in cents to avoid binary floating-point
            // errors when adding monetary amounts.
            const unitCents = Math.round(Number(product.price) * 100);
            const lineSubtotalCents = Math.round(unitCents * quantity);

            const lineTaxCents = product.taxable
                ? Math.round(
                    lineSubtotalCents * Number(product.tax_rate)
                )
                : 0;

            subtotalCents += lineSubtotalCents;
            taxCents += lineTaxCents;

            receiptItems.push({
                sku: product.sku,
                name: product.name,
                quantity,
                unit_price: (unitCents / 100).toFixed(2),
                tax_amount: (lineTaxCents / 100).toFixed(2)
            });
        }

        const subtotal = (subtotalCents / 100).toFixed(2);
        const total = ((subtotalCents + taxCents) / 100).toFixed(2);

        // Check bank ownership and available funds
        if (paymentMethod === "CARD") {
            const accountResult = await client.query(`
                SELECT balance
                FROM bank.bank_account
                WHERE account_id = $1
                  AND customer_id = $2
                FOR UPDATE
            `, [accountId, customerId]);

            if (accountResult.rows.length === 0) {
                throw new Error("Account not found for customer");
            }

            if (Number(accountResult.rows[0].balance) * 100 <
                subtotalCents + taxCents) {
                throw new Error("Insufficient bank balance");
            }
        }

        // Create purchase header
        const purchaseResult = await client.query(`
            INSERT INTO public.purchase
                (store_id, customer_id, purchase_date,
                 total, payment_method, account_id)
            VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)
            RETURNING purchase_id
        `, [
            storeId,
            customerId,
            total,
            paymentMethod,
            paymentMethod === "CARD" ? accountId : null
        ]);

        const purchaseId = purchaseResult.rows[0].purchase_id;

        // Insert receipt lines and update inventory
        for (let i = 0; i < receiptItems.length; i++) {
            const item = receiptItems[i];

            await client.query(`
                INSERT INTO public.purchase_item
                    (purchase_id, line_number, sku,
                     quantity, unit_price, tax_amount)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                purchaseId,
                i + 1,
                item.sku,
                item.quantity,
                item.unit_price,
                item.tax_amount
            ]);

            await client.query(`
                UPDATE public.inventory
                SET quantity = quantity - $1
                WHERE store_id = $2 AND sku = $3
            `, [item.quantity, storeId, item.sku]);
        }

        // Complete payment
        if (paymentMethod === "CARD") {
            await client.query(`
                UPDATE bank.bank_account
                SET balance = balance - $1
                WHERE account_id = $2
            `, [total, accountId]);
        }

        await client.query("COMMIT");

        return {
            success: true,
            purchase_id: purchaseId,
            store_id: storeId,
            customer_id: customerId,
            account_id: paymentMethod === "CARD" ? accountId : null,
            payment_method: paymentMethod,
            items: receiptItems,
            subtotal,
            total
        };

    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError);
        }
        throw error;

    } finally {
        client.release();
    }
}

module.exports = { processCheckout };
