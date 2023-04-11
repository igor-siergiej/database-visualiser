import * as bootstrap from 'bootstrap';
import Table from './Table';
import LeaderLine from 'leader-line-new';
import jsTokens from "js-tokens";
import Schema from './Schema';
import { SyntaxError } from './SyntaxError';
import Database from './Database';
import Util from './Util';

var visualised = false

const textTabButton = document.getElementById("text-tab-button")
const fileTabButton = document.getElementById("file-tab-button")

const fileVisualiseButton = document.getElementById("fileVisualiseButton")
const textVisualiseButton = document.getElementById("textVisualiseButton")

const syntaxTextArea = document.getElementById("syntaxTextArea");
const tableArea = document.getElementById("tableArea");
const filterArea = document.getElementById("filterArea");

const tableViewButton = document.getElementById("table-tab")
const syntaxViewButton = document.getElementById("syntax-tab")
const errorViewButton = document.getElementById("error-tab")

fileVisualiseButton.disabled = true
textVisualiseButton.disabled = true

const filePicker = document.getElementById("filePicker");
const textArea = document.getElementById("textArea");
const treeArea = document.getElementById("tree")

const backdrop = document.getElementById("backdrop");
const highlights = document.getElementById("highlights")

const alertDiv = document.getElementById("alertDiv");

textArea.addEventListener("scroll", function (event) {
  backdrop.scrollTop = textArea.scrollTop
});

textTabButton.addEventListener("click", clearAlertDiv)

fileTabButton.addEventListener("click", clearAlertDiv)

function clearAlertDiv() {
  alertDiv.innerHTML = ""
}

var lines = []

var database = new Database(); // this should be an array of schema
var publicSchema = new Schema("public",database.getSchemas()); // create default schema
database.addSchema(publicSchema) // add public schema to database array

// maybe have to think about creating multiple trees

// const data = [
//   { id: "roles1", parentId: "account_roles1" },
//   { id: "account_roles1", parentId: "test1" },
//   { id: "accounts1", parentId: "account_roles1"},
//   { id: "test1", parentId: null}]

// can only be one null parent id
// check if there are more than one ids with null parentId
// 


function createTableData() {
  var data = []
  var foreignKeys = getForeignKeysInDB()
  for (const element of foreignKeys) {
    data.push({ id: element.column.referencedTable, parentId: element.tableName })
  }

  var ids = []
  var parentIds = []
  // split up data into ids and parentIds
  for (const element of data) {
    ids.push(element.id)
    parentIds.push(element.parentId)
  }

  //remove duplicates
  ids = Array.from(new Set(ids))
  parentIds = Array.from(new Set(parentIds))

  // if there are no roots then there is a cyclic structure?
  var roots = parentIds.filter(x => ids.indexOf(x) === -1)

  // if there are multiple roots then need to split up into separate trees
  // means that tables are not all joined up by foreign keys
  if (roots.length > 1) {
    for (const root of roots) {
      let nodes = []
      extractTree(root, data, nodes)
    }
    // separate all the trees 
    // extract them by the root and its children
  } else {
    data.push({ id: roots[0], parentId: null })
  }
  return data
}

function getForeignKeysInDB() {
  var keys = []
  for (let schema of database.getSchemas()) {
    for (let table of schema.tables) {
      for (let column of table.columns) {
        if (column.getForeignKey() != undefined) {
          keys.push({ column: column.getForeignKey(), tableName: table.name })
        }
      }
    }
  }
  return keys
}
// need to dynamically generate this, could just be a for loop but need to check foreign keys

function createTreeFromDatabase() {
  const data = createTableData()

  const idMapping = data.reduce((acc, el, i) => {
    acc[el.id] = i;
    return acc;
  }, {});

  let root;
  data.forEach(el => {
    // Handle the root element
    if (el.parentId === null) {
      root = el;
      return;
    }
    // Use our mapping to locate the parent element in our data array
    const parentEl = data[idMapping[el.parentId]];
    // Add our current el to its parent's `children` array
    parentEl.children = [...(parentEl.children || []), el];
  });
  return root
}

function extractTree(rootNode, data, listOfNodes) {
  for (const element of data) { // get all of the children of rootNode and add to listOfNodes
    if (element.parentId == rootNode) { // this needs to be done recursively 
      listOfNodes.push(element)
    }
  }

  return { id: rootNode, parentId: null, children: listOfNodes }
}

function drawTreeTablesRecursively(tree, appendNode, tables) {
  var item = document.createElement("li")
  for (const table of tables) {
    if (table.name == tree.id) {
      table.createTreeTable(item)
    }
  }
  appendNode.appendChild(item)
  if (tree.children == undefined) {
    return
  } else {
    var list = document.createElement("ul")
    item.appendChild(list)
    for (const childNode of tree.children) {
      drawTreeTablesRecursively(childNode, list, tables)
    }
  }
}

