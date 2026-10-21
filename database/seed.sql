INSERT INTO state_tax (state, tax_rate)
VALUES
    ('TX', 0.0825),
    ('CA', 0.0725),
    ('NY', 0.0400),
    ('FL', 0.0600);

INSERT INTO store (name, address, city, state, zip)
VALUES
    ('Supermarket Houston', '123 Main St', 'Houston', 'TX', '77002'),
    ('Supermarket Dallas', '456 Oak St', 'Dallas', 'TX', '75201'),
    ('Supermarket Los Angeles', '789 Pine St', 'Los Angeles', 'CA', '90001'),
    ('Supermarket Miami', '321 Palm St', 'Miami', 'FL', '33101'),
    ('Supermarket New York', '654 Broadway', 'New York', 'NY', '10001');


INSERT INTO aisle (store_id, aisle_number, category)
VALUES
    (1, 1, 'Produce'),
    (1, 2, 'Dairy'),
    (1, 3, 'Meat'),
    (1, 4, 'Frozen Foods'),
    (1, 5, 'Household'),

    (2, 1, 'Produce'),
    (2, 2, 'Dairy'),
    (2, 3, 'Meat'),
    (2, 4, 'Frozen Foods'),
    (2, 5, 'Household'),

    (3, 1, 'Produce'),
    (3, 2, 'Dairy'),
    (3, 3, 'Meat'),
    (3, 4, 'Frozen Foods'),
    (3, 5, 'Household'),

    (4, 1, 'Produce'),
    (4, 2, 'Dairy'),
    (4, 3, 'Meat'),
    (4, 4, 'Frozen Foods'),
    (4, 5, 'Household'),

    (5, 1, 'Produce'),
    (5, 2, 'Dairy'),
    (5, 3, 'Meat'),
    (5, 4, 'Frozen Foods'),
    (5, 5, 'Household');

INSERT INTO product (sku, name, price, taxable, by_weight)
VALUES
    ('1001', 'Apples', 1.49, FALSE, TRUE),
    ('1002', 'Bananas', 0.69, FALSE, TRUE),
    ('1003', 'Milk', 3.99, FALSE, FALSE),
    ('1004', 'Eggs', 4.49, FALSE, FALSE),
    ('1005', 'Chicken Breast', 8.99, FALSE, FALSE),
    ('1006', 'Ground Beef', 7.49, FALSE, FALSE),
    ('1007', 'Frozen Pizza', 5.99, FALSE, FALSE),
    ('1008', 'Ice Cream', 4.99, FALSE, FALSE),
    ('1009', 'Dish Soap', 3.49, TRUE, FALSE),
    ('1010', 'Paper Towels', 9.99, TRUE, FALSE);

INSERT INTO inventory (store_id, sku, aisle_number, quantity)
VALUES
    (1, '1001', 1, 100),
    (1, '1002', 1, 150),
    (1, '1003', 2, 50),
    (1, '1004', 2, 80),
    (1, '1005', 3, 40),
    (1, '1006', 3, 35),
    (1, '1007', 4, 60),
    (1, '1008', 4, 45),
    (1, '1009', 5, 70),
    (1, '1010', 5, 90);

INSERT INTO customer (first_name, last_name, email, phone)
VALUES
    ('John', 'Smith', 'john@example.com', '7135550101'),
    ('Sarah', 'Johnson', 'sarah@example.com', '2145550102'),
    ('Michael', 'Brown', 'michael@example.com', '3105550103'),
    ('Emily', 'Davis', 'emily@example.com', '3055550104'),
    ('David', 'Wilson', 'david@example.com', '2125550105');

INSERT INTO bank.bank_account (customer_id, balance)
VALUES
    (1, 500.00),
    (2, 750.00),
    (3, 1200.00),
    (4, 300.00),
    (5, 950.00);