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

const alertDiv = document.getElementById("alertDiv")

function visualise(inputString) {
  let syntaxTextArea = document.getElementById("syntaxTextArea");
  let tableArea = document.getElementById("tableArea");
  let filterArea = document.getElementById("filterArea")

  if (visualised) { // if the table has already been visualised then reset the html of the outputs
    tableArea.innerHTML = ""
    syntaxTextArea.innerHTML = ""
    filterArea.innerHTML = ""
    // refresh error tab inner html too
  }
  document.getElementById("outputTab").hidden = false;

  let statements = inputString.split(';'); // this should have length the number of tables/ statements
  statements.pop() // removes the empty element at the end of the array that is created by split function

  // Maybe have a database object that has a schema and tables?
  let tables = [];
  for (const statement of statements) {
    if (statement.includes("CREATE") && statement.includes("TABLE")) {
      tables.push(createTable(statement))
    } else if (statement.includes("CREATE SCHEMA")) {
      // create schedma function here
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

function validateSQL(inputString) {
  var statements = inputString.split(";");
  statements.pop();
  var validated = true

  try { // try to create datamodel and the first error it throws will be displayed to user
    for (const statement of statements) {
      if (statement.includes("CREATE") && statement.includes("TABLE")) {
        createTable(statement)
      } else if (statement.includes("CREATE SCHEMA")) {
        // create schema object
      }
    }
  } catch (e) {
    // feedback to user with error
    validated = false
    createAlert(e,alertDiv)
  }

  return validated
}

function createTable(statement) {
  let table = new Table(statement);
  return table
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

function createAlert(errorMessage,alertsDiv) {
  if (alertsDiv.firstChild) { // if alertsDiv already has an alert then clear the div
    alertsDiv.innerHTML = ""
  }

  let alertDiv = document.createElement("div")
  alertDiv.className = "alert alert-danger alert-dismissible fade show"
  alertDiv.setAttribute("role","alert")

  let alertText = document.createTextNode(errorMessage)
  
  let dismissButton = document.createElement("button")
  dismissButton.className = "btn-close"
  dismissButton.setAttribute("data-bs-dismiss", "alert")
  dismissButton.type = "button"
  dismissButton.ariaLabel = "Close"

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
  if (textForm.checkValidity()) {
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

//text = text.replace(/(\r\n|\n|\r)/gm, ""); // replaces new lines