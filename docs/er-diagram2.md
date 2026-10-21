// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs


Table state_tax{
  state CHAR(2) [primary key]
  tax_rate DECIMAL(5, 4)
}

Table store{
  store_id integer [primary key]
  state char(2) [ref: >? state_tax.state]
  name varchar(100)
  address varchar(200)
  city varchar(100)
  zip varchar(10)
}

Table aisle{
  store_id integer [pk, ref: >? store.store_id]
  aisle_number integer [pk]
  category varchar(100)
  
}

Table product{
  sku varchar(30) [pk]
  name varchar(100)
  price decimal(10, 2)
  taxable boolean
  by_weight boolean
}

Table inventory{
  store_id integer [pk]
  sku varchar(30) [pk, ref: >? product.sku]
  aisle_number integer
  quantity decimal (10, 2)
}

Ref: inventory.(store_id, aisle_number) >? aisle.(store_id, aisle_number)

Table customer{
  customer_id integer [pk]
  first_name varchar(50)
  last_name varchar(50)
  email varchar(100)
  phone varchar(20)
}

Table purchase{
  purchase_id integer [pk]
  store_id integer [ref: >? store.store_id]
  customer_id integer [ref: ?>? customer.customer_id]
  purchase_date timestamp
  total decimal(10, 2)
  payment_method varchar(10)
  account_id integer [ref: ?>? bank.bank_account.account_id]
}

Table purchase_item{
  purchase_id integer [pk, ref: > purchase.purchase_id]
  line_number integer [pk]
  sku varchar(30) [ref: >? product.sku]
  quantity decimal(10, 2)
  unit_price decimal(10, 2)
  tax_amount decimal(10, 2)
}

Table bank.bank_account{
  account_id integer [pk]
  customer_id integer [ref: >?customer.customer_id]
  balance decimal(12, 2)
}

