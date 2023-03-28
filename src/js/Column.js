import ColumnType from './ColumnType';
import ForeignKey from './ForeignKey';
import Util from './Util';
import { SyntaxError } from './SyntaxError';

export default class Column {
    name;
    columnType;
    #primaryKey = "";
    #foreignKey;
    nullable = true;
    unique = false;
    constraints;

    constructor(tokenizedArray, columns) {
        Util.joinPunctuators(tokenizedArray)
        


        // first element should be name
        var columnName = tokenizedArray[0].value
        if (Util.isColumnNameValid(columnName, columns)) {
            this.name = columnName
        } else {
            throw new SyntaxError(`Column name "${columnName}" is invalid or duplicated`, columnName)
        }

        var columnType = new ColumnType();
        var dataType = tokenizedArray[1].value

        if (tokenizedArray[2] !== undefined) { // checking if there are enough arguments to parse
            var openBracket = tokenizedArray[2].value

            if (openBracket == "(" && tokenizedArray[4].value == ")") { //brackets for dataType
                columnType.setType(dataType, tokenizedArray[3].value) //set type with dataType and value
                tokenizedArray = tokenizedArray.splice(5)
            } else if (openBracket == "(") { // open bracket is present but closed is not
                if (tokenizedArray[3].value == ")") { // nothing in between the brackets means no value
                    throw new SyntaxError(`Empty Column Type Value`, "()")
                } else {
                    throw new SyntaxError(`Missing closing bracket for Column Type`, tokenizedArray[3].value)
                }
            } else if (openBracket == ")") {
                throw new SyntaxError(`Missing open bracket for Column Type`, dataType)
            } else {
                columnType.setType(dataType)
                tokenizedArray = tokenizedArray.splice(2)
            }
        } else {// if there is only columnName and dataType
            columnType.setType(dataType) 
            tokenizedArray = tokenizedArray.splice(2)         
        }

        this.columnType = columnType

        for (const element of tokenizedArray) {
            console.log(element)
        }

        while (tokenizedArray.length > 0) {
            var word = tokenizedArray[0].value
            switch (word.toUpperCase()) {
                case "NULL":
                    break;
                case "NOT":
                    if (tokenizedArray[1].value == "NULL") {
                        this.nullable = false
                        tokenizedArray.splice(0,2)
                    } else {
                        throw new SyntaxError(`Expecting NULL instead of "${tokenizedArray[1].value}"`, tokenizedArray[1].value)
                    }
                    break;
                case "PRIMARY":
                    if (tokenizedArray[1].value == "KEY") {
                        this.addKey("P")
                        tokenizedArray.splice(0,2)
                    }
                    break;
                case "UNIQUE":
                    this.unique = true
                    tokenizedArray.splice(0)
                    break;
                    default:
                        throw new SyntaxError(`Unrecognised Constraint: ${word}`, word)
            }
        }

       

        
        this.constraints = tokenizedArray
    }

    writeConstraintSyntax(textArea) {

        if (this.constraints.length != 0) {
            for (const element of this.constraints) {
                var typeValueText = document.createElement("span");
                typeValueText.className = "typeValueColor"

                var constraintText = document.createElement("span");
                constraintText.className = "constraintColor"

                if (element.type == "IdentifierName") {
                    if (element.value == "NULL") {
                        typeValueText.textContent = " " + element.value
                        textArea.appendChild(typeValueText)
                    } else {
                        constraintText.textContent = " " + element.value
                        textArea.appendChild(constraintText)
                    }
                }
            }
        }
        textArea.innerHTML += "<br>"
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

    setForeignKey(referencedTable,referencedColumn,columnType) {
        this.#foreignKey = new ForeignKey(referencedTable,referencedColumn,columnType)
    }

    getForeignKey() {
        return this.#foreignKey
    }
}

