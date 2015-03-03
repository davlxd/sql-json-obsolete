var rewire = require('rewire');
var bnf = rewire('../lib/bnf');
var parser = rewire('../lib/parser');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;


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
  },
];

describe('verify CLOSURE', function(){
  before(function(){
    bnf.__set__('yaccRules', yaccRules);
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
       'body': [{'expr': ['T', '+', 'F'], 'dotIndex': 0},
                {'expr': ['F'], 'dotIndex': 0}]},
      {'head': 'F',
       'body': [{'expr': ['(', 'E', ')'], 'dotIndex': 0},
                {'expr': [ 'id' ], 'dotIndex': 0}]
      }
    ];
    expect(itemSet0).to.eql(expected);
  })
})


// describe('verify GOTO', function(){
//   var parser = new Parser(yaccRules);
//   var augmentedRule = parser.augment();

//   var itemSet0 = parser.closure([augmentedRule]);
//   var itemSet1 =  parser.goto(itemSet0, 'E');
//   // var itemSet2 =  parser.goto(itemSet0, 'T');
//   // var itemSet3 =  parser.goto(itemSet0, 'F');
//   // var itemSet4 =  parser.goto(itemSet0, '(');
//   // var itemSet5 =  parser.goto(itemSet0, 'id');
// //  var itemSet6 =  parser.goto(itemSet1, '+');


//   it('verify GOTO from itemSet0 to itemSet1', function(){
//     var expected =  [
//       {'E_':[['E']]},
//       {'E': [['E', '+', 'T']]}
//     ]
//     expected[0].E_[0].dotIndex = 1;
//     expected[1].E[0].dotIndex = 1;

//     expect(itemSet1).to.eql(expected);

//     expected =  [
//       {'E_':[['E']]},
//       {'E': [['E', '+', 'T'], ['T']]},
//       {'T': [['T', '*', 'F'], ['F']]},
//       {'F': [['(', 'E', ')'], ['id']]}
//     ]
//     expected[0].E_[0].dotIndex = 0;
//     expected[1].E[0].dotIndex = 0;  expected[1].E[1].dotIndex = 0;
//     expected[2].T[0].dotIndex = 0;  expected[2].T[1].dotIndex = 0;
//     expected[3].F[0].dotIndex = 0;  expected[3].F[1].dotIndex = 0;

//     expect(itemSet0).to.eql(expected);

//   })

//   // it('verify GOTO from itemSet0 to itemSet2', function(){
//   //   var expected =  [
//   //     {'E':[['T']]},
//   //     {'T': [['T', '*', 'F']]}
//   //   ]
//   //   expected[0].E[0].dotIndex = 1;
//   //   expected[1].T[0].dotIndex = 1;

//   //   expect(itemSet2).to.eql(expected);
//   // })

//   // it('verify GOTO from itemSet0 to itemSet3', function(){
//   //   var expected =  [
//   //     {'T':[['F']]},
//   //   ]
//   //   expected[0].T[0].dotIndex = 1;

//   //   expect(itemSet3).to.eql(expected);
//   // })

//   // it('verify GOTO from itemSet0 to itemSet4', function(){
//   //   var expected =  [
//   //     {'F':[['(', 'E', ')'], ['(', 'E', ')'], ['id']]},
//   //     {'E':[['E', '+', 'T'], ['T']]},
//   //     {'T':[['T', '*', 'F'], ['F']]},
//   //   ]
//   //   expected[0].F[0].dotIndex = 1;  expected[0].F[1].dotIndex = 0;  expected[0].F[2].dotIndex = 0;
//   //   expected[1].E[0].dotIndex = 0;  expected[1].E[1].dotIndex = 0;
//   //   expected[2].T[0].dotIndex = 0;  expected[2].T[1].dotIndex = 0;

//   //   expect(itemSet4).to.eql(expected);
//   // })


//   // it('verify GOTO from itemSet0 to itemSet5', function(){
//   //   var expected =  [
//   //     {'F':[['id']]},
//   //   ]
//   //   expected[0].F[0].dotIndex = 1;

//   //   expect(itemSet5).to.eql(expected);
//   // })

//   // it('verify GOTO from itemSet1 to itemSet6', function(){

//   //   var expected =  [
//   //     {'E':[['E', '+', 'T']]},
//   //     {'T':[['T', '*', 'F'], ['F']]},
//   //     {'F':[['(', 'E', ')'], ['id']]}
//   //   ]
//   //   expected[0].E[0].dotIndex = 2;
//   //   expected[1].T[0].dotIndex = 0;  expected[1].T[1].dotIndex = 0;
//   //   expected[2].F[0].dotIndex = 0;  expected[2].F[1].dotIndex = 0;

//   //   expect(itemSet6).to.eql(expected);
//   // })




// })



// describe('Precompile table', function(){
//   it('elimination left recursion', function(){
//     parser.precompile();
//   })
// })
