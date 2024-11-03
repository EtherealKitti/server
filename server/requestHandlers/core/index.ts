interface Dictionary<T> {
    [Key: string]: T;
}

const fs: Dictionary<any> = require("fs");
const path: Dictionary<any> = require("path");

module.exports = (webSocketServer: Dictionary<any>,sqliteDatabase: Function) => {
	webSocketServer.on("connection",(webSocketClient: Dictionary<any>,request: Dictionary<any>) => {
		if (__filename.match(request.url)) {
			webSocketClient.on("message",(webSocketMessage: Dictionary<any>) => {
				webSocketMessage = JSON.parse(webSocketMessage.toString());
				
				if (webSocketMessage.operation === "load") {
					let locations: Array<string> = [];
					
					for (let location of fs.readdirSync(`${path.dirname(path.dirname(path.dirname(__filename)))}/public/webpages/general`,"utf8")) {
						locations.push(location.split(".")[0]);
					}
					
					webSocketClient.send(JSON.stringify({
						["operation"]: webSocketMessage.operation,
						["data"]: {
							["locations"]: locations
						}
					}));
				}
			});
		}
	});
}