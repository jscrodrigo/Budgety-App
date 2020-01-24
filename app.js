// Creating a module which handle the budget data (IIFE and closure)
//From the outside we don't have access to the inner funcitons and variables only after the return
//Remember: Callback functions doesn't need the (), because de eventLister will call it when necessary!

var budgetController = (function(){
  //Expense constructor
  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  //Expense calculatePercentage prototype
  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else{
      this.percentage = -1;
    }
  };

  //Expense getPercentage prototype
  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  //Income constructor
  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems : {
      exp: [],
      inc: []
    },
    totals : {
      exp: 0,
      inc:0
    },
    budget: 0,
    percentage: -1
  };

  var calculateTotal = function(type){
    var sum =0;
    data.allItems[type].forEach(function(current){
      sum += current.value;
    });
    data.totals[type] = sum;
  }

  return {
    addItem: function(type, des, val){
      var newItem, ID;
      //Creating a new ID
      if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      
      //Creating a new item
      if(type === 'exp'){
      newItem = new Expense(ID, des, val);
      } else if (type === 'inc'){
        newItem = new Income(ID, des,val);
      }
      //pushing into the data structure
      data.allItems[type].push(newItem);
      //returning the new item
      return newItem;
    },

    deleteItem: function(type, id){
      var ids, index;
      //Looping over the array elements
      //the map method returns an array
      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      index = ids.indexOf(id);
      if(index !== -1){
        //Removing elements = splice(position, numberOfElementsToBeDeleted)
        data.allItems[type].splice(index, 1);
      }
    },

     calculateBudget: function(){
        //calculate total income and total expenses
        calculateTotal('inc');
        calculateTotal('exp');
        // calculate the budget income - expenses
        data.budget = data.totals.inc - data.totals.exp;
        //calculate the total percentage of income the user expend
        if(data.totals.inc > 0){
          data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else{
          data.percentage = -1;
        }
     },

     calculatePercentages: function(){
       data.allItems.exp.forEach(function(current){
         current.calcPercentage(data.totals.inc);
       });
     },

     getPercentages: function(){
       // the map method returns and stores an array
       var allPercentages = data.allItems.exp.map(function(current){
         return current.getPercentage();
       });
       return allPercentages;
     },

     getBudget: function(){
        return {
          budget: data.budget,
          totalIncome: data.totals.inc,
          totalExpense: data.totals.exp,
          percentage: data.percentage
      };
     },
      testing: function(){
        console.log(data);
    }
  };
})();

