import * as bootstrap from 'bootstrap';
import Table from './Table';
import LeaderLine from 'leader-line-new';
import jsTokens from "js-tokens";
import Schema from './Schema';

var visualised = false

const fileForm = document.getElementById("fileForm");
const textForm = document.getElementById("textForm");

const filePicker = document.getElementById("filePicker");
const textArea = document.getElementById("textArea");

const alertDiv = document.getElementById("alertDiv")

var database = []; // this should be an array of schema
var publicSchema = new Schema("public"); // create default schema 
database.push(publicSchema) // add public schema to database array

function visualise() {
  let syntaxTextArea = document.getElementById("syntaxTextArea");
  let tableArea = document.getElementById("tableArea");
  let filterArea = document.getElementById("filterArea");

  if (visualised) { // if the table has already been visualised then reset the html of the outputs
    tableArea.innerHTML = ""
    syntaxTextArea.innerHTML = ""
    filterArea.innerHTML = ""
    // refresh error tab inner html too
  }
  
  document.getElementById("outputTab").hidden = false;

  var tables = []
   for (const schema of database) {
     for (const table of schema.tables) {
       tables.push(table)
     }
   }
 
  let uniqueColumnTypes = uniqueColumnTypesForAllTables(tables)

  for (const element of tables) {
    element.createTable(tableArea);
    element.writeSyntax(syntaxTextArea);
  }

  createFilters(uniqueColumnTypes, filterArea)

  visualised = true;
}

// in the future if it validates then create database object as a global variable and visualise will only visualise it
function validateSQL(inputString) {
  var statements = inputString.split(";");
  statements.pop();

  var validated = true

  try { // try to create datamodel and the first error it throws will be displayed to user as error
    for (var statement of statements) {
      statement = statement.replace(/(\r\n|\n|\r)/gm, ""); // replaces new lines
      statement = statement.trim() // removes white spaces before and after statement

      var words = statement.split(" ")

      if (words[0].toUpperCase() === "CREATE") {
         if (words[1].toUpperCase() == "SCHEMA") {
            // create schema object
         } else {
          let table = new Table(statement, database); // this will be added to database object later
          for (const schema of database) {
            if (table.schema == schema.name) {
              schema.addTable(table)
            }
          }
         }
      } else {
        throw Error("Unsupported Statement")
      }
    }

  } catch (error) {
    // feedback to user with error
    console.log(error)
    validated = false
    createAlert(error,alertDiv)
  }
  return validated
}

function fileValidation() {
  const fileName = document.getElementById("filePicker").files[0].name;
  var regex = new RegExp("^.*\.(txt|psql|sql)$")
  if (regex.test(fileName.toLowerCase())) {
    return true
  } else {
    return false
  }
}

function validateTextArea() {
  if (validateSQL(textArea.value)) {
    textArea.classList.remove("is-invalid")
    textArea.classList.add("is-valid")
    if (alertDiv.firstChild) { // if alertsDiv already has an alert then clear the div
      alertDiv.innerHTML = ""
    }
  } else {
    textArea.classList.remove("is-valid")
    textArea.classList.add("is-invalid")
  }
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

function createAlert(error,alertsDiv) {
  if (alertsDiv.firstChild) { // if alertsDiv already has an alert then clear the div
    alertsDiv.innerHTML = ""
  }

  let alertDiv = document.createElement("div")
  alertDiv.className = "alert alert-danger alert-dismissible fade show"
  alertDiv.setAttribute("role","alert")

  let boldError = document.createElement("strong")
  boldError.innerHTML = "Error: "
  let alertText = document.createTextNode(error.message)
  
  let dismissButton = document.createElement("button")
  dismissButton.className = "btn-close"
  dismissButton.setAttribute("data-bs-dismiss", "alert")
  dismissButton.type = "button"
  dismissButton.ariaLabel = "Close"

  alertDiv.appendChild(boldError)
  alertDiv.appendChild(alertText)
  alertDiv.appendChild(dismissButton)

  alertsDiv.appendChild(alertDiv)
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

const processChange = debounce(() => validateTextArea());

textArea.addEventListener("input", function () {
  textArea.classList.remove("is-invalid")
  textArea.classList.remove("is-valid")
  processChange()
});

document.getElementById("outputTab").hidden = true;

function highlightWords(type, checkbox) {
  var words = document.querySelectorAll(`[id=${type}]`);
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

function debounce(func, timeout = 500) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
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
  if (textForm.checkValidity() && validateSQL(textArea.value)) {
    textArea.classList.remove("is-invalid")
    textArea.classList.add("is-valid")
    visualise(textArea.value)
  } else {
    textArea.classList.remove("is-valid")
    textArea.classList.add("is-invalid")
  }
}, false)

  //  var line = new LeaderLine(
  //   document.getElementById('test'),
  //   document.getElementById('123')
  // );

