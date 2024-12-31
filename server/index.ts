interface Dictionary<T> {
    [Key: String]: T;
}

const http: Object<any> = require("http");
const express: any = require("express");
const app: Object<any> = express();
const fileSystem: Object<any> = require("fs");
const path: Object<any> = require("path");
const sqlite: Object<any> = require("sqlite3");
const webSocket: Object<any> = require("ws");

const utility: Object<Function> = {
	["database"]: (fileDirectory: String,databaseName: String): Object<any> => {
		const databasePath: String = `${fileDirectory.replace("scripts","database")}/${databaseName}.db`;
		
		if (!fileSystem.existsSync(databasePath.replaceAll(`/${databaseName}.db`,""))) {
			fileSystem.mkdirSync(path.dirname(databasePath),{["recursive"]: true});
		}
    	
		let database: Object<any> = new sqlite.Database(databasePath);
		
		database.arrayToRowsString = (array: Array<Array<String | Number | Boolean>>): String => {
			let values: String = "";
			
			for (const row: Object of array) {
				let rowString: String = "";
				
				for (const element: String | Number | Boolean of row) {
					if (typeof(element) === "string") {
						rowString += `'${element.replaceAll("'","<u0027>")}',`;
					} else {
						rowString += `${element},`;
					}
				}
				
				values += `(${rowString.slice(0,-1)}),`;
			}
			
			return values.slice(0,-1);
		};
		
		database.formatJsonInRows = (rows: Array<Object<any>> | Object<any>): undefined => {
			let formattedRows: Array<Object<any>> | Object<any> = rows;
			
			const formatRow = (dictionary: Object<any>) => {
				for (const key: String of Object.keys(dictionary)) {
					if (typeof(dictionary[key]) === "string") {
						if (!dictionary[key].match("^[0-9]+$")) {
							try {
								dictionary[key] = JSON.parse(dictionary[key].replaceAll("<u0027>","'"));
							} catch {}
						}
					}
				}
			};
			
			if (Array.isArray(formattedRows)) {
				for (const dictionary: Object of formattedRows) {
					formatRow(dictionary);
				}
			} else {
				formatRow(formattedRows);
			}
			
			return formattedRows;
		};
		
		return database;
	}
};

app.use(express.static(`${__dirname}/public`));

const server: Object<any> = http.createServer(app);
const webSocketServer: Object<any> = new webSocket.Server({server});

app.all("*",(request: Object<any>,response: Dictionary<any>): String | null => {
	const requestUrl: String = request.params["0"];

	if (!(requestUrl.match(/\.[a-zA-Z0-9]+$/) || [null])[0]) {
		const getFilePath = (filePath: String | undefined,backend: Boolean | undefined): String | null => {
			const fileTypeSubPath: String = backend ? "/backend/scripts" : "/frontend/webpages";
	
			if (filePath === undefined) {
				filePath = `${__dirname}${fileTypeSubPath}/core/404`;
			} else {
				if (filePath === "/") {
					filePath = `${__dirname}${fileTypeSubPath}/core/index`;
				} else {
					filePath = `${__dirname}${fileTypeSubPath}/general${filePath}`;
				}
			}

			if (fileSystem.existsSync(`${filePath}${backend ? ".ts" : ".html"}`)) {
				return `${filePath}${backend ? ".ts" : ".html"}`;
			} else {
				if (fileSystem.existsSync(`${filePath}/index${backend ? ".ts" : ".html"}`)) {
					return `${filePath}/index${backend ? ".ts" : ".html"}`;
				} else {
					return null;
				}
			}
		};
		
		let backendPath: String | null = getFilePath(requestUrl,true);
		
		if (backendPath) {
			const backendMethodFunction = require(backendPath)[request.method.toLowerCase()];
		
			if (backendMethodFunction) {
				backendMethodFunction(webSocketServer,utility,request,response);
			}
		}

		if (request.method === "GET") {
			const frontendPath: String | null = getFilePath(requestUrl);
	
			if (frontendPath) {
				response.sendFile(frontendPath);
			} else {
				if (!getFilePath(requestUrl,true)) {
					response.sendFile(getFilePath());
				}
			}
		}

		console.log(`Method: ${request.method}\nUrl: ${requestUrl}\nBackend path: ${backendPath}\nFrontend path: ${getFilePath(requestUrl)}\nBackend file exists: ${fileSystem.existsSync(backendPath)}\nFrontend file exists: ${fileSystem.existsSync(getFilePath(requestUrl))}\n`);
	}
});

server.listen(1532);

function interateDirectory(directory: String): undefined {
	for (const component: String of fileSystem.readdirSync(directory)) {
		if (fileSystem.existsSync(`${directory}/${component.split(".")[0]}.ts`)) {
			const initializeFunction = require(`${directory}/${component}`).initialize;

			if (initializeFunction) {
				initializeFunction(webSocketServer,utility);
			}
		} else {
			interateDirectory(`${directory}/${component}`);
		}
	}
}

interateDirectory(`${__dirname}/backend/scripts`);