//UI controller
var uIController = (function(){
  //Private access
  var domStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container-clearfix',
    expensesPercentagesLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(number, type){
    var numberArray, intPart, decimalPart, sign;
    // + || - in front of the number
    // 2 decimals and a dot separating it
    //comma (,) separating the thousands
    // calculating the absolute part of the number
    number = Math.abs(number);
    //adding two decimals in the number
    number = number.toFixed(2);
    numberArray = number.split('.');
    intPart = numberArray[0];
    if(intPart.length > 3){
      //substr returns the part of the string that we want.
      // var.substr(initialPosition, numberOfElementsRead);
      intPart = intPart.substr(0,intPart.length - 3) + ',' + intPart.substr(intPart.length - 3, 3);
    }
    decimalPart = numberArray[1];
    ;
    return (type === 'inc' ?  '+' :  '-') + ' ' + intPart + '.' + decimalPart;
  };

   //creating a forEach method for nodeList
   var nodeListForEach = function(nodeList, callBackFunction){
    for(var i = 0; i < nodeList.length; i++){
      callBackFunction(nodeList[i], i);
    }
  };

  return {
    //Public access
    getInput: function(){
      return {
        type: document.querySelector(domStrings.inputType).value,
        description: document.querySelector(domStrings.inputDescription).value,
        value: parseFloat(document.querySelector(domStrings.inputValue).value)
      };
    },

    addListItem: function(obj, type){
      var html, newHtml, element;
      // Create HTML string with placeholder text
      if(type === 'inc'){
        element = domStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      } else if( type === 'exp'){
        element = domStrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div>  <div class="item__percentage">35%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      //Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      //Insert the HTML Into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorId){
      var element = document.getElementById(selectorId);
      element.parentNode.removeChild(element);
    },

    clearFields: function(){
      var fields, fieldsArray;
      //querySelectorAll needs a comma (',');
      fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
      //converting a list to an array
      fieldsArray = Array.prototype.slice.call(fields);
      //forEach
      fieldsArray.forEach(function(current){
        current.value = "";
      });
      fieldsArray[0].focus();
    },
    
    getDOMStrings: function(){
      return domStrings;
    },

    displayBudget: function(obj){
      var type;
      obj.budget < 0 ? type = 'exp': type = 'inc';
      document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
      document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
      document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExpense, 'exp');
      if(obj.percentage > 0){
        document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages){
      //returns a node list, a list of each element of the dom string
      var fields = document.querySelectorAll(domStrings.expensesPercentagesLabel);
      nodeListForEach(fields, function(current, index){
        if(percentages[index]> 0){
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });

    },

    displayMonth: function(){
      var currentMonth, year, monthsArray, now;
      now = new Date();
      monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October','November', 'December'];
      currentMonth = monthsArray[now.getMonth()];
      year = now.getFullYear();
      document.querySelector(domStrings.dateLabel).textContent = currentMonth + ' ' + year;
    },

    changedType: function(){
      //selecting the input fields
     var fields=  document.querySelectorAll(domStrings.inputType + ',' + domStrings.inputDescription +
      ',' + domStrings.inputValue);
      nodeListForEach(fields, function(current){
        current.classList.toggle('red-focus');
      });
      //turning the button red
      document.querySelector(domStrings.inputButton).classList.toggle('red');
    }

  };
})();

//GLOBAL APPLICATION CONTROLLER
var appControler = (function(budgetCtrl, uICtrl){

  var eventListenersSetUp = function(){
    var dom = uIController.getDOMStrings();

    document.querySelector(dom.inputButton).addEventListener('click', controllerAddItem);

    document.addEventListener('keypress', function(event){
    //event.keyCode for chrome and event.which for other old browsers
    if(event.keyCode === 13 || event.which === 13){
       controllerAddItem();
     }
    });
    document.querySelector(dom.container).addEventListener('click', controllerDeleteItem);
    document.querySelector(dom.inputType).addEventListener('change', uIController.changedType);
  };
  
  var updateBudget = function(){
    //1- Calculate the budget
    budgetController.calculateBudget();
    //2- Return the budget 
    var budget = budgetController.getBudget();
    //3- Display de new budget on the UI
    uIController.displayBudget(budget);
  };

  var updatePercentage = function(){
    //1 - Calculate the percentage
    budgetController.calculatePercentages();
    //2 - Read percentages from the budget controller
   var percentages =  budgetController.getPercentages();
    //3 - Update the new percentages on the UI
    uIController.displayPercentages(percentages);
  }

  var controllerAddItem = function(){
    var input, newItem;
    //1 - Get the input data
    input = uIController.getInput();
    if(input.description !== "" && !isNaN(input.value) && input.value >0){
      //2 - Add the new item to the budget controller
      newItem =  budgetController.addItem(input.type, input.description, input.value);
      //3 - Add the new item to the UI
      uIController.addListItem(newItem, input.type);
      //4-cleaning the input fields
      uIController.clearFields();
      //5- calculate and update the budget
      updateBudget();
      //6 - Update the percentages
      updatePercentage();
    }
    
  };

  var controllerDeleteItem = function(event){
    var itemID, splitID, type, ID;
    //moving up to the parent element of the icon (traversing)
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID){
      //ID form -> inc-0 || exp-0
      //returns an array
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1st delete an item from the data structure
      budgetController.deleteItem(type,ID );

      //2nd delete the item from the UI
      uIController.deleteListItem(itemID);

      //3rd update and show the totals
      updateBudget();

      //4th update the percentages
      updatePercentage();
    }
  }

  return {
    init: function(){
      console.log('The application is runnig.');
      uIController.displayMonth();
      uIController.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: -1
      });
      eventListenersSetUp();
    }
  };
})(budgetController, uIController);

appControler.init();
