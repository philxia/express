var fs = require('fs');
var fse = require('fs.extra');
var http = require('http');
var fs = require('fs');
var unzip = require('unzip');

var rimraf = require('rimraf');

function traverBubbleChildren(bubble, func) {
    // body...
    if ( !! func)
        func(bubble);

    if (!bubble['children'])
        return;

    for (var ii = 0; ii < bubble.children.length; ii++) {
        traverBubbleChildren(bubble.children[ii], func);
    }
}

http.createServer(function(req, res) {

    var url = req.url;
    if (!url) {
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('This is the RevitExtractor testing server.\n');
    }
    if(url.match('sort') !== null){
        var localPath = 'E:\\tf\\results\\Custom';
        var files = fs.readdirSync(localPath);
        files.sort();
        res.end(files.toString());
    }
    if(url.match("unzip") !== null){
        var localPath = 'E:\\tf\\packs\\Custom\\RevitExtractor_x64_2015.0.2014.0623.152750.zip';
        var exFolder = 'E:\\tf\\packs\\Custom\\RevitExtractor_x64_2015.0.2014.0623.152750';
        var unzipExtractor = unzip.Extract({
            path: exFolder
        });
        unzipExtractor.on('error', function(err) {
            console.log(err);
        });
        unzipExtractor.on('close', function() {
            console.log('success');            
        });
        fs.createReadStream(localPath).pipe(unzipExtractor);
    }

    if (url.match("loadsuites") !== null) {
        var suitesString = fs.readFileSync(".\\testSuites.json", "utf8");
        var suites = JSON.parse(suitesString);
    }

    if (url.match("checkbubble") !== null) {
        var genBubbleJsonString = fs.readFileSync(".\\..\\dev\\benchmarks\\2015\\Simple_model.rvt\\bubble.json", "utf8");
        var genBubbleJsonObj = JSON.parse(genBubbleJsonString);

        var filesInfo = [];
        traverBubbleChildren(genBubbleJsonObj, function(b) {
            if ( !! b['type'] && b['type'] === 'resource' && !! b['urn'])
                filesInfo.push(b['urn']);
        });
    }
    if (url.match("del") !== null) {
        var folderPath = "D:\\tf\\output\\Development\\RevitExtractor_x64_2015.0.2014.0519";
        rimraf(folderPath, function(err) {
            console.log(err);
        })
    }
    if (url.match('rename') !== null) {
        var folderPath = "D:\\tf\\output\\Development\\RevitExtractor_x64_2015.0.2014.0519\\";
        fse.copyRecursive(folderPath, 'D:\\tf\\result\\Development\\RevitExtractor_x64_2015.0.2014.0519\\', function(argument) {
            console.log(argument);
        });
    }


}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
// var testSuite = {
//     name: "Smoke",
//     suites: [{
//         name: "Simple_model.rvt",
//         path: ".\\2015",
//         args: ["\\no2d"]
//     }]
// };


// var content = JSON.stringify(testSuite);

// fs.writeFileSync("testSuites.json", content);