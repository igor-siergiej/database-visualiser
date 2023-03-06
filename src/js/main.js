import * as bootstrap from 'bootstrap';
import Table from './Table';
import LeaderLine from 'leader-line-new';
import AnimEvent from 'anim-event';
import jsTokens from "js-tokens";

var visualised = false

const fileForm = document.getElementById("fileForm");
const textForm = document.getElementById("textForm");

const filePicker = document.getElementById("filePicker");
const textArea = document.getElementById("textArea");

function highlightWords(type, checkbox) {
  
  var words = document.querySelectorAll(`[id=${type}]`);
  console.log(checkbox.checked)
  if (checkbox.checked) {
    for (let i = 0; i < words.length; i++) {
      words[i].classList.add("highlightColor")
    }
  } else {
    for (let i = 0; i < words.length; i++) {
      words[i].classList.remove("highlightColor")
    }
  }
}

fileForm.addEventListener('submit', function (event) {
  event.preventDefault()
  event.stopPropagation()
  if (fileForm.checkValidity() && fileValidation()) {
    filePicker.classList.remove("is-invalid")
    filePicker.classList.add("is-valid")
    var reader = new FileReader();
    reader.readAsText(document.getElementById("filePicker").files[0], "UTF-8");
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
  let tableArray = text.split(';'); // this should have length the number of tables/ statements
  tableArray.pop() // removes the empty space at the end of the array that is created by split function
  tableArray.forEach(text => {
    // syntax checking here?
    if (text.includes("CREATE TABLE")) { // used to only catch create table statements in file parsing
      let table = new Table(text);
      tableList.push(table);
    }

  });
  return tableList
}

document.getElementById("outputTab").hidden = true;

function visualise(inputString) {

  let syntaxTextArea = document.getElementById("syntaxTextArea");
  let tableArea = document.getElementById("tableArea");

  if (visualised) { // if the table has already been visualised then reset the html of the outputs
    tableArea.innerHTML = ""
    syntaxTextArea.innerHTML = ""
    // refresh error tab inner html too
  }
  document.getElementById("outputTab").hidden = false;

  let filterArea = document.getElementById("filterArea")



  let tables = parseSQL(inputString);

  let uniqueColumnTypes = uniqueColumnTypesForAllTables(tables)

  for (const element of tables) {
    element.createTable(tableArea);
    element.writeSyntax(syntaxTextArea);
  }

  createFilters(uniqueColumnTypes, filterArea)

  visualised = true;
}

function uniqueColumnTypesForAllTables(tables) {
  var columnTypes = []
  for (const element of tables) {
    for (const columnType of element.getUniqueColumnTypes())
      columnTypes.push(columnType)
  }

  return (Array.from(new Set(columnTypes)))
}


function createFilters(uniqueColumnTypes, filterArea) {
  for (const type of uniqueColumnTypes) {
    var checkBoxDiv = createCheckbox(type)
    filterArea.appendChild(checkBoxDiv)
  }
}

function createCheckbox(type) {
  var checkboxDiv = document.createElement("div");
  checkboxDiv.className = "form-check checkbox-xl";

  var checkbox = document.createElement("input");
  checkbox.type = "checkbox"
  checkbox.id = type
  checkbox.value = ""
  checkbox.className = "form-check-input mx-3"

  var label = document.createElement("label");

  label.className = "form-check-label";
  label.htmlFor = type;

  label.appendChild(document.createTextNode(type))

  checkbox.addEventListener('change', function () {
    highlightWords(type, this)
  })

  checkboxDiv.appendChild(checkbox);
  checkboxDiv.appendChild(label);
  return checkboxDiv
}

  //  var line = new LeaderLine(
  //   document.getElementById('test'),
  //   document.getElementById('123')
  // );

//text = text.replace(/(\r\n|\n|\r)/gm, ""); // replaces new lines