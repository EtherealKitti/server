interface Dictionary<T> {
    [Key: string]: T;
}

const path: Dictionary<any> = require("path");

module.exports = (webSocketServer: Dictionary<any>,utlity: Dictionary<Function>) => {
	webSocketServer.on("connection",(webSocketClient: Dictionary<any>,request: Dictionary<any>) => {
		if (__filename.match(request.url)) {
			webSocketClient.on("message",(webSocketMessage: Dictionary<any>) => {
				webSocketMessage = JSON.parse(webSocketMessage.toString());
				const database: Dictionary<any> = utlity.database(__dirname,"database-template");
				
				database.serialize(() => {
					database.run(`CREATE TABLE IF NOT EXISTS '${webSocketMessage.data.tableName}' (rowId INT,text TEXT)`);
					
					if (webSocketMessage.operation === "createRows") {
						database.run(`INSERT INTO '${webSocketMessage.data.tableName}' VALUES ${database.arrayToRows(webSocketMessage.data.rows)}`);
					}
					
					if (webSocketMessage.operation === "deleteRow") {
						database.run(`DELETE FROM '${webSocketMessage.data.tableName}' WHERE id = ${webSocketMessage.data.rowId}`);
					}
					
					if (webSocketMessage.operation === "getRows") {
						database.all(`SELECT * FROM '${webSocketMessage.data.tableName}'`,(error: string,result: Dictionary<any>) => {
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
};
