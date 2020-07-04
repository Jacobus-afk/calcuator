Array.prototype.endIndex = function() {
    return this[this.length - 1];
}

document.addEventListener("DOMContentLoaded", () => {
    const operations = document.querySelectorAll(".operations");
    const keypad = document.querySelectorAll(".keypad");
    const screen = document.querySelector("#screen-text");
    const clear = document.querySelector("#clear");
    let humanReadableRegister = [];
    let reversePolishOutputQueue = [];


    function solveReversePolishEquation() {
        let result = [];
        // https://jsfiddle.net/DerekL/SKG9Y/
        const operators = {
            "+": function(a,b) {return parseFloat(b)+parseFloat(a);},
            "-": function(a,b) {return parseFloat(b)-parseFloat(a);},
            "*": function(a,b) {return parseFloat(b)*parseFloat(a);},
            "/": function(a,b) {return parseFloat(b)/parseFloat(a);},
        }

        for (let i = 0; i < reversePolishOutputQueue.length; i++) {
            let token = reversePolishOutputQueue[i];
            if (!isNaN(token)) {
                result.push(token);
            } else {
                let firstNum = result.pop();
                let secNum = result.pop();
                result.push(operators[token](firstNum, secNum))
            }
        }
        if (result.length > 1) {
            return "Error";
        } else {
            return result.pop();
        }
    }

    function generateReversePolishNotation() {
        // note on associativity: for this simple calculator we dont have to deal with power, 
        // thus all associativity is left
        // https://en.wikipedia.org/wiki/Shunting-yard_algorithm#The_algorithm_in_detail
        // https://www.thepolyglotdeveloper.com/2015/03/parse-with-the-shunting-yard-algorithm-using-javascript/
        const operators = {
            "*": 3,
            "/": 3,
            "+": 2,
            "-": 2
        }
        reversePolishOutputQueue = [];
        let operatorStack = [];

        for (let i = 0; i < humanReadableRegister.length; i++) {
            const token = humanReadableRegister[i];
            if(!isNaN(token)) {
                reversePolishOutputQueue.push(token);
            } else if ("/*-+".indexOf(token) !== -1) {
                let o1 = token;
                let o2 = operatorStack.endIndex();
                while("/*-+".indexOf(o2) !== -1 && (operators[o1] <= operators[o2])) {
                    reversePolishOutputQueue.push(operatorStack.pop());
                    o2 = operatorStack.endIndex();
                }
                operatorStack.push(o1);
            }
        }
        while (operatorStack.length > 0) {
            reversePolishOutputQueue.push(operatorStack.pop());
        }
    }

    function refreshScreen(value) {
        value = String(value);
        if (value.length > 9) {
            value = value.substring(0,9);
        }
        screen.textContent = value; //humanReadableRegister.endIndex();
    }

    function clearOperation() {
        humanReadableRegister = [];
        reversePolishOutputQueue = [];
    }

    function operate() {
        // console.log(humanReadableRegister);
        generateReversePolishNotation();
        // console.log(reversePolishOutputQueue);
        const result = solveReversePolishEquation();
        // console.log(result);
        refreshScreen(result);
        clearOperation();
    }

    function addNumber(number) {
        // let registerEndIndex = register.length - 1;

        // console.log(isNaN("1.23"));
        // console.log(register.endIndex());
        // if (register.endIndex().isNumeric()) {
        if (!isNaN(humanReadableRegister.endIndex())) { //if last entry in register is number append value
            if ((number === ".")&&(humanReadableRegister.endIndex().includes("."))) {
                return;
            }
            humanReadableRegister[humanReadableRegister.length - 1] += String(number);
            // register.endIndex() += String(number);
        }
        else {
            humanReadableRegister.push(String(number));
            // registerEndIndex++;
        }
        refreshScreen(humanReadableRegister.endIndex());
        // console.log(humanReadableRegister);
        // screen.textContent = humanReadableRegister.endIndex();
    }

    function addOperation(operation) {
        const operators = {
            "add": "+",
            "subtract": "-",
            "multiply": "*",
            "divide": "/"
        }
        // let registerEndIndex = register.length - 1;
        
        // if (!register.endIndex().isNumeric()) {
        if (isNaN(humanReadableRegister.endIndex())) {
            refreshScreen("Invalid");
            clearOperation();
            // console.log("invalid operation. can't have two operations without numbers between them");
            return;
        }
        if (operation === "equals") {
            // console.log("still need to handle equals");
            operate();
            return;
        }
        humanReadableRegister.push(operators[operation]);
    }

    for (let i = 0; i < operations.length; i++) {
        operations[i].addEventListener("click", event => {
            addOperation(event.srcElement.id);
            // console.log(event.srcElement.id);
        })
    }

    for (let i = 0; i < keypad.length; i++) {
        keypad[i].addEventListener("click", event => {
            addNumber(event.target.textContent);
            // console.log(event.target.textContent);
        })
    }

    clear.addEventListener("click", event => {
        refreshScreen("0");
        clearOperation();
    })
})