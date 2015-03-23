var rewire = require('rewire');
var bnf = rewire('../lib/bnf');
var parser = rewire('../lib/parser');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;



describe('SLR', function(){
  var itemSetArray = [];

  before(function(){
    var yaccRules = [
      {'head': 'E',
       'body': [{'expr': ['E', '+', 'T']},
                {'expr': ['T']}]
      },
      {'head': 'T',
       'body': [{'expr': ['T', '*', 'F']},
                {'expr': ['F']}]
      },
      {'head': 'F',
       'body': [{'expr': ['(', 'E', ')']},
                {'expr': ['id']}]
      },
    ];

    var tokens = [
      '+', '*', '(', ')', 'id'
    ];

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    bnf.__set__('firstTable', {});
    bnf.__set__('followTable', {});
    bnf.__set__('nonLeftRecursionYaccRules', []);

    parser.__set__('bnf', bnf);
  })

  it('parsing', function(){
    // var actionTable = parser.lalrParsingTable()[0];
    // var gotoTable = parser.lalrParsingTable()[1];
    
  })

})
