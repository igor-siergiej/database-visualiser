import ColumnType from './ColumnType';

export default class Column {
    name;
    columnType;
    #primaryKey = "";
    #foreignKey = "";
    constraints;
    errors = [];

    // need a dictionary look up for data types
    constructor(inputString) {
        // need to add validation to this
        
        if (inputString.find(e => e.value === "PRIMARY") && inputString.find(e => e.value === "KEY")) {
            this.addKey("P") // need to check if the keywords are next to eachother
            inputString = inputString.filter(element => element.value !== "PRIMARY")
            inputString = inputString.filter(element => element.value !== "KEY")
            // is there a better way of doing this?
        }

        // first element in array should be name need to check
        this.name = inputString[0].value
        this.errors.push("name")

        inputString = inputString.splice(1)

        if (inputString.find(e => e.value === "(")) { // data type with no value

            var joinedArray = inputString.map(function (element) {
                return element['value'];
            });

            joinedArray = joinedArray.join(" ")

            const matchInsideBrackets = /(?<=\().*?(?=\))/;

            var matchedValues = joinedArray.match(matchInsideBrackets)

            this.columnType = new ColumnType(inputString[0].value, matchedValues[0].trim())
            inputString = inputString.splice(4) // this will remove open bracket, value inside and close bracket
        } else {
            this.columnType = new ColumnType(inputString[0].value)
            inputString = inputString.splice(1) // this will just remove the datatype

        }
        this.constraints = inputString
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

