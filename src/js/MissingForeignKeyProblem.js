const Problem = require("./Problem")

class MissingForeignKeyConstraint extends Problem{
    title = "This table is missing a Foreign Key Constraint"
    fixText = "add a FOREIGN KEY constraint."
    link = "https://www.postgresql.org/docs/15/ddl-constraints.html#DDL-CONSTRAINTS-FK"

    createAccordionItem(tableName) {
        super.createAccordionItem(tableName,this.title, this.fixText, this.link)
    }
} 

module.exports = MissingForeignKeyConstraint