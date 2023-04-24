
const jsTokens = require("js-tokens")
const Column = require("./Column")
const Util = require("./Util")
const SyntaxError = require("./SyntaxError")


 class Table {
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
				var column = new Column(columnArray, this.columns, database);
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
						if (!this.doesTableExist(tableName, schemaName, database.getSchemas())) { // does table already exist in schema
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
				if (!this.doesTableExist(tableName, this.schema, database.getSchemas())) {
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
		return Util.doesNameExist(tableName, tables)
	}

	parseTableConstraints(tableConstraintsList, database) {
		for (var constraintStatement of tableConstraintsList) {
			switch (constraintStatement[0].value.toUpperCase()) {
				case "PRIMARY":
					Table.parsePriamryKeyTableConstraint(constraintStatement, this)
					break;
				case "FOREIGN":
					Table.parseForeignKeyTableConstraint(constraintStatement, this, database)
					break;
				default:
					throw new SyntaxError(`${constraintStatement[0].value} is not a valid constraint`, constraintStatement[0].value)
			}
		}
	}

	static parseForeignKeyTableConstraint(constraintStatement, table, database) {
		if (constraintStatement[1].value.toUpperCase() == "KEY") {
			if (constraintStatement[2].value == "(") {

				// removing "FOREIGN KEY ("
				constraintStatement = constraintStatement.splice(3)
				var columnNames = table.parseValuesInsideBrackets(constraintStatement, table)

				if (constraintStatement[0].value.toUpperCase() == "REFERENCES") {
					// removing previous elements of constraintStatement 
					constraintStatement = constraintStatement.splice(1)

					var referencedTable
					var openBracketIndex

					if (constraintStatement[1].value == ".") {
						// if schema exists
						if (Util.doesNameExist(constraintStatement[0].value, database.getSchemas())) {
							var tempTable = database.getTable(constraintStatement[2].value, constraintStatement[0].value)
							if (tempTable != undefined) {
								openBracketIndex = 3
								referencedTable = tempTable
							} else {
								throw new SyntaxError(`Table "${constraintStatement[2].value}" does not exist`, constraintStatement[2].value)
							}
						} else {
							throw new SyntaxError(`Schema "${constraintStatement[0].value}" does not exist`, constraintStatement[0].value)
						}
					} else {
						var tempTable = database.getTable(constraintStatement[0].value)
						if (tempTable != undefined) {
							referencedTable = tempTable
							openBracketIndex = 1
						} else {
							throw new SyntaxError(`Table "${constraintStatement[0].value}" does not exist`, constraintStatement[0].value)
						}
					}
				} else {
					throw new SyntaxError(`Unrecognised constraint: ${constraintStatement[0].value}`, constraintStatement[0].value)
				}

				constraintStatement = constraintStatement.splice(openBracketIndex + 1)
				var referencedColumnNames = referencedTable.parseValuesInsideBrackets(constraintStatement, referencedTable)


				// make sure the number of columns are the same in foreign key constraint
				if (referencedColumnNames.length != columnNames.length) {
					throw new SyntaxError("Number of referenced column names does not match number of column names in foreign key constraint")
				}

				for (let i = 0; i < columnNames.length; i++) {
					var columnType
					for (const column of referencedTable.columns) {
						if (column.name == referencedColumnNames[i]) {
							columnType = column.columnType.type
						}
					}
					table.setForeignKey(columnNames[i], referencedTable.name, referencedColumnNames[i], columnType)
				}

			} else {
				throw new SyntaxError(`Expected open bracket instead of: ${thirdWord}`, thirdWord)
			}
		} else {
			throw new SyntaxError(`Expected "KEY" instead of: ${secondWord}`, secondWord)
		}
	}

	static parsePriamryKeyTableConstraint(constraintStatement, table) {
		if (constraintStatement[1].value.toUpperCase() == "KEY") {
			if (constraintStatement[2].value == "(") {
				// removing "PRIMARY KEY ("
				constraintStatement = constraintStatement.splice(3)
				var columnNames = table.parseValuesInsideBrackets(constraintStatement, table)
				table.setPrimaryKey(columnNames)
			} else {
				throw new SyntaxError(`Expected open bracket instead of: "${constraintStatement[2].value}"`, constraintStatement[2].value)
			}
		} else {
			throw new SyntaxError(`Expected "KEY" instead of: "${constraintStatement[1].value}"`, constraintStatement[1].value)
		}
	}

	// this will take a constraintStatement and at index starting 0 parse values in brackets separated by commas until a closing bracket is reached
	parseValuesInsideBrackets(constraintStatement, table) {
		let j = 0
		let values = ""
		while (constraintStatement[j].value != ")") {
			if (constraintStatement[j + 1] == undefined || constraintStatement[j + 1].value == "(") {
				throw new SyntaxError(`Missing closing bracket in key constraint`)
			}
			if (constraintStatement[j].value != ",") {
				if (!Util.doesNameExist(constraintStatement[j].value, table.columns)) {
					throw new SyntaxError(`Column "${constraintStatement[j].value}" does not exist in table "${table.name}"`, constraintStatement[j].value)
				}
			}
			values += constraintStatement[j].value
			j++
		}
		// removes the values that were just parsed and put into values with the closing bracket
		constraintStatement.splice(0, j + 1)
		values = values.split(",")
		return values
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


	createTable(div) {
		let tableContainer = document.createElement("div")
		let table = document.createElement("table");
		table.className = "table border border-2 m-3"
		table.style = "width: fit-content;"

		let thead = table.createTHead();
		let headingRow = thead.insertRow();

		headingRow.className = ""

		let heading = document.createElement("th")
		heading.colSpan = 3
		heading.className = "bg-primary"

		let headingText;
		if (this.schema != "public") {
			headingText = document.createTextNode(this.schema + "." + this.name); 
		} else {
			headingText = document.createTextNode(this.name); 
		}

		heading.appendChild(headingText)
		headingRow.appendChild(heading)

		for (const column of this.columns) {
			var row = table.insertRow();

			this.createKeyColumn(row, column.hasPrimaryKey())
			this.createColumn(row, column.name)
			this.createColumn(row, column.columnType.type, column)
		}

		tableContainer.appendChild(table)
		div.appendChild(tableContainer);
	}

	createColumn(row, text, column) {
		let cell = row.insertCell();
		cell.className = "px-2 border"
		let textNode = document.createTextNode(text);
		cell.appendChild(textNode)

		if (column != undefined) {
			// not ideal but works
			cell.id = this.name + "/" + column.name + "/" + column.columnType.type;
		}
	}

	createKeyColumn(row, doesColumnHavePrimaryKey) {
		let cell = row.insertCell();
		cell.className = "borderless"
		if (doesColumnHavePrimaryKey) {
			cell.innerHTML = `<i class="bi bi-key-fill bi-3x"></i>`
		}
	}

	writeSyntax(syntaxArea) {
		Util.writeSyntax("<p>", syntaxArea)
		Util.writeSyntax("CREATE TABLE ", syntaxArea, Util.typeColor)
		Util.writeSyntax(this.name + " (<br>", syntaxArea)

		for (const column of this.columns) {
			Util.writeSyntax("&emsp;" + column.name + " ", syntaxArea)
			column.writeSyntax(syntaxArea)
			column.writeConstraintSyntax(syntaxArea)
			Util.writeSyntax(",<br>", syntaxArea)
		}
		Util.writeSyntax("); </p>", syntaxArea)
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

module.exports = Table