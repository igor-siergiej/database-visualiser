

 class SyntaxError extends Error{
    #errorWord;

    constructor(message, errorWord) {
        super(message)
        this.#errorWord = errorWord
    }

    getErrorWord() {
        return this.#errorWord
    }
}

module.exports = SyntaxError