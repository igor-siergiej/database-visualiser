const Problem = require("./Problem")

class MultipleRootsProblem extends Problem{
    title = "All of the tables are not linked together by foreign key constraints."
    fixText = "Make sure all of the tables are linked together by the arrows in \"Table View\""
    link = "https://www.postgresql.org/docs/current/tutorial-fk.html"

    createAccordionItem(tableName) {
        super.createAccordionItem(tableName,this.title, this.fixText, this.link)
    }
} 

module.exports = MultipleRootsProblem