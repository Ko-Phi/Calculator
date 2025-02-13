class Stack {
  constructor() {
    this.items = [];
  }
  push(element) {
    this.items.push(element);
  }
  pop() {
    if (this.items.length === 0) return "Underflow";
    return this.items.pop();
  }
  peek() {
    return this.items[this.items.length - 1];
  }
  isEmpty() {
    return this.items.length === 0;
  }
  contains(givenElement) {
    return this.items.filter((element) => element === givenElement).length > 0;
  }
  length() {
    return this.items.length;
  }
  printStack() {
    let stackString = "";
    for (let i = 0; i < this.items.length; i++) {
      stackString += this.items[i] + " ";
    }
    return stackString;
  }
}

class Token {
  constructor(value, type) {
    this.value = value;
    this.type = type;
  }
  [Symbol.toPrimitive](hint) {
    return this.value;
  }
}
function makeToken(type, ...values) {
  let newToken = { value: values[0], type: type };
  if (type === "function") newToken.argNumber = values[1];
  return newToken;
}

const operationPrescedance = {
  "^": 2,
  "*": 3,
  "/": 3,
  "+": 4,
  "-": 4,
  //temp fix
  sin: 1,
  cos: 1,
  tan: 1,
  sqrt: 1,
  log: 1,
  min: 1,
  max: 1,
};

const operators = ["+", "-", "*", "/", "^"];
const splitters = [operators, ",", "(", ")"].flat(Infinity);
function calculate(input) {
  let infix = [];
  let token = "";

  // Turn input string into array of tokens
  for (let i = 0; i < input.length; i++) {
    if (!splitters.includes(input[i]) && input[i] !== " ") {
      token += input[i];
    } else if (token) {
      if (token in operationPrescedance) {
        infix.push(makeToken("function", token, 2));
      } else {
        infix.push(makeToken("number", token));
      }
      token = "";
    }
    // Check if is splitters
    if (splitters.includes(input[i])) {
      // Checks if current is a unary operator
      if (i === 0 || operators.includes(input[i - 1]) || input[i - 1] === "(") {
        if (input[i] === "-") {
          console.log("Unary:", input[i]);
          infix.push(makeToken("number", "-1"), makeToken("operator", "*"));
          continue;
        }
        if (input[i] === "+") {
          continue;
        }
      }
      if (
        input[i] === "(" &&
        i !== 0 &&
        !splitters.includes(input[i - 1]) &&
        input[i - 1] !== " "
      ) {
        infix.push(makeToken("operator", "*"), makeToken("parenthesis", "("));
        continue;
      }
      // Push current splitter
      if (operators.includes(input[i]))
        infix.push(makeToken("operator", input[i]));
      else if (input[i] === ",") infix.push(makeToken("comma", input[i]));
      else infix.push(makeToken("parenthesis", input[i]));
    }
  }
  if (token) infix.push(makeToken("number", token));

  console.table(infix);
  console.log(infix.map((token) => token.value).join(" "));
  // Turn infix to postfix
  const stack = new Stack();
  let postfix = [];

  infix.forEach((token) => {
    if (token.type === "number") {
      postfix.push(token);
    }
    if (token.type === "function") {
      stack.push(infix[i]);
    }
    if (token.value === "(") {
      stack.push(token);
    }
    if (token.value === ")") {
      while (stack.peek().value !== "(") {
        if (stack.peek().value !== ",") postfix.push(stack.pop());
        else stack.pop();
      }
      stack.pop();
    }
    if (token.type === "operator") {
      if (
        stack.isEmpty() ||
        operationPrescedance[token.value] <
          operationPrescedance[stack.peek().value]
      ) {
        stack.push(token);
      } else {
        // Pops all operators from the stack w/ a lower prescedance than current operator
        while (
          !stack.isEmpty() &&
          operationPrescedance[stack.peek().value] <=
            operationPrescedance[token.value]
        ) {
          postfix.push(stack.pop());
        }
        // Push current operator to stack
        stack.push(token);
      }
    }
  });
  while (stack.isEmpty() === false) {
    postfix.push(stack.pop());
  }

  console.table(postfix);
  console.log(postfix.map((token) => token.value).join(" "));
  return;
  /*
  for (let i = 0; i < infix.length; i++) {
    //Checks if token is a number
    if (!isNaN(+infix[i])) {
      postfix.push(infix[i]);
      continue;
    }
    //Checks if token is a function
    if (isNaN(+infix[i]) && !splitters.includes(infix[i])) {
      stack.push(infix[i]);
    }

    if (infix[i] === "(") {
      stack.push("(");
      continue;
    }
    if (infix[i] === ")") {
      // Pops and pushes the stack to postfix until "(" is current token
      while (stack.peek() !== "(") {
        if (stack.peek() !== ",") postfix.push(stack.pop());
        else stack.pop();
      }
      stack.pop();
      continue;
    }

    if (operators.includes(infix[i])) {
      // Checks if the current operator's prescedance is less than one at top of stack, the stack is empty, or has "("
      if (
        operationPrescedance[infix[i]] < operationPrescedance[stack.peek()] ||
        stack.isEmpty()
      ) {
        stack.push(infix[i]);
      } else {
        // Pops all operators from the stack w/ a lower prescedance than current operator
        while (
          operationPrescedance[stack.peek()] <= operationPrescedance[infix[i]]
        ) {
          postfix.push(stack.pop());
        }
        // Push current operator to stack
        stack.push(infix[i]);
      }
      // console.log(postfix, stack.printStack());
      continue;
    }

    if (infix[i] === ",") {
      while (!(stack.peek() === "(" || stack.peek() === ",")) {
        postfix.push(stack.pop());
      }
      stack.push(infix[i]);
    }
  }
  while (stack.isEmpty() === false) {
    postfix.push(stack.pop());
  }
  */

  // Evalulate postfix
  const operationFunctions = {
    "^": exponate,
    "*": multiply,
    "/": divide,
    "+": add,
    "-": subtract,
  };
  let ans = "";
  let loops = 0;
  for (let i = 0; i < postfix.length; i++) {
    if (operators.includes(postfix[i])) {
      ans =
        "" + operationFunctions[postfix[i]](+postfix[i - 2], +postfix[i - 1]);
      console.log(postfix.splice(i - 2, 3));
      postfix.splice(i - 2, 0, ans);
      i = i - 2;
    }
    if (loops > 50) return console.log("Stuck");
    loops++;
    console.log(postfix, i, postfix[i]);
  }
  console.log("Ans:", postfix[0]);
}

