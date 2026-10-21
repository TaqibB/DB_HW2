const BASE = "http://localhost:3000/api";
async function checkHealth(){
    try{
        const res = await fetch(`${BASE}/health`);
        if(!res.ok)
            throw new Error(`HTTP error: ${res.status}`);
        data = await res.json();
        console.log("Health Check Response:", data);
        return data;
    } catch (err) {
        console.error("Health check failed:", err.message);
        throw err;
    }
}

async function checkDB(){
    try{
        const res = await fetch(`${BASE}/db-test`);
        if(!res.ok)
            throw new Error(`Database error: ${res.status}`);
        data = await res.json();
        console.log("Health Check Response:", data);
        return data;
    } catch (err) {
        console.error("Health check failed:", err.message);
        throw err;
    }
}

async function sendRequest(endpoint, method = "GET", payload = null){
    const options = {
        method,
        headers: {"Content-Type": "applications/json"}
    };
    if(payload && method !== "GET")
        options.body = JSON.stringify(payload);

    res = await fetch (`${BASE}/${endpoint}`, options);
    data = await res.json();

    if(!res.ok)
        throw new Error(data.error || data.message || `Request failed (${res.status})`)
    return data;
}

function renderTable(rows) {
    tableHeadRow.empty();
    tableBody.empty();

    if(!rows || rows.length === 0){
        tableBody.append("<tr><td colspan = `100%`>No data returned</td></tr>");
        return;
    }

    headers = Object.keys(rows[0]);
    headers.forEach((h) => {
        tableHeadRow.append($("<th>").text(h));
    });

    rows.forEach((row) => {
        tr = $("<tr>");
        headers.forEach((h) => {
            tr.append($("<td>").text(row[h] !== null ? row[h] : "NULL"));
        });
        tableBody.append(tr);
    });
}

const dataTypes = {
    VARCHAR: (max = 100, required = true) => ({
        attrs: {
            type: "text",
            maxlength: String(max),
            required
        }
    }),

    DECIMAL_12_2: (min = "0.00", max = "9999999999.99") => ({
        attrs: {
            type: "number",
            step: "0.01",
            min: String(min),
            max: String(max),
            placehoolder: "0.00",
            required: true
        }
    }),

    CHAR: (length = 2, uppercase = true) => ({
        attrs: {
            type: "text",
            maxlength: String(length),
            minlength: String(length),
            pattern: `[A-Za-z]{${length}}`,
            required: true
        },
        onInput: uppercase
            ? function() {
                $(this).val($(this).val().replace(/[^a-zA-Z]/g, "").toUpperCase()); }
                : null
    }),

    INT:  (min = "1", max = "2147483647") => ({
        attrs: {
            type: "number",
            step: "1",
            min: String(min),
            max: String(max),
            required: true
        },
        onKeydown: function(e){
            if([".", "e", "E", "+", "-"].includes(e.key))
                e.preventDefault();
        }
    }),

    DECIMAL_5_4: (min = "-9.9999", max = "9.9999") => ({
        attrs: {
            type: "number",
            step: "0.0001",
            min: String(min),
            max: String(max),
            placeholder: "0.0000",
            required: true
        }
    }),

    TIMESTAMP: (required = true) => ({
        attrs: {
            type: "datetime-local",
            step: "1",
            required
        }
    }),

    BOOLEAN: (required = true) => ({
        isSelect: true,
        options: [
            { value: "", label: "-- Select --"},
            { value: "true", label: "True"},
            { value: "false", label: "False"}
        ],
        attrs: {
            required
        }
    }),

    PHONE: (required = true) => ({
        attrs: {
            type: "tel",
            placeholder: "555-555-5555",
            maxlength: "12",
            pattern: "\\d{3}-\\d{3}-\\d{4}",
            required
        },
        onInput: function(){
            let val = $(this).val().replace(/\D/g, "").substring(0, 10);
            if(val.length > 10)
                val = val.substring(0, 10);
            
            let formatted = "";
            if(val.length > 6){
                formatted = `${val.substring(0, 3)}-${val.substring(3, 6)}-${val.substring(6)}`;
            } else if(val.length > 3){
                formatted = `${val.substring(0, 3)}-${val.substring(3)}`;
            } else {
                formatted = val;
            }

            $(this).val(formatted);
        }
    }),

    EMAIL: (max = 100, required = true) => ({
        attrs: {
            type: "email",
            maxlength: String(max),
            placeholder: "user@domain.com",
            required
        }
    })
};