function visualise() {
  if (visualised) { // if the table has already been visualised then reset the html of the outputs
    tableArea.innerHTML = ""
    syntaxTextArea.innerHTML = ""
    filterArea.innerHTML = ""
    treeArea.innerHTML = ""

    if (lines.length > 0) {
      for (var line of lines) {
        line.remove()
      }
    }
    // refresh error tab inner html too
  }

  // reveal output tab only once database is visualised
  document.getElementById("outputTab").hidden = false;

  var tables = []

  // adds all tables in db to tables
  for (const schema of database.getSchemas()) {
    for (const table of schema.tables) {
      tables.push(table)
    }
  }

  // if there are no foreign keys then draw tables in creation order
  if (getForeignKeysInDB().length > 0) {
    drawTreeTablesRecursively(createTreeFromDatabase(), treeArea, tables)
  } else {
    for (const table of tables) {
      table.createTable(tableArea)
    }
  }

  writeSyntax(syntaxTextArea,tables)

  //check if table view is active then create lines
  if (window.getComputedStyle(tableArea).visibility !== "hidden") {
    createLines(tables)
  }

  createFilters(uniqueColumnTypesForAllTables(tables), filterArea)

  visualised = true;
}

// this should probably be in a try catch block because it error crashes often
function createLines(tables) {
  lines = []
  for (const table of tables) {
    for (const column of table.columns) {
      var foreignKey = column.getForeignKey()
      if (foreignKey !== undefined) {
        // need the id to be unique and start from the type column
        // therefore need table and column name and column type
        var from = table.name + "/" + 
                   column.name + "/" + 
                   column.columnType.type

        // same as above need this id to be unique per schema
        // that's why table, column and type are required to be in the id
        var to = foreignKey.referencedTable + "/" + 
                 foreignKey.referencedColumn + "/" + 
                 foreignKey.referencedColumnType

        var line = new LeaderLine(
          document.getElementById(from),
          document.getElementById(to)
        )

        line.startPlugColor= '#1a6be0'
        line.endPlugColor= '#1efdaa'
        line.startPlug = "square"
        line.endPlug = "arrow1"
        line.gradient = true
        line.dropShadow = true
        line.path = "line"
        line.setOptions({ startSocket: 'right', endSocket: 'right' })

        lines.push(line)
      }
    }
  }
}

function removeLines() {
  for (var line of lines) {
    line.hide("none")
  }
}

function writeSyntax(syntaxTextArea, tables) {
  for (const table of tables) {
    table.writeSyntax(syntaxTextArea);
  }
}

function validateSQL(inputString) {
  database = new Database();
  publicSchema = new Schema("public",database.getSchemas());
  database.addSchema(publicSchema)

  // removes lines beginning with -- (comment in SQL)
  inputString = inputString.replace(/^--.*$/gm, '');

  var statements = inputString.split(";");
  statements.pop(); // need a check if the last value is empty

  var validated = true

  try { // try to create datamodel and the first error it throws will be displayed to user as error
    for (var statement of statements) {
      statement = statement.replace(/(\r\n|\n|\r)/gm, ""); // replaces new lines
      statement = statement.trim() // removes white spaces before and after statement

      var words = statement.split(" ")

      var firstWord = words[0].toUpperCase().trim()
      var secondWord = words[1].toUpperCase()

      if (firstWord == "CREATE") {
        if (secondWord == "SCHEMA") {
          words = words.splice(2)
          if (words.length > 1) {
            throw new SyntaxError(`Unexpected statement "${words[1]}"`, words[1])
          } else {
            let schema = new Schema(words[0],database.getSchemas());
            database.addSchema(schema)
          }
          
        } else if (secondWord == "TABLE") {
          let table = new Table(statement, database.getSchemas());

          // if schema exists is already checked in Table constructor
          for (const schema of database.getSchemas()) {
            if (table.schema == schema.name) {
              schema.addTable(table)
            }
          }
        } else {
          throw new SyntaxError(`Unrecognised Flag: ${secondWord}`,secondWord)
        }
      } else if (firstWord == "ALTER" || firstWord == "\\.ALTER") {
        if (secondWord == "SCHEMA") {
          database.alterSchema(words.splice(2))
        } else if (secondWord == "TABLE") {
          database.alterTable(words.splice(2))
        } else {
          throw new SyntaxError(`Unrecognised Flag: ${secondWord}`,secondWord)
        }
      } else {
        // ignore these statements because they are not relative to visualising/structure
        if (firstWord == "SET" || firstWord == "SELECT" || firstWord == "\\.COPY" || firstWord == "COPY") {
          continue;
        } else {
          throw new SyntaxError(`Unsupported Statement: ${firstWord}`, firstWord)
        }

      }
    }
  } catch (syntaxError) {
    console.log(syntaxError)
    if (syntaxError instanceof SyntaxError) {
      highlightSyntaxError(syntaxError.getErrorWord())
      createAlert(syntaxError, alertDiv)
      validated = false
    }
    validated = false
  }
  // DEBUG ONLY
  console.log(database)
  return validated
}

