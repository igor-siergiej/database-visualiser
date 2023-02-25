export default class Column {
    name;
    type;
    isPrimaryKey = "";

    constructor(inputString) {
        if (inputString.find(e => e.value === "PRIMARY") && inputString.find(e => e.value === "KEY")) {
            this.isPrimaryKey = "P"
        }

        if (inputString.find(e => e.value === "FOREIGN") && inputString.find(e => e.value === "KEY")) {
            this.isPrimaryKey = "P"
        }

        // first element in array should be name
        this.name = inputString[0]

        // need a dictionary look up for data types
        this.type = inputString[1]
        if (inputString.length > 2) {
            if (inputString[2].value == "(") {
                this.type.value = this.type.value.concat(inputString[2].value, inputString[3].value, inputString[4].value)
                // this should probably be add values to type until a closed bracket is
            }
        }
    }
}