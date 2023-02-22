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
		console.log(columns)
	}

	createTable(div) {
		let table = document.createElement("div");
		table.className = "row border border-4 mx-3 w-25 gx-0 h-100 my-3 w-auto";

		let keyColumn = document.createElement("div");
		keyColumn.className = "col-1 border-top border-4 gx-0 w-25 h-100";

		let nameColumn = document.createElement("div");
		nameColumn.className = "col border-top border-start border-4 h-100 gx-0";

		let typeColumn = document.createElement("div");
		typeColumn.className = "col border-top border-start border-4 h-100 gx-0";

		let heading = document.createElement("h3");
		heading.className = "text-center my-0 bg-primary";
		heading.innerText = this.name;
		table.appendChild(heading);

		for (const column of this.columns) {
			this.createColumn(column.isPrimaryKey, keyColumn)
			this.createColumn(column.name.value, nameColumn)
			this.createColumn(column.type.value, typeColumn)
		}
		
		table.appendChild(keyColumn)
		table.appendChild(nameColumn);
		table.appendChild(typeColumn);

		div.appendChild(table);
	}

	createColumn(text, div) {
		let nameRow = document.createElement("div");
		nameRow.className = "row py-1 px-2 gx-0";

		let nameText = document.createTextNode(text);
		nameRow.appendChild(nameText);
		
		div.appendChild(nameRow)
	}
}