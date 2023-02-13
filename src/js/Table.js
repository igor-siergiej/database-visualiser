import jsTokens from "js-tokens";

export default class Table {
	name;
	columns;
	keys;

	constructor(inputString) {
		const tokenizedInputString = jsTokens(inputString);

		
		for (const token of tokenizedInputString) {
			console.log(token)
			if (token.type == "IdentifierName") {
				this.name = token.value;
				break;
			}
		}
		console.log(this);
		//for the number of ',' loop over and create columns and set them as instance variables
	}

	// input string e.i. table name and list of columns
	parseString() {

	}

	// add a table to the div or div id?
	createTable(div) {

	}
}