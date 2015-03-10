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
   'body': [{'expr': ['T', '*', 'F']},
            {'expr': ['F']}]
  },
  {'head': 'F',
   'body': [{'expr': ['(', 'E', ')']},
            {'expr': ['id']}]
  },
];

var tokens = [
  '*', '+', 'id', '(', ')'
];

describe('verify items()', function(){

  var itemSetArray = [];

  before(function(){
    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    parser.__set__('bnf', bnf);

    var itemSet0 = parser.closure([bnf.augmentRule()]);  itemSetArray.push(itemSet0);
    var itemSet1 =  parser.goto(itemSet0, 'E');  itemSetArray.push(itemSet1);
    var itemSet2 =  parser.goto(itemSet0, 'T');  itemSetArray.push(itemSet2);
    var itemSet3 =  parser.goto(itemSet0, 'F');  itemSetArray.push(itemSet3);
    var itemSet4 =  parser.goto(itemSet0, '(');  itemSetArray.push(itemSet4);
    var itemSet5 =  parser.goto(itemSet0, 'id');  itemSetArray.push(itemSet5);
    var itemSet6 =  parser.goto(itemSet1, '+');  itemSetArray.push(itemSet6);
    var itemSet7 =  parser.goto(itemSet2, '*');  itemSetArray.push(itemSet7);
    var itemSet8 =  parser.goto(itemSet4, 'E');  itemSetArray.push(itemSet8);
    var itemSet9 =  parser.goto(itemSet6, 'T');  itemSetArray.push(itemSet9);
    var itemSet10 =  parser.goto(itemSet7, 'F');  itemSetArray.push(itemSet10);
    var itemSet11 =  parser.goto(itemSet8, ')');  itemSetArray.push(itemSet11);
  })

  it('verify items', function(){
    var collection = parser.items();
    expect(collection).to.have.length(12);
    
    itemSetArray.forEach(function(itemSet){
      expect(parser.collectionContains(collection, itemSet)).to.be.true;      
    });
  })
})

