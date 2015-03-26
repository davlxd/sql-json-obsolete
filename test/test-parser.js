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
      '+', '*', '(', ')', 'id', 'EOF'
    ];

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    bnf.__set__('firstTable', {});
    bnf.__set__('followTable', {});
    bnf.__set__('nonLeftRecursionYaccRules', []);

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

    expect(collection.jumpTable).to.eql(
      [ { E: 1, T: 2, F: 3, '(': 4, id: 5 },
        { '+': 6 },
        { '*': 7 },
        {},
        { E: 8, T: 2, F: 3, '(': 4, id: 5 },
        {},
        { T: 9, F: 3, '(': 4, id: 5 },
        { F: 10, '(': 4, id: 5 },
        { '+': 6, ')': 11 },
        { '*': 7 },
        {},
        {} ]
    );
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
          'EOF': 'accept', '+': 'shift 6'
        },
        {
          'EOF': { head: 'E', body: ['T'] },
          '+': { head: 'E', body: ['T'] },
          ')': { head: 'E', body: ['T'] },
          '*': 'shift 7'
        },
        {
          'EOF': { head: 'T', body: ['F'] },
          '+': { head: 'T', body: ['F'] },
          ')': { head: 'T', body: ['F'] },
          '*': { head: 'T', body: ['F'] }
        },
        {
          '(': 'shift 4', id: 'shift 5'
        },
        {
          'EOF': { head: 'F', body: ['id'] },
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
          'EOF': { head: 'E', body: ['E', '+', 'T'] },
          '+': { head: 'E', body: ['E', '+', 'T'] },
          ')': { head: 'E', body: ['E', '+', 'T'] },
          '*': 'shift 7'
        },
        {
          'EOF': { head: 'T', body: ['T', '*', 'F'] },
          '+': { head: 'T', body: ['T', '*', 'F'] },
          ')': { head: 'T', body: ['T', '*', 'F'] },
          '*': { head: 'T', body: ['T', '*', 'F'] }
        },
        {
          'EOF': { head: 'F', body: ['(', 'E', ')'] },
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


describe('LALR propagate lookahead', function(){
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
      '=', '*', 'id', 'EOF'
    ];

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    bnf.__set__('firstTable', {});
    bnf.__set__('followTable', {});
    bnf.__set__('nonLeftRecursionYaccRules', []);
    parser.__set__('bnf', bnf);
  })

  it('verify kernel items with propagated lookahead hehe', function(){
    var kernels = parser.__get__('kernelItems')();

    expect(parser.__get__('generatePropagateTable')(kernels)).to.eql([
        // propagate table
        [
          [[[[1,0,0],[2,0,0],[3,0,0],[4,0,0],[5,0,0],[2,1,0]]]],
          [[[]]],
          [[[[6,0,0]]],[[]]],
          [[[]]],[
            [[[8,0,0],[4,0,0],[5,0,0],[7,0,0]]]],
          [[[]]],
          [[[[9,0,0],[7,0,0],[4,0,0],[5,0,0]]]],
          [[[]]],
          [[[]]],
          [[[]]]

        ]
        ,
        // initial lookahead table
        [
          [[[]]],
          [[[]]],
          [[[]],[[]]],
          [[[]]],
          [[["="]]],
          [[["="]]],
          [[[]]],
          [[[]]],
          [[[]]],
          [[[]]]
        ]

      ]);

    expect(parser.propagateLookahead().concat()).to.eql(
      [
        [
          {'head':'S_',
           'body':[{'expr':['S'],'dotIndex':0,'lookahead':['EOF']}]}
        ],
        [
          {'head':'S_',
           'body':[{'expr':['S'],'dotIndex':1,'lookahead':['EOF']}]}
        ],
        [
          {'head':'S',
           'body':[{'expr':['L','=','R'],'dotIndex':1,'lookahead':['EOF']}]},
          {'head':'R',
           'body':[{'expr':['L'],'dotIndex':1,'lookahead':['EOF']}]}
        ],
        [
          {'head':'S',
           'body':[{'expr':['R'],'dotIndex':1,'lookahead':['EOF']}]}
        ],
        [
          {'head':'L',
           'body':[{'expr':['*','R'],'dotIndex':1,'lookahead':['=','EOF']}]}
        ],
        [
          {'head':'L',
           'body':[{'expr':['id'],'dotIndex':1,'lookahead':['=','EOF']}]}
        ],
        [
          {'head':'S',
           'body':[{'expr':['L','=','R'],'dotIndex':2,'lookahead':['EOF']}]}
        ],
        [
          {'head':'R',
           'body':[{'expr':['L'],'dotIndex':1,'lookahead':['=','EOF']}]}
        ],
        [
          {'head':'L',
           'body':[{'expr':['*','R'],'dotIndex':2,'lookahead':['=','EOF']}]}
        ],
        [
          {'head':'S',
           'body':[{'expr':['L','=','R'],'dotIndex':3,'lookahead':['EOF']}]}
        ],
      ]
    );

    expect(parser.propagateLookahead().jumpTable).to.eql(
      [ { S: 1, L: 2, R: 3, '*': 4, id: 5 },
        {},
        { '=': 6 },
        {},
        { L: 7, R: 8, '*': 4, id: 5 },
        {},
        { L: 7, R: 9, '*': 4, id: 5 },
        {},
        {},
        {} ]
    );
  })
})



