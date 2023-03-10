export default class Schema {
    name;
    tables = [];

    constructor(name) {
        this.name = name
    }
    
    addTable(table) {
        this.tables.push(table)
    }
}