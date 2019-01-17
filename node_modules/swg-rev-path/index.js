'use strict';
// rev-path源码版本: "1.0.0"
var modifyFilename = require('modify-filename');

module.exports = function (pth, hash) {
	if (arguments.length !== 2) {
		throw new Error('`path` and `hash` required');
	}

	return modifyFilename(pth, function (filename, ext) {
    // modify by swg begin
		//old return filename + '-' + hash + ext;
		return filename + ext;
    // modify by swg end
	});
};

module.exports.revert = function (pth, hash) {
	if (arguments.length !== 2) {
		throw new Error('`path` and `hash` required');
	}

	return modifyFilename(pth, function (filename, ext) {
		return filename.replace(new RegExp('-' + hash + '$'), '') + ext;
	});
};
