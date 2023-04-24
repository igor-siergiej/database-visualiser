class ForeignKey {
    referencedTable;
    referencedColumn;
    referencedColumnType

    constructor(referencedTable, referencedColumn, referencedColumnType) {
        this.referencedTable = referencedTable
        this.referencedColumn = referencedColumn
        this.referencedColumnType = referencedColumnType
    }
}

module.exports = ForeignKey