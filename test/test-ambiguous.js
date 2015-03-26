var rewire = require('rewire');
var bnf = rewire('../lib/bnf');
var parser = rewire('../lib/parser');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;



describe('ambiguous grammer', function(){
  var itemSetArray = [];

  before(function(){
    var yaccRules = [
      {'head': 'E',
       'body': [
         {'expr': ['E', '+', 'E']},
         {'expr': ['E', '*', 'E']},
         {'expr': ['(', 'E', ')']},
         {'expr': ['id']}
       ]
      }
    ];

    var tokens = [
      '+', '*', '(', ')', 'id'
    ];

    var ambiguousRules = {
      '+': {'precedence': 0, 'association': 'left'},
      '-': {'precedence': 0, 'association': 'left'},
      '*': {'precedence': 2, 'association': 'left'},
      '/': {'precedence': 2, 'association': 'left'},
      'UMINUS': {'precedence': 4, 'association': 'right'}
    };

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    bnf.__set__('ambiguousRules', ambiguousRules);
    bnf.__set__('firstTable', {});
    bnf.__set__('followTable', {});
    bnf.__set__('nonLeftRecursionYaccRules', []);

    parser.__set__('bnf', bnf);

  })

  it('parsing table', function(){
    var actionTable = parser.lalrParsingTable()[0];
    var gotoTable = parser.lalrParsingTable()[1];

    expect(actionTable).to.eql(
      [
        {
          '(': 'shift 2', 'id': 'shift 3'
        },
        {
          'EOF': 'accept', '+': 'shift 4', '*': 'shift 5'
        },
        {
          '(': 'shift 2', 'id': 'shift 3'
        },
        {
          'EOF': 'reduce 1,3',
          ')': 'reduce 1,3',
          '*': 'reduce 1,3',
          '+': 'reduce 1,3'
        },
        {
          '(': 'shift 2', 'id': 'shift 3'
        },
        {
          '(': 'shift 2', 'id': 'shift 3'
        },
        {
          ')': 'shift 9', '+': 'shift 4', '*': 'shift 5'
        },
        {
          'EOF': 'reduce 1,0',
          ')': 'reduce 1,0',
          '*': 'shift 5',
          '+': 'reduce 1,0'
        },
        {
          'EOF': 'reduce 1,1',
          ')': 'reduce 1,1',
          '*': 'reduce 1,1',
          '+': 'reduce 1,1'
        },
        {
          'EOF': 'reduce 1,2',
          ')': 'reduce 1,2',
          '*': 'reduce 1,2',
          '+': 'reduce 1,2'
        }

      ]
    );

    expect(gotoTable).to.eql(
      [
        { 'E': 1 },
        {},
        { 'E': 6 },
        {},
        { 'E': 7 },
        { 'E': 8 },
        {},
        {},
        {},
        {}
      ]
    );

  })

})


