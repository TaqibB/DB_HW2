
const URL = "http://localhost:3000/api/checkout/test";

// Replace 7 with the account_id returned by PostgreSQL
// This account should have exactly $15.00.
const TEST_ACCOUNT_ID = 7;

async function runTest() {
    console.log("Starting two simultaneous checkouts...\n");

    const requests = [1, 2].map(async (number) => {
        try {
            const response = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    account_id: TEST_ACCOUNT_ID
                })
            });

            const data = await response.json();

            return {
                request: number,
                status: response.status,
                success: data.success,
                purchase_id: data.purchase_id ?? null,
                message: data.message ?? null
            };

        } catch (error) {
            return {
                request: number,
                status: null,
                success: false,
                purchase_id: null,
                message: error.message
            };
        }
    });

    // Execute both checkout requests concurrently
    const results = await Promise.all(requests);

    console.table(results);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Successful checkouts: ${successful}`);
    console.log(`Failed checkouts: ${failed}`);

    if (successful === 1 && failed === 1) {
        console.log("PASS: Only one checkout succeeded.");
    } else {
        console.log("TEST FAILED: Unexpected checkout results.");
    }
}

runTest();