function add(a, b) {
  return a + b;
}
function subtract(a, b) {
  return a - b;
}
function multiply(a, b) {
  return a * b;
}
function divide(a, b) {
  return a / b;
}
function exponate(a, b) {
  return a ** b;
}
/*
calculate("((1+2)-3*(4/5))+6");
calculate("3+5");
calculate("8-2*3");
calculate("4/2+6");
calculate("3+(5-2)");
calculate("8*(3+2)");
calculate("(4+5)*6");
calculate("3+4*2/(1-5)");
calculate("10/(2+3*2)-4");
calculate("5*(6+2)/4-3");
calculate("42");
calculate("(((3+4)))");
calculate("6/(2*(3+1))");

calculate("-5+3");
calculate("4*-2");
calculate("-(3+2)");
calculate("5+-3");

calculate("--4+2");
calculate("---5");

calculate("(-3)*4");
calculate("5/(-2+1)");

calculate("-0");
calculate("-(5-(-3))");

calculate("3+(4*2)");
calculate("(8-3)*4");
calculate("6/(2+1)");

calculate("((3+4)*2)");
calculate("5*(6/(2+1))");
calculate("((8/(3+1))+2)");

calculate("(-3+2)");
calculate("5/(-2+1)");
calculate("4*(-(3+2))");

calculate("(-3*(4+1))"); 
calculate("((5+1)*-(2+3))");
calculate("6/(3+(-1*2))");
calculate("5*(-(3+4))");
*/
