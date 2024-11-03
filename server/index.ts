interface Dictionary<T> {
    [Key: string]: T;
}

const express: any = require("express");
const app: Dictionary<any> = express();
const fs: Dictionary<any> = require("fs");
const path: Dictionary<any> = require("path");
const webSocket: Dictionary<any> = require("ws");
const http: Dictionary<any> = require("http");
const sqlite: Dictionary<any> = require("sqlite3");

const utlity: Dictionary<Function> = {
	["database"]: (fileDirectory: string,databaseName: string) => {
		const databasePath: string = `${fileDirectory.replace("requestHandlers","database")}/${databaseName}.db`;
		
		if (!fs.existsSync(databasePath.replaceAll(`/${databaseName}.db`,""))) {
			fs.mkdirSync(path.dirname(databasePath),{recursive: true});
		}
    	
		let database: Dictionary<any> = new sqlite.Database(databasePath);
		
		database.arrayToRows = (array: Array<Array<string | number | boolean>>) => {
			let values: string = "";
			
			for (const row of array) {
				let rowString: string = "";
				
				for (const element of row) {
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
		
		database.formatJsonInRows = (rows: Array<Dictionary<any>> | Dictionary<any>) => {
			let formattedRows: Array<Dictionary<any>> | Dictionary<any> = rows;
			
			const formatRow = (dictionary: Dictionary<any>) => {
				for (const key of Object.keys(dictionary)) {
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
				for (const dictionary of formattedRows) {
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

const server: Dictionary<any> = http.createServer(app);
const webSocketServer: Dictionary<any> = new webSocket.Server({server});

app.get("*",(request: Dictionary<any>,response: Dictionary<any>) => {
    const sendWebpage = (path: string) => {
        if (fs.existsSync(`${__dirname}/public/webpages/${path}.html`) || fs.existsSync(`${__dirname}/public/webpages/${path}`)) {
            if (fs.existsSync(`${__dirname}/public/webpages/${path}.html`)) {
                response.sendFile(`${__dirname}/public/webpages/${path}.html`);
            } else {
                if (fs.existsSync(`${__dirname}/public/webpages/${path}/index.html`)) {
                    response.sendFile(`${__dirname}/public/webpages/${path}/index.html`);
                } else {
                    if (fs.existsSync(`${__dirname}/public/webpages/${path}/index`)) {
                        let oneHtmlFile: boolean = true;
						
                        for (const fileName of fs.readdirSync(`${__dirname}/public/webpages/${path}/index`)) {
                            if (fileName !== "index.html") {
                                if (fileName.includes(".html")) {
                                    oneHtmlFile = false;
                                }
                            }
                        }
                        
                        if (oneHtmlFile) {
                            response.sendFile(`${__dirname}/public/webpages/${path}/index/index.html`);
                        } else {
                            sendWebpage("core/404");
                        }
                    } else {
                        sendWebpage("core/404");
                    }
                }
            }
        } else {
            sendWebpage("core/404");
        }
    };
    
    if (request.url === "/") {
        sendWebpage("core/index");
    } else {
        if (request.url.match(/[^/]*$/)[0] !== "index") {
			if (request.path.split("/")[1] !== "proxy") {
            	sendWebpage(`general${request.url.split("?")[0]}`);
			} else {
				require(`${__dirname}/requestHandlers/core/proxy.ts`)(webSocketServer,utlity,request,response);
			}
        } else {
			sendWebpage("core/404");
        }
    }
});

server.listen(1533);

function interateDirectory(directory: string) {
	for (const component of fs.readdirSync(directory)) {
		if (component !== "proxy.ts") {
			if (fs.existsSync(`${directory}/${component.split(".")[0]}.ts`)) {
				require(`${directory}/${component}`)(webSocketServer,utlity);
			} else {
				interateDirectory(`${directory}/${component}`);
			}
		}
	}
}

interateDirectory(`${path.dirname(__filename)}/requestHandlers`);