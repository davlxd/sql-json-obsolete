//TODO: Yacc %left, %right %prec

function inspectItemSet(itemSet){
  console.log('-0-------------------------------------------------------------');
  itemSet.forEach(function(item){
    console.log(item);
  });
  console.log('-1-------------------------------------------------------------');
}


function doClosure(computedSet, toComputeSet){
  var yaccRules = this.yaccRules;

  console.log('\n=0=================================================');
  inspectItemSet(computedSet);
  inspectItemSet(toComputeSet);
  console.log('=1=================================================\n');
  if (toComputeSet.length === 0) return ;

  var newToComputeSet = [];
  toComputeSet.forEach(function(item){

    var itemHead = Object.keys(item)[0];
    var itemBodyArr = item[itemHead];

    itemBodyArr.forEach(function(itemBody){
      console.log(itemHead);
      console.log(itemBody);
      var newItemKey = itemBody[itemBody.dotIndex];
      var newItem = {}; newItem[newItemKey] = [];

      if (!yaccRules[newItemKey])  return ;
      yaccRules[newItemKey].forEach(function(newItemBody){
        newItemBody.dotIndex = 0;
        newItem[newItemKey].push(newItemBody);
      });

      var computedSetHeadArr = computedSet.map(function(value){
        return Object.keys(value)[0];
      });
      if (computedSetHeadArr.indexOf(newItemKey) === -1 ){
        newToComputeSet.push(newItem);
        computedSet.push(newItem);
      }
      inspectItemSet(computedSet);
      inspectItemSet(newToComputeSet);
    });
  });
  doClosure.call(this, computedSet, newToComputeSet);
}

function closure(itemSet){
  doClosure.call(this, itemSet, itemSet);
}

function Parser(yaccRules){
  this.yaccRules = yaccRules;
}

function augment(){
  var yaccRules = this.yaccRules;

  var head = Object.keys(yaccRules)[0];
  var head_ = head + '_';

  yaccRules[head_] = [[head]];
  yaccRules[head_][0].dotIndex = 0;

  var firstRule = {};
  firstRule[head_] = yaccRules[head_];
  return firstRule;
}

Parser.prototype.items = function(){
  var augmentedRule = augment.call(this);
  var C = closure.call(this, [augmentedRule]);
}

module.exports = Parser;
