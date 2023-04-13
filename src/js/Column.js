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

    constructor(tokenizedArray, columns) {
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

        var columnConstraints = ["PRIMARY", "NOT", "NULL", "UNIQUE","DEFAULT"]

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
        this.parseColumnConstraints(tokenizedArray)
    }

    parseColumnConstraints(tokenizedArray) {
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
                    // TODO foreign key
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

