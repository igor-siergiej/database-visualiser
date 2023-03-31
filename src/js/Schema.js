import Util from "./Util";
import { SyntaxError } from "./SyntaxError";

export default class Schema {
    name;
    tables = [];

    constructor(schemaName, database) {
        if (Util.isNameValid(schemaName)) {
            if (!Util.doesNameExist(schemaName, database)) {
                this.name = schemaName
            } else {
                throw new SyntaxError(`The schema "${schemaName}" already exists`, schemaName)
            }
        } else {
            throw new SyntaxError(`The schema name "${schemaName}" is invalid`, schemaName)
        }
    }

    setName(name) {
        this.name = name
    }
    
    addTable(table) {
        this.tables.push(table)
    }

    alterTable(statement) {

    }
}