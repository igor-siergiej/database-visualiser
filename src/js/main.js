import * as bootstrap from 'bootstrap';
import Table from './Table';
import LeaderLine from 'leader-line-new';
import AnimEvent from 'anim-event';
import jsTokens from "js-tokens";


function parseSQL(text) {
  var tableList = [];

  // need to check if statements are not IF NOT EXISTS and CREATE TABLE AS
  let tableArray = text.split(';'); // this should have length the number of tables
  // removes the empty space at the end of the array that is created by split function
  tableArray.pop()
  tableArray.forEach(text => {
    // syntax checking here?
    let table = new Table(text);
    tableList.push(table);
  });

  return tableList
}

document.getElementById("outputTab").hidden = true; 

document.querySelector('.click').addEventListener('click', (e) => {
  document.getElementById("outputTab").hidden = false; 
  let div = document.getElementById("tableArea");
  // need a better way to check for needing to reconstruct tables
  let text = document.getElementById("textArea").value;
  let tables = parseSQL(text);

  for (const element of tables) {
    element.createTable(div);
  }

  //  var line = new LeaderLine(
  //   document.getElementById('test'),
  //   document.getElementById('123')
  // );

});

//text = text.replace(/(\r\n|\n|\r)/gm, ""); // replaces new lines

    //generateTable(table, data);   this should be used for adding values to table so
    // these can be used to implement correcting queries?

    //e.target.textContent = 'Clicked!';

