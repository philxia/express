var fs = require('fs');
var path = require('path');
var checkPoint_ns = require('./checkPoint').checkPoint;
var tstMgr_ns = require('../../testManager').testManager;

var checker = exports.imageChecker = {}; // new namespace.


checker.ImageChecker = function(context, testcase, genImageFilePath) {
    this.testcase = testcase;
    this.context = context;
    this.isExecuted = false;
    this.isDone = false;
    this.genImageFilePath = genImageFilePath;
    this.imageCompareToolPath = path.join(tstMgr_ns.ToolsFolder, "\\ImageProcessor\\ImageProcessor.exe");
    if (!fs.existsSync(this.imageCompareToolPath))
        throw 'The tool does not existed at the give path - ' + this.imageCompareToolPath;
    if (!fs.existsSync(this.genImageFilePath))
        throw 'The file does not existed at the give path - ' + this.genImageFilePath;
    var imageFileName = genImageFilePath.substr(genImageFilePath.lastIndexOf('\\'));
    this.benImagePath = path.join(tstMgr_ns.BenchmarksFolder, this.context.envName,
        this.testcase.args[1], imageFileName);
    if (!fs.existsSync(this.benImagePath))
        throw 'The file does not existed at the give path - ' + this.benImagePath;
    // sample: Dwf2Png.exe .\2d.dwfx .\2d.png
    this.imageCompareToolArgs = [this.genImageFilePath, this.benImagePath, '50'];

    this.checkPoint = new checkPoint_ns.CheckPoint(checkPoint_ns.View2DCheck_ImageCompareCheck);
    this.testcase.checkPoints.push(this.checkPoint);
}

checker.ImageChecker.prototype.checks = function(callback) {
    var scope = this;
    if (!scope.isExecuted) {
        scope.context.executingCmd = true;
        scope.isExecuted = true;

        var util = require('util'),
            spawn = require('child_process').spawn,
            exec = spawn(scope.imageCompareToolPath, scope.imageCompareToolArgs);

        exec.stdout.on('data', function(data) {
            var buff = new Buffer(data);
            var info = buff.toString('utf8');
            console.log('stdout: ' + info);
            // callback('INFO', info);
        });

        exec.stderr.on('data', function(data) {
            var buff = new Buffer(data);
            var err = buff.toString('utf8');
            console.log('stderr: ' + err);
            // callback('ERROR', data);
        });

        exec.on('exit', function(code) {
            scope.isDone = true;
            scope.returnCode = code;
        });
    }

    // go next checker if this test is done.
    if (scope.isDone) {
        scope.context.executingCmd = false;
        if (scope.returnCode === 0) {
            scope.checkPoint.setStatus(checkPoint_ns.SUCCESS);
            callback('SUCCESS', scope.testcase.prefix + 'The image generated with the dwfx is identical with the benchmarks.');

        } else
            scope.checkPoint.postCallback(callback, 'ERROR',
                scope.testcase.prefix +
                'The image generated with the dwfx is different with the benchmarks and produce the different image at ' +
                '' + '.');
    }
}