import * as bootstrap from 'bootstrap';
  
  function generateTableHead(table, data) {
    data.shift();
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
    var returnList = [];
    // need to check if statements are not IF NOT EXISTS and CREATE TABLE AS
    let tableArray = text.split('CREATE TABLE'); // this should have length the number of tables
    tableArray.shift();
    tableArray.forEach(text => {
        text = text.replace(/(\r\n|\n|\r)/gm, "");
        let textArray = text.split(',');
        let tableTitle = textArray[0].split('(')[0];
        textArray[0] = textArray[0].split('(')[1];
        textArray.unshift(tableTitle)
        let lastIndex = textArray.length -1;
        let length = textArray[lastIndex].length;
        textArray[lastIndex] = textArray[lastIndex].substring(0,length-2);
        returnList.push(textArray);
    });
    
    return returnList
  }
 

  document.querySelector('.click').addEventListener('click', (e) => {
    let div = document.querySelector(".tableArea");
     if (div.childElementCount == 0) { // need a better way to check for needing to reconstruct tables
        let text = document.querySelector(".textarea").value;
        let sqlText = parseSQL(text);

        for (const element of sqlText) {

            let heading = document.createElement("h3");
            heading.innerText = element[0];
            div.appendChild(heading);
            
            let table = document.createElement("table");
            table.className = "table";
            generateTableHead(table, element);
            
            div.appendChild(table);
        }
     }
    });
    
    //generateTable(table, data);   this should be used for adding values to table so
    // these can be used to implement correcting queries?

    //e.target.textContent = 'Clicked!';

