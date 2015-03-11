var rewire = require('rewire');
var bnf = rewire('../lib/bnf');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;

describe('rule fetch & compare routines', function(){

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
    }
  ];

  var tokens = [
    '*', '+', 'id', '(', ')'
  ];

  before(function(){
    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
  })

  it('test symbols', function(done){
    expect(bnf.symbols()).to.have.length(8);
    done();
  });

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
  })

  it('test itemSetEqual and descendant', function(done){
    var itemSet0 = [];
    var itemSet1 = [];
    itemSet0.push(bnf.cloneRule(yaccRules[0]));
    itemSet0.push(bnf.cloneRule(yaccRules[1]));
    itemSet1.push(bnf.cloneRule(yaccRules[0]));
    itemSet1.push(bnf.cloneRule(yaccRules[1]));

    expect(bnf.itemSetEqual(itemSet0, itemSet1)).to.be.true;
    itemSet1[1].body[1].expr[0] = 'Z';
    expect(bnf.itemSetEqual(itemSet0, itemSet1)).to.be.false;
    done();
  })

})


describe('first & follow', function(){
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
    }
  ];

  var tokens = [
    '*', '+', 'id', '(', ')'
  ];

  before(function(){
    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
  })

  it('elimate left recursion', function(done){
    var nonLeftRecursionYaccRules = bnf.__get__('nonLeftRecursion')();
    var expectNonLeftReucurYaccRules = [
      {'head': 'E',
       'body': [{'expr': ['T', 'E_']}]
      },
      {'head': 'E_',
       'body': [{'expr': ['+', 'T', 'E_']},
                {'expr': []}]
      },
      {'head': 'T',
       'body': [{'expr': ['F', 'T_']}]
      },
      {'head': 'T_',
       'body': [{'expr': ['*', 'F', 'T_']},
                {'expr': []}]
      },
      {'head': 'F',
       'body': [{'expr': ['(', 'E', ')']},
                {'expr': ['id']}]
      }
    ];

    expect(nonLeftRecursionYaccRules).to.eql(expectNonLeftReucurYaccRules);
    done();
  })

  it('generate First table', function(done){
    var firstTable = bnf.__get__('generateFirstTable')();
    var expectFirstTable =
      { '*': [ '*' ],
        '+': [ '+' ],
        'id': [ 'id' ],
        '(': [ '(' ],
        ')': [ ')' ],
        'E': [ '(', 'id' ],
        'E_': [ '+', '' ],
        'T': [ '(', 'id' ],
        'T_': [ '*', '' ],
        'F': [ '(', 'id' ]
      };

    expect(firstTable).to.eql(expectFirstTable);
    done();
  })

  it('generate Follow table', function(done){
    var followTable = bnf.__get__('generateFollowTable')();
    var expectFollowTable =
      { 'E': [ '$', '+', ')' ],
        'T': [ '$', '+', ')', '*' ],
        'F': [ '$', '+', ')', '*' ]
      };

    expect(followTable).to.eql(expectFollowTable);
    done();
  })

})

