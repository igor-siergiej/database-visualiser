import jsTokens from "js-tokens";
import Column from './Column';

export default class Table {
	name;
	columns = [];
	keys;

	// inputString = input text split up by 'Create Table' string
	constructor(inputString) {
		const tokenizedInputString = jsTokens(inputString);
		let tokenizedArray = Array.from(tokenizedInputString);

		tokenizedArray = tokenizedArray.filter(function( token ) {
			return token.type != "LineTerminatorSequence";
		});

		tokenizedArray = tokenizedArray.filter(function( token ) {
			return token.type != "WhiteSpace";
		});

		

		for (const token of tokenizedArray) {
			
		}
		

		var index = tokenizedArray.map(function(e) { return e.value; }).indexOf("(");

		
		
		// first open bracket should be after table name 
		this.name = tokenizedArray[index -2].value;

	
		var columnArray = tokenizedArray.slice(index + 1);
		
		var columns =  [];
		var bufferArray = [];
		for (const element of columnArray) {
			if (bufferArray.length == 0 && element.value == "PRIMARY") { // this means there are table constraints
				bufferArray = [];
				break
			} else {
				if (element.value == ",") {  // this means there were no table constraints
					columns.push(bufferArray);
					bufferArray = []
				} else {
					bufferArray.push(element);
				}
				
			}
		}
		if (bufferArray.length != 0) {
			columns.push(bufferArray);
			bufferArray = []
		}

		for (const element of columns) {
			var column = new Column();
			this.columns.push(column);
		}

		console.log(columns)


		//for the number of ',' loop over and create columns and set them as instance variables
	}

	// add a table to the div or div id?
	createTable(div) {

	}
}