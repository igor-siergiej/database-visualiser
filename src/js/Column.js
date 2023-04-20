import ColumnType from './ColumnType';
import ForeignKey from './ForeignKey';
import Util from './Util';
import { SyntaxError } from './SyntaxError';

export default class Column {
    name;
    columnType;
    #primaryKey = "";
    #foreignKey;
    nullable;
    unique = false;

    constructor(tokenizedArray, columns, database) {
        //Util.joinPunctuators(tokenizedArray)

        // first element should be name
        var columnName = tokenizedArray[0].value 

        //if columnName is a stringLiteral remove the quotes
        if (tokenizedArray[0].type == "StringLiteral") {
            this.name = columnName.substring(1,columnName.length -1)
        } else if (Util.isNameValid(columnName)) {
            if (!Util.doesNameExist(columnName, columns)) {
                this.name = columnName
            } else {
                throw new SyntaxError(`The column name "${columnName}" already exists`, columnName)
            }
        } else {
            throw new SyntaxError(`The Column name "${columnName}" is invalid`, columnName)
        }

        var columnType = new ColumnType();
        var dataType = ""

        // start from second word since first is columnName
        var i = 1 

        var columnConstraints = ["PRIMARY", "NOT", "NULL", "UNIQUE","DEFAULT", "REFERENCES"]

        // add words to dataType until we reach a constraint or "(" or end of array
        while (i < tokenizedArray.length && 
               !columnConstraints.includes(tokenizedArray[i].value.toUpperCase()) && 
               tokenizedArray[i].value != "(") {
            dataType += tokenizedArray[i].value + " "
            i++
        }

        // trim to remove space at end
        dataType = dataType.trim()

        // remove all of the words that we grouped above
        tokenizedArray = tokenizedArray.filter(function(element) {
            return !dataType.includes(element.value)
        })
        // add the dataType back into the array to make parsing work
        tokenizedArray.splice(1,0,dataType)

        if (tokenizedArray[2] !== undefined) { // checking if there are enough arguments to parse
            var openBracket = tokenizedArray[2].value

            if (openBracket == "(" && tokenizedArray[4].value == ")") { //brackets for dataType
                columnType.setType(dataType, tokenizedArray[3].value) //set type with dataType and value
                tokenizedArray = tokenizedArray.splice(5)
            } else if (openBracket == "(") { // open bracket is present but closed is not
                if (tokenizedArray[3].value == ")") { // nothing in between the brackets means no value
                    throw new SyntaxError(`Empty Column Type Value`, "()")
                } else if (tokenizedArray[4].value == ",") {
                    columnType.setType(dataType, tokenizedArray[3].value, tokenizedArray[5].value)
                    tokenizedArray = tokenizedArray.splice(7)
                } else {
                    throw new SyntaxError(`Missing closing bracket for Column Type: ${tokenizedArray[4].value}`, tokenizedArray[4].value)

                }
            } else if (openBracket == ")") {
                throw new SyntaxError(`Missing open bracket for Column Type`, dataType)
            } else {
                columnType.setType(dataType)
                tokenizedArray = tokenizedArray.splice(2)
            }
        } else {// if there is only columnName and dataType (2 words)
            columnType.setType(dataType)
            tokenizedArray = tokenizedArray.splice(2)
        }
        this.columnType = columnType
        this.parseColumnConstraints(tokenizedArray,database)
    }

