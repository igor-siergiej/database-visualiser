const Problem = require("./Problem")

class NoForeignKeyProblem extends Problem{
    title = "Currently in the database, there are no foreign keys."
    fixText = "add a FOREIGN KEY constraint to link the tables."
    link = "https://www.postgresql.org/docs/15/ddl-constraints.html#DDL-CONSTRAINTS-FK"

    createAccordionItem(tableName) {
        super.createAccordionItem(tableName,this.title, this.fixText, this.link)
    }
} 

module.exports = NoForeignKeyProblem