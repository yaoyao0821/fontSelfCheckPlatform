var fs = require("fs");
var path = require('path');

let jsonFS = {}
jsonFS.writeJsonFile = function(outputFile, data, prettyPrint){
    return new Promise((resolve, reject) => {
        var str;
        if (prettyPrint){
            str = JSON.stringify(data, null, '\t');
        }else{
            str = JSON.stringify(data);
        }
        fs.writeFile(outputFile, str, function(err) {
            if(err) {
                console.log(err);
                reject(err);
            }
            //console.dir(data);
            console.log("The file was saved to "+ outputFile.toString());
            resolve();
        });
    })
}

jsonFS.readJsonFile= function(inputFile){
    return new Promise(function (resolve, reject) {
        fs.readFile(
            inputFile,
            {encoding: 'utf-8'},
            function(err, fileContents) {
                if (!err) {
                    //console.info(fileContents);
                    resolve(JSON.parse(fileContents));
                } else {
                    console.log(err);
                    reject(err);
                }
            }
        );
    })
}

module.exports = jsonFS;