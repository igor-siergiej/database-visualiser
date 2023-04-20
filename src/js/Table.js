import jsTokens from "js-tokens";
import Column from './Column';
import Util from "./Util";
import { SyntaxError } from "./SyntaxError";

export default class Table {
	name;
	global = false;
	local = false;
	temp = false;
	unlogged = false;
	ifNotExists = false;
	schema = "public"
	columns = [];
	owner;

	constructor(tokenizedArray, database) {
		// tokenizedArray[0] this should be "CREATE" but is already checked for	

		var indexOfOpenBracket;

		var secondWord
		if (tokenizedArray[1] != undefined) {
			secondWord = tokenizedArray[1].value
		}

		var thirdWord
		if (tokenizedArray[2] != undefined) {
			thirdWord = tokenizedArray[2].value
		}

		// checking what is after "CREATE"
		switch (secondWord.toUpperCase()) {
			// If it's "GLOBAL" or "LOCAL", check if "TEMP" or "TEMPORARY" is used
			case "GLOBAL":
			case "LOCAL":
				if (thirdWord != "TEMPORARY" && thirdWord != "TEMP") {
					throw new SyntaxError("GLOBAL or LOCAL flag used without TEMPORARY flag", tokenizedArray[1].value)
				} else {
					// If "TEMP" flag is used set the correct flags
					if (secondWord == "GLOBAL") {
						this.temp = true
						this.global = true
					} else {
						this.temp = true
						this.local = true
					}
				}

				// check if "TABLE" word is present
				this.checkIfTableFlagExists(3, tokenizedArray)

				// get the index of the open bracket based on if "IF NOT EXISTS" flag exists 
				// and if schema name is used in the table name and validating everything.
				indexOfOpenBracket = this.checkCreateTableStatement(3, tokenizedArray, database)
				break;

			case "UNLOGGED":
				this.unlogged = true
				this.checkIfTableFlagExists(2, tokenizedArray)
				indexOfOpenBracket = this.checkCreateTableStatement(2, tokenizedArray, database)
				break;

			case "TEMP":
			case "TEMPORARY":
				this.temp = true
				this.checkIfTableFlagExists(2, tokenizedArray)
				indexOfOpenBracket = this.checkCreateTableStatement(2, tokenizedArray, database)
				break;

			case "TABLE":
				// don't need to check for table flag becuase it already exists
				indexOfOpenBracket = this.checkCreateTableStatement(1, tokenizedArray, database)
				break;

			default:
				// if flag is not recognised then throw new error
				throw new SyntaxError(`\"${tokenizedArray[1].value}\" is not a valid flag in a CREATE TABLE statement.`
					, tokenizedArray[1].value)
		}

		// split everything before the open bracket to remove the CREATE TABLE
		tokenizedArray = tokenizedArray.slice(indexOfOpenBracket + 1);

		if (indexOfOpenBracket == -1) {
			throw new SyntaxError(`Missing columns`)
		}
		

		// just get the values from tokenized array
		var tokenizedArrayValues = tokenizedArray.map(function (element) {
			return element['value'];
		});

		// join the array to a string
		tokenizedArrayValues = tokenizedArrayValues.join(" ")

		const commaOutsideOfBrackets = /(?<!\([^\)]+)\s*,\s*(?!\))/;

		// split the string to individual columns
		var columnStrings = tokenizedArrayValues.split(commaOutsideOfBrackets)

		// checking that there is a closing bracket for the statement
		var lastColumn = columnStrings[columnStrings.length - 1]
		if (lastColumn[lastColumn.length - 1] != ")") {
			throw new SyntaxError(`Missing closing bracket for statement`, ")")
		} else {
			columnStrings[columnStrings.length - 1] = lastColumn.substring(0, lastColumn.length - 1);
		}

		var columns = [];

		for (const element of columnStrings) {

			// tokenize the column string
			const tokenizedInputString = jsTokens(element);
			var tokenizedColumnArray = Array.from(tokenizedInputString)

			// if there is an unclosed quote then throw error
			for (const token of tokenizedColumnArray) {
				if (token.type == "StringLiteral" && token.closed == false) {
					throw new SyntaxError(`Single quote found without a closing one`, token.value)
				}
			}

			// remove white spaces
			tokenizedColumnArray = tokenizedColumnArray.filter(function (token) {
				return token.type != "WhiteSpace";
			});

			columns.push(tokenizedColumnArray)
		}

