var rewire = require('rewire');
var bnf = rewire('../lib/bnf');
var parser = rewire('../lib/parser');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;



describe('verify CLOSURE', function(){
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
      '+', '*', '(', ')', 'id', 'EOF'
    ];

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    bnf.__set__('firstTable', {});
    bnf.__set__('followTable', {});
    bnf.__set__('nonLeftRecursionYaccRules', []);
    parser.__set__('bnf', bnf);
  })

  it('verify initial CLOSURE', function(){
    var itemSet0 = parser.closure([bnf.augmentRule()]);

    var expected = [
      {'head': 'E_',
       'body': [{'expr': ['E'], 'dotIndex': 0}]
      },
      {'head': 'E',
       'body': [{'expr': ['E', '+', 'T'], 'dotIndex': 0},
                {'expr': ['T'], 'dotIndex': 0}]
      },
      {'head': 'T',
       'body': [{'expr': ['T', '*', 'F'], 'dotIndex': 0},
                {'expr': ['F'], 'dotIndex': 0}]
      },
      {'head': 'F',
       'body': [{'expr': ['(', 'E', ')'], 'dotIndex': 0},
                {'expr': [ 'id' ], 'dotIndex': 0}]
      }
    ];
    expect(itemSet0).to.eql(expected);
  })
})



