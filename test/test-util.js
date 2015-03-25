var util = require('../lib/util');
var assert  = require('assert');
var chai = require('chai');
var expect = chai.expect;

describe('Util function test', function(){

  it('array2dEqual', function(){
    var arr0 = [[], ['a'], [], ['a', 'b']];
    var arr1 = util.clone2dArray(arr0);
    expect(util.array2dEqual(arr0, arr1)).to.be.true;

    arr1[1][0] = 'c';
    expect(util.array2dEqual(arr0, arr1)).to.be.false;
  });

  it('arrayEqual', function(){
    var arr0 = [ [ [ '$' ] ],
                 [ [], [ '+' ] ],
                 [ [ '+', ')' ], [ '+', '*', ')' ] ],
                 [ [ '+', '*', ')' ] ],
                 [ [ '+', '*', ')' ] ],
                 [ [ '+', '*', ')' ] ],
                 [ [] ],
                 [ [] ],
                 [ [], [ ')', '+' ] ],
                 [ [], [ '*' ] ],
                 [ [] ],
                 [ 'a' ],
                 'b'
               ];
    var arr1 = util.cloneArray(arr0);
    var arr2 = util.cloneArray(arr0);
    expect(util.arrayEqual(arr0, arr1)).to.be.true;
    expect(util.arrayEqual(arr0, arr2)).to.be.true;

    arr1[2][0][0] = '-';
    expect(util.arrayEqual(arr0, arr1)).to.be.false;

    arr2[12] = 'c';
    expect(util.arrayEqual(arr0, arr1)).to.be.false;
  });

})

