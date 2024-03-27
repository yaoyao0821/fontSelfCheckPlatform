var fs = require("fs");
var path = require('path');
var jsonFS = require('./jsonFS');

var args = process.argv.slice(2);
console.log("args:",args[0]);

var filePath = path.join(process.cwd(), 'package.json');
jsonFS.readJsonFile(filePath).then((packageInfo)=>{
    let version = packageInfo.version;
    version=!args[0]?version:version+"."+args[0];
    let info = {
        name: packageInfo.name,
        version: version
    }
    console.log("file:", info);
    var outputFile = path.join(process.cwd(), 'public', 'info.json');
    return jsonFS.writeJsonFile(outputFile, info, true);
}).then(()=>{
    console.log("Success!")
}).catch((e)=>{
    console.error("Error: ", e);
})