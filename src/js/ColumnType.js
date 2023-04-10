import { SyntaxError } from "./SyntaxError";

export default class ColumnType {
    type;
    value;
    secondValue;

    typesWithNoInput = ["smallint","integer","bigint","smallserial","bigserial",
                         "serial","real","double precision",
                         "point","line","lseg","box","path","polygon","circle", "cidr",
                         "inet", "macaddr", "macaddr8", "money","text", "bytea", "boolean","date","int"]

    typesWithInput = ["numeric", "decimal","timestamp", "timestamp with time zone", "timestamptz",
                       "time", "time with time zone", "timetz", "interval", "character varying", "varchar", "character",
                       "char", "timestamp with time zone", "time with time zone","timestamp without time zone",
                       "time without time zone"]

    setType(type, value, secondValue) {
        type = type.toLowerCase()
        if (value === undefined) { // if no value
            if (this.typesWithInput.includes(type) || this.typesWithNoInput.includes(type)) {
                this.type = type;
            } else {
                throw new SyntaxError(`The columnType \"${type}\" does not exist`, type)
            }             
        } else { // if there is a value
            if (this.typesWithNoInput.includes(type)) {
                throw new SyntaxError(`The columnType \"${type}\" should not have a parameter`, type)
            } else if (this.typesWithInput.includes(type)) {
                if (isNaN(value)) {
                    throw new SyntaxError(`\"${value}\" is not a valid value`, value)
                }
                this.type = type;
                this.value = value;
                if (secondValue !== undefined) { // only one value was passed
                    if (isNaN(secondValue)) {
                        throw new SyntaxError(`\"${secondValue}\" is not a valid value`, secondValue)
                    }
                    this.secondValue = secondValue
                }
            } else {
                throw new SyntaxError(`The columnType \"${type}\" does not exist`, type)
            }
        }
    }

    getValue() {
        if (this.value === undefined) {
            return this.type
        } else if (this.secondValue === undefined) {
            return this.type + "(" + this.value + ")"
        } else {
            return this.type + "(" + this.value + " , " + this.secondValue + ")"
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

    isTypeValid(type) {
        return this.typesWithInput.includes(type) || this.typesWithNoInput.includes(type)
    }
}