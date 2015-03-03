//TODO: Yacc %left, %right %prec
var bnf = require('./bnf');

function inspectItemSet(itemSet){
  console.log('-0-------------------------------------------------------------');
  itemSet.forEach(function(item){
    console.log(item);
  });
  console.log('-1-------------------------------------------------------------');
}


function doClosure(computedSet, toComputeSet){
  if (toComputeSet.length === 0) return computedSet ;

  var newToComputeSet = [];
  toComputeSet.forEach(function(itemGroup){

    itemGroup.body.forEach(function(item){
      var newItemKey = item.expr[item.dotIndex];
      var newItem = bnf.cloneRule(bnf.getRule(newItemKey));
      if (!newItem) return ;

      var newItemInComputedSet = computedSet.filter(function(value){
        return value.head === newItemKey;
      })[0];
      if (newItemInComputedSet){
        var newItemBody = bnf.bodyDiffFirst(newItem.body, newItemInComputedSet.body);

        if (newItemBody.length > 0){
          newItem.body = newItemBody;
          newItemInComputedSet.body = newItemInComputedSet.body.concat(newItemBody);
          newToComputeSet.push(newItem);
        }

      } else {
        newToComputeSet.push(newItem);
        computedSet.push(newItem);
      }
    });
  });
  return doClosure(computedSet, newToComputeSet);
}

exports.closure = function(itemSet){
  return doClosure(itemSet, itemSet);
}

function goto(itemSet, symbol){
  var yaccRules = this.yaccRules;
  var gotoSet = [];

  if (symbol === '$'){
    var ifHasAugmentedRule = !itemSet.every(function(item){
      return Object.keys(item)[0] !== Object.keys(yaccRules.augmentedRule)[0];
    });
    if (ifHasAugmentedRule) return 'accepted';
  }

  itemSet.forEach(function(item){
    console.log(item);
    var itemHead = Object.keys(item)[0];
    var itemBodyArr = item[itemHead];
    var gotoItem = {}; gotoItem[itemHead] = [];

    itemBodyArr.forEach(function(itemBody){
      if (itemBody[itemBody.dotIndex] === symbol){
        console.log(itemBody);
        console.log(itemBody.dotIndex);
        var itemBody = itemBody.slice();
        console.log(itemBody.dotIndex);
        itemBody.dotIndex = itemBody.dotIndex + 1;
        gotoItem[itemHead].push(itemBody);
      }
    });
    if (gotoItem[itemHead].length > 0)
      gotoSet.push(gotoItem);
  });

  inspectItemSet(gotoSet);

  return closure.call(this, gotoSet);
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

  var augmentedRule = {};
  augmentedRule[head_] = yaccRules[head_];
  yaccRules.augmentedRule = augmentedRule;

  return augmentedRule;
}

Parser.prototype.items = function(){
  var augmentedRule = augment.call(this);
  var C = closure.call(this, [augmentedRule]);
  goto.call(this, C, '(');
}

Parser.test = function(){
  console.log(bnf.getRule('F'));
  console.log(bnf.yaccRules());

  bnf.augmentRule();
  console.log(bnf.yaccRules());
}