function highlightSyntaxError(errorWord) {
  var text = textArea.value
  // find word to highlight and surround it with a error HTML tag
  var highlightedText = text.replace(errorWord, `<error>${errorWord}</error>`)
  highlights.innerHTML = highlightedText
}

function validateFilePickerText(fileText) {
  if (validateSQL(fileText)) {
    fileVisualiseButton.disabled = false
    filePicker.classList.remove("is-invalid")
    filePicker.classList.add("is-valid")
    if (alertDiv.firstChild) { // if alertsDiv already has an alert then clear the div
      alertDiv.innerHTML = ""
    }
  } else {
    fileVisualiseButton.disabled = true
    filePicker.classList.remove("is-valid")
    filePicker.classList.add("is-invalid")
  }
}

function validateFilePicker() {
  const file = filePicker.files[0]
  const filename = file.name
  var regex = new RegExp("^.*\.(txt|psql|sql)$")
  if (regex.test(filename.toLowerCase())) {
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.addEventListener('load', (event) => {
      validateFilePickerText(event.target.result)
    })
  } else {
    createAlert(new SyntaxError(`Filename ${filename} is invalid`), alertDiv)
    filePicker.classList.remove("is-valid")
    filePicker.classList.add("is-invalid")
  }
}

function validateTextArea() {
  if (validateSQL(textArea.value)) {
    textVisualiseButton.disabled = false
    textArea.classList.remove("is-invalid")
    textArea.classList.add("is-valid")
    if (alertDiv.firstChild) { // if alertsDiv already has an alert then clear the div
      alertDiv.innerHTML = ""
    }
  } else {
    textVisualiseButton.disabled = true
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

function createAlert(error, alertsDiv) {
  if (alertsDiv.firstChild) { // if alertsDiv already has an alert then clear the div
    alertsDiv.innerHTML = ""
  }

  let alertDiv = document.createElement("div")
  alertDiv.className = "alert alert-danger alert-dismissible fade show"
  alertDiv.setAttribute("role", "alert")

  let boldError = document.createElement("strong")
  boldError.innerHTML = "Syntax Error: "
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
  var columnDiv = document.createElement("div");
  columnDiv.className = "col"

  var checkboxDiv = document.createElement("div");
  checkboxDiv.className = "form-check checkbox-xl py-2 px-1";

  var checkbox = document.createElement("input");
  checkbox.type = "checkbox"
  checkbox.id = type
  checkbox.value = ""
  checkbox.className = "form-check-input mx-3 filter"

  var label = document.createElement("label");

  label.className = "form-check-label";
  label.htmlFor = type;

  label.appendChild(document.createTextNode(type))

  checkbox.addEventListener('change', function () {
    highlightWords(type, this)
  })

  checkboxDiv.appendChild(checkbox);
  checkboxDiv.appendChild(label);
  columnDiv.appendChild(checkboxDiv)
  return columnDiv
}

const delayedValidateTextArea = Util.debounce(() => validateTextArea());
const delayedValidateFilePicker = Util.debounce(() => validateFilePicker());

highlights.innerHTML = textArea.value;

textArea.addEventListener("input", function () {
  highlights.innerHTML = textArea.value;
  //update the text of the fake textArea

  textArea.classList.remove("is-invalid")
  textArea.classList.remove("is-valid")
  delayedValidateTextArea()
});

filePicker.addEventListener('change', function () {
  filePicker.classList.remove("is-invalid")
  filePicker.classList.remove("is-valid")
  delayedValidateFilePicker()
})

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

textVisualiseButton.addEventListener('click', function () {
  visualise(textArea.value)
}, false)

fileVisualiseButton.addEventListener('click', function () {
  visualise(document.getElementById("filePicker").files[0].value)
})

// showing and hiding lines drawn between tables because they can't seem to be 
// able to be added to a div so bootstrap cannot hide them automatically

tableViewButton.addEventListener("click", function (event) {
  createLines(database.getAllTables())
})
syntaxViewButton.addEventListener("click", function (event) {
  removeLines()
})

errorViewButton.addEventListener("click", function(event) {
  removeLines()
})