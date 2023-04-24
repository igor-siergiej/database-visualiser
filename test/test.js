var assert = require('assert');
const Validator = require('../src/js/Validator');
const  Database  = require('../src/js/Database');

describe('Validate', function () {
    describe('validate()', function () {
        it("should work", function() {
            var database = new Database()
        
            try {
                Validator.validateSQL(database, "CREATE TABLE;")
            } catch(error) {
                assert.equal(error.message,"Missing Semicolon in statement")
            }
        })

    })
})
