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
      {'head': 'lines',
       'body': [
         {'expr': ['lines', 'expr', '\n']},
         {'expr': ['lines', '\n']},
         {'expr': []}
       ]
      },

      {'head': 'expr',
       'body': [
         {'expr': ['expr', '+', 'expr']},
         {'expr': ['expr', '-', 'expr']},
         {'expr': ['expr', '*', 'expr']},
         {'expr': ['expr', '/', 'expr']},
         {'expr': ['(', 'expr', ')']},
         {'expr': ['-', 'expr'], 'prec': 'UMINUS'},
         {'expr': ['NUMBER']}
       ]
      }
    ];

    var tokens = [
      '\n', '+', '-', '*', '/', '(', ')', '-', 'NUMBER'
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
    // console.log(actionTable);
    // console.log(gotoTable);

    // parser.inspectCollection(parser.propagateLookahead());
    // console.log(parser.lalrParsingTable());

  })

})


