//TODO: Yacc %left, %right %prec
var bnf = require('./bnf');

function inspectItemSet(itemSet){
  console.log('-0-------------------------------------------------------------');
  itemSet.forEach(function(item){
    console.log(item);
  });
  console.log('-1-------------------------------------------------------------');
}


function first(symbol){
  if (bnf.terminals().indexOf(symbol) !== -1) return [symbol];
  
}


function follow(symbol){
  
}


function doClosure(computedSet, toComputeSet){
  if (toComputeSet.length === 0) return computedSet ;

  var newToComputeSet = [];
  toComputeSet.forEach(function(itemGroup){

    itemGroup.body.forEach(function(item){
      var newItemHead = item.expr[item.dotIndex];
      var newItem = bnf.cloneRule(bnf.getRule(newItemHead));
      if (!newItem) return ;

      var newItemInComputedSet = computedSet.filter(function(value){
        return value.head === newItemHead;
      })[0];
      if (newItemInComputedSet){
        var newItemBody = bnf.bodyDiffFirst(newItem.body, newItemInComputedSet.body);

        if (newItemBody.length > 0){
          newItemInComputedSet.body = newItemInComputedSet.body.concat(newItemBody);
          newItem.body = newItemBody;
          newToComputeSet.push(newItem);
        }

      } else {
        computedSet.push(newItem);
        newToComputeSet.push(newItem);
      }
    });
  });
  return doClosure(computedSet, newToComputeSet);
}

function closure(itemSet){
  return doClosure(itemSet, itemSet);
}
exports.closure = closure;


function goto(itemSet, symbol){
  var yaccRules = this.yaccRules;
  var gotoSet = [];

  if (symbol === '$'){
    var ifHasAugmentedRule = !itemSet.every(function(item){
      return item.head !== bnf.augmentRule().head;
    });
    if (ifHasAugmentedRule) return 'accept';
    return [];
  }

  itemSet.forEach(function(item){
    var gotoItem = {}; gotoItem.head = item.head; gotoItem.body = [];

    item.body.forEach(function(bodyEntry){
      if (bodyEntry.expr[bodyEntry.dotIndex] === symbol){
        var newBodyEntry = bnf.cloneBodyEntry(bodyEntry);
        newBodyEntry.dotIndex = newBodyEntry.dotIndex + 1;
        gotoItem.body.push(newBodyEntry);
      }
    });

    if (gotoItem.body.length > 0)
      gotoSet.push(gotoItem);
  });

  return closure(gotoSet);
}
exports.goto = goto;


function collectionContains(collection, itemSet){
  return !collection.every(function(itemSetInCollection){
    return !bnf.itemSetEqual(itemSetInCollection, itemSet);
  });
}
exports.collectionContains = collectionContains;


function doItems(computedCollection, toComputedCollection){
  // console.log('\n------------------------------');
  // console.log(computedCollection);
  // console.log('------------------------------\n');
  if (toComputedCollection.length === 0) return computedCollection;
  var newToComputeCollection = [];

  toComputedCollection.forEach(function(itemSet){
    bnf.symbols().forEach(function(symbol){
      var gotoItemSet = goto(itemSet, symbol);
      if (gotoItemSet.length > 0 && !collectionContains(computedCollection, gotoItemSet)){
        computedCollection.push(gotoItemSet);
        newToComputeCollection.push(gotoItemSet);
      }
    });
  });

  return doItems(computedCollection, newToComputeCollection);
}

function items(){
  var collection = []
  collection.push(closure([bnf.augmentRule()]));
  return doItems(collection, collection);
}
exports.items = items;

