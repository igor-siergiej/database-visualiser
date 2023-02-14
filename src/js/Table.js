import jsTokens from "js-tokens";

export default class Table {
	name;
	columns;
	keys;

	// inputString = input text split up by 'Create Table' string
	constructor(inputString) {
		const tokenizedInputString = jsTokens(inputString);
		let tokenizedArray = Array.from(tokenizedInputString);

		for (const token of tokenizedArray) {
			
			console.log(token)
			
			// if (token.type == "IdentifierName") {
			// 	this.name = token.value;
			// 	break;
			// }
		}

		var index = tokenizedArray.map(function(e) { return e.value; }).indexOf("(");
		// first open bracket should be after table name 
		this.name = tokenizedArray[index -2].value;

		var columnArray = tokenizedArray.slice(index + 1);
		var columns;
		for (const element of columnArray) {
			if (element.value != "PRIMARY") { // until we reach keyword
				columns += element;
			} else {
				break
			}
		}
		console.log(columns)

		
		console.log(this);
		//for the number of ',' loop over and create columns and set them as instance variables
	}

	// add a table to the div or div id?
	createTable(div) {

	}
}