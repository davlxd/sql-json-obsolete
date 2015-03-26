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
  var collection = []; collection.gotoTable = [];
  collection.push(closure([bnf.cloneRule(bnf.augmentRule())]));  collection.gotoTable.push({});

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
            computedCollection.push(gotoItemSet);  computedCollection.gotoTable.push({});
            newToComputeCollection.push(gotoItemSet);
            gotoItemSetIndex = computedCollection.length - 1;
          }
          var fromIndex = collectionIndexOf(computedCollection, itemSet);
          computedCollection.gotoTable[fromIndex][symbol] = gotoItemSetIndex;
        }
      });
    });
    return doItems(computedCollection, newToComputeCollection);
  }
  return doItems(collection, collection);
}
exports.items = items;


function kernelItems(){
  var collection = []
  items().forEach(function(itemSet){
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
  var propagateTable = [], generatedTable = [];
  kernels.forEach(function(){ propagateTable.push([]); generatedTable.push([]); });

  function injectPoundSign(inteSet){
    inteSet.forEach(function(item){
      item.body.forEach(function(bodyEntry){
        bodyEntry.lookahead = ['#'];
      });
    });
  }

  function stripLookahead(itemSet){
    var strippedItemSet = [], lookahead = [];
    itemSet.forEach(function(item){
      var strippedItem = {};  strippedItem.head = item.head; strippedItem.body = [];
      item.body.forEach(function(bodyEntry){
        var strippedBoyEntry = {};
        strippedBoyEntry.expr = bodyEntry.expr;
        strippedBoyEntry.dotIndex = bodyEntry.dotIndex;
        util.concatUniqInplace(lookahead, bodyEntry.lookahead);
        strippedItem.body.push(strippedBoyEntry);
      });
      strippedItemSet.push(strippedItem);
    });

    return [strippedItemSet, lookahead];
  }

  kernels.forEach(function(itemSet, index){
    itemSet = bnf.cloneItemSet(itemSet);
    injectPoundSign(itemSet);

    var closureSet = closure(itemSet);

    var nextSymbolArr = [];
    closureSet.forEach(function(item){
      item.body.forEach(function(bodyEntry){
        if (bodyEntry.dotIndex < bodyEntry.expr.length)
          util.concatUniqInplace(nextSymbolArr, [bodyEntry.expr[bodyEntry.dotIndex]]);
      });
    });

    nextSymbolArr.forEach(function(symbol){
      var gotoItemSet = gotoNoClosure(closureSet, symbol);
      var strippedItemSet = stripLookahead(gotoItemSet)[0];
      var lookahead = stripLookahead(gotoItemSet)[1];

      var propagateIndex = collectionIndexOf(kernels, strippedItemSet);
      if (lookahead.indexOf('#') !== -1)
        util.concatUniqInplace(propagateTable[index], [propagateIndex]);

      var nonPoundLookahead = lookahead.filter(function(ch){return ch !== '#';});
      util.concatUniqInplace(generatedTable[propagateIndex], nonPoundLookahead);
    });
  });

  return [propagateTable, generatedTable]
}



function propagateLookahead(){
  var kernels = kernelItems();
  var propagateTable = generatePropagateTable(kernels)[0];
  var lookaheadTable = generatePropagateTable(kernels)[1];  lookaheadTable[0].push('$');

  while (true){
    var newLookaheadTable = util.clone2dArray(lookaheadTable);
    for (var index = 0; index < newLookaheadTable.length; index++){
      propagateTable[index].forEach(function(itemId){
        util.concatUniqInplace(newLookaheadTable[itemId], newLookaheadTable[index]);
      });
    }
    if (util.array2dEqual(newLookaheadTable, lookaheadTable)) break;
    lookaheadTable = newLookaheadTable;
  }

  kernels.forEach(function(itemSet, index){
    itemSet.forEach(function(item){
      item.body.forEach(function(bodyEntry){
        bodyEntry.lookahead = lookaheadTable[index].concat();
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
    if (value.head) {
      reduce = value;
      shift = actionTable[index][symbol];
    }

    var reduceSymbolIndex = -1;
    reduce.body.every(function(symbol, index){
      reduceSymbolIndex = index;
      return bnf.ambiguousSymbols().indexOf(symbol) === -1;
    });

    var reduceSymbol = reduce.body[reduceSymbolIndex];
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
            var reduce = {};  reduce.head = item.head;
            reduce.body = bnf.cloneBodyEntry(bodyEntry).expr;
            handleAmbiguous(index, symbol, reduce);
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




function parsing(lexer){
  lalrParsingTable();
  console.log(lexer.next());
}




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
inspectItemSet(itemSet);
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
console.log(bnf.follow(item.head));
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


