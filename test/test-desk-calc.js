var rewire = require('rewire');
var bnf = rewire('../lib/bnf');
var parser = rewire('../lib/parser');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');



describe('ambiguous grammer', function(){
  var itemSetArray = [];

  before(function(){
    var yaccRules = [
      {'head': 'lines',
       'body': [
         {
           'expr': ['lines', 'expr', '\n'],
           'action': function(var0, var1, var2){ console.log('=' + var1.value); }
         },
         {
           'expr': ['lines', '\n']
         },
         {
           'expr': []
         }
       ]
      },

      {'head': 'expr',
       'body': [
         {
           'expr': ['expr', '+', 'expr'],
           'action': function(var0, var1, var2){ return var0.value + var2.value; }
         },
         {
           'expr': ['expr', '-', 'expr'],
           'action': function(var0, var1, var2){ return var0.value - var2.value; }
         },
         {
           'expr': ['expr', '*', 'expr'],
           'action': function(var0, var1, var2){ return var0.value * var2.value; }
         },
         {
           'expr': ['expr', '/', 'expr'],
           'action': function(var0, var1, var2){ return var0.value / var2.value; }
         },
         {
           'expr': ['(', 'expr', ')'],
           'action': function(var0, var1, var2){ return var1.value; }
         },
         {
           'expr': ['-', 'expr'], 'prec': 'UMINUS',
           'action': function(var0, var1){ return - var1.value; }
         },
         {
           'expr': ['NUMBER'],
           'action': function(var0){ return var0.value; }
         }
       ]
      }
    ];

    var tokens = [
      '\n', '+', '-', '*', '/', '(', ')', '-', 'NUMBER', 'EOF'
    ];

    var ambiguousRules = {
      '+': {'precedence': 0, 'association': 'left'},
      '-': {'precedence': 0, 'association': 'left'},
      '*': {'precedence': 2, 'association': 'left'},
      '/': {'precedence': 2, 'association': 'left'},
      'UMINUS': {'precedence': 4, 'association': 'right'}
    };

    bnf.__set__('yaccRules', yaccRules);
    bnf.__set__('tokens', tokens);
    bnf.__set__('ambiguousRules', ambiguousRules);
    bnf.__set__('firstTable', {});
    bnf.__set__('followTable', {});
    bnf.__set__('nonLeftRecursionYaccRules', []);

    parser.__set__('bnf', bnf);

  })

  beforeEach(function(){
    sinon.spy(console, 'log');
  })

  afterEach(function(){
    console.log.restore();
  })

  it('calc 34 + 10 * 2', function(){

    var arr = [
      {'tag': 'NUMBER', 'value':34},
      {'tag': '+'},
      {'tag': 'NUMBER', 'value':10},
      {'tag': '*'},
      {'tag': 'NUMBER', 'value':2},
      {'tag': '\n'},
      {'tag': 'EOF'}
    ];
    var index = 0;

    parser.parsing(function(){
      return arr[index++];
    });

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.getCall(0).args[0]).to.equal('=54');

  })

  it('calc 34 / 10 * 2', function(){

    var arr = [
      {'tag': 'NUMBER', 'value':34},
      {'tag': '/'},
      {'tag': 'NUMBER', 'value':10},
      {'tag': '*'},
      {'tag': 'NUMBER', 'value':2},
      {'tag': '\n'},
      {'tag': 'EOF'}
    ];
    var index = 0;

    parser.parsing(function(){
      return arr[index++];
    });

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.getCall(0).args[0]).to.equal('=6.8');
  })

  it('calc 3 * (5 - 2)', function(){

    var arr = [
      {'tag': 'NUMBER', 'value':3},
      {'tag': '*'},
      {'tag': '('},
      {'tag': 'NUMBER', 'value':5},
      {'tag': '-'},
      {'tag': 'NUMBER', 'value':2},
      {'tag': ')'},
      {'tag': '\n'},
      {'tag': 'EOF'}
    ];
    var index = 0;

    parser.parsing(function(){
      return arr[index++];
    });

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.getCall(0).args[0]).to.equal('=9');
  })

  it('calc 3 + -5 / 2', function(){

    var arr = [
      {'tag': 'NUMBER', 'value':3},
      {'tag': '+'},
      {'tag': '-'},
      {'tag': 'NUMBER', 'value':5},
      {'tag': '/'},
      {'tag': 'NUMBER', 'value':2},
      {'tag': '\n'},
      {'tag': 'EOF'}
    ];
    var index = 0;

    parser.parsing(function(){
      return arr[index++];
    });

    expect(console.log.calledOnce).to.be.true;
    expect(console.log.getCall(0).args[0]).to.equal('=0.5');
  })

})


