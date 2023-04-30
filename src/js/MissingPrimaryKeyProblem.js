const Problem = require("./Problem")

class MissingPrimaryKeyProblem extends Problem{
    problemText = "This table is missing a Primary Key Constraint"
    fixText = "Add a PRIMARY KEY column constraint"

    constructor() {
        super()
    }

    createAccordionItem(identifier) {
        super.createAccordionItem(identifier,this.problemText, this.fixText)
    }
} 

module.exports = MissingPrimaryKeyProblem