const manFieldSchemas = {
    //Decimals
    taxRate: {label: "Tax Rate", ...dataTypes.DECIMAL_5_4("0.0000", "1.0000")},
    balance: {label: "Balance", ...dataTypes.DECIMAL_12_2("-9999999999.99")},
    price: {label: "Price", ...dataTypes.DECIMAL_12_2()},
    total: {label: "Total", ...dataTypes.DECIMAL_12_2()},
    quantity: {label: "Quantity", ...dataTypes.DECIMAL_12_2()},
    unitPrice: {label: "Unit Price", ...dataTypes.DECIMAL_12_2()},
    taxAmount: {label: "Tax Amount", ...dataTypes.DECIMAL_12_2()}, 

    //Integers
    storeId: {label: "Store ID", ...dataTypes.INT()},
    aisleNumber: {label: "Aisle Number", ...dataTypes.INT()},
    purchaseId: {label: "Purchase ID", ...dataTypes.INT()},
    lineNumber: {label: "Line Number", ...dataTypes.INT()},
    customerId: {label: "Customer ID", ...dataTypes.INT()},
    accountId: {label: "Account ID", ...dataTypes.INT()}, 
    
    //Contacts & Strings
    firstName: {label: "First Name", ...dataTypes.VARCHAR(50)},
    lastName: {label: "Last Name", ...dataTypes.VARCHAR(50)},
    email: {label: "Email Address", ...dataTypes.EMAIL(120)},
    phone: {label: "Phone Number", ...dataTypes.PHONE()},
    state: {label: "State Code", ...dataTypes.CHAR(2)},

    name: {label: "Name", ...dataTypes.VARCHAR(100)},
    address: {label: "Address", ...dataTypes.VARCHAR(200)},
    city: {label: "City", ...dataTypes.VARCHAR(100)},
    zip: {label: "Zip Code", ...dataTypes.VARCHAR(10)},
    category: {label: "Category", ...dataTypes.VARCHAR(100)},
    sku: {label: "SKU", ...dataTypes.VARCHAR(30)},
    paymentMethod: {label: "Payment Method", ...dataTypes.VARCHAR(10)},

    //System Fields
    purchaseDate: {label: "Purchase Date", ...dataTypes.TIMESTAMP()},
    taxable: {label: "Taxable", ...dataTypes.BOOLEAN()},
    byWeight: {label: "By Weight", ...dataTypes.BOOLEAN()}
};

const tableSchemas = {
    stateTax: ["state", "taxRate"],
    store: ["storeId", "state", "name", "address", "city", "zip"],
    aisle: ["storeId", "aisleNumber", "category"],
    inventory: ["storeId", "sku", "aisleNumber", "quantity"],
    customer: ["customerId", "firstName", "lastName", "email", "phone"],
    product: ["sku", "name", "price", "taxable", "byWeight"],
    purchaseItem: ["purchaseId", "lineNumber", "sku", "quantity", "unitPrice", "taxAmount"],
    purchase: ["purchaseId", "storeId", "customerId", "purchaseDate", "total", "paymentMethod", "accountId"],
    bankAccount: ["accountId", "customerId", "balance"]
};

// $("#tableSelect").on("change", function(){
//     selectedKey = $(this).val();
//     container = $("#tableContainer");

//     console.log(`changed key with ${selectedKey}`);
// });

function manEnterCase(){
    selectedTable = $(this).val();
    container = $("#tableContainer");
    submitBtn = $("#submitCustomCase");

    container.empty();

    if(!selectedTable || !tableSchemas[selectedTable]){
        submitBtn.hide();
        return;
    }
    
    submitBtn.show();

    reqCols = tableSchemas[selectedTable];

    reqCols.forEach((colKey) => {
        col = manFieldSchemas[colKey];
        
        if(!col)
            return;

        inputId = `field_${selectedTable}_${colKey}`;

        wrapper = $("<div>", { class : "form-group"});
        label = $("<label>", {for: inputId, text: col.label});
        // input = $("<input>", {id: inputId, ...col.attrs});
        let field;

        if(col.isSelect){
            field = $("<select>", {id: inputId, name: colKey, ...col.attrs});
            col.options.forEach((opt) => {
                field.append($("<option>", {value: opt.value, text: opt.label}));
            });
        } else {
            field = $("<input>", {id: inputId, name: colKey, ...col.attrs});

            if(typeof col.onInput === "function")
                field.on("input", col.onInput);
            if(typeof col.onKeydown === "function")
                field.on("keydown", col.onKeydown);
        }


        wrapper.append(label, field);
        container.append(wrapper);
    });
    container.find("input, select").first().trigger("focus");
}

