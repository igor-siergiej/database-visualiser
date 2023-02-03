import * as bootstrap from 'bootstrap';
  
  function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.appendChild(text);
      row.appendChild(th);
    }
  }

  function generateTable(table, data) {
    for (let element of data) {
      let row = table.insertRow();
      for (key in element) {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
      }
    }
  }
  
 

  document.querySelector('.click').addEventListener('click', (e) => {
    let table = document.querySelector(".table");
    let data = document.querySelector(".textarea").value;
    generateTableHead(table, data);
    generateTable(table, mountains);
    e.target.textContent = 'Clicked!';
  });