		for (const columnArray of columns) {
			if (columnArray[0] == undefined) { // if columnArray is empty means that there is an extra comma
				throw new SyntaxError(`Empty column, there probably exists an extra comma in table ${this.name}`, this.name)
			}
			var firstWord = columnArray[0].value.toUpperCase()
			if (firstWord == "PRIMARY" || firstWord == "FOREIGN") { // this means we reached table constraints
				// need the rest of the arrays joined and passed to parseTableConstraints()
				this.parseTableConstraints(columns.slice(columns.indexOf(columnArray)), database)
				break
			} else {
				// this means there were no table constraints
				var column = new Column(columnArray, this.columns,database);
				this.columns.push(column);
			}
		}
	}

	checkCreateTableStatement(startingIndex, tokenizedArray, database) {
		var indexOfOpenBracket
		if (tokenizedArray[3] == undefined) {
			return -1
		}
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
		var firstWord = tokenizedArray[indexOfTable + 1].value
		var secondWord = tokenizedArray[indexOfTable + 2].value
		var thirdWord = tokenizedArray[indexOfTable + 3].value
		if (firstWord.toUpperCase() == "IF") {
			if (secondWord.toUpperCase() == "NOT") {
				if (thirdWord.toUpperCase() == "EXISTS") {
					this.ifNotExists = true
					return true
				} else {
					throw new SyntaxError("Unexpected word in \"IF NOT EXISTS\"", thirdWord)
				}
			} else {
				throw new SyntaxError("Unexpected word in \"IF NOT EXISTS\"", secondWord)
			}
		} else {
			return false
		}
	}

	checkIfTableFlagExists(indexOfTable, tokenizedArray) {
		var word = tokenizedArray[indexOfTable].value
		if (word.toUpperCase() != "TABLE") {
			throw new SyntaxError(`\"${word}\" should be "TABLE"`, word)
		}
	}

	setName(nameIndex, tokenizedArray, database) {
		var tableName = tokenizedArray[nameIndex].value

		// this means that a schema name is before table name
		if (tokenizedArray[nameIndex + 1].value == ".") {
			if (this.temp) {
				throw new SyntaxError("Temporary tables exist in a special schema, so a schema name cannot be given when creating a temporary table", name)
			}
			var schemaName = tableName
			var tableName = tokenizedArray[nameIndex + 2].value


			if (Util.isNameValid(tableName)) {
				if (Util.isNameValid(schemaName)) {
					if (this.doesSchemaExist(schemaName, database.getSchemas())) {
						// get the tables where schema is schemaName
						if (!this.doesTableExist(tableName,schemaName, database.getSchemas())) { // does table already exist in schema
							this.name = tableName
							this.schema = schemaName
							return true
						} else {
							throw new SyntaxError(`Table "${tableName}" already exists in schema "${schemaName}"`, tableName)
						}
					} else {
						throw new SyntaxError(`Schema "${schemaName}" does not exist`, schemaName)
					}
				} else {
					throw new SyntaxError(`Schema name "${schemaName}" is not valid`, schemaName)
				}
			} else {
				throw new SyntaxError(`Name "${tableName}" is not valid`, tableName)
			}

			// this means that only table name is present
		} else if (tokenizedArray[nameIndex + 1].value == "(") {
			if (Util.isNameValid(tableName)) {
				if (!this.doesTableExist(tableName,this.schema, database.getSchemas())) {
					this.name = tableName;
				} else {
					throw new SyntaxError(`Table name "${tableName}" already exists`, tableName)
				}
			} else {
				throw new SyntaxError(`Name "${tableName}" is not valid`, tableName)
			}
		} else {
			throw new SyntaxError("Invalid syntax, should be an open bracket or invalid table name", tokenizedArray[nameIndex + 0].value + tokenizedArray[nameIndex + 1].value)
		}
	}

	doesSchemaExist(schemaName, schemas) {
		var match = false
		for (const schema of schemas) {
			if (schema.name == schemaName) {
				match = true
			}
		}
		return match
	}

	doesTableExist(tableName, schemaName, schemas) {
		var tables = []
		for (const schema of schemas) {
			if (schema.name == schemaName) {
				for (const table of schema.tables) {
					tables.push(table)
				}
				break
			}
		}
		return Util.doesNameExist(tableName,tables)
	}

	parseTableConstraints(tableConstraintsList, database) {
		for (const constraintStatement of tableConstraintsList) {
			var firstWord = constraintStatement[0].value
			var secondWord = constraintStatement[1].value
			var thirdWord = constraintStatement[2].value
			switch (firstWord.toUpperCase()) {
				case "PRIMARY":
					if (secondWord.toUpperCase() == "KEY") {
						if (thirdWord == "(") {
							var columnNames = [];
							// while values are either "," or valid column name add them to columnNames
							columnNames.push(constraintStatement[3].value)
							columnNames.push(constraintStatement[5].value)
							this.setPrimaryKey(columnNames)
						} else {
							throw new SyntaxError(`Expected open bracket instead of: "${thirdWord}"`, thirdWord)
						}
					} else {
						throw new SyntaxError(`Expected "KEY" instead of: "${secondWord}"`, secondWord)
					}
					break;

				case "FOREIGN":// need to add functionality for multiple columns in foreign key
					if (secondWord.toUpperCase() == "KEY") {
						if (thirdWord == "(") {
							var columnName = constraintStatement[3].value
							var referencedTable = constraintStatement[6].value
							var referencedColumn = constraintStatement[8].value
							var referencedColumnType
							for (const schema of database.getSchemas()) {
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
							this.setForeignKey(columnName, referencedTable, referencedColumn, referencedColumnType)
						} else {
							throw new SyntaxError(`Expected open bracket instead of: ${thirdWord}`, thirdWord)
						}
					} else {
						throw new SyntaxError(`Expected "KEY" instead of: ${secondWord}`, secondWord)
					}
					break;
				default:
					throw new SyntaxError(`${firstWord} is not a valid constraint`, firstWord)
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

	setForeignKey(columnName, referencedTable, referencedColumn, referencedColumnType) {
		for (const column of this.columns) {
			if (column.name == columnName) {
				column.setForeignKey(referencedTable, referencedColumn, referencedColumnType)
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

	createTreeTable(div) {
		let table = document.createElement("div");
		table.className = "table row border border-2 mx-3 gx-0 my-3";
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
		headingColumn.appendChild(heading)
		table.appendChild(headingColumn);

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

	createTable(div) {
		let table = document.createElement("div");
		table.className = "row border border-2 mx-3 w-25 gx-0 h-100 my-3 w-auto";
		table.id = this.name

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
		typeColumn.id = "typeColumn"

		let heading = document.createElement("h3");
		heading.className = "text-center border my-0 bg-primary";
		heading.innerText = this.name;
		table.appendChild(heading);

		for (const column of this.columns) { 

			
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

	createColumn(text, div, column) {
		if (text != "") {
			let nameRow = document.createElement("div");

			if (text != "P") {
				nameRow.className = "row py-1 px-2 gx-0 border";
			} else {
				nameRow.className = "row gx-0 gy-0";
				nameRow.innerHTML =`<i class="bi bi-key-fill"></i>`
				div.appendChild(nameRow)
				return
			}
			if (div.id == "typeColumn") { // not ideal but works
				nameRow.id = this.name + "/" + column.name + "/" + column.columnType.type;
			}

			let nameText = document.createTextNode(text);
			nameRow.appendChild(nameText);

			div.appendChild(nameRow)
		}
	}

	writeSyntax(syntaxArea) {
		Util.writeSyntax("CREATE TABLE ", syntaxArea, Util.typeColor)
		Util.writeSyntax(this.name + " (<br>", syntaxArea)

		for (const column of this.columns) {
			Util.writeSyntax("&emsp;" + column.name + " ",syntaxArea)
			column.writeSyntax(syntaxArea)
			column.writeConstraintSyntax(syntaxArea)
		}
		
		Util.writeSyntax("); <br>",syntaxArea)
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