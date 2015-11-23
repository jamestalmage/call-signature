'use strict';
module.exports.parse = parse;
module.exports.generate = generate;

// TODO(jamestalmage): Allow full range of identifier characters instead of just ASCII
//
// This will likely require a build step
//
// SPEC: http://www.ecma-international.org/ecma-262/5.1/#sec-7.6
//
// TOOLING:
//    https://github.com/mathiasbynens/regenerate
//    https://www.npmjs.com/package/regjsgen

var regex = /^\s*([A-Za-z$_][A-Za-z0-9$_]*)\s*\.\s*([A-Za-z$_][A-Za-z0-9$_]*)\s*\(\s*((?:[A-Za-z$_][A-Za-z0-9$_]*)|(?:\[\s*[A-Za-z$_][A-Za-z0-9$_]*\s*]))?((?:\s*,\s*(?:(?:[A-Za-z$_][A-Za-z0-9$_]*)|(?:\[\s*[A-Za-z$_][A-Za-z0-9$_]*\s*])))+)?\s*\)\s*$/;

function parse(str) {
	var match = regex.exec(str);
	if (!match) {
		return null;
	}

	var object = match[1];
	var member = match[2];
	var args = match[4] || '';
	args = args.split(',');
	if (match[3]) {
		args[0] = match[3];
	}
	var trimmed = [];
	args.forEach(function (str) {
		var optional = false;
		str = str.replace(/\s+/g, '');
		if (!str.length) {
			return;
		}
		if (str.charAt(0) === '[' && str.charAt(str.length - 1) === ']') {
			optional = true;
			str = str.substring(1, str.length - 1);
		}
		trimmed.push({
			name: str,
			optional: optional
		});
	});

	return {
		object: object,
		member: member,
		args: trimmed
	};
}

function generate(parsed) {
	return [
		parsed.object,
		'.',
		parsed.member,
		'(',
		parsed.args.map(function (arg) {
			return arg.optional ? '[' + arg.name + ']' : arg.name;
		}).join(', '),
		')'
	].join('');
}
