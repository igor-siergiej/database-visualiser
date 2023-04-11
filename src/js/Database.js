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
        var schemaName = statement[0]

        if (!Util.doesNameExist(schemaName,this.schemas)) {
            throw new SyntaxError(`Schema "${schemaName} does not exist`, schemaName)
        }
    
        var flag = statement[1]

        switch (flag.toUpperCase()) {
            case "RENAME":
                if (statement[2] == "TO") {
                    var newName = statement[3]

                    if (Util.isNameValid(newName)) {
                        if (Util.doesNameExist(newName, this.schemas)) {
                            for (const schema of this.schemas) {
                                if (schema.name == schemaName) {
                                    schema.name = newName
                                }
                            }
                        } else {
                            throw new SyntaxError(`Schema "${newName}" does not exist`, newName)
                        }
                    } else {
                        throw new SyntaxError(`Schema "${newName}" is not valid`, newName)
                    }
                } else {
                    throw new SyntaxError(`Unrecognised flag "${statement[2]}`, statement[2])
                }
                break;
            case "OWNER":
                if (statement[2] == "TO") {
                    var newOwner = statement[3]
                    if (Util.doesNameExist(newOwner, this.schemas)) {
                        for (const schema of this.schemas) {
                            if (schema.name == schemaName) {
                                schema.owner = newOwner
                            }
                        }
                    }
                } else {
                    throw new SyntaxError(`Unrecognised flag "${statement[2]}`, statement[2])
                }
                break;
            default:
                throw new SyntaxError(`Unrecognised flag "${flag.toUpperCase()}`, flag)
        }
    }

    alterTable(statement) {
        // need to check if schema name or just name was given
        // and check if the table exists
        // check in pgyadmin4 if you can enter just table name without schema
        if (!Util.doesNameExist(schemaName,this.schemas)) {
            throw new SyntaxError(`Schema "${schemaName} does not exist`, schemaName)
        }

    }

    getAllTables() {
        let tables = []
        for (const schema of this.schemas) {
            for (const table of schema.tables) {
                
            }
        }
    }
}