const jsTokens = require("js-tokens")
const Table = require("./Table")
const SyntaxError = require("./SyntaxError")
const Schema = require("./Schema")
  
  class Validator {

    // attempts to create a database object, if syntax error is detected, throws errors
    static validateSQL(database, inputString) {
        var statements
        // removes lines beginning with -- (comment in SQL)
        inputString = inputString.replace(/^--.*$/gm, '');
        if (inputString.includes(";")) {
            statements = inputString.split(";");
            if (statements[statements.length - 1].replace(/(\r\n|\n|\r)/gm, "").trim() == "") {
                statements.pop();
            }
        } else {
            throw new SyntaxError(`Missing Semicolon in statement`, inputString)
        }

        for (var statement of statements) {
            statement = statement.replaceAll("\\.", '')
            statement = statement.replace(/(\r\n|\n|\r)/gm, ""); // replaces new lines
            statement = statement.trim() // removes white spaces before and after statement

            // tokenize input string
            const tokenizedInputString = jsTokens(statement);
            let tokenizedArray = Array.from(tokenizedInputString);

            // removes newlines
            tokenizedArray = tokenizedArray.filter(function (token) {
                return token.type != "LineTerminatorSequence";
            });

            // removes whitespaces
            tokenizedArray = tokenizedArray.filter(function (token) {
                return token.type != "WhiteSpace";
            });

            var firstWord = tokenizedArray[0].value
            var secondWord = tokenizedArray[1].value

            if (firstWord.toUpperCase() == "CREATE") {
                if (secondWord.toUpperCase() == "SCHEMA") {
                    tokenizedArray = tokenizedArray.splice(2)
                    if (tokenizedArray.length > 1) {
                        throw new SyntaxError(`Unexpected statement "${tokenizedArray[1].value}"`, tokenizedArray[1].value)
                    } else {
                        let schema = new Schema(tokenizedArray[0].value, database.getSchemas());
                        database.addSchema(schema)
                    }
                } else if (secondWord.toUpperCase() == "TABLE") {
                    let table = new Table(tokenizedArray, database);

                    // if schema exists is already checked in Table constructor
                    for (const schema of database.getSchemas()) {
                        if (table.schema == schema.name) {
                            schema.addTable(table)
                        }
                    }
                } else {
                    throw new SyntaxError(`Unrecognised Flag: ${secondWord}`, secondWord)
                }
            } else if (firstWord.toUpperCase() == "ALTER") {
                if (secondWord.toUpperCase() == "SCHEMA") {
                    database.alterSchema(tokenizedArray.splice(2))
                } else if (secondWord == "TABLE") {
                    database.alterTable(tokenizedArray.splice(2))
                } else {
                    throw new SyntaxError(`Unrecognised Flag: ${secondWord}`, secondWord)
                }
            } else {
                // ignore these statements because they are not relative to visualising/structure
                if (firstWord.toUpperCase() == "SET" || firstWord.toUpperCase() == "SELECT" || firstWord.toUpperCase() == "COPY") {
                    continue;
                } else {
                    throw new SyntaxError(`Unsupported Statement: ${firstWord}`, firstWord)
                }
            }
        }
        return true
    }
}

module.exports = Validator