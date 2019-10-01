var originalData = [];
var headerConfig = [];
var globalSearchVal = '';
var paginationConfig = {
    currentPage: 0,
    pageSize: 5,
    totalPages: 0,
}

var data = [];
fetch('https://restcountries.eu/rest/v2/all')
    .then((response) => {
        return response.json()
    })
    .then(response => {
        processData(response);
        headerConfig = createHeaderConfig(originalData);
        // console.log(headerConfig);
        data = originalData.filter(() => true);
        generate_table();

    })


function generate_table() {
    // console.log(headerConfig, data);
    headerConfig[2].type = "number";
    headerConfig[3].type = "number";


    let body = document.getElementById("table-wrapper");

    let tbl = document.createElement("table");
    let tblHeader = document.createElement("thead");
    let row = document.createElement("tr");
    let inputRow = document.createElement("tr");

    for (let j = 0; j < headerConfig.length; j++) {
        let cell = document.createElement("th");
        let inputCell = document.createElement("th");

        let name = document.createElement('span');
        let sort = document.createElement('span');
        sort.innerHTML = ' &#8593 ';
        sort.addEventListener('click', (event) => {
            clicked(j);
        })
        let cellText = document.createTextNode(headerConfig[j].name);
        name.appendChild(cellText);
        cell.appendChild(name);
        cell.appendChild(sort)
        row.appendChild(cell);

        let input = document.createElement("input");
        input.type = "text";
        input.addEventListener('keyup', (event) => {
            filterColumn();
        })
        inputCell.appendChild(input)
        inputRow.appendChild(inputCell);
    }
    tblHeader.appendChild(row);
    tblHeader.appendChild(inputRow);

    tbl.appendChild(tblHeader);
    // creating all cells

    updatePagination();

    renderTableBody(tbl);
    body.appendChild(tbl);
    renderPagination();

}

function renderTableBody(tableRef) {
    let tblBody = document.createElement("tbody");
    [startIndex, endIndex] = startEndIndex();
    console.log(startIndex, endIndex);
    for (let i = startIndex; i < endIndex; i++) {
        // creates a table row
        let row = document.createElement("tr");

        for (let j = 0; j < headerConfig.length; j++) {
            // Create a <td> element and a text node, make the text
            // node the contents of the <td>, and put the <td> at
            // the end of the table row   
            let cell = document.createElement("td");
            let cellText = document.createTextNode(data[i][headerConfig[j].name]);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }

        tblBody.appendChild(row);
    }

    tableRef.appendChild(tblBody);


    tableRef.setAttribute("border", "1");


    // for (let i = 0, row; row = tbl.rows[i] && row === 0; i++) {
    //     //iterate through rows
    //     //rows would be accessed using the "row" letiable assigned in the for loop
    //     for (let j = 0, col; col = row.cells[j]; j++) {
    //         console.log(row.cell[j]);

    //     }
    // }

}

function clicked(index = 55) {

    data.sort((a, b) => {
        // return a[headerConfig[index]] > b[headerConfig[index]] 
        let result = 1;
        let first = a[headerConfig[index].id];
        let second = b[headerConfig[index].id];
        if (headerConfig[index].type === 'number') {
            result = first - second;
        } else {
            if (first === null) {
                result = -1
            } else if (second === null) {
                result = 1
            }
            else if (first.toUpperCase() < second.toUpperCase()) { result = -1; }
            else if (first.toUpperCase() > second.toUpperCase()) { result = 1; }
            else result = 0;
        }
        if (headerConfig[index].sortingOrder) {
            if (result > 0) {
                result = -1;
            } else if (result < 0) {
                result = 1;
            }
        }



        return result;

    });
    headerConfig[index].sortingOrder = !headerConfig[index].sortingOrder;
    deleteTable();
}
function createHeaderConfig(data) {
    let header = [];
    if (data.length > 0) {
        header = Object.keys(data[0]);

        return header.map((column) => {
            const col = {
                id: column,
                name: column,
                type: 'string',
                isSortable: true,
                sortingOrder: undefined,
                isFilterable: true
            }
            return col;
        })
    }
    return header;
}
function deleteTable(index = 0) {
    updatePagination(index);
    let tbl = document.getElementsByTagName("table")[0];
    tbl.getElementsByTagName('tbody')[0].remove()
    renderTableBody(tbl);
    renderPagination();

}
function compareNumber(a, b, asc = true) {
    return b - a ? asc : a - b;
}

