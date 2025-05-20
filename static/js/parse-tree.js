/**
 * Generate a parse tree for a regex pattern using PEG.js
 */
function generateParseTree(pattern) {
  const parseTreeArea = document.getElementById('parse-tree-area');
  parseTreeArea.innerHTML = ''; // Clear previous tree
  
  try {
    // Define a PEG.js grammar for parsing regular expressions
    const grammar = `
      {
        function makeNode(type, value, children) {
          return { type, value, children: children || [] };
        }
      }
      
      Expression
        = alternative:Alternative { return alternative; }
      
      Alternative
        = head:Sequence tail:(_ "|" _ Sequence)* {
            if (tail.length === 0) return head;
            return makeNode('alternative', '|', [head].concat(tail.map(item => item[3])));
          }
      
      Sequence
        = first:Term rest:(_ Term)* {
            if (rest.length === 0) return first;
            return makeNode('sequence', '', [first].concat(rest.map(item => item[1])));
          }
      
      Term
        = Atom Quantifier?
      
      Atom
        = Char / Group / CharacterClass / AnyChar
      
      Group
        = "(" _ expr:Expression _ ")" { return makeNode('group', '()', [expr]); }
      
      CharacterClass
        = "[" chars:[^\\]]+ "]" { return makeNode('charClass', '[' + chars.join('') + ']', []); }
        / "[" chars:"\\]"+ "]" { return makeNode('charClass', '[' + chars.join('') + ']', []); }
      
      AnyChar
        = "." { return makeNode('anyChar', '.', []); }
      
      Char
        = char:[^|()\\[\\].*+?{}^$] { return makeNode('char', char, []); }
        / "\\\\" char:. { return makeNode('escapedChar', '\\\\' + char, []); }
      
      Quantifier
        = "?" { return makeNode('quantifier', '?', []); }
        / "+" { return makeNode('quantifier', '+', []); }
        / "*" { return makeNode('quantifier', '*', []); }
        / "{" _ digits:[0-9]+ _ "}" { return makeNode('quantifier', '{' + digits.join('') + '}', []); }
        / "{" _ min:[0-9]+ _ "," _ max:[0-9]+ _ "}" { 
            return makeNode('quantifier', '{' + min.join('') + ',' + max.join('') + '}', []); 
          }
        / "{" _ min:[0-9]+ _ "," _ "}" { 
            return makeNode('quantifier', '{' + min.join('') + ',}', []); 
          }
      
      _ = [ \\t\\n\\r]* { return null; }
    `;
    
    // Parse the regex using PEG.js
    const parser = peggy.generate(grammar);
    const parseTree = parser.parse(pattern);
    
    // Render the parse tree
    const treeHtml = renderParseTree(parseTree);
    parseTreeArea.innerHTML = treeHtml;
  } catch (e) {
    console.error('Error creating parse tree:', e);
    parseTreeArea.innerHTML = `<div class="error">Error creating parse tree: ${e.message}</div>`;
  }
}

/**
 * Render the parse tree as an HTML tree structure
 */
function renderParseTree(node, indent = 0) {
  if (!node) return '';
  
  const nodeType = node.type || 'unknown';
  const nodeValue = node.value || '';
  const nodeChildren = node.children || [];
  
  // Create HTML for this node
  let html = `<div class="tree-node" style="margin-left:${indent * 20}px">`;
  html += `<span class="node-type">${nodeType}</span>`;
  if (nodeValue) {
    html += ` <span class="node-value">'${nodeValue}'</span>`;
  }
  html += '</div>';
  
  // Recursively render children
  for (const child of nodeChildren) {
    html += renderParseTree(child, indent + 1);
  }
  
  return html;
}