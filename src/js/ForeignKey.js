export default class ForeignKey {
    referencedTable;
    referencedColumn;

    constructor(referencedTable, referencedColumn) {
        this.referencedTable = referencedTable
        this.referencedColumn = referencedColumn
    }
}