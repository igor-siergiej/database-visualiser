import Util from "./Util";
import { SyntaxError } from "./SyntaxError";

export default class Database {
    schemas = []


    addSchema(schema) {
        this.schemas.push(schema)
    }

    getSchemas() {
        return this.schemas
    }

    alterSchema(statement) {
        console.log(statement)
    }

    alterTable() {

    }
}