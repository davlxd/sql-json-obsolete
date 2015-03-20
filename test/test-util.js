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
})

