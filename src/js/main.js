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
  
  function parseSQL(text) {
    // need to first split by each 'CREATE TABLE'
    // need to check if statements are not IF NOT EXISTS and CREATE TABLE AS
    let textArray = text.split(',');
    textArray[0] = textArray[0].split('(')[1];
    textArray.forEach(element => {
        console.log(element);
    });
    let lastIndex = textArray.length -1;
    let length = textArray[lastIndex].length;
    textArray[lastIndex] = textArray[lastIndex].substring(0,length-2);
    return textArray
  }
 

  document.querySelector('.click').addEventListener('click', (e) => {
    let table = document.querySelector(".table");
    if (table != null) {
        table.deleteTHead();
    }
    let text = document.querySelector(".textarea").value;
    let headers = parseSQL(text);
    generateTableHead(table, headers);


    //generateTable(table, data);   this should be used for adding values to table so
    // these can be used to implement correcting queries?


    //e.target.textContent = 'Clicked!';
  });