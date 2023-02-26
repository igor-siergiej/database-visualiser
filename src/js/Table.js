import jsTokens from "js-tokens";
import Column from './Column';

export default class Table {
	name;
	columns = [];
	keys = [];

	// inputString = input text split up by 'Create Table' string
	constructor(inputString) {
		const tokenizedInputString = jsTokens(inputString);
		let tokenizedArray = Array.from(tokenizedInputString);

		tokenizedArray = tokenizedArray.filter(function (token) {
			return token.type != "LineTerminatorSequence";
		});
		// removes newlines

		tokenizedArray = tokenizedArray.filter(function (token) {
			return token.type != "WhiteSpace";
		});
		// removes whitespaces

		var index = tokenizedArray.map(function (e) { return e.value; }).indexOf("(");

		// first open bracket should be after table name
		
		this.name = tokenizedArray[index - 1].value;

		// split everything before the open bracket to remove the CREATE TABLE
		tokenizedArray = tokenizedArray.slice(index + 1);

		var tokenizedArrayValues = tokenizedArray.map(function (element) {
			return element['value'];
		});

		tokenizedArrayValues = tokenizedArrayValues.join(" ")

		const commaOutsideOfBrackets = /(?<!\([^\)]+)\s*,\s*(?!\))/;

		var columnStrings = tokenizedArrayValues.split(commaOutsideOfBrackets)

		var columns = [];

		for (const element of columnStrings) {
			const tokenizedInputString = jsTokens(element);
			var tokenizedColumnArray = Array.from(tokenizedInputString)
			tokenizedColumnArray = tokenizedColumnArray.filter(function (token) {
				return token.type != "WhiteSpace";
			});
			columns.push(tokenizedColumnArray)
		}

		for (const columnArray of columns) {
			
				if (columnArray[0].value == "PRIMARY" || columnArray[0].value == "FOREIGN") { // this means we reached table constraints
					// need the rest of the arrays joined and passed to parseTableConstraints()
					this.parseTableConstraints(columns.slice(columns.indexOf(columnArray)))
					break
				} else {
					  // this means there were no table constraints
						var column = new Column(columnArray);
						this.columns.push(column);
					}
				}
	}

	parseTableConstraints(tableConstraintsList) {

		for (const element of tableConstraintsList) {
			if (element[0].value == "PRIMARY" || element[1].value == "KEY") {
				let tempElement = element
				tempElement = tempElement.filter(e => e.value !== "PRIMARY")
				tempElement = tempElement.filter(e => e.value !== "KEY")

				for (const word of tempElement) {
					if (word.type == "IdentifierName") {
						for (const column of this.columns) {
							if (column.name == word.value) {
								column.isPrimaryKey = "P"
							}
						}
					}
				}
			}
		}
	}

	createTable(div) {
		let table = document.createElement("div");
		table.className = "row border border-4 mx-3 w-25 gx-0 h-100 my-3 w-auto";

		let keyColumn = document.createElement("div");
		keyColumn.className = "col-1 border-top border-4 gx-0 h-100";

		let nameColumn = document.createElement("div");
		nameColumn.className = "col border-top border-start border-4 h-100 gx-0";

		let typeColumn = document.createElement("div");
		typeColumn.className = "col border-top border-start border-4 h-100 gx-0";

		let heading = document.createElement("h3");
		heading.className = "text-center my-0 bg-primary";
		heading.innerText = this.name;
		table.appendChild(heading);

		console.log(this)

		for (const column of this.columns) {
			this.createColumn(column.isPrimaryKey, keyColumn)
			this.createColumn(column.name, nameColumn)
			this.createColumn(column.columnType.getValue(), typeColumn)
		}

		table.appendChild(keyColumn)
		table.appendChild(nameColumn);
		table.appendChild(typeColumn);

		div.appendChild(table);
	}

	createColumn(text, div) {
		let nameRow = document.createElement("div");
		nameRow.className = "row py-1 px-2 gx-0";

		let nameText = document.createTextNode(text);
		nameRow.appendChild(nameText);

		div.appendChild(nameRow)
	}

	writeSyntax(textArea) {
		var blueText = document.createElement("span");
		blueText.style = "color: green;";

		var redText = document.createElement("span");
		redText.style = "color: red;";

		blueText.textContent = "CREATE TABLE "
		textArea.appendChild(blueText)
		textArea.innerHTML += this.name + " (" + "<br>"

		// create function for writing in colours

		for (const column of this.columns) {
			textArea.innerHTML += "&emsp;"
			textArea.innerHTML += column.name + " "
			if (column.columnType.doesTypeHaveValue()) {
				blueText.textContent = column.columnType.type
				textArea.appendChild(blueText)
				textArea.innerHTML += " (";
				redText.textContent = column.columnType.value
				textArea.appendChild(redText)
				textArea.innerHTML += ")"
				
			} else {
				blueText.textContent = column.columnType.getValue()
				textArea.appendChild(blueText)
			}
			textArea.innerHTML += "<br>"
		}
		textArea.innerHTML += "&emsp;" + "<br>"
	}
}