var SfLogAnalyzer = {
	LIMIT_USAGE_FOR_NS: 'LIMIT_USAGE_FOR_NS',
	// DateTime column params
	DT_COLUMN_FULL: 'dtFull',
	DT_COLUMN_SHORT: 'dtShort',
	DT_COLUMN_OFF: 'dtOff',
	// Log line type prefixed
	TPR_SYSTEM_METHOD: 'SYSTEM_METHOD',
	info: {
		logLevel: {}
	},
	lines: []
};

SfLogAnalyzer.filter = {
	columns: {
		dateTime: SfLogAnalyzer.DT_COLUMN_OFF
	},
	visibleTypes: {
		'SYSTEM_METHOD_ENTRY': false,
		'SYSTEM_METHOD_EXIT': false
	},
	search: 'SOQL'
};

SfLogAnalyzer.init = function(textAreaId) {
	var logText, rawLines, i, line, currLines, reLineBegin;
	logText = document.getElementById(textAreaId).innerHTML;
	console.log('File size: ' + logText.length);
	rawLines = logText.split('\n');
	rawLines.push('00:00:00.000 (1)|FAKE_LAST_LINE');
	console.log('Number of lines: ' + rawLines.length);
	// TODO first line - detect version and log level
	this.parseFirstLine(rawLines[0]);
	reLineBegin = /^\d\d:\d\d:\d\d\.\d\d\d \(\d+\)\|/;
	currLines = [];
	for (i = 1; i < rawLines.length; i++) {
		if ( reLineBegin.test(rawLines[i]) ) {
			line = this.parseLine(currLines.join('\n'));
			if ( line ) {
				this.lines.push(line);
			}
			currLines = [];
		}
		currLines.push(rawLines[i]);
	}
	this.show();

};

SfLogAnalyzer.show = function() {
	var i, line, isShow;
	for (i = 0; i < this.lines.length; i++) {
		line = this.lines[i];
		isShow = true;
		if ( SfLogAnalyzer.filter.visibleTypes.hasOwnProperty(line.type) ) {
			isShow = SfLogAnalyzer.filter.visibleTypes[line.type];
		}
		if ( SfLogAnalyzer.filter.search ) {
			if ( line.rawLine.indexOf(SfLogAnalyzer.filter.search) === -1 ) {
				isShow = false;
			}
		}
		if ( isShow ) {
			line.appendTo('logContainer');
		}
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
	if ( chunks.length > 4 ) {
		lineItem.fifth = chunks[4];
	}

	return lineItem;

};

/**
 * Base line without certain type
 */
SfLogAnalyzer.Line = {
	rawLine: '',
	dateTime: '',
	type: '',
	objId: '',
	msg: '',
	fifth: '',
	getDateTime: function(dtFilter) {
		if ( dtFilter == SfLogAnalyzer.DT_COLUMN_SHORT ) {
			return this.dateTime.substr(0,8);
		} else if ( dtFilter == SfLogAnalyzer.DT_COLUMN_OFF ) {
			return '';
		} else {
			return this.dateTime;
		}
	},
	appendTo: function(containerId) {
		var lineElement = document.createElement('pre');
		var htmlMsg = this.msg.replace(/\n/g, '<br>');
		lineElement.innerHTML = this.getDateTime(SfLogAnalyzer.filter.columns.dateTime) + '|' + this.type + '|' + this.objId + '|' + htmlMsg + '|' + this.fifth;
		//lineElement.innerHTML = this.rawLine;
		document.getElementById(containerId).appendChild(lineElement);
	},
	isLimitUsageForNS: function() {
		return this.type === SfLogAnalyzer.LIMIT_USAGE_FOR_NS;
	}

};
