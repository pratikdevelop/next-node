const loadData = async () => {
    try {
        const categories = await axios.get('/api/categories')
        categoriesData = categories.data.response;
        populateCategories(categoriesData)

    } catch (error) {
        console.error("Error loading data:", error);
    }
};
const loadInvoices = async (i = 1, categoryId=null) => {
    try {
        const invoices = await axios.get(`/api/invoices?page=${i}&category=${categoryId}`);
        console.log(
            invoices.data
        );
        
        const apiResponse = invoices.data;
        const startItem = (apiResponse.pagination.currentPage - 1) * apiResponse.pagination.limit + 1;
        const endItem = Math.min(startItem + apiResponse.pagination.limit - 1, apiResponse.pagination.count);

        // Display the values in the UI
        document.getElementById('start-item').textContent = startItem;
        document.getElementById('end-item').textContent = endItem;
        document.getElementById('total-items').textContent = apiResponse.pagination.count;

        // Create pagination buttons dynamically
        const paginationContainer = document.getElementById('pagination_buttons');
        paginationContainer.innerHTML = ` <button
            class="rounded-md rounded-r-none border border-r-0 border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                <path fill-rule="evenodd"
                    d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
                    clip-rule="evenodd" />
            </svg>
        </button>`;

        for (let i = 1; i <= apiResponse.pagination.totalPages; i++) {
            paginationContainer.innerHTML += `<button onClick='changePageNumber(${i})'
            class="rounded-md rounded-r-none rounded-l-none border border-r-0 border-slate-300 py-2 px-3 text-center text-sm  ${i == apiResponse.pagination.currentPage ? 'bg-slate-800 text-white' : ''}"
            type="button">
            ${i}
        </button>`;
        }

        paginationContainer.innerHTML += `<button
            class="rounded-md rounded-l-none border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                <path fill-rule="evenodd"
                    d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                    clip-rule="evenodd" />
            </svg>
        </button>`;


        populateInvoices(invoices.data.invoices);

    } catch (error) {
        console.error("Error loading data:", error);

    }
};

const changePageNumber = (i) => {
    console.log(`Fetching data for page ${i}`);
    loadInvoices(i)

}
const populateCategories = (categoriesData) => {
    let selectElement = document.querySelectorAll("#category");
    selectElement.forEach((selectElement) => {
        if (!selectElement.value) {
            selectElement.innerHTML = '<option value="">Select Category</option>';
            categoriesData.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                selectElement.appendChild(option);
            });
        }

    })
};

const deleteInvoice = async (invoiceId) => {
    try {
        await axios.delete(`/api/invoices/${invoiceId}`)
        loadInvoices()
    } catch (error) {
        console.error(
            'Error in updatIng the invoice status: ', error
        );
    }


}

const markAsDone = async (invoiceId) => {
    try {
        await axios.patch(`/api/invoices/${invoiceId}`, { status: "Complete" })
        loadInvoices();
    } catch (error) {
        console.error(
            'Error in updatIng the invoice status: ', error
        );

    }

}


const changeCategory = (value) =>{
    loadInvoices(1, value)
}
const populateInvoices = (invoices) => {
    let tableBody = document.querySelector('#table-body');
    tableBody.innerHTML = ''
    invoices.forEach((invoice, index) => {
        tableBody.innerHTML += `<tr class="hover:bg-slate-50">

            <td class="p-2 border-gray-300 border">
                <p class="text-sm font-bold">
                   ${index + 1}
                </p>
            </td>
            <td class="p-2 border-gray-300 border">
                <p class="text-sm font-bold">
                   ${invoice.invoice_number}
                </p>
            </td>
            <td class="p-2 border-gray-300 border">
                <p class="text-sm">
                    ${invoice.Customer.name}
                </p>
            </td>
            <td class="p-2 border-gray-300 border">
                <p class="text-sm">
                ${invoice.Customer.address}
                </p>
            </td>
            <td class="p-2 border-gray-300 border">
                <p class="text-sm">
                    ${invoice.total_amount}
                </p>
            </td>
            <td class="p-2 border-gray-300 border">
                <p class="text-sm text-center rounded-full text-white  ${invoice.status == 'Pending' ? 'bg-orange-500 py-2' : 'bg-green-700 px-4 py-2'}">${invoice.status}</p>
            </td>
            <td class="p-2 border-gray-300 border">
                <span class=" flex items-center space-x-4">
                    ${invoice.status !== 'Complete' ?
                ` <i onClick='deleteInvoice(${invoice.id})' class=" cursor-pointer text-sm fa-solid fa-trash text-red-700 px-2 py-2 rounded border-1"></i>
                    <i onClick="markAsDone(${invoice.id})" class="cursor-pointer text-sm fa-solid fa-circle-check text-green-800 px-2 py-2 rounded border-1"></i>` : '<span class="text-center w-6 h-1 border bg-black mx-auto"> </span>'
            }
                   
                    
                </span>
            </td>
        </tr>`;
    })
}

window.addEventListener("load", () => {
    loadData();
    loadInvoices()
});
