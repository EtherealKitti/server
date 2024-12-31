const path: Object<any> = require("path");

module.exports = {
	["get"]: async (webSocketServer: Object<any>,utility: Object<Function>,request: Object<any>,response: Object<any>): undefined => {
		response.set("Content-Type","application/json");

		if (request.query.url) {
			try {
				const endpointResult: Object<any> = await fetch(request.query.url);

				if (endpointResult.status === 200) {
					const endpointResultHeaders: Object<any> = Object.fromEntries(endpointResult.headers.entries());

					if (endpointResultHeaders["content-type"].includes("application/json")) {
						response.end(await endpointResult.text());
					} else {
						response.end(JSON.stringify({
							["errorCode"]: 415,
							["errorMessage"]: "Response isn't a JSON"
						}));
					}
				} else {
					response.end(JSON.stringify({
						["errorCode"]: endpointResult.status,
						["errorMessage"]: endpointResult.statusText
					}));
				}
			} catch {
				response.end(JSON.stringify({
					["errorCode"]: 400,
					["errorMessage"]: "Invalid URL query"
				}));
			}
		} else {
			response.end(JSON.stringify({
				["errorCode"]: 400,
				["errorMessage"]: "Invalid URL query"
			}));
		}
	}
};
