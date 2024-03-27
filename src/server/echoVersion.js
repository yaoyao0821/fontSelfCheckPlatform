var fs = require("fs");
var path = require('path');
var jsonFS = require('./jsonFS');

var filePath = path.join(process.cwd(), 'package.json');
jsonFS.readJsonFile(filePath).then((packageInfo)=>{
    console.log("##vso[task.setvariable variable=VERSION]"+packageInfo.version);
}).catch((e)=>{
    console.error("Error: ", e);
})