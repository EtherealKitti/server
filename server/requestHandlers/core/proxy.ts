interface Dictionary<T> {
    [Key: string]: T;
}

const path: Dictionary<any> = require("path");

module.exports = async (webSocketServer: Dictionary<any>,sqliteDatabase: Function,request: Dictionary<any>,response: Dictionary<any>) => {
    try {
        response.end(await (await fetch(request.query.url.slice(1,-1))).text());
    } catch {}
};