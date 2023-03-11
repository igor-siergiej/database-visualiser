import jsTokens from "js-tokens";
import Column from './Column';

export default class Table {
	name;
	global = false;
	local = false;
	temp = false;
	unlogged = false;
	ifNotExists = false;

	columns = [];

	constructor(inputString, database) {
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

		// tokenizedArray[0] this should be "CREATE" but is already checked for	

		var indexOfOpenBracket;

		switch (tokenizedArray[1].value) {
			case "GLOBAL":
			case "LOCAL":

				if (tokenizedArray[2].value != "TEMPORARY" && tokenizedArray[2].value != "TEMP") {
					throw Error("GLOBAL or LOCAL flag used without TEMPORARY flag")
				} else {
					if (tokenizedArray[1] == "GLOBAL") {
						this.global = true
					} else {
						this.local = true
					}
				}

				if (tokenizedArray[3].value != "TABLE") {
					throw Error("MISSING TABLE")
				}

				this.setName(4, tokenizedArray, database)
				indexOfOpenBracket = 5
				break;

			case "UNLOGGED":

				this.unlogged = true



				// need to check if table exists
				this.setName(3, tokenizedArray, database)
				indexOfOpenBracket = 4
				break;

			case "TEMP":
			case "TEMPORARY":

				this.temp = true
				if (tokenizedArray[2].value != "TABLE") {
					throw Error("MISSING TABLE")
				}

				this.setName(3, tokenizedArray, database)
				indexOfOpenBracket = 4
				break;

			case "TABLE":
				if (this.checkIfNotExists(1, tokenizedArray)) {
					if (this.setName(5, tokenizedArray, database)) {
						indexOfOpenBracket = 8
					} else {
						indexOfOpenBracket = 6
					}
				} else {
					if (this.setName(2, tokenizedArray, database)) {
						indexOfOpenBracket = 5
					} else {
						indexOfOpenBracket = 3
					}
				}
				
				break;

			default:
				throw Error("INVALID FLAG IN CREATE STATEMENT")
		}

		console.log(this)

		// split everything before the open bracket to remove the CREATE TABLE
		tokenizedArray = tokenizedArray.slice(indexOfOpenBracket + 1);
		console.log(tokenizedArray)

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

	checkIfNotExists(indexOfTable, tokenizedArray) {
		if (tokenizedArray[indexOfTable + 1].value == "IF") {
			if (tokenizedArray[indexOfTable + 2].value == "NOT") {
				if (tokenizedArray[indexOfTable + 3].value == "EXISTS") {
					this.ifNotExists = true
					return true
				} else {
					throw new Error("Unexpected word in \"IF NOT EXISTS\"")
				}
			} else {
				throw new Error("Unexpected word in \"IF NOT EXISTS\"")
			}
		} else {
			return false
		}
	}

	checkIfTableFlagExists(indexOfTable, tokenizedArray) {
		if (tokenizedArray[indexOfTable].value != "TABLE") {
			throw Error("Missing \"TABLE\"")
		}
	}

	setName(nameIndex, tokenizedArray, database) {
		var name = tokenizedArray[nameIndex].value

		// this means that a schema name is before table name
		if (tokenizedArray[nameIndex + 1].value == ".") {
			var schemaName = name
			var name = tokenizedArray[nameIndex + 2].value

			if (this.isNameValid(name)) {
				if (this.isNameValid(schemaName)) {
					if (this.doesSchemaExist(database, schemaName)) {
						this.name = name
						return true
						// add this table to the schema
					} else {
						throw new Error(`Schema "${schemaName}" does not exist`)
					}
				} else {
					throw new Error(`Schema name "${schemaName}" is not valid`)
				}
			} else {
				throw new Error(`Name "${name}" is not valid`)
			}

			// this means that only table name is present
		} else if (tokenizedArray[nameIndex + 1].value == "(") {
			if (this.isNameValid(name)) {
				this.name = name;
			}
		} else {
			throw new Error("Invalid syntax, should be an open bracket or invalid table name")
		}
	}

	// Name must contain only letters (a-z, A-Z), numbers (0-9), or underscores ( _ ) 
	// Name must begin with a letter or underscore.
	// Name must be less than the maximum length of 59 characters. 
	isNameValid(name) {
		var valid = false
		const validSQLColumnNameRegex = /^[A-Za-z_][A-Za-z\d_]*$/;

		if (name.match(validSQLColumnNameRegex) && name.length < 59) {
			valid = true
		}
		return valid
	}

	doesSchemaExist(database, schemaName) {
		var match = false
		for (const schema of database) {
			if (schema.name == schemaName) {
				match = true
			}
		}
		return match
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