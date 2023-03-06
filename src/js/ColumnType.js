export default class ColumnType {
    type;
    value;


    constructor(type, value) {
        this.type = type;
        this.value = value;
    }

    getValue() {
        if (this.value === undefined) {
            return this.type
        } else {
            return this.type + "(" + this.value + ")"
        }
    }

    doesTypeHaveValue() {
        if (this.value === undefined) {
            return false
        } else {
            return true
        }
    }

    getType() {
        return this.type;
    }
}