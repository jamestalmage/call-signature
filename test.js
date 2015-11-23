import test from 'ava';
import support from './';

test('parse - handles spaces', t => {
	const expected = {
		callee: {
			type: 'MemberExpression',
			object: 't',
			member: 'equal'
		},
		args: [
			{
				name: 'actual',
				optional: false
			},
			{
				name: 'expected',
				optional: false
			},
			{
				name: 'message',
				optional: true
			}
		]
	};
	t.same(support.parse('t.equal(actual,expected,[message])'), expected, 'no spaces');
	t.same(support.parse('t.equal(actual, expected, [message])'), expected, 'standard spacing');
	t.same(support.parse('  t  .  equal  (  actual  ,  expected  ,  [  message  ]  )  '), expected, 'lots of spaces');
	t.end();
});

test('parse - when callee is an Identifier', t => {
	const expected = {
		callee: {
			type: 'Identifier',
			name: 'assert'
		},
		args: [
			{
				name: 'value',
				optional: false
			},
			{
				name: 'message',
				optional: true
			}
		]
	};
	t.same(support.parse('assert(value,[message])'), expected, 'no spaces');
	t.same(support.parse('assert(value, [message])'), expected, 'standard spacing');
	t.same(support.parse('  assert  (  value  ,  [  message  ]  )  '), expected, 'lots of spaces');
	t.end();
});

test('parse - handles no args', t => {
	const expected = {
		callee: {
			type: 'MemberExpression',
			object: 'a',
			member: 'fail'
		},
		args: []
	};
	t.same(support.parse('a.fail()'), expected, 'no spaces');
	t.same(support.parse('  a  .  fail  (  )  '), expected, 'lots of spaces');
	t.end();
});

test('parse - handles only optional args', t => {
	const expected1 = {
		callee: {
			type: 'MemberExpression',
			object: 'assert',
			member: 'baz'
		},
		args: [
			{
				name: 'foo',
				optional: true
			}
		]
	};

	const expected2 = {
		callee: {
			type: 'MemberExpression',
			object: 'assert',
			member: 'baz'
		},
		args: [
			{
				name: 'foo',
				optional: true
			},
			{
				name: 'bar',
				optional: true
			}
		]
	};

	t.same(support.parse('assert.baz([foo])'), expected1, '1 arg - no spaces');
	t.same(support.parse(' assert . baz ( [ foo ] ) '), expected1, '1 arg - lots of spaces');
	t.same(support.parse('assert.baz([foo],[bar])'), expected2, '2 args - no spaces');
	t.same(support.parse(' assert . baz ( [ foo ] , [ bar ] ) '), expected2, '2 args - lots of spaces');
	t.end();
});

test('generate - MemberExpression callee', t => {
	const parsed = {
		callee: {
			type: 'MemberExpression',
			object: 't',
			member: 'equal'
		},
		args: [
			{
				name: 'actual',
				optional: false
			},
			{
				name: 'expected',
				optional: false
			},
			{
				name: 'message',
				optional: true
			}
		]
	};

	t.is(support.generate(parsed), 't.equal(actual, expected, [message])');
	t.end();
});

test('generate - Identifier callee', t => {
	const parsed = {
		callee: {
			type: 'Identifier',
			name: 'assert'
		},
		args: [
			{
				name: 'value',
				optional: false
			},
			{
				name: 'message',
				optional: true
			}
		]
	};

	t.is(support.generate(parsed), 'assert(value, [message])');
	t.end();
});

test('parse->generate round trip', t => {
	[
		'assert(value, [message])',
		't.ok(value, [message])',
		't.notOk(value, [message])',
		't.true(value, [message])',
		't.false(value, [message])',
		't.is(value, expected, [message])',
		't.not(value, expected, [message])',
		't.same(value, expected, [message])',
		't.notSame(value, expected, [message])',
		't.regexTest(regex, contents, [message])'
	].forEach(function (pattern) {
		t.is(
			support.generate(support.parse(pattern)),
			pattern
		);
	});
	t.end();
});
