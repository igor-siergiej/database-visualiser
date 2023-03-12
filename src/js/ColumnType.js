export default class ColumnType {
    type;
    value;

    #typesWithNoInput = ["smallint","integer","bigint","smallserial","bigserial",
                         "serial","real","numeric","decimal","double precision",
                         "point","line","lseg","box","path","polygon","circle", "cidr",
                         "inet", "macaddr", "macaddr8", "money", "character varying", "varchar", "character",
                         "char", "text", "bytea", "boolean", "timestamp", "timestamp with time zone", "timestamptz",
                         "date", "time", "time with time zone", "timetz", "interval"]

    #typesWithInput = ["numeric", "decimal","timestamp", "timestamp with time zone", "timestamptz",
                       "time", "time with time zone", "timetz", "interval"]

    //get type string, get if type has value
    // if type is present in typesWithNoInput and there is an input throw error
    // if type is present in typesWithInput and there is an input check input and set
    // if type is present in typesWithInput and there is no input put default value?

    constructor(type, value) {
        this.type = type;
        this.value = value;
    }

    setType(inputType) {
        
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