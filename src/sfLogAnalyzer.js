var SfLogAnalyzer = {
	LIMIT_USAGE_FOR_NS: 'LIMIT_USAGE_FOR_NS',
	info: {
		logLevel: {}
	}
};

SfLogAnalyzer.init = function(textAreaId) {
	var logText, rawLines, i, line, currLines, reLineBegin;
	logText = document.getElementById(textAreaId).innerHTML;
	console.log('File size: ' + logText.length);
	rawLines = logText.split('\n');
	console.log('Number of lines: ' + rawLines.length);
	// TODO first line - detect version and log level
	this.parseFirstLine(rawLines[0]);
	reLineBegin = /^\d\d:\d\d:\d\d\.\d\d\d \(\d+\)\|/;
	currLines = [];
	for (i = 1; i < rawLines.length; i++) {
		if ( reLineBegin.test(rawLines[i]) ) {
			line = this.parseLine(currLines.join('\n'));
			if ( line ) {
				line.appendTo('logContainer');
			}
			currLines = [];
		}
		currLines.push(rawLines[i]);
	}
};

SfLogAnalyzer.parseFirstLine = function(line) {
	var apiVersion;
	apiVersion = line.substr(0,4);
	console.log('API version: ' + apiVersion);
	line.substr(5).split(';').forEach(function(item) {
		var chunks = item.split(',');
		SfLogAnalyzer.info.logLevel[chunks[0]] = chunks[1];
	});
	console.log(SfLogAnalyzer.info.logLevel);
};

SfLogAnalyzer.parseLine = function(line) {
	var lineItem, dt, logType, objId, msg;
	var chunks = line.split('|');
	if ( chunks.length < 2 ) {
		return false;
	}
	lineItem = Object.create(SfLogAnalyzer.Line);
	lineItem.rawLine = line;
	lineItem.dateTime = chunks[0];
	lineItem.type = chunks[1];
	if ( chunks.length > 2 ) {
		lineItem.objId = chunks[2];
	}
	if ( chunks.length > 3 ) {
		lineItem.msg = chunks[3];
	}

	return lineItem;

};

SfLogAnalyzer.Line = {
	rawLine: '',
	dateTime: '',
	type: '',
	objId: '',
	msg: '',
	appendTo: function(containerId) {
		var lineElement = document.createElement('div');
		var htmlMsg = this.msg.replace(/\n/g, '<br>');
		//lineElement.innerHTML = this.dateTime + '|' + this.type + '|' + this.objId + '|' + htmlMsg;
		lineElement.innerHTML = this.rawLine;
		document.getElementById(containerId).appendChild(lineElement);
	},
	isLimitUsageForNS: function() {
		return this.type === SfLogAnalyzer.LIMIT_USAGE_FOR_NS;
	}

};
