export default class Table {
    name;
    columns;
    keys;

    constructor(name,columns,keys) {
        this.name = name;
        this.columns = columns;
        this.keys = keys;
    }
}