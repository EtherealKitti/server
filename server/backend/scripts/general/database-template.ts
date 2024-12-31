const path: Object<any> = require("path");

module.exports = {
	["initialize"]: (webSocketServer: Object<any>,utlity: Object<Function>): undefined => {
		webSocketServer.on("connection",(webSocketClient: Object<any>,request: Object<any>) => {
			if (__filename.match(request.url)) {
				webSocketClient.on("message",(webSocketMessage: Object<any>) => {
					webSocketMessage = JSON.parse(webSocketMessage.toString());
					const database: Object<any> = utlity.database(__dirname,"database-template");
					
					database.serialize(() => {
						database.run(`CREATE TABLE IF NOT EXISTS '${webSocketMessage.data.tableName}' (rowId INT,text TEXT)`);
						
						if (webSocketMessage.operation === "createRows") {
							database.run(`INSERT INTO '${webSocketMessage.data.tableName}' VALUES ${database.arrayToRowsString(webSocketMessage.data.rows)}`);
						}
						
						if (webSocketMessage.operation === "deleteRow") {
							database.run(`DELETE FROM '${webSocketMessage.data.tableName}' WHERE id = ${webSocketMessage.data.rowId}`);
						}
						
						if (webSocketMessage.operation === "getRows") {
							database.all(`SELECT * FROM '${webSocketMessage.data.tableName}'`,(error: String,result: Object<any>) => {
								webSocketClient.send(JSON.stringify({
									["operation"]: webSocketMessage.operation,
									["data"]: {
										["rows"]: JSON.parse(JSON.stringify(result))
									}
								}));
							});
						}
					});
				});
			}
		});
	}
};
