const path: Object<any> = require("path");

module.exports = {
	["initialize"]: (webSocketServer: Object<any>,utlity: Object<Function>): undefined => {
		webSocketServer.on("connection",(webSocketClient: Object<any>,request: Object<any>) => {
			if (__filename.match(request.url)) {
				webSocketClient.on("message",(webSocketMessage: Object<any>) => {
					webSocketMessage = JSON.parse(webSocketMessage.toString());
					
					if (webSocketMessage.operation === "greeting") {
						webSocketClient.send(JSON.stringify({
							["operation"]: webSocketMessage.operation,
							["data"]: {
								["message"]: webSocketMessage.data.message,
								["response"]: "Hewo client :3"
							}
						}));
					}
				});
			}
		});
	}
};
