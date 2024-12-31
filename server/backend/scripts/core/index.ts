const fs: Object<any> = require("fs");
const path: Object<any> = require("path");

module.exports = {
	["initialize"]: (webSocketServer: Object<any>,sqliteDatabase: Function) => {
		webSocketServer.on("connection",(webSocketClient: Object<any>,request: Object<any>) => {
			if (__filename.match(request.url)) {
				webSocketClient.on("message",(webSocketMessage: Object<any>) => {
					webSocketMessage = JSON.parse(webSocketMessage.toString());
					
					if (webSocketMessage.operation === "load") {
						const locations: Array<String> = [];
						
						for (const location: String of fs.readdirSync(`${path.dirname(path.dirname(path.dirname(path.dirname(__filename))))}/backend/scripts/general`,"utf8")) {
							locations.push(location.split(".")[0]);
						}

						for (const location: String of fs.readdirSync(`${path.dirname(path.dirname(path.dirname(path.dirname(__filename))))}/frontend/webpages/general`,"utf8")) {
							locations.push(location.split(".")[0]);
						}
						
						{
							const duplicates: Array<String> = [];

							for (const locationIndex: Number in locations) {
								if (!duplicates.find((element) => element === locations[locationIndex])) {
									duplicates.push(locations[locationIndex]);
								} else {
									locations.splice(locationIndex);
								}
							}
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
};
