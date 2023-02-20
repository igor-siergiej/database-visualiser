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

		tokenizedArray = tokenizedArray.filter(function (token) {
			return token.type != "LineTerminatorSequence";
		});
		// removes newlines

		tokenizedArray = tokenizedArray.filter(function (token) {
			return token.type != "WhiteSpace";
		});
		// removes whitespaces

		var index = tokenizedArray.map(function (e) { return e.value; }).indexOf("(");

		// first open bracket should be after table name
		// split everything before the open bracket to remove the keywords
		this.name = tokenizedArray[index - 1].value;
		console.log(this.name)

		var columnArray = tokenizedArray.slice(index + 1);

		var columns = [];
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
			var column = new Column(element);
			this.columns.push(column);
		}
		console.log(this.columns)
	}

	createTable(div) {
		let table = document.createElement("div");
		table.className = "col border border-4 mx-5 my-5 w-25 gx-0";
		let heading = document.createElement("h3");
		heading.className = "text-center py-1 px-1 my-0 bg-primary";
		heading.innerText = this.name;
		table.appendChild(heading);

		for (const column of this.columns) {
			this.createColumn(column, table)
		}
		div.appendChild(table);
	}

	createColumn(column, div) {
		let nameRow = document.createElement("div");
		nameRow.className = "row py-1 px-2 gx-0";

		let typeRow = document.createElement("div");
		typeRow.className = "row py-1 px-2 gx-0";


		let nameText = document.createTextNode(column.name.value);
		nameRow.appendChild(nameText);

		let typeText = document.createTextNode(column.type.value);
		typeRow.appendChild(typeText);
		
		div.appendChild(nameRow);
		div.appendChild(typeRow)
	}


	//   if (this.columns.indexOf(column) == 0) {
	// 	row.className = "row border-top border-bottom border-2 py-1 px-2 gx-0";
	//   } else if (this.columns.indexOf(column) == this.columns.length - 1) {
	// 	row.className = "row py-1 px-2 gx-0";
	//   } else {
	// 	row.className = "row border-bottom border-2 py-1 px-2 gx-0";
}