import ColumnType from './ColumnType';

export default class Column {
    name;
    columnType;
    isPrimaryKey = "";

    // need a dictionary look up for data types
    constructor(inputString) {
        if (inputString.find(e => e.value === "PRIMARY") && inputString.find(e => e.value === "KEY")) {
            this.isPrimaryKey = "P"
        }

        // first element in array should be name need to check
        this.name = inputString[0].value

        if (inputString.find(e => e.value === "(")) { // data type with no value

            var joinedArray = inputString.map(function (element) {
                return element['value'];
            });

            joinedArray = joinedArray.join(" ")

            const matchInsideBrackets = /(?<=\().*?(?=\))/;

            var matchedValues = joinedArray.match(matchInsideBrackets)

            this.columnType = new ColumnType(inputString[1].value, matchedValues[0].trim())
        } else {
            this.columnType = new ColumnType(inputString[1].value)
        }
    }
}

