import jsTokens from "js-tokens";
import Column from './Column';

export default class Table {
	name;
	temp = false;
	unlogged = false;
	ifNotExists = false;
	columns = [];

	constructor(inputString) {
		const tokenizedInputString = jsTokens(inputString);
		let tokenizedArray = Array.from(tokenizedInputString);

		// removes newlines
		tokenizedArray = tokenizedArray.filter(function (token) {
			return token.type != "LineTerminatorSequence";
		});

		// removes whitespaces
		tokenizedArray = tokenizedArray.filter(function (token) {
			return token.type != "WhiteSpace";
		});
		
		// first open bracket should be after table name
		var index = tokenizedArray.map(function (e) { return e.value; }).indexOf("(");
	
		if (index == -1) {
			throw Error("No brackets found in string")
		}

		//Must contain only letters (a-z, A-Z), numbers (0-9), or underscores ( _ ) 
		//Must begin with a letter or underscore.
		// Must be less than the maximum length of 59 characters. 
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
								column.addKey("P")
							}
						}
					}
				}
			}
		}
	}

	hasPrimaryKey() {
		for (const element of this.columns) {
			if (element.hasPrimaryKey()) {
				return true;
			}
		}
		return false
	}

	createTable(div) {
		let table = document.createElement("div");
		table.className = "row border border-2 mx-3 w-25 gx-0 h-100 my-3 w-auto";

		let keyColumn = document.createElement("div");
		if (this.hasPrimaryKey()) {
			keyColumn.className = "col-1 border border-2 gx-0";
		} else {
			keyColumn.className = "col-1 border border-2 gx-0 error";
		}
		
		let nameColumn = document.createElement("div");
		nameColumn.className = "col border border-2 h-100 gx-0";

		let typeColumn = document.createElement("div");
		typeColumn.className = "col border border-2 h-100 gx-0";

		let heading = document.createElement("h3");
		heading.className = "text-center border my-0 bg-primary";
		heading.innerText = this.name;
		table.appendChild(heading);

		for (const column of this.columns) {
			if (column.hasPrimaryKey()) {
				this.createColumn("P", keyColumn)
			} else {
				this.createColumn("", keyColumn)
			}
			
			this.createColumn(column.name, nameColumn)
			this.createColumn(column.columnType.getValue(), typeColumn)
		}

		table.appendChild(keyColumn);
		table.appendChild(nameColumn);
		table.appendChild(typeColumn);

		div.appendChild(table);
	}

	createColumn(text, div) {
		if (text != "") {
			let nameRow = document.createElement("div");
			if (text != "P") {
				nameRow.className = "row py-1 px-2 gx-0 border";
			} else {
				nameRow.className = "row py-1 px-2 gx-0";
			}

			let nameText = document.createTextNode(text);
			nameRow.appendChild(nameText);

			div.appendChild(nameRow)
		}
	}

	writeSyntax(textArea) {
		var typeText = document.createElement("span");
		typeText.className = "typeColor"

		var typeValueText = document.createElement("span");
		typeValueText.className = "typeValueColor"

		var constraintText = document.createElement("span");
		constraintText.className = "constraintColor"

		typeText.textContent = "CREATE TABLE "
		textArea.appendChild(typeText)
		textArea.innerHTML += this.name + " (" + "<br>"

		// create function for writing in colours

		//Write a method in column to create the syntax per column??
		for (const column of this.columns) {
			textArea.innerHTML += "&emsp;"
			textArea.innerHTML += column.name + " "
			if (column.columnType.doesTypeHaveValue()) {
				typeText.textContent = column.columnType.type
				typeText.id = column.columnType.type
				textArea.appendChild(typeText)
				textArea.innerHTML += " (";
				typeValueText.textContent = column.columnType.value
				textArea.appendChild(typeValueText)
				textArea.innerHTML += ")"
			} else {
				typeText.textContent = column.columnType.getValue()
				typeText.id = column.columnType.getValue();
				textArea.appendChild(typeText)
			}
			column.writeConstraintSyntax(textArea)
		}
		textArea.innerHTML += ");"
		textArea.innerHTML += "<br>"
	}

	createErrors() {
		// add the notification red bubble to  the errors tab button
	}

	getUniqueColumnTypes() {
		var columnTypes = [];
		for (const element of this.columns) {
			columnTypes.push(element.columnType.getType())
		}
		return Array.from(new Set(columnTypes))
	}
}