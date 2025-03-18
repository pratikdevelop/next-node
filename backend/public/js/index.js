let customers = [];
let categories = [];
let products = [];
let totalAmount = 0;

// Fetch initial data
const loadData = async () => {
    try {
        const [customerResponse, categoryResponse] = await Promise.all([
            axios.get('/api/customers'),
            axios.get('/api/categories')
        ]);
        customers = customerResponse.data.response;
        categories = categoryResponse.data.response;

        populateCustomers();
        populateCategories();
    } catch (error) {
        console.error("Error loading data:", error);
    }
};

// Populate customers
const populateCustomers = () => {
    const customerSelect = document.getElementById("customer");
    customerSelect.innerHTML = '<option value="">Select Customer</option>';
    customers.forEach(customer => {
        const option = document.createElement("option");
        option.value = customer.id;
        option.textContent = customer.name;
        customerSelect.appendChild(option);
    });
};

// Populate categories in all selects
const populateCategories = () => {
    let selectElement = document.querySelectorAll(".category");
    selectElement.forEach((selectElement)=>{
        if (!selectElement.value){
            selectElement.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                selectElement.appendChild(option);
            });
        }

    })
};

// Fetch products based on category
const loadProducts = async (categoryId, productSelect) => {
    try {
        const response = await axios.get(`/api/products?category_id=${categoryId}`);
        products = response.data.response;
        productSelect.innerHTML = '<option value="">Select Product</option>';
        products.forEach(product => {
            const option = document.createElement("option");
            option.value = product.id;
            option.textContent = `${product.name} - $${product.price}`;
            option.dataset.price = product.price;
            productSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
};

// Add invoice row
const addInvoiceRow = () => {
    const tbody = document.querySelector("tbody");
    const newRow = document.createElement("tr");
    newRow.classList.add("hover:bg-slate-50");
    newRow.innerHTML = `
        <td class="p-4 w-48">
            <select class="category w-full bg-transparent text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2" onchange="loadProducts(this.value, this.closest('tr').querySelector('.product'))">
                <option value="">Select Category</option>
            </select>
        </td>
        <td class="p-4 w-48">
            <select class="product w-full bg-transparent text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2" onchange="updateRowTotal(this)">
                <option value="">Select Product</option>
            </select>
        </td>
        <td class="p-4">
            <input type="number" min="1" class="quantity w-full text-sm border border-slate-200 rounded-md px-3 py-2" value="1" onchange="updateRowTotal(this)" />
        </td>
        <td class="p-4">
            <input class="price w-full text-sm border border-slate-200 rounded-md px-3 py-2" value="0.00" readonly />
        </td>
        <td class="p-4">
            <input class="total w-full text-sm border border-slate-200 rounded-md px-3 py-2" value="0.00" readonly />
        </td>
        <td class="p-4">
            <button type="button" class="text-sm bg-red-600 px-3 py-1 rounded-full text-white" onclick="deleteRow(this)"><i class="fa-solid fa-xmark"></i> Delete</button>
        </td>
    `;
    tbody.appendChild(newRow);
    populateCategories();
    updateInvoiceTotal();
};

// Delete row
const deleteRow = (button) => {
    button.closest("tr").remove();
    updateInvoiceTotal();
};

// Update row total
const updateRowTotal = (element) => {
    const row = element.closest("tr");
    const productSelect = row.querySelector(".product");
    const quantityInput = row.querySelector(".quantity");
    const priceInput = row.querySelector(".price");
    const totalInput = row.querySelector(".total");

    const selectedOption = productSelect.selectedOptions[0];
    const price = selectedOption && selectedOption.dataset.price ? parseFloat(selectedOption.dataset.price) : 0;
    const quantity = parseInt(quantityInput.value) || 0;

    priceInput.value = price.toFixed(2);
    const total = (price * quantity).toFixed(2);
    totalInput.value = total;

    updateInvoiceTotal();
};

const customerChange = (customerId) =>{
    
    let customer = customers.find(customer => {

        return  customerId.value == customer.id 
    })
    document.getElementById('customer-details').innerHTML = `
    <input class="price w-full text-sm border border-slate-200 rounded-md px-3 py-2" value="${customer.address}" readonly />
    <input class="w-full text-sm border border-slate-200 rounded-md px-3 py-2" value="${customer.phone}" readonly />
    <input class="price w-full text-sm border border-slate-200 rounded-md px-3 py-2" value="${customer.city}" readonly />
    <input class="w-full text-sm border border-slate-200 rounded-md px-3 py-2" value="${customer.state}" readonly />
    `;

}

// Update invoice total
const updateInvoiceTotal = () => {
    const totals = document.querySelectorAll(".total");
    let invoiceTotal = 0;
    totals.forEach(total => {
        invoiceTotal += parseFloat(total.value) || 0;
    });
    document.getElementById("invoiceTotal").innerHTML = `$${invoiceTotal.toFixed(2)}`;
    totalAmount = invoiceTotal.toFixed(2)
};

// Handle form submission
const handleSubmit = (event) => {
    event.preventDefault();
    const customerId = document.getElementById("customer").value;
    if (!customerId) {
        alert("Please select a customer.");
        return;
    }

    const invoiceData = {
        customer_id: customerId,
        total_amount: totalAmount,
        items: []
    };
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach(row => {
        const categorySelect = row.querySelector(".category");
        const productSelect = row.querySelector(".product");
        const quantityInput = row.querySelector(".quantity");
        const priceInput = row.querySelector(".price");
        const priceTotal = row.querySelector(".total");

        if (categorySelect.value && productSelect.value) {
            invoiceData.items.push({
                product_id: productSelect.value,
                quantity: parseInt(quantityInput.value),
                price: parseFloat(priceInput.value),
                total: parseFloat(priceTotal.value)
            });
        }
    });

    if (invoiceData.items.length > 0) {
        axios.post('/api/invoices', invoiceData)
            .then(response => {
                alert("Invoice submitted successfully!");
                document.querySelector("tbody").innerHTML = "";
                addInvoiceRow();
                document.getElementById("customer").value = "";
                document.getElementById("invoiceTotal").innerHTML = '$ 0.00';
                document.getElementById('customer-details').innerHTML='';
                // window.location.href ='/';
            })
            .catch(error => alert("Error submitting invoice: " + error.message));
    } else {
        alert("Please add at least one valid invoice item.");
    }
};

window.addEventListener("load", () => {
    loadData();
    addInvoiceRow(); // Start with one row
});