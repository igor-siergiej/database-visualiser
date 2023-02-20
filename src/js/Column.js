export default class Column {
    name;
    type;
    isPrimaryKey;

    constructor(inputString) {
        // if column type is found in array from dictionary then set type.
        // remove all words from dictionary and the one that remains is column name?
        this.name = inputString[0]
        this.type = inputString[1]
    }
}