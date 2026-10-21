BEGIN;

INSERT INTO purchase (
    purchase_id,
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
    1,
    CURRENT_TIMESTAMP,
    3.99,
    'CARD',
    1
);

INSERT INTO purchase_item (
    purchase_id,
    line_number,
    sku,
    quantity,
    unit_price,
    tax_amount
)
VALUES (
    1,
    1,
    '1003',
    1,
    3.99,
    0.00
);

UPDATE inventory
SET quantity = quantity - 1
WHERE store_id = 1
  AND sku = '1003';

UPDATE bank.bank_account
SET balance = balance - 3.99
WHERE account_id = 1;