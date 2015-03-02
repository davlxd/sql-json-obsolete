var Parser = require('../lib/parser');
var sqlBnf = require('../lib/sqlbnf');
var assert  = require('assert');
var _  = require('underscore');
var chai = require('chai');
var expect = chai.expect;

var yaccRules = {
  'E': [['E', '+', 'T'],
        ['T'],
       ],
  'T': [['T', '*', 'F'],
        ['F']
       ],
  'F': [['(', 'E', ')'],
        ['id']
       ]
};

describe('Check BNF table', function(){
  it('check if any nonterminal underivable', function(){
     var parser = new Parser(yaccRules);
    //var parser = new Parser(sqlBnf.yaccRules);
    parser.items();
  })
})


// describe('Precompile table', function(){
//   it('elimination left recursion', function(){
//     parser.precompile();
//   })
// })
