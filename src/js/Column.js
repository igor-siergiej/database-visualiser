import ColumnType from './ColumnType';
import Util from './Util';

export default class Column {
    name;
    columnType;
    #primaryKey = "";
    #foreignKey = "";
    nullable = true;
    constraints;

    constructor(tokenizedArray) {
        Util.joinPunctuators(tokenizedArray)

        // if the input array contains primary and key then remove them from the 
        // if (tokenizedArray.find(e => e.value === "PRIMARY") && tokenizedArray.find(e => e.value === "KEY")) {
        //     this.addKey("P") // need to check if the keywords are next to eachother
        //     tokenizedArray = tokenizedArray.filter(element => element.value !== "PRIMARY")
        //     tokenizedArray = tokenizedArray.filter(element => element.value !== "KEY")
        //     // is there a better way of doing this?
        // }

        // first element should be name
        if (Util.isNameValid(tokenizedArray[0].value)) {
            this.name = tokenizedArray[0].value // 
        } else {
            throw new Error(`Column name\"${tokenizedArray[0].value}\" invalid`)
        }

        // removes name from array
        tokenizedArray = tokenizedArray.splice(1);

        var columnType = new ColumnType();

        if (tokenizedArray[1].value == "(" && tokenizedArray[3].value == ")") {
            columnType.setType(tokenizedArray[0].value, tokenizedArray[2].value)
        } else {
            columnType.setType(tokenizedArray[0].value)
        }

        this.columnType = columnType

        console.log(columnType)

        if (tokenizedArray.find(e => e.value === "(")) { // data type with no value

            var joinedArray = tokenizedArray.map(function (element) {
                return element['value'];
            });

            joinedArray = joinedArray.join(" ")

            const matchInsideBrackets = /(?<=\().*?(?=\))/;

            var matchedValues = joinedArray.match(matchInsideBrackets)

            this.columnType = new ColumnType(tokenizedArray[0].value, matchedValues[0].trim())
            tokenizedArray = tokenizedArray.splice(4) // this will remove open bracket, value inside and close bracket
        } else {
            this.columnType = new ColumnType(tokenizedArray[0].value)
            tokenizedArray = tokenizedArray.splice(1) // this will just remove the datatype

        }
        this.constraints = tokenizedArray
        // if there are words here that do not match keywords then flag as error
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
}

