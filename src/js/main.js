import * as bootstrap from 'bootstrap';
import Table from './Table'; 
import LeaderLine from 'leader-line-new';
import AnimEvent from 'anim-event';

  function generateTableHead(table, data) {
    data.shift();
    let thead = table.createTHead();
    for (let key of data) {
      let th = document.createElement("th");
      if (key == " id serial") {
        th.id = "test"
      }
      let row = thead.insertRow();
      let text = document.createTextNode(key);
      th.appendChild(text);
      row.appendChild(th);
    }
  }

  function generateCustomTable(div,data) {
    let column = document.createElement("div");
    column.className = "col-md border border-4 mx-3 my-3 w-auto";
    let heading = document.createElement("h3");
    heading.className = "text-center";
    heading.innerText = data[0];
    column.appendChild(heading);
    data.shift();

    
    for (let element of data) {
      let row = document.createElement("div");
      if (data.indexOf(element) == 0) {
        row.className = "row border-top border-bottom border-1 py-1";
      } else {
        row.className = "row border-bottom border-1 py-1";
      }
      let text = document.createTextNode(element);
      row.appendChild(text);
      column.appendChild(row);
    }
    div.appendChild(column);
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
        text = text.replace(/(\r\n|\n|\r)/gm, ""); // replaces new lines
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

            //let table = document.createElement("div");
            //table.id = element[0].trim();
            //table.className = "container";
            generateCustomTable(div, element);
        }
     }

     var line = new LeaderLine(
      document.getElementById('test'),
      document.getElementById('123')
    );
     
    });

  
    

    //generateTable(table, data);   this should be used for adding values to table so
    // these can be used to implement correcting queries?

    //e.target.textContent = 'Clicked!';

