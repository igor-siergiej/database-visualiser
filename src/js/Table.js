import jsTokens from "js-tokens";
import Column from './Column';
import Util from "./Util";
import LeaderLine from "leader-line-new";

export default class Table {
	name;
	global = false;
	local = false;
	temp = false;
	unlogged = false;
	ifNotExists = false;
	schema = "public"
	columns = [];

	constructor(inputString, database) {
		// tokenize input string
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

		// checking what is after "CREATE"
		switch (tokenizedArray[1].value) { 
			// If it's "GLOBAL" or "LOCAL", check if "TEMP" or "TEMPORARY" is used
			case "GLOBAL":
			case "LOCAL":
				if (tokenizedArray[2].value != "TEMPORARY" && tokenizedArray[2].value != "TEMP") {
					throw Error("GLOBAL or LOCAL flag used without TEMPORARY flag")
				} else {
					// If "TEMP" flag is used set the correct flags
					if (tokenizedArray[1].value == "GLOBAL") {
						this.temp = true
						this.global = true
					} else {
						this.temp = true
						this.local = true
					}
				}

				// check if "TABLE" word is present
				this.checkIfTableFlagExists(3,tokenizedArray)

				// get the index of the open bracket based on if "IF NOT EXISTS" flag exists 
				// and if schema name is used in the table name and validating everything.
				indexOfOpenBracket = this.checkCreateTableStatement(3,tokenizedArray,database)
				break;

			case "UNLOGGED":
				this.unlogged = true
				this.checkIfTableFlagExists(2,tokenizedArray)
				indexOfOpenBracket = this.checkCreateTableStatement(2,tokenizedArray,database)
				break;

			case "TEMP":
			case "TEMPORARY":
				this.temp = true
				this.checkIfTableFlagExists(2,tokenizedArray)
				indexOfOpenBracket = this.checkCreateTableStatement(2,tokenizedArray,database)
				break;

			case "TABLE":
				// don't need to check for table flag becuase it already exists
				indexOfOpenBracket = this.checkCreateTableStatement(1,tokenizedArray,database)
				break;

			default:
				// if flag is not recognised then throw error
				throw Error("INVALID FLAG IN CREATE STATEMENT")
		}

		// split everything before the open bracket to remove the CREATE TABLE
		tokenizedArray = tokenizedArray.slice(indexOfOpenBracket + 1);

		// just get the values from tokenized array
		var tokenizedArrayValues = tokenizedArray.map(function (element) {
			return element['value'];
		});

		// join the array to a string
		tokenizedArrayValues = tokenizedArrayValues.join(" ")

		const commaOutsideOfBrackets = /(?<!\([^\)]+)\s*,\s*(?!\))/;

		// split the string to individual columns
		var columnStrings = tokenizedArrayValues.split(commaOutsideOfBrackets)

		var columns = [];

		for (const element of columnStrings) {
			
			// tokenize the column string
			const tokenizedInputString = jsTokens(element);
			var tokenizedColumnArray = Array.from(tokenizedInputString)
			
			// remove white spaces
			tokenizedColumnArray = tokenizedColumnArray.filter(function (token) {
				return token.type != "WhiteSpace";
			});

			columns.push(tokenizedColumnArray)
		}

