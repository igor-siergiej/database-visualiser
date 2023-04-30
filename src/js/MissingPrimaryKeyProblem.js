const Problem = require("./Problem")

class MissingPrimaryKeyProblem extends Problem{
    title = "This table is missing a Primary Key Constraint"
    fixText = "add a PRIMARY KEY constraint."
    link = "https://www.postgresql.org/docs/15/ddl-constraints.html#DDL-CONSTRAINTS-PRIMARY-KEYS"

    createAccordionItem(tableName) {
        super.createAccordionItem(tableName,this.title, this.fixText, this.link)
    }
} 

module.exports = MissingPrimaryKeyProblem