CREATE TABLE state_tax (
    state CHAR(2) PRIMARY KEY,
    tax_rate NUMERIC(5,4) NOT NULL,
    CHECK (tax_rate >= 0 AND tax_rate <= 1)
);

CREATE TABLE store (
    store_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state CHAR(2) NOT NULL,
    zip VARCHAR(10) NOT NULL,

    FOREIGN KEY (state) REFERENCES state_tax(state)
);

CREATE TABLE aisle (
    store_id INTEGER NOT NULL,
    aisle_number INTEGER NOT NULL,
    category VARCHAR(100),

    PRIMARY KEY (store_id, aisle_number),
    FOREIGN KEY (store_id) REFERENCES store(store_id)
);

CREATE TABLE product (
    sku VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    taxable BOOLEAN NOT NULL,
    by_weight BOOLEAN NOT NULL,

    CHECK (price >= 0)
);

CREATE TABLE inventory (
    store_id INTEGER NOT NULL,
    sku VARCHAR(30) NOT NULL,
    aisle_number INTEGER NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 0,

    PRIMARY KEY (store_id, sku),

    FOREIGN KEY (store_id)
        REFERENCES store(store_id),

    FOREIGN KEY (sku)
        REFERENCES product(sku),

    FOREIGN KEY (store_id, aisle_number)
        REFERENCES aisle(store_id, aisle_number),

    CHECK (quantity >= 0)
);

CREATE TABLE customer (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20)
);

CREATE SCHEMA bank;

CREATE TABLE bank.bank_account (
    account_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,

    FOREIGN KEY (customer_id)
        REFERENCES public.customer(customer_id),

    CHECK (balance >= 0)
);

CREATE TABLE purchase (
    purchase_id INTEGER PRIMARY KEY,
    store_id INTEGER,
    customer_id INTEGER,
    purchase_date TIMESTAMP,
    total DECIMAL(10,2),
    payment_method VARCHAR(10),
    account_id INTEGER,

    FOREIGN KEY (store_id) REFERENCES store(store_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (account_id) REFERENCES bank.bank_account(account_id)
);

CREATE TABLE purchase_item (
    purchase_id INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    sku VARCHAR(30),
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    tax_amount DECIMAL(10,2),

    PRIMARY KEY (purchase_id, line_number),

    FOREIGN KEY (purchase_id)
        REFERENCES purchase(purchase_id),

    FOREIGN KEY (sku)
        REFERENCES product(sku)
);