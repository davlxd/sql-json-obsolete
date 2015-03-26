//TODO: Yacc %left, %right %prec
var bnf = require('./bnf');
var util = require('./util');

function inspectItemSet(itemSet){
  console.log('-0-------------------------------------------------------------');
  itemSet.forEach(function(item){
    console.log(JSON.stringify(item));
  });
  console.log('-1-------------------------------------------------------------');
}
exports.inspectItemSet = inspectItemSet;

function inspectCollection(collection){
  console.log('\n\n===========================================================');
  collection.forEach(function(itemSet){
    inspectItemSet(itemSet);
  });
  console.log('===========================================================\n\n');
}
exports.inspectCollection = inspectCollection;


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

  function mergeLookahead(body, newItemBody){
    newItemBody.forEach(function(newBodyEntry){
      var matchedBodyEntry = body.filter(function(bodyEntry){
        return bnf.arrayEqual(newBodyEntry.expr, bodyEntry.expr)
          && newBodyEntry.dotIndex === bodyEntry.dotIndex;
      })[0];

      if (matchedBodyEntry)
        util.concatUniqInplace(matchedBodyEntry.lookahead, newBodyEntry.lookahead);
      else
        body.push(newBodyEntry);
    });
  }

  function doClosure(computedSet, toComputeSet){
    // console.log('\n==================================================');
    // inspectItemSet(computedSet);
    // inspectItemSet(toComputeSet);
    // console.log('==================================================\n');

    if (toComputeSet.length === 0) return computedSet ;

    var newToComputeSet = [];
    toComputeSet.forEach(function(item){

      item.body.forEach(function(bodyEntry){
        var newItemHead = bodyEntry.expr[bodyEntry.dotIndex];
        var newItem = bnf.cloneRule(bnf.getRule(newItemHead));

        if (!newItem) return ;
        if (bodyEntry.lookahead) {
          newItem = addLookahead(newItem, [bodyEntry.expr[bodyEntry.dotIndex+1], bodyEntry.lookahead]);
        }

        var newItemInComputedSet = computedSet.filter(function(value){
          return value.head === newItemHead;
        })[0];
        if (newItemInComputedSet){
          var newItemBody = bnf.bodyDiffFirst(newItem.body, newItemInComputedSet.body);

          if (newItemBody.length > 0){
            mergeLookahead(newItemInComputedSet.body, newItemBody);
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


function gotoNoClosure(itemSet, symbol){
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

  return gotoSet;
}



function goto(itemSet, symbol){
  var itemSet = gotoNoClosure(itemSet, symbol);

  if (Array.isArray(itemSet) && itemSet.length > 0)
    return closure(itemSet);

  return itemSet;
}
exports.goto = goto;


function collectionIndexOf(collection, itemSet){
  for (var index = 0; index < collection.length; index++){
    if (bnf.itemSetEqual(collection[index], itemSet)) return index;
  }
  return -1;
}


function collectionIndexOfNoLookahead(collection, itemSet){
  for (var index = 0; index < collection.length; index++){
    if (bnf.itemSetEqual(collection[index], itemSet, 'noCheckLookahead')) return index;
  }
  return -1;
}



function items(){
  var collection = []; collection.jumpTable = [];
  collection.push(closure([bnf.cloneRule(bnf.augmentRule())]));  collection.jumpTable.push({});

  function collectionContains(collection, itemSet){
    return !collection.every(function(itemSetInCollection){
      return !bnf.itemSetEqual(itemSetInCollection, itemSet);
    });
  }

  function doItems(computedCollection, toComputedCollection){
    if (toComputedCollection.length === 0) return computedCollection;
    var newToComputeCollection = [];

    toComputedCollection.forEach(function(itemSet){
      // console.log('\n\n      toCompute.....');
      // inspectItemSet(itemSet);
      bnf.symbols().forEach(function(symbol){
         // console.log('            with symbol.....  '  + symbol);
        var gotoItemSet = goto(itemSet, symbol);
         // console.log('      output.....');
         // inspectItemSet(gotoItemSet);
        if (gotoItemSet.length > 0) {
          var gotoItemSetIndex = collectionIndexOf(computedCollection, gotoItemSet);
          if (gotoItemSetIndex === -1) {
            computedCollection.push(gotoItemSet);  computedCollection.jumpTable.push({});
            newToComputeCollection.push(gotoItemSet);
            gotoItemSetIndex = computedCollection.length - 1;
          }
          var fromIndex = collectionIndexOf(computedCollection, itemSet);
          computedCollection.jumpTable[fromIndex][symbol] = gotoItemSetIndex;
        }
      });
    });
    return doItems(computedCollection, newToComputeCollection);
  }
  return doItems(collection, collection);
}
exports.items = items;


function kernelItems(){
  var allItems = items();
  var collection = []; collection.jumpTable = allItems.jumpTable;

  allItems.forEach(function(itemSet){
    var newItemSet = [];
    itemSet.forEach(function(item){
      var newItem = {};  newItem.head = item.head;  newItem.body = [];
      item.body.forEach(function(bodyEntry){
        if (bodyEntry.dotIndex !== 0){
          newItem.body.push(bodyEntry); return;
        }
        if (newItem.head === bnf.augmentRule().head &&
            bnf.bodyEntryEqual(bnf.augmentRule().body[0], bodyEntry)){
          newItem.body.push(bodyEntry); return;
        }
      });
      if (newItem.body.length > 0)  newItemSet.push(newItem);
    });
    if (newItemSet.length > 0)  collection.push(newItemSet);
  });

  return collection;
}


function generatePropagateTable(kernels){
  var propagateTable = kernels.reduce(function(prev, itemSet){ // construct 4-level empty array
    prev.push(itemSet.reduce(function(prev, item){
      prev.push(item.body.reduce(function(prev, bodyEntry){
        prev.push([]); return prev;
      }, [])); return prev;
    }, [])); return prev;
  }, []);
  var generatedTable = util.cloneArray(propagateTable);

  function itemSetIndexOfBodyEntry(itemSet, head, bodyEntry){
    for (var itemIndex = 0; itemIndex < itemSet.length; itemIndex++){
      if (itemSet[itemIndex].head !== head)  continue;
      var theItem = itemSet[itemIndex];
      for (var bodyEntryIndex = 0; bodyEntryIndex < theItem.body.length; bodyEntryIndex++){
        if (bnf.bodyEntryEqual(theItem.body[bodyEntryIndex], bodyEntry, 'noCheckLookahead'))
          return [itemIndex, bodyEntryIndex];
      }
    }
    return [-1];
  }

  kernels.forEach(function(kernelItemSet, kernelItemSetIndex){
    kernelItemSet.forEach(function(kernelItem, kernelItemIndex){
      kernelItem.body.forEach(function(kernelBodyEntry, kernelBodyEntryIndex){
        var thisKernelItem = {}; thisKernelItem.head = kernelItem.head;
        thisKernelItem.body = [kernelBodyEntry]; thisKernelItem.body[0].lookahead = ['#'];

        closure([thisKernelItem]).forEach(function(item, itemIndex){
          item.body.forEach(function(bodyEntry, bodyEntryIndex){
            if (bodyEntry.dotIndex >= bodyEntry.expr.length) return ;

            var jumpSymbol = bodyEntry.expr[bodyEntry.dotIndex]
            var jumpItemSetIndex = kernels.jumpTable[kernelItemSetIndex][jumpSymbol];
            var jumpBodyEntry = {};
            jumpBodyEntry.expr = bodyEntry.expr.concat();
            jumpBodyEntry.dotIndex = bodyEntry.dotIndex + 1;

            var _ = itemSetIndexOfBodyEntry(kernels[jumpItemSetIndex], item.head, jumpBodyEntry);
            var jumpItemIndex = _[0];  var jumpBodyEntryIndex = _[1];

            if (bodyEntry.lookahead.indexOf('#') !== -1) {
              propagateTable[kernelItemSetIndex][kernelItemIndex][kernelBodyEntryIndex].push(
                [jumpItemSetIndex, jumpItemIndex, jumpBodyEntryIndex]);
            }
            util.concatUniqInplace(
              generatedTable[jumpItemSetIndex][jumpItemIndex][jumpBodyEntryIndex],
              bodyEntry.lookahead.filter(function(ch){return ch !== '#'}));

          });
        });
      });
    });
  });

  return [propagateTable, generatedTable]
}



function propagateLookahead(){
  var kernels = kernelItems();
  var propagateTable = generatePropagateTable(kernels)[0];
  var lookaheadTable = generatePropagateTable(kernels)[1];  lookaheadTable[0][0][0].push('$');

  while (true){
    var newLookaheadTable = util.cloneArray(lookaheadTable);

    newLookaheadTable.forEach(function(itemSetLookahead, itemSetLookaheadIndex){
      itemSetLookahead.forEach(function(itemLookahead, itemLookaheadIndex){
        itemLookahead.forEach(function(bodyEntryLookahead, bodyEntryLookaheadIndex){
          propagateTable[itemSetLookaheadIndex][itemLookaheadIndex][bodyEntryLookaheadIndex].forEach(function(targetLocation){
            var x = targetLocation[0], y = targetLocation[1], z = targetLocation[2];
            util.concatUniqInplace(newLookaheadTable[x][y][z], bodyEntryLookahead);
          });
        });
      });
    });

    if (util.arrayEqual(newLookaheadTable, lookaheadTable)) break;
    lookaheadTable = newLookaheadTable;
  }


  kernels.forEach(function(itemSet, itemSetIndex){
    itemSet.forEach(function(item, itemIndex){
      item.body.forEach(function(bodyEntry, bodyEntryIndex){
        bodyEntry.lookahead = lookaheadTable[itemSetIndex][itemIndex][bodyEntryIndex].sort();
      });
    });
  });

  return kernels;
}
exports.propagateLookahead = propagateLookahead;



var actionTable = [];
var gotoTable = [];

function lalrParsingTable(){
  if (actionTable.length > 0 && gotoTable.length > 0) return [actionTable, gotoTable];

  var kernels = propagateLookahead();
  kernels.forEach(function(){ actionTable.push({});  gotoTable.push({}); });

  var acceptItem = bnf.cloneRule(bnf.augmentRule());
  acceptItem.body[0].dotIndex = 1; acceptItem.body[0].lookahead = ['$'];

  function handleAmbiguous(index, symbol, value){
    if (!actionTable[index][symbol]) {
      actionTable[index][symbol] = value; return ;
    }

    var reduce = actionTable[index][symbol], shift = value;
    if (reduce.indexOf('shift') === 0) {
      reduce = value;
      shift = actionTable[index][symbol];
    }

    var reduceRule = bnf.getRuleByIndex(reduce.split(' ')[1].split(','));
    var reduceSymbolIndex = -1;
    reduceRule.expr.every(function(symbol, index){
      reduceSymbolIndex = index;
      return bnf.ambiguousSymbols().indexOf(symbol) === -1;
    });

    var reduceSymbol = reduceRule.expr[reduceSymbolIndex];
    if (bnf.ambiguousRuleFor(symbol).association === 'left' && bnf.ambiguousRuleFor(reduceSymbol).association === 'left'){
      if (bnf.ambiguousRuleFor(reduceSymbol).precedence < bnf.ambiguousRuleFor(symbol).precedence)
        actionTable[index][symbol] = shift;
      else
        actionTable[index][symbol] = reduce;
    }
  }

  function unionLookahead(itemSet){
    var lookaheadUnion = [];
    itemSet.forEach(function(item){
      item.body.forEach(function(bodyEntry){
        util.concatUniqInplace(lookaheadUnion, bodyEntry.lookahead);
        bodyEntry.lookahead = lookaheadUnion;
      });
    });
  }

  for (var index = 0; index < kernels.length; index++){
    var itemSet = closure(bnf.cloneItemSet(kernels[index]));
    itemSet.forEach(function(item){
      if (bnf.itemEqual(item, acceptItem, 'noCheck')) actionTable[index]['$'] = 'accept';

      item.body.forEach(function(bodyEntry){  //A -> α·aβ, a
        if (bodyEntry.dotIndex < bodyEntry.expr.length) {
          var nextSymbol = bodyEntry.expr[bodyEntry.dotIndex];
          var gotoItemSet = gotoNoClosure(itemSet, nextSymbol);
          var gotoItemSetIndex = collectionIndexOf(kernels, gotoItemSet);
           var gotoItemSetIndex = collectionIndexOfNoLookahead(kernels, gotoItemSet);
          if (bnf.isTerminal(nextSymbol) && gotoItemSetIndex !== -1)
            handleAmbiguous(index, nextSymbol, 'shift ' +  gotoItemSetIndex);
          return ;
        }

        if (item.head !== acceptItem.head) {
          bodyEntry.lookahead.forEach(function(symbol){
            // var reduce = {};  reduce.head = item.head;
            // reduce.body = bnf.cloneBodyEntry(bodyEntry).expr;
            // handleAmbiguous(index, symbol, reduce);
            handleAmbiguous(index, symbol, 'reduce ' + bnf.indexOfRule(item.head, bodyEntry.expr));
          });
        }
      });
    });

    bnf.nonTerminals().forEach(function(nonTerminal){
      var gotoItemSet = gotoNoClosure(itemSet, nonTerminal);
      // unionLookahead(gotoItemSet); var gotoIndex = collectionIndexOf(kernels, gotoItemSet);
      var gotoIndex = collectionIndexOfNoLookahead(kernels, gotoItemSet);
      if (gotoIndex === -1) return ;
      gotoTable[index][nonTerminal] = gotoIndex;
    });
  }

  return [actionTable, gotoTable];
}
exports.lalrParsingTable = lalrParsingTable;



function parsing(next){
  var parsingTable =  lalrParsingTable();
  var actionTable = parsingTable[0];
  var gotoTable = parsingTable[1];

  var stateStack = []; stateStack.push(0);
  var symbolStack = [];

  var input = next();

  while(true) {
    var top = stateStack[stateStack.length - 1];
    var action = actionTable[top][input];
    if (action.indexOf('shift') === 0) {
      stateStack.push(parseInt(action.split(' ')[1]));
      symbolStack.push(input);
      input = next();

    } else if (action.indexOf('reduce') === 0){
      var reduceRule = bnf.getRuleByIndex(action.split(' ')[1].split(','));
      reduceRule.expr.forEach(function(){ stateStack.pop(); symbolStack.pop(); });

      top = stateStack[stateStack.length - 1];
      stateStack.push(gotoTable[top][reduceRule.head]);
      symbolStack.push(reduceRule.head);

    } else if (action.indexOf('accept') === 0){
      console.log('Done');  break;

    } else {
      console.log('Error');  break;
    }

    console.log(stateStack);
    console.log(symbolStack);
    console.log('\n');
  }

}
exports.parsing = parsing;



var actionTable1 = [];
var gotoTable1 = [];

function slrParsingTable(){
  if (actionTable1.length > 0 && gotoTable1.length > 0) return [actionTable1, gotoTable1];

  var collection = items();
  collection.forEach(function(){actionTable1.push({}); gotoTable1.push({});});


  function handleConflict(index, symbol, value){
    if (!actionTable1[index][symbol]) {
      actionTable1[index][symbol] = value; return ;
    }
    console.log('Conflict !');
    actionTable1[index][symbol] = value;
  }

  var acceptItem = bnf.cloneRule(bnf.augmentRule()); acceptItem.body[0].dotIndex = 1;
  for (var index = 0; index < collection.length; index++){
    var itemSet = collection[index];
    itemSet.forEach(function(item){
      if (bnf.itemEqual(item, acceptItem)) actionTable1[index]['$'] = 'accept';

      item.body.forEach(function(bodyEntry){  //A -> α·aβ
        if (bodyEntry.dotIndex < bodyEntry.expr.length) {
          var nextSymbol = bodyEntry.expr[bodyEntry.dotIndex];
          var gotoItemSet = goto(itemSet, nextSymbol);
          if (bnf.isTerminal(nextSymbol) && collectionIndexOf(collection, gotoItemSet) !== -1)
            handleConflict(index, nextSymbol, 'shift '+collectionIndexOf(collection, gotoItemSet));
          return ;
        }

        if (item.head !== acceptItem.head) {
          bnf.follow(item.head).forEach(function(symbol){
            var reduce = {};  reduce.head = item.head;
            reduce.body = bnf.cloneBodyEntry(bodyEntry).expr;
            handleConflict(index, symbol, reduce);
          });
        }
      });
    });

    bnf.nonTerminals().forEach(function(nonTerminal){
      var gotoIndex = collectionIndexOf(collection, goto(itemSet, nonTerminal));
      if (gotoIndex === -1) return ;
      gotoTable1[index][nonTerminal] = gotoIndex;
    });
  }

  return [actionTable1, gotoTable1];
}
exports.slrParsingTable = slrParsingTable;


