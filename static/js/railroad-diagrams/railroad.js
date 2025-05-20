// Railroad-diagrams library - simplified version for demo
// In a real implementation, you would include the actual library from:
// https://github.com/tabatkins/railroad-diagrams/blob/gh-pages/railroad.js

(function() {
  'use strict';
  
  // The actual railroad-diagrams library or substitute
  // This is a simplified version for demonstration purposes
  
  // Base class for all railroad diagram elements
  class RailroadElement {
    constructor() {
      this.width = 0;
      this.height = 0;
      this.up = 0;
      this.down = 0;
    }
    
    addTo(parent) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', this.width + 10);
      svg.setAttribute('height', this.height + 10);
      svg.setAttribute('viewBox', `0 0 ${this.width + 10} ${this.height + 10}`);
      svg.setAttribute('class', 'railroad-diagram');
      
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', 'translate(5, 5)');
      svg.appendChild(g);
      
      this.format(g, 0, 0);
      parent.appendChild(svg);
      
      return this;
    }
    
    format(parent, x, y) {
      // To be implemented by subclasses
    }
  }
  
  // Terminal element (literal)
  class Terminal extends RailroadElement {
    constructor(text) {
      super();
      this.text = text;
      this.width = text.length * 8 + 20;
      this.height = 30;
      this.up = 15;
      this.down = 15;
    }
    
    format(parent, x, y) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', this.width);
      rect.setAttribute('height', this.height);
      rect.setAttribute('rx', 5);
      rect.setAttribute('ry', 5);
      rect.setAttribute('class', 'terminal');
      rect.setAttribute('fill', '#dbeeff');
      rect.setAttribute('stroke', '#999');
      
      parent.appendChild(rect);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + this.width / 2);
      text.setAttribute('y', y + this.height / 2);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('class', 'terminal-text');
      text.textContent = this.text;
      
      parent.appendChild(text);
    }
  }
  
  // Sequence of elements
  class Sequence extends RailroadElement {
    constructor(...items) {
      super();
      this.items = items;
      
      // Calculate dimensions
      this.width = 0;
      this.up = 0;
      this.down = 0;
      
      for (const item of items) {
        this.width += item.width;
        this.up = Math.max(this.up, item.up);
        this.down = Math.max(this.down, item.down);
      }
      
      this.height = this.up + this.down;
    }
    
    format(parent, x, y) {
      const centerY = y + this.up;
      let currentX = x;
      
      // Draw line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', x + this.width);
      line.setAttribute('y2', centerY);
      line.setAttribute('stroke', '#999');
      parent.appendChild(line);
      
      // Format each item
      for (const item of this.items) {
        item.format(parent, currentX, centerY - item.up);
        currentX += item.width;
      }
    }
  }
  
  // Choice element (alternatives)
  class Choice extends RailroadElement {
    constructor(defaultIndex, ...items) {
      super();
      this.items = items;
      this.defaultIndex = defaultIndex || 0;
      
      // Calculate dimensions
      this.width = Math.max(...items.map(item => item.width)) + 40; // Space for arcs
      this.up = 0;
      this.down = 0;
      
      let totalHeight = 0;
      for (const item of items) {
        this.up = Math.max(this.up, item.up);
        this.down = Math.max(this.down, item.down);
        totalHeight += item.up + item.down;
      }
      
      this.height = totalHeight + (items.length - 1) * 10; // Spacing between options
    }
    
    format(parent, x, y) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      parent.appendChild(g);
      
      // Calculate positions
      let currentY = y;
      const startX = x + 20;
      const endX = x + this.width - 20;
      
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        const itemY = currentY + item.up;
        
        // Draw arc to item
        const arcPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arcPath.setAttribute('d', `M ${x},${y + this.up} Q ${startX},${itemY} ${startX + 10},${itemY}`);
        arcPath.setAttribute('fill', 'none');
        arcPath.setAttribute('stroke', '#999');
        g.appendChild(arcPath);
        
        // Format item
        item.format(g, startX + 10, currentY);
        
        // Draw arc from item
        const arcPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arcPath2.setAttribute('d', `M ${endX - 10},${itemY} Q ${endX},${itemY} ${endX + 20},${y + this.up}`);
        arcPath2.setAttribute('fill', 'none');
        arcPath2.setAttribute('stroke', '#999');
        g.appendChild(arcPath2);
        
        currentY += item.up + item.down + 10;
      }
    }
  }
  
  // Optional element
  class Optional extends RailroadElement {
    constructor(item) {
      super();
      this.item = item;
      this.width = item.width + 40; // Space for bypass
      this.up = item.up;
      this.down = item.down + 20; // Space for bypass
      this.height = this.up + this.down;
    }
    
    format(parent, x, y) {
      const centerY = y + this.up;
      const bypassY = centerY + 20;
      
      // Draw bypass line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', `M ${x},${centerY} C ${x+10},${centerY} ${x+10},${bypassY} ${x+20},${bypassY} H ${x+this.width-20} C ${x+this.width-10},${bypassY} ${x+this.width-10},${centerY} ${x+this.width},${centerY}`);
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke', '#999');
      parent.appendChild(line);
      
      // Format the item
      this.item.format(parent, x + 20, centerY - this.item.up);
    }
  }
  
  // Zero or more repetition
  class ZeroOrMore extends RailroadElement {
    constructor(item) {
      super();
      this.item = item;
      this.width = item.width + 40;
      this.up = item.up;
      this.down = item.down + 20;
      this.height = this.up + this.down;
    }
    
    format(parent, x, y) {
      // Similar to Optional but with a loop back
      const centerY = y + this.up;
      const bypassY = centerY + 20;
      
      // Draw the item
      this.item.format(parent, x + 20, centerY - this.item.up);
      
      // Draw the bypass
      const bypass = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      bypass.setAttribute('d', `M ${x},${centerY} C ${x+10},${centerY} ${x+10},${bypassY} ${x+20},${bypassY} H ${x+this.width-20} C ${x+this.width-10},${bypassY} ${x+this.width-10},${centerY} ${x+this.width},${centerY}`);
      bypass.setAttribute('fill', 'none');
      bypass.setAttribute('stroke', '#999');
      parent.appendChild(bypass);
      
      // Draw the loop
      const loop = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      loop.setAttribute('d', `M ${x+this.width-20},${centerY} C ${x+this.width-30},${centerY-10} ${x+30},${centerY-10} ${x+20},${centerY}`);
      loop.setAttribute('fill', 'none');
      loop.setAttribute('stroke', '#999');
      loop.setAttribute('stroke-dasharray', '3,3');
      parent.appendChild(loop);
      
      // Arrow for the loop
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrow.setAttribute('d', `M ${x+20},${centerY} l 5,-3 v 6 z`);
      arrow.setAttribute('fill', '#999');
      parent.appendChild(arrow);
    }
  }
  
  // One or more repetition
  class OneOrMore extends RailroadElement {
    constructor(item) {
      super();
      this.item = item;
      this.width = item.width + 40;
      this.up = item.up;
      this.down = item.down + 20;
      this.height = this.up + this.down;
    }
    
    format(parent, x, y) {
      // Similar to ZeroOrMore but without the bypass
      const centerY = y + this.up;
      
      // Draw the item
      this.item.format(parent, x + 20, centerY - this.item.up);
      
      // Draw the main line
      const mainLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      mainLine.setAttribute('x1', x);
      mainLine.setAttribute('y1', centerY);
      mainLine.setAttribute('x2', x + this.width);
      mainLine.setAttribute('y2', centerY);
      mainLine.setAttribute('stroke', '#999');
      parent.appendChild(mainLine);
      
      // Draw the loop
      const loop = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      loop.setAttribute('d', `M ${x+this.width-20},${centerY} C ${x+this.width-30},${centerY-10} ${x+30},${centerY-10} ${x+20},${centerY}`);
      loop.setAttribute('fill', 'none');
      loop.setAttribute('stroke', '#999');
      loop.setAttribute('stroke-dasharray', '3,3');
      parent.appendChild(loop);
      
      // Arrow for the loop
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrow.setAttribute('d', `M ${x+20},${centerY} l 5,-3 v 6 z`);
      arrow.setAttribute('fill', '#999');
      parent.appendChild(arrow);
    }
  }
  
  // Complete diagram
  class Diagram extends RailroadElement {
    constructor(item) {
      super();
      this.item = item;
      this.width = item.width + 20; // Space for start and end
      this.up = item.up;
      this.down = item.down;
      this.height = this.up + this.down;
    }
    
    format(parent, x, y) {
      const centerY = y + this.up;
      
      // Start marker
      const startCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      startCircle.setAttribute('cx', x + 5);
      startCircle.setAttribute('cy', centerY);
      startCircle.setAttribute('r', 5);
      startCircle.setAttribute('fill', '#333');
      parent.appendChild(startCircle);
      
      // End marker
      const endCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      endCircle.setAttribute('cx', x + this.width - 5);
      endCircle.setAttribute('cy', centerY);
      endCircle.setAttribute('r', 5);
      endCircle.setAttribute('fill', '#333');
      parent.appendChild(endCircle);
      
      // Main line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', x + this.width);
      line.setAttribute('y2', centerY);
      line.setAttribute('stroke', '#999');
      parent.appendChild(line);
      
      // Format the item
      this.item.format(parent, x + 10, centerY - this.item.up);
    }
  }
  
  // Complete sequence (diagram with start/end)
  function CompleteSequence(...items) {
    return new Sequence(...items);
  }
  
  // Export to global scope
  window.Diagram = Diagram;
  window.CompleteSequence = CompleteSequence;
  window.Terminal = Terminal;
  window.Sequence = Sequence;
  window.Choice = Choice;
  window.Optional = Optional;
  window.ZeroOrMore = ZeroOrMore;
  window.OneOrMore = OneOrMore;
})();