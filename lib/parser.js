//TODO: Yacc %left, %right %prec
var bnf = require('./bnf');

function inspectItemSet(itemSet){
  console.log('-0-------------------------------------------------------------');
  itemSet.forEach(function(item){
    console.log(JSON.stringify(item));
  });
  console.log('-1-------------------------------------------------------------');
}
exports.inspectItemSet = inspectItemSet;

function closure(itemSet){

  function addLookahead(newItem, ba){  // ba: βa
    var newBody = [];

    newItem.body.forEach(function(bodyEntry){
      var newBodyEntry = bnf.cloneBodyEntry(bodyEntry);
      if (!newBodyEntry.lookahead)  newBodyEntry.lookahead = [];
      // console.log(ba);
      // console.log(bnf.first(ba));
      newBodyEntry.lookahead = newBodyEntry.lookahead.concat(bnf.first(ba));
      newBody.push(newBodyEntry);
    });
    newItem.body = newBody;
    return newItem;
  }

  function doClosure(computedSet, toComputeSet){
    // console.log('\n==================================================');
    // inspectItemSet(computedSet);
    // inspectItemSet(toComputeSet);
    // console.log('==================================================\n');

    if (toComputeSet.length === 0) return computedSet ;

    var newToComputeSet = [];
    toComputeSet.forEach(function(itemGroup){

      itemGroup.body.forEach(function(item){
        var newItemHead = item.expr[item.dotIndex];
        var newItem = bnf.cloneRule(bnf.getRule(newItemHead));
        if (!newItem) return ;
        newItem = addLookahead(newItem, [item.expr[item.dotIndex+1], item.lookahead]);

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

  return doClosure(itemSet, itemSet);
}
exports.closure = closure;


function goto(itemSet, symbol){
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


function collectionIndexOf(collection, itemSet){
  for (var index in collection){
    if (bnf.itemSetEqual(collection[index], itemSet)) return index;
  }
  return -1;
}
exports.collectionIndexOf = collectionIndexOf;


function items(){
  var collection = []
  collection.push(closure([bnf.augmentRule()]));

  function doItems(computedCollection, toComputedCollection){
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
  return doItems(collection, collection);
}
exports.items = items;




var actionTable = [];
var gotoTable = [];

function slrParsingTable(){
  if (actionTable.length > 0 && gotoTable.length > 0) return [actionTable, gotoTable];

  var collection = items();
  collection.forEach(function(){actionTable.push({}); gotoTable.push({});});

  var acceptItem = bnf.cloneRule(bnf.augmentRule()); acceptItem.body[0].dotIndex = 1;
  for (var index in collection){
    var itemSet = collection[index];
    itemSet.forEach(function(item){
      if (bnf.itemEqual(item, acceptItem)) actionTable[index]['$'] = 'accept';

      item.body.forEach(function(bodyEntry){  //A -> α·aβ
        if (bodyEntry.dotIndex < bodyEntry.expr.length) {
          var nextSymbol = bodyEntry.expr[bodyEntry.dotIndex];
          var gotoItemSet = goto(itemSet, nextSymbol);
          if (bnf.isTerminal(nextSymbol) && collectionIndexOf(collection, gotoItemSet) !== -1)
            actionTable[index][nextSymbol] = 'shift ' + collectionIndexOf(collection, gotoItemSet);
          return ;
        }

        if (item.head !== acceptItem.head) {
          bnf.follow(item.head).forEach(function(symbol){
            var reduce = {};  reduce.head = item.head;
            reduce.body = bnf.cloneBodyEntry(bodyEntry).expr;

            actionTable[index][symbol] = reduce;
          });
        }
      });
    });

    bnf.nonTerminals().forEach(function(nonTerminal){
      var gotoIndex = collectionIndexOf(collection, goto(itemSet, nonTerminal));
      if (gotoIndex === -1) return ;
      gotoTable[index][nonTerminal] = gotoIndex;
    });
  }

  return [actionTable, gotoTable];
}
exports.slrParsingTable = slrParsingTable;


