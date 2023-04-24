 class Util {
    // Name must contain only letters (a-z, A-Z), numbers (0-9), or underscores ( _ ) 
    // Name must begin with a letter or underscore.
    // Name must be less than the maximum length of 59 characters. 

    static typeColor = "typeColor"
    static constraintColor = "constraintColor"
    static typeValueColor = "typeValueColor"


    static isNameValid(name) {
        var valid = false
        const validSQLColumnNameRegex = /^[A-Za-z_][A-Za-z\d_]*$/;

        if (name.match(validSQLColumnNameRegex) && name.length < 80) {
            valid = true
        }
        return valid
    }

    static doesNameExist(name, list) {
        name = name.replace(/['"]+/g, '')
        var isNameFound = false
        for (const element of list) {
            if (element.name == name) {
                isNameFound = true
            }
        }
        return isNameFound
    }

    // write a function to join punctuators for a tokenized array
    static joinPunctuators(tokenizedArray) {
        for (var i = 0; i < tokenizedArray.length; i++) {
            var value = tokenizedArray[i].value
            var type = tokenizedArray[i].type
            if (type == "Punctuator" && value != "(" && value != ")") {
                if (i == 0) {
                    tokenizedArray[i].value += tokenizedArray[i + 1].value
                    tokenizedArray.splice(i, i)
                } else {
                    tokenizedArray[i].value += tokenizedArray[i + 1].value
                    tokenizedArray.splice(i + 1, 1)
                }
            }
        }
    }

    static writeSyntax(text,syntaxTextArea,color) {
        if (color == undefined) {
            syntaxTextArea.innerHTML += text
        } else {
            let textNode = document.createElement("span");
            textNode.className = color
            textNode.textContent = text
            textNode.id = text
            syntaxTextArea.appendChild(textNode)
        }
    }

    static debounce(func, timeout = 500) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }
}

module.exports = Util