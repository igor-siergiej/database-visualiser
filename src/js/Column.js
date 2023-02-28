import ColumnType from './ColumnType';

export default class Column {
    name;
    columnType;
    isPrimaryKey = "";
    constraints;

    // need a dictionary look up for data types
    constructor(inputString) {
        
        if (inputString.find(e => e.value === "PRIMARY") && inputString.find(e => e.value === "KEY")) {
            this.isPrimaryKey = "P" // need to check if the keywords are next to eachother
            inputString = inputString.filter(element => element.value !== "PRIMARY")
            inputString = inputString.filter(element => element.value !== "KEY")
            // is there a better way of doing this
        }

        // first element in array should be name need to check
        this.name = inputString[0].value

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
    }
}

