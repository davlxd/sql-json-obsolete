var Lexer = require('../lib/lexer');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;

describe('Lexer should return correct tokens', function(){
  it('test case number 1', function(done){
    var input = '   \nfuselect\t selectdb \tfrom\t3.14\n3ck';
    var lexer = new Lexer(input);
    expect(lexer.next()).to.eql(['NAME', 'fuselect']);
    expect(lexer.next()).to.eql(['NAME', 'selectdb']);
    expect(lexer.next()).to.eql(['FROM']);
    expect(lexer.next()).to.eql(['NUM', 3.14]);
    expect(lexer.next()).to.eql(['NUM', 3]);
    expect(lexer.next()).to.eql(['NAME', 'ck']);
    done();
  })

  it('test case number 2', function(done){
    var input = 'select * where location like \'earth%\' and msd >= 34.3';
    var lexer = new Lexer(input);
    expect(lexer.next()).to.eql(['SELECT']);
    expect(lexer.next()).to.eql(['*']);
    expect(lexer.next()).to.eql(['WHERE']);
    expect(lexer.next()).to.eql(['NAME', 'location']);
    expect(lexer.next()).to.eql(['LIKE']);
    expect(lexer.next()).to.eql(['STRING', 'earth%']);
    expect(lexer.next()).to.eql(['AND']);
    expect(lexer.next()).to.eql(['NAME', 'msd']);
    expect(lexer.next()).to.eql(['COMPARISON', '>=']);
    expect(lexer.next()).to.eql(['NUM', 34.3]);
    done();
  })

})
