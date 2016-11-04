/* 
	Author - Sumeet Wilkhu
	Description - The script is using node.js to automate the process of preparing Matlab files for grading.

*/ 
var re = /([a-z-_\d]*)_\d+_\d+_([a-zA-Z\d]*)[-_\d+]*\.m/;
var fs = require('fs');
var unzip = require('unzip');
var EasyZip = require('easy-zip').EasyZip;
var fileToCopy = null;
var zipFile = null;

if(process.argv.length > 2) {
	zipFile = process.argv[2];
	fileToCopy = process.argv[3];
}

if(!fs.existsSync('./tmp')) {
	fs.mkdirSync('tmp');
}

if(!fs.existsSync('./tmp/divided_results')) {
	fs.mkdirSync('./tmp/divided_results');
}

fs.createReadStream(zipFile)
	.pipe(unzip.Parse())
	.on('entry', function(entry) {
		var file = entry.path;
		if(file.match(re)) {
			var result = file.match(re);
			var dirName = './tmp/divided_results/'+result[1];
			var fileName = result[2]+'.m';
			if (!fs.existsSync(dirName)){
    			fs.mkdirSync(dirName);
			}
			entry.pipe(fs.createWriteStream(dirName + '/' + fileName));
			if(fileToCopy){
				fs.createReadStream(fileToCopy).pipe(fs.createWriteStream(dirName + '/' + fileToCopy));
			}
		}
		else {
			console.log(file + ' is skipped');
		}
	})
	.on('close', function(err) {
		zipResults();
		console.log('done');
	});

function zipResults() {
	var zip5 = new EasyZip();
	zip5.zipFolder('./tmp/divided_results',function(){
		zip5.writeToFile('divided_results.zip');
	});
}
