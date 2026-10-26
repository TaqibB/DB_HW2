BEGIN;

DO $$
DECLARE
    new_purchase_id INTEGER;
BEGIN

    -- Check inventory and decrease stock
    UPDATE inventory
    SET quantity = quantity - 1
    WHERE store_id = 1
      AND sku = '1003'
      AND quantity >= 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient inventory';
    END IF;

    -- Check balance and deduct payment
    UPDATE bank.bank_account
    SET balance = balance - 3.99
    WHERE account_id = 1
      AND customer_id = 1
      AND balance >= 3.99;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient funds or invalid account';
    END IF;

    -- Create purchase and get ID
    INSERT INTO purchase (
        store_id,
        customer_id,
        purchase_date,
        total,
        payment_method,
        account_id
    )
    VALUES (
        1,
        1,
        CURRENT_TIMESTAMP,
        3.99,
        'CARD',
        1
    )
    RETURNING purchase_id INTO new_purchase_id;

    -- Use ID for the purchased product
    INSERT INTO purchase_item (
        purchase_id,
        line_number,
        sku,
        quantity,
        unit_price,
        tax_amount
    )
    VALUES (
        new_purchase_id,
        1,
        '1003',
        1,
        3.99,
        0.00
    );

END $$;

COMMIT;