		for (const columnArray of columns) {
			if (columnArray[0].value == "PRIMARY" || columnArray[0].value == "FOREIGN") { // this means we reached table constraints
				// need the rest of the arrays joined and passed to parseTableConstraints()
				this.parseTableConstraints(columns.slice(columns.indexOf(columnArray)), database)
				break
			} else {
				// this means there were no table constraints
				var column = new Column(columnArray);
				this.columns.push(column);
			}
		}
	}

	checkCreateTableStatement(startingIndex,tokenizedArray,database) {
		var indexOfOpenBracket
		if (this.checkIfNotExists(startingIndex, tokenizedArray)) {
			if (this.setName(startingIndex + 4, tokenizedArray, database)) {
				indexOfOpenBracket = startingIndex + 7
			} else {
				indexOfOpenBracket = startingIndex + 5
			}
		} else {
			if (this.setName(startingIndex + 1, tokenizedArray, database)) {
				indexOfOpenBracket = startingIndex + 4
			} else {
				indexOfOpenBracket = startingIndex + 2
			}
		}
		return indexOfOpenBracket
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
			if (this.temp) {
				throw new Error("Temporary tables exist in a special schema, so a schema name cannot be given when creating a temporary table")
			}
			var schemaName = name
			var name = tokenizedArray[nameIndex + 2].value

			if (Util.isNameValid(name)) {
				if (Util.isNameValid(schemaName)) {
					if (this.doesSchemaExist(database, schemaName)) {
						this.name = name
						this.schema = schemaName
						return true
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
			if (Util.isNameValid(name)) {
				this.name = name;
			} else {
				throw new Error(`Name "${name}" is not valid`)
			}
		} else {
			throw new Error("Invalid syntax, should be an open bracket or invalid table name")
		}
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

	parseTableConstraints(tableConstraintsList, database) {
		for (const constraintStatement of tableConstraintsList) {
			switch(constraintStatement[0].value) {
				case "PRIMARY":
					if (constraintStatement[1].value == "KEY") {
						if (constraintStatement[2].value == "(") {
							var columnNames = [];
							// while values are either "," or valid column name add them to columnNames
							columnNames.push(constraintStatement[3].value)
							columnNames.push(constraintStatement[5].value)
							this.setPrimaryKey(columnNames)
						} else {
							// throw error that open bracket expected
						}
					} else {
						throw new Error(`Expected "KEY" instead of ${constraintStatement[1].value}`)
					}
				break;

				case "FOREIGN":
					if (constraintStatement[1].value == "KEY") {
						if (constraintStatement[2].value == "(") {
							var columnName = constraintStatement[3].value
							var referencedTable = constraintStatement[6].value
							var referencedColumn = constraintStatement[8].value
							var referencedColumnType
							for (const schema of database) {
								for (const table of schema.tables) {
									if (table.name == referencedTable) {
										for (const column of table.columns) {
											if (column.name == referencedColumn) {
												referencedColumnType = column.columnType.type
											}
										}
									}
								}
							}
							this.setForeignKey(columnName,referencedTable,referencedColumn,referencedColumnType)
						} else {
							// throw error that open bracket expected
						}
					} else {
						throw new Error(`Expected "KEY" instead of ${constraintStatement[1].value}`)
					}
				break;

				default:
					throw new Error(`${constraintStatement[0].value} is not a valid constraint`)
			}
		}
	}
	
	setPrimaryKey(columnNames) {
		for (const columnName of columnNames) {
			for (const column of this.columns) {
				if (column.name == columnName) {
					column.addKey("P")
				}
			}
		}
	}

	setForeignKey(columnName, referencedTable,referencedColumn,referencedColumnType) {
		for (const column of this.columns) {
			if (column.name == columnName) {
				column.setForeignKey(referencedTable,referencedColumn,referencedColumnType)
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
		table.className = "table row border border-2 mx-3 gx-0  my-3";
		table.style = "width: fit-content;"
		table.id = this.name

		let headingColumn = document.createElement("div")
		headingColumn.className = "row-lg"

		let keyColumn = document.createElement("div");
		if (this.hasPrimaryKey()) {
			keyColumn.className = "col-1 border border-2 gx-0";
		} else {
			keyColumn.className = "col-1 border border-2 gx-0 error";
		}

		let nameColumn = document.createElement("div");
		nameColumn.className = "col-lg border border-2  gx-0";

		let typeColumn = document.createElement("div");
		typeColumn.className = "col-lg border border-2  gx-0";
		typeColumn.id = "typeColumn"

		let heading = document.createElement("h3");
		heading.className = "text-center border my-0 bg-primary";
		heading.innerText = this.name;


		headingColumn.appendChild(heading);
		table.appendChild(headingColumn)

		
		for (const column of this.columns) {
			
			if (column.hasPrimaryKey()) {
				this.createColumn("P", keyColumn)
			} else {
				this.createColumn("", keyColumn)
			}

			this.createColumn(column.name, nameColumn)
			this.createColumn(column.columnType.getValue(), typeColumn, column)
			// type column has to contain table name, column name and datatype
		}

		// fix this in the future and find a better way to set ids to draw lines 
		// or just keep it as it is but rework function to make it look better
		table.appendChild(keyColumn);
		table.appendChild(nameColumn);
		table.appendChild(typeColumn);

		div.appendChild(table);
	}

	createColumn(text, div,column) {
		if (text != "") {
			let nameRow = document.createElement("div");
			if (text != "P") {
				nameRow.className = "row py-1 px-2 gx-0 border";
			} else {
				nameRow.className = "row py-1 px-2 gx-0";
			}
			if (div.id == "typeColumn") { // not ideal but works
				nameRow.id = this.name+"/"+column.name + "/" + column.columnType.type;
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