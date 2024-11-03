interface Dictionary<T> {
    [Key: string]: T;
}

const path: Dictionary<any> = require("path");

module.exports = (webSocketServer: Dictionary<any>,utlity: Dictionary<Function>) => {
	webSocketServer.on("connection",(webSocketClient: Dictionary<any>,request: Dictionary<any>) => {
		if (__filename.match(request.url)) {
			webSocketClient.on("message",(webSocketMessage: Dictionary<any>) => {
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
};
