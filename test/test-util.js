var util = require('../lib/util');
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
  }
];



describe('', function(){

  it('test onlyInFirstArray', function(done){
    var obj1 = {}, obj2 = {};
    var arr1 = ['E']; arr1.dotIndex = 0;
    var arr2 = ['C']; arr2.dotIndex = 1;

    var arr3 = ['E']; arr3.dotIndex = 0;
    var arr4 = ['C']; arr4.dotIndex = 0;
    var arr5 = ['D']; arr5.dotIndex = 0;
    obj1.F = [arr1, arr2]; obj2.F = [arr3, arr4, arr5];
    // console.log(obj1);
    // console.log(obj2);
    var arrDiff = util.itemOnlyInFirstSet(obj2.F, obj1.F);
    console.log(arrDiff);
    done();
  });

  it('test cloneOneRule', function(done){
    var clonedRule = util.cloneOneRule(yaccRules, 'T');
    clonedRule.body[0].expr[1] = '-';

    expect(yaccRules[1]).to.not.eql(clonedRule);
    done();
  })

})