function processData(data) {
    originalData = data.map(country => {
        const newCountry = {
            name: country.name,
            capital: country.capital,
            population: country.population,
            area: country.area,
            numericCode: country.numericCode
        }
        return newCountry
    })
}
function globalSearch(event) {
    globalSearchVal = event.target.value;
    doGlobalSearch(globalSearchVal);
    filterColumn()
    deleteTable();

}
function doGlobalSearch(val) {
    data = originalData.filter((row) => {
        let res = false;
        for (let index = 0; index < headerConfig.length; index++) {
            let element = row[headerConfig[index].id];
            if (element) {
                element = element.toString();
            }
            if (element && element.search(new RegExp(val, "i")) > -1) {
                res = true;
                break;
            }
        }
        return res;
    })
}
function filterColumn() {

    let tableRef = document.getElementsByTagName('table')[0];
    let filters = tableRef.getElementsByTagName('input');
    filters = Array.from(filters);
    doGlobalSearch(globalSearchVal);
    filters.forEach((element, index) => {
        data = filterSingleCol(element.value, index)
    });
    deleteTable();
}
function filterSingleCol(val, index) {
    return data.filter((row) => {
        let res = false;
        let element = row[headerConfig[index].id];
        if (element) {
            element = element.toString();
        }
        if (element && element.search(new RegExp(val, "i")) > -1) {
            res = true;
        }
        return res;
    })

}
function updatePagination(index = 0) {
    let psize = document.getElementById('select').value;
    psize = parseInt(psize, 10);
    if (data) {
        const totalItems = data.length;
        paginationConfig.currentPage = 0;
        paginationConfig.pageSize = psize;
        paginationConfig.totalPages = Math.ceil(totalItems / psize);
        if (index < paginationConfig.totalPages) {
            paginationConfig.currentPage = index;
        }
    }


}
function updatePageSize(event) {
    updatePagination();
    deleteTable();
}
function startEndIndex() {
    let startIndex = paginationConfig.currentPage * paginationConfig.pageSize;
    let endIndex = (paginationConfig.currentPage + 1) * paginationConfig.pageSize;
    if (endIndex > data.length) {
        endIndex = data.length;
    }
    return [startIndex, endIndex]
}
function goToPage(index) {
    if (index < 0) {
        index = paginationConfig.totalPages - 1;
    }
    deleteTable(index);
}
function changePage(i) {
    goToPage(paginationConfig.currentPage + i);
}
function renderPagination() {
    let pagination = document.getElementById('page-list');
    let prevPag = pagination.getElementsByTagName('div')[0];
    if (prevPag) {
        prevPag.remove();
    }
    let ul = document.createElement('div');
    let startIndex = paginationConfig.currentPage;
    let endIndex = paginationConfig.totalPages;
    if (startIndex > paginationConfig.totalPages - 5) {
        startIndex = paginationConfig.totalPages - 5;
        if (startIndex < 0) {
            startIndex = 0;
        }
    }
    if (endIndex > startIndex + 5) {
        endIndex = startIndex + 5
    }

    for (let index = startIndex; index < endIndex; index++) {
        let li = document.createElement('div');
        let cellText = document.createTextNode(index + 1);
        li.addEventListener('click', () => {
            goToPage(index);
        })
        li.appendChild(cellText);
        if (paginationConfig.currentPage === index) {
            li.className = 'current-page';
        }
        ul.appendChild(li)
        console.log(ul);


    }
    pagination.appendChild(ul)
};

function updateHeader() {
    console.log('updated')
}