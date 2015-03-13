var rewire = require('rewire');
var bnf = rewire('../lib/bnf');
var parser = rewire('../lib/parser');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;



describe('verify CLOSURE', function(){
  before(function(){
    var yaccRules = [
      {'head': 'S',
       'body': [{'expr': ['C', 'C']}]
      },
      {'head': 'C',
       'body': [{'expr': ['c', 'C']},
                {'expr': ['d']}]
      },
    ];

    var tokens = [
      'd', 'c'
    ];

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    parser.__set__('bnf', bnf);
  })

  it('verify initial CLOSURE', function(){
    var itemSet0 = parser.closure([bnf.augmentRule()]);

    expect(itemSet0).to.eql(
      [
        {'head': 'S_',
         'body': [{'expr': ['S'], 'dotIndex': 0, 'lookahead': ['$']}]
        },
        {'head': 'S',
         'body': [{'expr': ['C', 'C'], 'dotIndex': 0, 'lookahead': ['$']}]
        },
        {'head': 'C',
         'body': [{'expr': ['c', 'C'], 'dotIndex': 0, 'lookahead': ['c', 'd']},
                  {'expr': ['d'], 'dotIndex': 0, 'lookahead': ['c' ,'d']}]
        }
      ]
    );
  })
})



describe('verify GOTO case 2', function(){

  var itemSet0, itemSet1, itemSet2, itemSet3, itemSet4, itemSet5, itemSet6, itemSet7;
  var itemSet8, itemSet9;

  before(function(){
    var yaccRules = [
      {'head': 'S',
       'body': [{'expr': ['C', 'C']}]
      },
      {'head': 'C',
       'body': [{'expr': ['c', 'C']},
                {'expr': ['d']}]
      },
    ];

    var tokens = [
      'd', 'c'
    ];

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    parser.__set__('bnf', bnf);

    itemSet0 = parser.closure([bnf.augmentRule()]);
    itemSet1 =  parser.goto(itemSet0, 'S');
    itemSet2 =  parser.goto(itemSet0, 'C');
    itemSet3 =  parser.goto(itemSet0, 'c');
    itemSet4 =  parser.goto(itemSet0, 'd');
    itemSet5 =  parser.goto(itemSet2, 'C');
    itemSet6 =  parser.goto(itemSet2, 'c');
    itemSet7 =  parser.goto(itemSet2, 'd');
    itemSet8 =  parser.goto(itemSet3, 'C');
    itemSet9 =  parser.goto(itemSet6, 'C');
  })

  it('verify GOTO from itemSet0 to itemSet1', function(){
    expect(itemSet1).to.eql(
      [
        {'head': 'S_',
         'body': [{'expr': ['S'], 'dotIndex': 1, 'lookahead': ['$']}]
        }
      ]
    );


    expect(itemSet0).to.eql(
      [
        {'head': 'S_',
         'body': [{'expr': ['S'], 'dotIndex': 0, 'lookahead': ['$']}]
        },
        {'head': 'S',
         'body': [{'expr': ['C', 'C'], 'dotIndex': 0, 'lookahead': ['$']}]
        },
        {'head': 'C',
         'body': [{'expr': ['c', 'C'], 'dotIndex': 0, 'lookahead': ['c', 'd']},
                  {'expr': ['d'], 'dotIndex': 0, 'lookahead': ['c' ,'d']}]
        }
      ]
    );
  })

  it('verify GOTO from itemSet0 to itemSet2', function(){
    expect(itemSet2).to.eql(
      [
        {'head': 'S',
         'body': [{'expr': ['C', 'C'], 'dotIndex': 1, 'lookahead': ['$']}]
        },
        {'head': 'C',
         'body': [{'expr': ['c', 'C'], 'dotIndex': 0, 'lookahead': ['$']},
                  {'expr': ['d'], 'dotIndex': 0, 'lookahead': ['$']}]
        }
      ]
    );
  })

  it('verify GOTO from itemSet0 to itemSet3', function(){
    expect(itemSet3).to.eql(
      [
        {'head': 'C',
         'body': [{'expr': ['c', 'C'], 'dotIndex': 1, 'lookahead': ['c', 'd']},
                  {'expr': ['c', 'C'], 'dotIndex': 0, 'lookahead': ['c', 'd']},
                  {'expr': ['d'], 'dotIndex': 0, 'lookahead': ['c' ,'d']}]
        }
      ]
    );
  })

  it('verify GOTO from itemSet0 to itemSet4', function(){
    expect(itemSet4).to.eql(
      [
        {'head': 'C',
         'body': [{'expr': ['d'], 'dotIndex': 1, 'lookahead': ['c' ,'d']}]
        }
      ]
    );
  })

  it('verify GOTO from itemSet2 to itemSet5', function(){
    expect(itemSet5).to.eql(
      [
        {'head': 'S',
         'body': [{'expr': ['C', 'C'], 'dotIndex': 2, 'lookahead': ['$']}]
        }
      ]
    );
  })

  it('verify GOTO from itemSet2 to itemSet6', function(){
    expect(itemSet6).to.eql(
      [
        {'head': 'C',
         'body': [{'expr': ['c', 'C'], 'dotIndex': 1, 'lookahead': ['$']},
                  {'expr': ['c', 'C'], 'dotIndex': 0, 'lookahead': ['$']},
                  {'expr': ['d'], 'dotIndex': 0, 'lookahead': ['$']}]
        }
      ]
    );
  })

  it('verify GOTO from itemSet2 to itemSet7', function(){
    expect(itemSet7).to.eql(
      [
        {'head': 'C',
         'body': [{'expr': ['d'], 'dotIndex': 1, 'lookahead': ['$']}]
        }
      ]
    );
  })

  it('verify GOTO from itemSet3 to itemSet8', function(){
    expect(itemSet8).to.eql(
      [
        {'head': 'C',
         'body': [{'expr': ['c', 'C'], 'dotIndex': 2, 'lookahead': ['c', 'd']}]
        }
      ]
    );
  })

  it('verify GOTO from itemSet6 to itemSet9', function(){
    expect(itemSet9).to.eql(
      [
        {'head': 'C',
         'body': [{'expr': ['c', 'C'], 'dotIndex': 2, 'lookahead': ['$']}]
        }
      ]
    );
  })

  it('verify GOTO from itemSet3 to itemSet3', function(){
    expect(itemSet3).to.eql(parser.goto(itemSet3, 'c'));
  })

  it('verify GOTO from itemSet3 to itemSet4', function(){
    expect(itemSet4).to.eql(parser.goto(itemSet3, 'd'));
  })

  it('verify GOTO from itemSet6 to itemSet6', function(){
    expect(itemSet6).to.eql(parser.goto(itemSet6, 'c'));
  })

  it('verify GOTO from itemSet6 to itemSet7', function(){
    expect(itemSet7).to.eql(parser.goto(itemSet6, 'd'));
  })
})

