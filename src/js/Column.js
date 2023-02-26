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
        this.name = inputString[0]

        if (inputString.find(e => e.value === "(")) { // data type with no value

            var joinedArray = inputString.map(function (element) {
                return element['value'];
            });

            joinedArray = joinedArray.join(" ")
            console.log(joinedArray)

            const matchInsideBrackets = /(?<=\().*?(?=\))/;

            this.columnType = new ColumnType(inputString[1].value, parseInt(joinedArray.match(matchInsideBrackets)[0]))
        } else {
            this.columnType = new ColumnType(inputString[1].value)
        }
    }
}

