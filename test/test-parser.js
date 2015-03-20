var rewire = require('rewire');
var bnf = rewire('../lib/bnf');
var parser = rewire('../lib/parser');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;



describe('SLR', function(){
  var itemSetArray = [];

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
      '+', '*', '(', ')', 'id'
    ];

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

    expect(bnf.itemSetEqual(collection[0], itemSetArray[0])).to.be.true;
    expect(bnf.itemSetEqual(collection[1], itemSetArray[1])).to.be.true;
    expect(bnf.itemSetEqual(collection[2], itemSetArray[2])).to.be.true;
    expect(bnf.itemSetEqual(collection[3], itemSetArray[3])).to.be.true;
    expect(bnf.itemSetEqual(collection[4], itemSetArray[4])).to.be.true;
    expect(bnf.itemSetEqual(collection[5], itemSetArray[5])).to.be.true;
    expect(bnf.itemSetEqual(collection[6], itemSetArray[6])).to.be.true;
    expect(bnf.itemSetEqual(collection[7], itemSetArray[7])).to.be.true;
    expect(bnf.itemSetEqual(collection[8], itemSetArray[8])).to.be.true;
    expect(bnf.itemSetEqual(collection[9], itemSetArray[9])).to.be.true;
    expect(bnf.itemSetEqual(collection[10], itemSetArray[10])).to.be.true;
    expect(bnf.itemSetEqual(collection[11], itemSetArray[11])).to.be.true;

  })

  it('SLR parsing table', function(){
    var actionTable = parser.slrParsingTable()[0];
    var gotoTable = parser.slrParsingTable()[1];

    expect(actionTable).to.eql(
      [
        {
          '(': 'shift 4', id: 'shift 5'
        },
        {
          '$': 'accept', '+': 'shift 6'
        },
        {
          '$': { head: 'E', body: ['T'] },
          '+': { head: 'E', body: ['T'] },
          ')': { head: 'E', body: ['T'] },
          '*': 'shift 7'
        },
        {
          '$': { head: 'T', body: ['F'] },
          '+': { head: 'T', body: ['F'] },
          ')': { head: 'T', body: ['F'] },
          '*': { head: 'T', body: ['F'] }
        },
        {
          '(': 'shift 4', id: 'shift 5'
        },
        {
          '$': { head: 'F', body: ['id'] },
          '+': { head: 'F', body: ['id'] },
          ')': { head: 'F', body: ['id'] },
          '*': { head: 'F', body: ['id'] }
        },
        {
          '(': 'shift 4', id: 'shift 5'
        },
        {
          '(': 'shift 4', id: 'shift 5'
        },
        {
          ')': 'shift 11', '+': 'shift 6'
        },
        {
          '$': { head: 'E', body: ['E', '+', 'T'] },
          '+': { head: 'E', body: ['E', '+', 'T'] },
          ')': { head: 'E', body: ['E', '+', 'T'] },
          '*': 'shift 7'
        },
        {
          '$': { head: 'T', body: ['T', '*', 'F'] },
          '+': { head: 'T', body: ['T', '*', 'F'] },
          ')': { head: 'T', body: ['T', '*', 'F'] },
          '*': { head: 'T', body: ['T', '*', 'F'] }
        },
        {
          '$': { head: 'F', body: ['(', 'E', ')'] },
          '+': { head: 'F', body: ['(', 'E', ')'] },
          ')': { head: 'F', body: ['(', 'E', ')'] },
          '*': { head: 'F', body: ['(', 'E', ')'] }
        }
      ]
    );

    expect(gotoTable).to.eql(
      [
        { 'E': 1, 'T': 2, 'F': 3 },
        {},
        {},
        {},
        { 'E': 8, 'T': 2, 'F': 3 },
        {},
        { 'T': 9, 'F': 3 },
        { 'F': 10 },
        {},
        {},
        {},
        {}
      ]
    );
  })
})


describe('propagation LALR', function(){
  var itemSetArray = [];

  before(function(){
    var yaccRules = [
      {'head': 'S',
       'body': [{'expr': ['L', '=', 'R']},
                {'expr': ['R']}]
      },
      {'head': 'L',
       'body': [{'expr': ['*', 'R']},
                {'expr': ['id']}]
      },
      {'head': 'R',
       'body': [{'expr': ['L']}]
      },
    ];

    var tokens = [
      '=', '*', 'id'
    ];

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    parser.__set__('bnf', bnf);
  })

  it('verify kernel items with propagated lookahead', function(){
    parser.propagateLookahead();
    expect(parser.propagateLookahead()).to.eql(
      [
        [
          {'head':'S_',
           'body':[{'expr':['S'],'dotIndex':0,'lookahead':['$']}]}
        ],
        [
          {'head':'S_',
           'body':[{'expr':['S'],'dotIndex':1,'lookahead':['$']}]}
        ],
        [
          {'head':'S',
           'body':[{'expr':['L','=','R'],'dotIndex':1,'lookahead':['$']}]},
          {'head':'R',
           'body':[{'expr':['L'],'dotIndex':1,'lookahead':['$']}]}
        ],
        [
          {'head':'S',
           'body':[{'expr':['R'],'dotIndex':1,'lookahead':['$']}]}
        ],
        [
          {'head':'L',
           'body':[{'expr':['*','R'],'dotIndex':1,'lookahead':['=','$']}]}
        ],
        [
          {'head':'L',
           'body':[{'expr':['id'],'dotIndex':1,'lookahead':['=','$']}]}
        ],
        [
          {'head':'S',
           'body':[{'expr':['L','=','R'],'dotIndex':2,'lookahead':['$']}]}
        ],
        [
          {'head':'R',
           'body':[{'expr':['L'],'dotIndex':1,'lookahead':['=','$']}]}
        ],
        [
          {'head':'L',
           'body':[{'expr':['*','R'],'dotIndex':2,'lookahead':['=','$']}]}
        ],
        [
          {'head':'S',
           'body':[{'expr':['L','=','R'],'dotIndex':3,'lookahead':['$']}]}
        ],
      ]
    );
  })
})

