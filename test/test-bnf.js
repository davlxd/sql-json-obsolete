var rewire = require('rewire');
var bnf = rewire('../lib/bnf');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;

describe('Mock yaccRules', function(){

  var yaccRules = [
    {'head': 'E',
     'body': [{'expr': ['E', '+', 'T']},
              {'expr': ['T']}]
    },
    {'head': 'T',
     'body': [{'expr': ['T', '+', 'F']},
              {'expr': ['F']}]
    },
    {'head': 'F',
     'body': [{'expr': ['(', 'E', ')']},
              {'expr': ['id']}]
    }
  ];

  before(function(){
    bnf.__set__('yaccRules', yaccRules);
  })

  it('test cloneRule and getRule', function(done){
    var clonedRule = bnf.cloneRule(bnf.getRule('T'));
    clonedRule.body[0].expr[1] = '-';

    expect(bnf.getRule('T')).to.not.eql(clonedRule);
    done();
  })

  it('test cloneRule and getRule with rule head X', function(done){
    var clonedRule = bnf.cloneRule(bnf.getRule('X'));
    done();
  })


  it('test cloneRule and getRule', function(done){
    expect(bnf.augmentRule()).to.eql({
      'head': 'E_',
      'body':[{'expr': ['E'], 'dotIndex': 0}]
    });
    expect(bnf.yaccRules()).to.have.length(4);
    done();
  })

  it('test onlyOne', function(done){
    var origin = bnf.cloneRule(bnf.getRule('E'));
    origin.body[0].dotIndex = 0;
    origin.body[1].dotIndex = 0;

    var altered = bnf.cloneRule(bnf.getRule('E'));
    altered.body[0].dotIndex = 1;
    altered.body[1].dotIndex = 0;

    var diff = bnf.bodyDiffFirst(altered.body, origin.body);
    expect(diff).to.eql([ { expr: [ 'E', '+', 'T' ], dotIndex: 1 } ]);
    done();
  });


})
