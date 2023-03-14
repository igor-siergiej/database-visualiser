export default class ColumnType {
    type;
    value;

    #typesWithNoInput = ["smallint","integer","bigint","smallserial","bigserial",
                         "serial","real","double precision",
                         "point","line","lseg","box","path","polygon","circle", "cidr",
                         "inet", "macaddr", "macaddr8", "money","text", "bytea", "boolean","date"]

    #typesWithInput = ["numeric", "decimal","timestamp", "timestamp with time zone", "timestamptz",
                       "time", "time with time zone", "timetz", "interval", "character varying", "varchar", "character",
                       "char"]

    setType(type, value) {
        console.log(type)
        console.log(value)
        type = type.toLowerCase()
        if (value === undefined) { // if no value
            if (this.#typesWithInput.includes(type) || this.#typesWithNoInput.includes(type)) {
                this.type = type;
            } else {
                throw new Error(`The columnType \"${type}\" does not exist`)
            }             
        } else { // if there is a value
            if (this.#typesWithNoInput.includes(type)) {
                throw new Error(`The columnType \"${type}\" should not have a parameter`)
            } else if (this.#typesWithInput.includes(type)) {
                if (isNaN(value)) {
                    throw new Error(`\"${value}\" is not a valid value`)
                }
                this.type = type;
                this.value = value;
            } else {
                throw new Error(`The columnType \"${type}\" does not exist`)
            }
        }
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