describe('verify GOTO', function(){

  var itemSet0, itemSet1, itemSet2, itemSet3, itemSet4, itemSet5, itemSet6, itemSet7;
  var itemSet8, itemSet9, itemSet10, itemSet11;

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
      '+', '*', '(', ')', 'id', 'EOF'
    ];

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    bnf.__set__('firstTable', {});
    bnf.__set__('followTable', {});
    bnf.__set__('nonLeftRecursionYaccRules', []);
    parser.__set__('bnf', bnf);

    itemSet0 = parser.closure([bnf.augmentRule()]);
    itemSet1 =  parser.goto(itemSet0, 'E');
    itemSet2 =  parser.goto(itemSet0, 'T');
    itemSet3 =  parser.goto(itemSet0, 'F');
    itemSet4 =  parser.goto(itemSet0, '(');
    itemSet5 =  parser.goto(itemSet0, 'id');
    itemSet6 =  parser.goto(itemSet1, '+');
    itemSet7 =  parser.goto(itemSet2, '*');
    itemSet8 =  parser.goto(itemSet4, 'E');
    itemSet9 =  parser.goto(itemSet6, 'T');
    itemSet10 =  parser.goto(itemSet7, 'F');
    itemSet11 =  parser.goto(itemSet8, ')');
  })

  it('verify GOTO from itemSet0 to itemSet1', function(){
    var expectItemSet1 =  [
      {'head': 'E_',
       'body': [{'expr': ['E'], 'dotIndex': 1}]
      },
      {'head': 'E',
       'body': [{'expr': ['E', '+', 'T'], 'dotIndex': 1}]
      }
    ]
    expect(expectItemSet1).to.eql(itemSet1);


    var expecteItemSet0 = [
      {'head': 'E_',
       'body': [{'expr': ['E'], 'dotIndex': 0}]
      },
      {'head': 'E',
       'body': [{'expr': ['E', '+', 'T'], 'dotIndex': 0},
                {'expr': ['T'], 'dotIndex': 0}]
      },
      {'head': 'T',
       'body': [{'expr': ['T', '*', 'F'], 'dotIndex': 0},
                {'expr': ['F'], 'dotIndex': 0}]},
      {'head': 'F',
       'body': [{'expr': ['(', 'E', ')'], 'dotIndex': 0},
                {'expr': [ 'id' ], 'dotIndex': 0}]
      }
    ];
    expect(expecteItemSet0).to.eql(itemSet0);
  })

  it('verify GOTO from itemSet0 to itemSet2', function(){
    var expectItemSet2 =  [
      {'head': 'E',
       'body': [{'expr': ['T'], 'dotIndex': 1}]
      },
      {'head': 'T',
       'body': [{'expr': ['T', '*', 'F'], 'dotIndex': 1}]
      }
    ]
    expect(expectItemSet2).to.eql(itemSet2);
  })

  it('verify GOTO from itemSet0 to itemSet3', function(){
    var expectItemSet3 =  [
      {'head': 'T',
       'body': [{'expr': ['F'], 'dotIndex': 1}]
      }
    ]
    expect(expectItemSet3).to.eql(itemSet3);
  })

  it('verify GOTO from itemSet0 to itemSet4', function(){
    var expectItemSet4 =  [
      {'head': 'F',
       'body': [{'expr': ['(', 'E', ')'], 'dotIndex': 1},
                {'expr': ['(', 'E', ')'], 'dotIndex': 0},
                {'expr': [ 'id' ], 'dotIndex': 0}]
      },
      {'head': 'E',
       'body': [{'expr': ['E', '+', 'T'], 'dotIndex': 0},
                {'expr': ['T'], 'dotIndex': 0}]
      },
      {'head': 'T',
       'body': [{'expr': ['T', '*', 'F'], 'dotIndex': 0},
                {'expr': ['F'], 'dotIndex': 0}]
      }
    ]
    expect(expectItemSet4).to.eql(itemSet4);
  })


  it('verify GOTO from itemSet0 to itemSet5', function(){
    var expectItemSet5 =  [
      {'head': 'F',
       'body': [{'expr': [ 'id' ], 'dotIndex': 1}]
      }
    ]
    expect(expectItemSet5).to.eql(itemSet5);
  })


  it('verify GOTO from itemSet1 to accept', function(){
    var accept = parser.goto(itemSet1, 'EOF');
    expect(accept).to.eql('accept');
  })

  it('verify GOTO from itemSet1 to itemSet6', function(){
    var expectItemSet6 =  [
      {'head': 'E',
       'body': [{'expr': ['E', '+', 'T'], 'dotIndex': 2}]
      },
      {'head': 'T',
       'body': [{'expr': ['T', '*', 'F'], 'dotIndex': 0},
                {'expr': ['F'], 'dotIndex': 0}]},
      {'head': 'F',
       'body': [{'expr': ['(', 'E', ')'], 'dotIndex': 0},
                {'expr': [ 'id' ], 'dotIndex': 0}]
      }
    ]
    expect(expectItemSet6).to.eql(itemSet6);
  })

  it('verify GOTO from itemSet2 to itemSet7', function(){
    var expectItemSet7 =  [
      {'head': 'T',
       'body': [{'expr': ['T', '*', 'F'], 'dotIndex': 2}]
      },
      {'head': 'F',
       'body': [{'expr': ['(', 'E', ')'], 'dotIndex': 0},
                {'expr': [ 'id' ], 'dotIndex': 0}]
      }
    ]
    expect(expectItemSet7).to.eql(itemSet7);
  })

  it('verify GOTO from itemSet2 to non accept', function(){
    var nonAccept = parser.goto(itemSet3, 'E');
    expect(nonAccept).to.eql([]);

    nonAccept = parser.goto(itemSet3, 'EOF');
    expect(nonAccept).to.eql([]);

    nonAccept = parser.goto(itemSet3, 'X');
    expect(nonAccept).to.eql([]);
  })

  it('verify GOTO from itemSet4 to itemSet2', function(){
    expect(itemSet2).to.eql(parser.goto(itemSet4, 'T'));
  })

  it('verify GOTO from itemSet4 to itemSet4', function(){
    expect(itemSet4).to.eql(parser.goto(itemSet4, '('));
  })

  it('verify GOTO from itemSet4 to itemSet5', function(){
    expect(itemSet5).to.eql(parser.goto(itemSet4, 'id'));
  })

  it('verify GOTO from itemSet4 to itemSet8', function(){
    var expectItemSet8 =  [
      {'head': 'F',
       'body': [{'expr': ['(', 'E', ')'], 'dotIndex': 2}]
      },
      {'head': 'E',
       'body': [{'expr': ['E', '+', 'T'], 'dotIndex': 1}]
      }
    ]
    expect(expectItemSet8).to.eql(itemSet8);
  })

  it('verify GOTO from itemSet6 to itemSet9', function(){
    var expectItemSet9 =  [
      {'head': 'E',
       'body': [{'expr': ['E', '+', 'T'], 'dotIndex': 3}]
      },
      {'head': 'T',
       'body': [{'expr': ['T', '*', 'F'], 'dotIndex': 1}]
      }
    ]
    expect(expectItemSet9).to.eql(itemSet9);
  })

  it('verify GOTO from itemSet6 to itemSet3', function(){
    expect(itemSet3).to.eql(parser.goto(itemSet6, 'F'));
  })

  it('verify GOTO from itemSet6 to itemSet4', function(){
    expect(itemSet4).to.eql(parser.goto(itemSet6, '('));
  })

  it('verify GOTO from itemSet6 to itemSet5', function(){
    expect(itemSet5).to.eql(parser.goto(itemSet6, 'id'));
  })

  it('verify GOTO from itemSet7 to itemSet10', function(){
    var expectItemSet10 =  [
      {'head': 'T',
       'body': [{'expr': ['T', '*', 'F'], 'dotIndex': 3}]
      }
    ]
    expect(expectItemSet10).to.eql(itemSet10);
  })

  it('verify GOTO from itemSet7 to itemSet4', function(){
    expect(itemSet4).to.eql(parser.goto(itemSet7, '('));
  })

  it('verify GOTO from itemSet7 to itemSet5', function(){
    expect(itemSet5).to.eql(parser.goto(itemSet7, 'id'));
  })

  it('verify GOTO from itemSet8 to itemSet11', function(){
    var expectItemSet11 =  [
      {'head': 'F',
       'body': [{'expr': ['(', 'E', ')'], 'dotIndex': 3}]
      }
    ]
    expect(expectItemSet11).to.eql(itemSet11);
  })

  it('verify GOTO from itemSet8 to itemSet6', function(){
    expect(itemSet6).to.eql(parser.goto(itemSet8, '+'));
  })

  it('verify GOTO from itemSet9 to itemSet7', function(){
    expect(itemSet7).to.eql(parser.goto(itemSet9, '*'));
  })

})


