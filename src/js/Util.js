export default class Util {
    // Name must contain only letters (a-z, A-Z), numbers (0-9), or underscores ( _ ) 
	// Name must begin with a letter or underscore.
	// Name must be less than the maximum length of 59 characters. 

	static isNameValid(name) {
		var valid = false
		const validSQLColumnNameRegex = /^[A-Za-z_][A-Za-z\d_]*$/;

		if (name.match(validSQLColumnNameRegex) && name.length < 59) {
			valid = true
		}
		return valid
	}

    // write a function to join punctuators for a tokenized array
    static joinPunctuators(tokenizedArray) {
        for (var i = 0; i < tokenizedArray.length;i++) {
            var value = tokenizedArray[i].value
            var type = tokenizedArray[i].type
            if (type == "Punctuator" && value != "(" && value != ")") {
                if (i == 0) {
                    tokenizedArray[i].value += tokenizedArray[i+1].value
                    tokenizedArray.splice(i,i)
                } else {
                    tokenizedArray[i].value += tokenizedArray[i+1].value
                    tokenizedArray.splice(i+1,1)
                }
            }
        }
    }
}