$(function(){ 
    const outputLog = $("#outputLog");
    const tableHeadRow = $("#tableHeadRow");
    const tableBody = $("#tableBody");

    //--Connection Status & DB Control

    $("#healthCheck").on("click", async () => {
        outputLog.text("Checking server health...");
        try{
            const result = await checkHealth();
            outputLog.text(JSON.stringify(result, null, 2));
        } catch (err){
            outputLog.text(`Server Unreachable: ${err.message}`);
        }
    });

    $("#dbCheck").on("click", async () => {
        outputLog.text("Checking database connection...");
        try{
            const result = await checkDB();
            outputLog.text(JSON.stringify(result, null, 2));
        } catch (err) {
            outputLog.text(`Database Unreachable: ${err.message}`);
        }
    });


    $("#initTables").on("click", async () => {
        outputLog.text("Initializaing tables...");
        try{
            const res = await sendRequest("db/init", "POST");
            outputLog.text(JSON.stringify(res, null, 2));
        } catch (err){
            outputLog.text(`Init Error: ${err.message}`);
        }
    });

    $("#randomInit").on("click", async () => {
        outputLog.text("Seeding baseline data...");
        try{
            const res = await sendRequest("db/seed", "POST");
            outputLog.test(JSON.stringify(res, null, 2));
        } catch (err) {
            outputLog.text(`Seed Error: ${err.message}`);
        }
    });

    $("#tableSelect").on("change", manEnterCase);

    $("#submitCustomCase").on("click", async () => {
        selectedTable = $("#tableSelect").val();
        
        if(!selectedTable || !tableSchemas[selectedTable]){
            outputLog.text("Error: Select a valid table first");
            return;
        }

        reqCols = tableSchemas[selectedTable];
        payload = {};
        validationError = null;

        reqCols.forEach((colKey) => {
            if(validationError)
                return;

            col = manFieldSchemas[colKey];
            inputId = `#field_${selectedTable}_${colKey}`;
            el = $(inputId);
            val = el.val();

            if(col.attrs && col.attrs.required && (val === "" || val === null)){
                validationError = `Field "${col.label || colKey}" is required`;
                el.trigger("focus");
                return;
            }

            if(val === "" || val === null){
                payload[colKey] = null;
            } else if (col.type === "INT"){
                payload[colKey] = parseInt(val, 10);
            } else if(col.type === "DECIMAL") {
                payload[colKey] = parseFloat(val);
            } else if(col.type === "BOOLEAN"){
                payload[colKey] = val === "true" || val === true;
            } else{
                payload[colKey] = val;
            }
        });

        if(validationError){
            outputLog.text(`Validation Failed: ${validationError}`);
            return;
        }

        outputLog.text(`Submitting new row to "${selectedTable}"...`);

        try{
            const res = await sendRequest(`tables/${selectedTable}`, "POST", payload);
            outputLog.text(`Row Inserted Successfully:\n${JSON.stringify(res, null, 2)}`);
        } catch (err) {
            outputLog.text(`Insert Failed: ${err.message}`);
        }


    });
    

    $("#dropTables").on("click", async () => {
        outputLog.text("Dropping tables...");
        try{
            const res = await sendRequest("db/drop", "POST");
            outputLog.text(JSON.stringify(res, null, 2));
            tableHeadRow.empty();
            tableBody.empty();
        } catch (err){
            outputLog.text(`Drop Error: ${err.message}`);
        }
    });

    //--OLTP Simulation

    $("#btnRunSim").on("click", async () => {
        storeIdVal = $("#simStoreId").val();
        custIdVal = $("#simCustId").val();
        accountIdVal = $("simAcctId").val();

        payload = {
            store_id: storeIdVal ? parseInt(storeIdVal, 10) : 1,
            customer_id: custIdVal ? parseInt(cusIdVal, 10) : null,
            account_id: accountIdVal ? parseInt(accountIdVal, 10) : null
        };

        try{
            const res = await sendRequest("simulation/checkout", "POST", payload);
            outputLog.text(`Checkout Successful:\n${JSON.stringify(res, null, 2)}`);
        } catch (err){
            outputLog.text(`Checkout Failed (OLTP Contrainst/Error):\n${err.message}`);
        }
    });

    //--Analytical Report Views

    async function report(endpoint) {
        outputLog.text(`Fetching report: ${endpoint}...`);
        try{
            const res = await sendRequest(`reports/${endpoint}`, "GET");
            outputLog.text(`Successful Query. Retrieved ${res.data ? res.data.length : 0} rows.`);
            renderTable(res.data);
        } catch (err){
            outputLog.text(`Report Error: ${err.message}`);
            tableHeadRow.empty();
            tableBody.empty();
        }
    }

    $("#btnReportStoreSales").on("click", () => report("store-sales"));
    $("#btnReportTopProducts").on("click", () => report("top-products"));
    $("#btnReportInventoryLevels").on("click", () => report("low-stock"));



});