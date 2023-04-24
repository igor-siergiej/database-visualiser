var assert = require('assert');
const Validator = require('../src/js/Validator');
const Database = require('../src/js/Database');
const fs = require('fs')

var database

describe('Validator', function () {
    describe('validateSQL()', function () {
        describe('should throw SyntaxError', function () {

            beforeEach(function () {
                database = new Database();
            });

            it("Should catch missing semicolon in statement", function () {
                try {
                    Validator.validateSQL(database, "CREATE TABLE")
                } catch (error) {
                    assert.equal(error.message, "Missing Semicolon in statement")
                }
            })

            it("Should catch no columns in a table", function () {
                try {
                    Validator.validateSQL(database, "CREATE TABLE;")
                } catch (error) {
                    assert.equal(error.message, "Missing columns")
                }
            })

            it("Should catch no columns in a table", function () {
                try {
                    Validator.validateSQL(database, "CREATE TABLE tableName!();")
                } catch (error) {
                    assert.equal(error.message, "Invalid syntax, should be an open bracket or invalid table name")
                }
            })
        })

        describe("Should validate successfully", function () {

            beforeEach(function () {
                database = new Database();
            });

            it("Should validate demo.sql successfully", function () {
                fs.readFile("test/testData/demo.sql", "utf-8", (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {
                        assert.equal(Validator.validateSQL(database, data), true)
                    }
                })
            })

            it("Should validate dump.sql successfully", function () {
                fs.readFile("test/testData/dump.sql", "utf-8", (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {
                        assert.equal(Validator.validateSQL(database, data), true)
                    }
                })
            })

            it("Should validate student1.sql successfully", function () {
                fs.readFile("test/testData/student1.sql", "utf-8", (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {
                        assert.equal(Validator.validateSQL(database, data), true)
                    }
                })
            })

            it("Should validate student2.sql successfully", function () {
                fs.readFile("test/testData/student2.sql", "utf-8", (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {
                        assert.equal(Validator.validateSQL(database, data), true)
                    }
                })
            })
        })
    })
})
