var Lexer = require('../lib/lexer');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;

describe('Lexer should return correct tokens', function(){
  it('test case number 1', function(done){
    var input = '   \nfuselect\t selectdb \tfrom\t3.14\n3ck';
    var lexer = new Lexer(input);
    expect(lexer.next()).to.eql({'tag': 'ID', 'value':'fuselect'});
    expect(lexer.next()).to.eql({'tag': 'ID', 'value':'selectdb'});
    expect(lexer.next()).to.eql({'tag': 'FROM'});
    expect(lexer.next()).to.eql({'tag': 'NUM', 'value':3.14});
    expect(lexer.next()).to.eql({'tag': 'NUM', 'value':3});
    expect(lexer.next()).to.eql({'tag': 'ID', 'value':'ck'});
    done();
  })
})
