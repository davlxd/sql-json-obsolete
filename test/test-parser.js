var Lexer = require('../lib/lexer');
var assert  = require('assert');
var _  = require('underscore');
var parser = require('../lib/parser');
var chai = require('chai');
var expect = chai.expect;

describe('Check BNF table', function(){
  it('check if any nonterminal underivable', function(){
    parser.check();
  })
})


// describe('Precompile table', function(){
//   it('elimination left recursion', function(){
//     parser.precompile();
//   })
// })