    parseColumnConstraints(tokenizedArray,database) {
        while (tokenizedArray.length > 0) {
            var word = tokenizedArray[0].value
            
            switch (word.toUpperCase()) {
                case "NULL":
                    this.nullable = true
                    break;
                case "NOT":
                    if (tokenizedArray[1].value == "NULL") {
                        this.nullable = false
                        tokenizedArray.splice(0, 2)
                    } else {
                        throw new SyntaxError(`Expecting NULL instead of "${tokenizedArray[1].value}"`, tokenizedArray[1].value)
                    }
                    break;
                case "PRIMARY":
                    if (tokenizedArray[1].value == "KEY") {
                        this.addKey("P")
                        tokenizedArray.splice(0, 2)
                    }
                    break;
                case "UNIQUE":
                    this.unique = true
                    tokenizedArray.shift()
                    break;
                case "REFERENCES":
                    var table
                    var openBracketIndex

                    if (tokenizedArray[2].value == ".") {
                        // if schema exists
                        if (Util.doesNameExist(tokenizedArray[1].value,database.getSchemas())) {
                            var tempTable = database.getTable(tokenizedArray[3].value,tokenizedArray[1].value)
                            if (tempTable != undefined) {
                                openBracketIndex = 4
                                table = tempTable
                            } else {
                                throw new SyntaxError(`Table "${tokenizedArray[3].value}" does not exist`, tokenizedArray[3].value)
                            }
                        } else {
                            throw new SyntaxError(`Schema "${tokenizedArray[1].value}" does not exist`, tokenizedArray[1].value)
                        }
                    } else {
                        var tempTable = database.getTable(tokenizedArray[1].value)
                        if (tempTable != undefined) {
                            table = tempTable
                            openBracketIndex = 2
                        } else {
                            throw new SyntaxError(`Table "${tokenizedArray[1].value}" does not exist`, tokenizedArray[1].value)
                        }
                    }
                    if (tokenizedArray[openBracketIndex] != undefined) {
                        if (tokenizedArray[openBracketIndex+2] != undefined) {
                            if (tokenizedArray[openBracketIndex].value == "(") {
                                if (tokenizedArray[openBracketIndex+2].value == ")") {
                                    var foundColumn
                                    for (const element of table.columns) {
                                        if (element.name == tokenizedArray[openBracketIndex+1].value){
                                            foundColumn = element
                                        }
                                    }
                                    if (foundColumn != undefined) {
                                        this.#foreignKey = new ForeignKey(table.name,foundColumn.name,foundColumn.columnType.type)
                                        tokenizedArray.splice(0,openBracketIndex+3)
                                    }
                                } else {
                                    throw new SyntaxError(`Expected closing bracket instead of "${tokenizedArray[openBracketIndex+2].value}"`,tokenizedArray[openBracketIndex+2].value)
                                }
                            } else { // else assume the primary key columns of that table
                                throw new SyntaxError(`Expected open bracket instead of "${tokenizedArray[openBracketIndex].value}"`,tokenizedArray[openBracketIndex].value)
                            }
                        } else {
                            throw new SyntaxError(`Missing flag near "${tokenizedArray[tokenizedArray.length-1].value}"`,tokenizedArray[tokenizedArray.length-1].value)
                        }
                    } else {
                        throw new SyntaxError(`Missing flag near "${tokenizedArray[tokenizedArray.length-1].value}"`,tokenizedArray[tokenizedArray.length-1].value)
                    }
                    break;
                case "CHECK":
                    // TODO dunnno
                    break;
                case "DEFAULT":
                    tokenizedArray.splice(0)
                    // look at dump.sql and properly remove check checks
                    break;
                default:
                    throw new SyntaxError(`Unrecognised Constraint: ${word}`, word)
            }
        }
    }

    writeSyntax(syntaxArea) {
        if (this.columnType.doesTypeHaveValue()) {
            Util.writeSyntax(this.columnType.type,syntaxArea,Util.typeColor)
            Util.writeSyntax(" (",syntaxArea)

            Util.writeSyntax(this.columnType.value,syntaxArea,Util.typeValueColor)
            Util.writeSyntax(")",syntaxArea) 
        } else {
            Util.writeSyntax(this.columnType.type,syntaxArea,Util.typeColor)
        }
    }

    writeConstraintSyntax(syntaxArea) {
        if (this.#primaryKey == "P") {
            Util.writeSyntax(" PRIMARY KEY",syntaxArea, Util.typeColor)
        }
        if (this.unique) {
            Util.writeSyntax(" UNIQUE", syntaxArea, Util.constraintColor)
        }

        if (this.nullable == false) {
            Util.writeSyntax(" NOT",syntaxArea,Util.constraintColor)
            Util.writeSyntax(" NULL",syntaxArea,Util.typeValueColor)
        } else if (this.nullable == true) {
            Util.writeSyntax(" NULL", syntaxArea, Util.typeValueColor)
        }
        Util.writeSyntax("<br>",syntaxArea)
    }
  
    addKey(key) {
        if (key == "P") {
            this.#primaryKey = "P"
        }
    }

    hasPrimaryKey() {
        if (this.#primaryKey == "P") {
            return true
        }
        return false
    }

    setForeignKey(referencedTable, referencedColumn, columnType) {
        this.#foreignKey = new ForeignKey(referencedTable, referencedColumn, columnType)
    }

    getForeignKey() {
        return this.#foreignKey
    }
}

