import Util from "./Util";
import { SyntaxError } from "./SyntaxError";
import jsTokens from "js-tokens";

export default class Database {
    schemas = []
    errors = []


    addSchema(schema) {
        this.schemas.push(schema)
    }

    getSchemas() {
        return this.schemas
    }

    alterSchema(statement) {
        var schemaName = statement[0].value

        if (!Util.doesNameExist(schemaName,this.schemas)) {
            throw new SyntaxError(`Schema "${schemaName}" does not exist`, schemaName)
        }
    
        var flag = statement[1].value

        switch (flag.toUpperCase()) {
            case "RENAME":
                if (statement[2].value == "TO") {
                    var newName = statement[3].value

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
                    throw new SyntaxError(`Unrecognised flag "${statement[2].value}`, statement[2].value)
                }
                break;
            case "OWNER":
                if (statement[2].value == "TO") {
                    var newOwner = statement[3].value
                    if (Util.doesNameExist(newOwner, this.schemas)) {
                        for (const schema of this.schemas) {
                            if (schema.name == schemaName) {
                                schema.owner = newOwner
                            }
                        }
                    }
                } else {
                    throw new SyntaxError(`Unrecognised flag "${tokenizedArray[2].value}`, tokenizedArray[2].value)
                }
                break;
            default:
                throw new SyntaxError(`Unrecognised flag "${flag.toUpperCase()}`, flag)
        }
    }

    alterTable(statement) {
        var tableName
        var statementIndex

        // ignore ONLY keyword
        if (statement[0].value.toUpperCase() == "ONLY") {
            statement = statement.splice(1)
        }

        // if schema name is present
        if (statement[1].value == ".") {
            // does schema exist
            if (Util.doesNameExist(statement[0].value,this.schemas)) {
                var tempSchema
                for (const schema of this.schemas) {
                    if (schema.name == statement[0].value) {
                        tempSchema = schema
                    }
                }
                // does table name exist in the schema
                if (Util.doesNameExist(statement[2].value, tempSchema.tables)) {
                    statementIndex = 3
                    tableName = statement[2].value
                } else {
                    throw new SyntaxError(`Table "${statement[2].value}" does not exist in ${statement[0].value} Schema`)
                }
            } else {
                throw new SyntaxError(`Schema "${statement[1].value} does not exist`, statement[1].value)
            }
        } else {
            if (Util.doesNameExist(statement[0].value, this.getAllTables())) {
                tableName = statement[0].value
                statementIndex = 1
            } else {
                throw new SyntaxError(`Table "${statement[0].value}" does not exist`, statement[0].value)
            }
        }

        switch(statement[statementIndex].value.toUpperCase()) {
            case "OWNER":
                if (statement[statementIndex + 1].value == "TO") {
                    var schemaName = statement[statementIndex + 2].value
                    if (Util.doesNameExist(schemaName,this.schemas)) {
                        // set table owner to schema
                        for (const element of this.getAllTables()) {
                            if (element.name == tableName) {
                                element.owner = schemaName
                            }
                        }
                    } else {
                        throw new SyntaxError(`Schema "${schemaName}" does not exist`, schemaName)
                    }
                } else {
                    throw new SyntaxError(`Expecting keyword "TO" instead of "${statement[statementIndex + 1].value}"`,statement[statementIndex + 1].value)
                }
                break;
            case "ADD":

                break;
            default:
                throw new SyntaxError(`Unrecognised Statement: ${statement[statementIndex].value}`, statement[statementIndex].value)
        }
    }

    getAllTables() {
        let tables = []
        for (const schema of this.schemas) {
            for (const table of schema.tables) {
                tables.push(table)
            }
        }
        return tables
    }

    getTable(tableName,schemaName) {
        if (schemaName == undefined) {
            schemaName = "public"
        }
       
        for (const table of this.getAllTables()) {
            if (table.name == tableName && table.schema == schemaName) {
                return table
            }
        }
    }
}