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

async function postData(endpoint, payload = {}) {
    try{
        const res = await fetch(`${BASE}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        data = await res.json();

        if(!res.ok)
            throw new Error(data.error || data.message || `Request failed (${res.status})`);
        return data;
    } catch (err) {
        console.error(`Error on POST / ${endpoint}:`, err.message);
        throw err;
    }
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
    // state: {
    //     label: "State Code",
    //     attrs:{
    //         type: "text",
    //         name: "state",
    //         maxlength: "2",
    //         minlength: "2",
    //         pattern: "[A-Za-z]{2}",
    //         placeholder: "TX",
    //         required: true
    //     },
    //     onInput: function(){
    //         $(this).val($(this).val().replace(/[^a-zA-Z]/g, '').toUpperCase());
    //     }
    // }

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

    container.empty();

    if(!selectedTable || !tableSchemas[selectedTable])
        return;
    
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
    // schema = manFieldSchemas[selectedKey];
    // inputId = `input_${selectedKey}`;

    // wrapper = $("<div>", { class : "form-group"});
    // label = $("<label>", {for: inputId, text: schema.label});
    // input = $("<input>", {id: inputId, ...schema.attrs});

    // if(typeof schema.onInput === "function")
    //     input.on("input", schema.onInput);
    // if(typeof schema.onKeydown === "function")
    //     input.on("keydown", schema.onKeydown);

    // wrapper.append(label, input);
    // container.append(wrapper);
    // input.trigger("focus");
    container.find("input, select").first().trigger("focus");
}

$(function(){
    outputLog = $("#outputLog");

    $("#healthCheck").on("click", async () => {
        outputLog.text("Checking server health...");
        try{
            const result = await checkHealth();
            outputLog.text(JSON.stringify(result, null, 2));
        } catch (err){
            outputLog.text(`Server Unreachable: ${err.message}`);
        }
    });


    $("#tableSelect").on("change", manEnterCase);
});