describe('LALR propagate lookahead case 2', function(){
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

  it('verify kernel items with propagated lookahead case 2', function(){
    var kernels = parser.__get__('kernelItems')();
    expect(parser.__get__('generatePropagateTable')(kernels)).to.eql([
      // propagate table
      [
        [[[[1,0,0],[1,1,0],[2,0,0],[2,1,0],[3,0,0],[4,0,0],[5,0,0]]]],
        [[[]],[[[6,0,0]]]],
        [[[]],[[[7,0,0]]]],
        [[[]]],
        [[[[8,0,0]]]],
        [[[]]],
        [[[[9,0,0],[9,1,0],[3,0,0],[4,0,0],[5,0,0]]]],
        [[[[10,0,0],[4,0,0],[5,0,0]]]],
        [[[[11,0,0]]],[[[6,0,0]]]],
        [[[]],
         [[[7,0,0]]]],
        [[[]]],
        [[[]]]
      ]
      ,
      // initial lookahead table
      [
	      [[[]]],
	      [[[]],[["+"]]],
	      [[["+",")"]],[["+","*",")"]]],
	      [[["+","*",")"]]],
	      [[["+","*",")"]]],
	      [[["+","*",")"]]],
	      [[[]]],
	      [[[]]],
	      [[[]],[[")","+"]]],
	      [[[]],[["*"]]],
	      [[[]]],
	      [[[]]]
      ]
    ]);

    expect(parser.propagateLookahead().concat()).to.eql(
      [
        [
          {'head':'E_',
           'body':[{'expr':['E'],'dotIndex':0,'lookahead':['EOF']}]}
        ],
        [
          {'head':'E_',
           'body':[{'expr':['E'],'dotIndex':1,'lookahead':['EOF']}]},
          {'head':'E',
           'body':[{'expr':['E','+','T'],'dotIndex':1,'lookahead':['+','EOF']}]}
        ],
        [
          {'head':'E',
           'body':[{'expr':['T'],'dotIndex':1,'lookahead':[')','+','EOF']}]},
          {'head':'T',
           'body':[{'expr':['T','*','F'],'dotIndex':1,'lookahead':[')','*','+','EOF']}]}
        ],
        [
          {'head':'T',
           'body':[{'expr':['F'],'dotIndex':1,'lookahead':[')','*','+','EOF']}]}
        ],
        [
          {'head':'F',
           'body':[{'expr':['(','E',')'],'dotIndex':1,'lookahead':[')','*','+','EOF']}]}
        ],
        [
          {'head':'F',
           'body':[{'expr':['id'],'dotIndex':1,'lookahead':[')','*','+','EOF']}]}
        ],
        [
          {'head':'E',
           'body':[{'expr':['E','+','T'],'dotIndex':2,'lookahead':[')','+','EOF']}]}
        ],
        [
          {'head':'T',
           'body':[{'expr':['T','*','F'],'dotIndex':2,'lookahead':[')','*','+','EOF']}]}
        ],
        [
          {'head':'F',
           'body':[{'expr':['(','E',')'],'dotIndex':2,'lookahead':[')','*','+','EOF']}]},
          {'head':'E',
           'body':[{'expr':['E','+','T'],'dotIndex':1,'lookahead':[')','+']}]}
        ],
        [
          {'head':'E',
           'body':[{'expr':['E','+','T'],'dotIndex':3,'lookahead':[')','+','EOF']}]},
          {'head':'T',
           'body':[{'expr':['T','*','F'],'dotIndex':1,'lookahead':[')','*','+','EOF']}]}
        ],
        [
          {'head':'T',
           'body':[{'expr':['T','*','F'],'dotIndex':3,'lookahead':[')','*','+','EOF']}]}
        ],
        [
          {'head':'F',
           'body':[{'expr':['(','E',')'],'dotIndex':3,'lookahead':[')','*','+','EOF']}]}
        ]
      ]
    );

    expect(parser.propagateLookahead().jumpTable).to.eql(
      [ { E: 1, T: 2, F: 3, '(': 4, id: 5 },
        { '+': 6 },
        { '*': 7 },
        {},
        { E: 8, T: 2, F: 3, '(': 4, id: 5 },
        {},
        { T: 9, F: 3, '(': 4, id: 5 },
        { F: 10, '(': 4, id: 5 },
        { '+': 6, ')': 11 },
        { '*': 7 },
        {},
        {} ]
    );
  })
})


describe('LALR parsing table', function(){
  var itemSetArray = [];

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

  it('LALR parsing table', function(){
    var actionTable = parser.lalrParsingTable()[0];
    var gotoTable = parser.lalrParsingTable()[1];

    expect(actionTable).to.eql(
      [
        {
          'c': 'shift 4', d: 'shift 3'
        },
        {
          'EOF': 'accept'
        },
        {
          'c': 'shift 4', d: 'shift 3'
        },
        {
          'c': 'reduce 2,1',
          'd': 'reduce 2,1',
          'EOF': 'reduce 2,1'
        },
        {
          'c': 'shift 4', d: 'shift 3'
        },
        {
          'EOF': 'reduce 1,0'
        },
        {
          'c': 'reduce 2,0',
          'd': 'reduce 2,0',
          'EOF': 'reduce 2,0'
        }
      ]
    );

    expect(gotoTable).to.eql(
      [
        { 'S': 1, 'C': 2 },
        {},
        { 'C': 5 },
        {},
        { 'C': 6 },
        {},
        {}
      ]
    );
  })
})