describe('verify CLOSURE with lookahead', function(){
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
      'd', 'c', 'EOF'
    ];

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    bnf.__set__('firstTable', {});
    bnf.__set__('followTable', {});
    bnf.__set__('nonLeftRecursionYaccRules', []);
    parser.__set__('bnf', bnf);
  })

  it('verify initial CLOSURE', function(){
    var augmentRule = bnf.augmentRule(); augmentRule.body[0].lookahead = ['EOF'];
    var itemSet0 = parser.closure([augmentRule]);


    expect(itemSet0).to.eql(
      [
        {'head': 'S_',
         'body': [{'expr': ['S'], 'dotIndex': 0, 'lookahead': ['EOF']}]
        },
        {'head': 'S',
         'body': [{'expr': ['C', 'C'], 'dotIndex': 0, 'lookahead': ['EOF']}]
        },
        {'head': 'C',
         'body': [{'expr': ['c', 'C'], 'dotIndex': 0, 'lookahead': ['c', 'd']},
                  {'expr': ['d'], 'dotIndex': 0, 'lookahead': ['c' ,'d']}]
        }
      ]
    );
  })
})



describe('verify GOTO with lookahead', function(){

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
      'd', 'c', 'EOF'
    ];

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    bnf.__set__('firstTable', {});
    bnf.__set__('followTable', {});
    bnf.__set__('nonLeftRecursionYaccRules', []);
    parser.__set__('bnf', bnf);

    var augmentRule = bnf.augmentRule(); augmentRule.body[0].lookahead = ['EOF'];
    itemSet0 = parser.closure([augmentRule]);
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
         'body': [{'expr': ['S'], 'dotIndex': 1, 'lookahead': ['EOF']}]
        }
      ]
    );


    expect(itemSet0).to.eql(
      [
        {'head': 'S_',
         'body': [{'expr': ['S'], 'dotIndex': 0, 'lookahead': ['EOF']}]
        },
        {'head': 'S',
         'body': [{'expr': ['C', 'C'], 'dotIndex': 0, 'lookahead': ['EOF']}]
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
         'body': [{'expr': ['C', 'C'], 'dotIndex': 1, 'lookahead': ['EOF']}]
        },
        {'head': 'C',
         'body': [{'expr': ['c', 'C'], 'dotIndex': 0, 'lookahead': ['EOF']},
                  {'expr': ['d'], 'dotIndex': 0, 'lookahead': ['EOF']}]
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
         'body': [{'expr': ['C', 'C'], 'dotIndex': 2, 'lookahead': ['EOF']}]
        }
      ]
    );
  })

  it('verify GOTO from itemSet2 to itemSet6', function(){
    expect(itemSet6).to.eql(
      [
        {'head': 'C',
         'body': [{'expr': ['c', 'C'], 'dotIndex': 1, 'lookahead': ['EOF']},
                  {'expr': ['c', 'C'], 'dotIndex': 0, 'lookahead': ['EOF']},
                  {'expr': ['d'], 'dotIndex': 0, 'lookahead': ['EOF']}]
        }
      ]
    );
  })

  it('verify GOTO from itemSet2 to itemSet7', function(){
    expect(itemSet7).to.eql(
      [
        {'head': 'C',
         'body': [{'expr': ['d'], 'dotIndex': 1, 'lookahead': ['EOF']}]
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
         'body': [{'expr': ['c', 'C'], 'dotIndex': 2, 'lookahead': ['EOF']}]
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

