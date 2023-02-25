import * as bootstrap from 'bootstrap';
import Table from './Table';
import LeaderLine from 'leader-line-new';
import AnimEvent from 'anim-event';
import jsTokens from "js-tokens";

const fileForm = document.getElementById("fileForm");
const textForm = document.getElementById("textForm");

const filePicker = document.getElementById("filePicker");
const textArea = document.getElementById("textArea");

fileForm.addEventListener('submit', function (event) {
  event.preventDefault()
  event.stopPropagation()
    // means textArea is hidden so validate filePicker
    if (fileForm.checkValidity() && fileValidation()) {
      filePicker.classList.remove("is-invalid")
      filePicker.classList.add("is-valid")
      var reader = new FileReader();
      reader.readAsText(document.getElementById("filePicker").files[0],"UTF-8");
      reader.addEventListener('load', (event) => {
        visualise(event.target.result)
      })
    } else {
      filePicker.classList.add("is-invalid")
      filePicker.classList.remove("is-valid")
    }
}, false)

textForm.addEventListener('submit', function (event) {
  event.preventDefault()
  event.stopPropagation()
  if (textForm.checkValidity()) {
    textArea.classList.remove("is-invalid")
    textArea.classList.add("is-valid")
    visualise(textArea.value)
  } else {
    textArea.classList.remove("is-valid")
    textArea.classList.add("is-invalid")
  }
}, false)

function fileValidation() {
  // check which div is hidden and validate the other
  // write validation for text area not being empty
  const fileName = document.getElementById("filePicker").files[0].name;
  var regex = new RegExp("^.*\.(txt|psql|sql)$")
  if (regex.test(fileName.toLowerCase())) {
    return true
  } else {
    return false
  }
}

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

function visualise(inputString) {
  document.getElementById("outputTab").hidden = false;
  let div = document.getElementById("tableArea");
  // need a better way to check for needing to reconstruct tables
  let text = document.getElementById("textArea").value;
  let tables = parseSQL(text);

  for (const element of tables) {
    element.createTable(div);
  }
}

  //  var line = new LeaderLine(
  //   document.getElementById('test'),
  //   document.getElementById('123')
  // );


//text = text.replace(/(\r\n|\n|\r)/gm, ""); // replaces new lines

    //generateTable(table, data);   this should be used for adding values to table so
    // these can be used to implement correcting queries?

    //e.target.textContent = 'Clicked!';

