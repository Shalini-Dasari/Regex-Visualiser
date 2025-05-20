/**
 * Convert regex to railroad diagram
 * Uses the railroad-diagrams library
 */
function drawRegexDiagram(pattern) {
  const diagramArea = document.getElementById('diagram-area');
  diagramArea.innerHTML = ''; // Clear previous diagram
  
  try {
    // Create a Diagram object from Railroad.js
    let diagram;
    
    if (pattern === '') {
      diagram = new Diagram(new CompleteSequence(new Terminal('Empty')));
    } else {
      // Parse the regex and create a railroad diagram
      const parsedElements = parseRegex(pattern);
      diagram = new Diagram(new CompleteSequence(...parsedElements));
    }
    
    // Add the diagram to the page
    diagram.addTo(diagramArea);
    
  } catch (e) {
    console.error('Error creating railroad diagram:', e);
    diagramArea.innerHTML = `<div class="error">Error creating railroad diagram: ${e.message}</div>`;
  }
}

/**
 * Basic regex parser for railroad diagram generation
 * This is a simplified implementation - a production version would be more comprehensive
 */
function parseRegex(regex) {
  const elements = [];
  let i = 0;
  
  while (i < regex.length) {
    const char = regex[i];
    
    // Handle character classes
    if (char === '[') {
      const endBracket = regex.indexOf(']', i);
      if (endBracket === -1) throw new Error('Unclosed character class');
      
      const charClass = regex.substring(i, endBracket + 1);
      elements.push(new Terminal(charClass));
      i = endBracket + 1;
      
      // Check for quantifiers after character class
      if (i < regex.length) {
        const nextChar = regex[i];
        if (nextChar === '{') {
          const result = handleQuantifier(charClass, regex, i);
          elements.pop(); // Remove the original terminal
          elements.push(result.element);
          i = result.newIndex;
        } else if ('?*+'.includes(nextChar)) {
          elements.pop(); // Remove the original terminal
          elements.push(handleSimpleQuantifier(charClass, nextChar));
          i++;
        }
      }
      continue;
    }
    
    // Handle groups
    if (char === '(') {
      let depth = 1;
      let j = i + 1;
      
      while (j < regex.length && depth > 0) {
        if (regex[j] === '(') depth++;
        if (regex[j] === ')') depth--;
        j++;
      }
      
      if (depth !== 0) throw new Error('Unclosed group');
      
      const group = regex.substring(i + 1, j - 1);
      let groupElement;
      
      // Check for alternation within group
      if (group.includes('|')) {
        const options = group.split('|');
        groupElement = new Choice(0, ...options.map(opt => new Sequence(new Terminal(opt))));
      } else {
        groupElement = new Sequence(new Terminal(group));
      }
      
      // Check for quantifiers after group
      if (j < regex.length) {
        const nextChar = regex[j];
        if (nextChar === '{') {
          const result = handleQuantifier(groupElement, regex, j);
          groupElement = result.element;
          j = result.newIndex;
        } else if ('?*+'.includes(nextChar)) {
          groupElement = handleSimpleQuantifier(groupElement, nextChar);
          j++;
        }
      }
      
      elements.push(groupElement);
      i = j;
      continue;
    }
    
    // Handle alternation at top level
    if (char === '|') {
      return [new Choice(0, 
        new Sequence(...elements), 
        new Sequence(...parseRegex(regex.substring(i + 1)))
      )];
    }
    
    // Handle quantifiers for single characters
    if (i + 1 < regex.length) {
      const nextChar = regex[i + 1];
      if (nextChar === '{') {
        const result = handleQuantifier(char, regex, i + 1);
        elements.push(result.element);
        i = result.newIndex;
        continue;
      } else if ('?*+'.includes(nextChar)) {
        elements.push(handleSimpleQuantifier(char, nextChar));
        i += 2;
        continue;
      }
    }
    
    // Regular character
    if ('.^$()[]{}?*+\\|'.includes(char)) {
      // Escape special regex characters for display
      elements.push(new Terminal(char));
    } else {
      elements.push(new Terminal(char));
    }
    i++;
  }
  
  return elements;
}

/**
 * Handle quantifiers like {n}, {n,}, {n,m}
 */
function handleQuantifier(element, regex, startIndex) {
  const closeBrace = regex.indexOf('}', startIndex);
  if (closeBrace === -1) throw new Error('Unclosed quantifier');
  
  const quantValue = regex.substring(startIndex + 1, closeBrace);
  let result;
  
  // Create Terminal if element is a string
  const terminalElement = typeof element === 'string' ? new Terminal(element) : element;
  
  if (quantValue.includes(',')) {
    // Range quantifier {n,m} or {n,}
    const [min, max] = quantValue.split(',').map(v => v.trim());
    if (max === '') {
      // {n,} - at least n times
      result = new OneOrMore(terminalElement);
      result = new Sequence(result, new Terminal(`(min ${min})`));
    } else {
      // {n,m} - between n and m times
      result = new OneOrMore(terminalElement);
      result = new Sequence(result, new Terminal(`(${min}-${max} times)`));
    }
  } else {
    // Exact number {n}
    const count = parseInt(quantValue, 10);
    if (count === 0) {
      result = new ZeroOrMore(terminalElement);
    } else if (count === 1) {
      result = terminalElement;
    } else {
      result = new OneOrMore(terminalElement);
      result = new Sequence(result, new Terminal(`(${count} times)`));
    }
  }
  
  return {
    element: result,
    newIndex: closeBrace + 1
  };
}

/**
 * Handle simple quantifiers (?, *, +)
 */
function handleSimpleQuantifier(element, quantifier) {
  // Create Terminal if element is a string
  const terminalElement = typeof element === 'string' ? new Terminal(element) : element;
  
  switch (quantifier) {
    case '?':
      return new Optional(terminalElement);
    case '*':
      return new ZeroOrMore(terminalElement);
    case '+':
      return new OneOrMore(terminalElement);
    default:
      return terminalElement;
  }
}