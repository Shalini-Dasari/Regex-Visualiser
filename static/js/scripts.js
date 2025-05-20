document.addEventListener('DOMContentLoaded', function() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const body = document.body;
  const regexInput = document.getElementById('regex-input');
  const resultMessage = document.getElementById('result-message');
  const extraButtons = document.getElementById('extra-buttons');
  const railroadContainer = document.getElementById('railroad-container');
  const parseTreeContainer = document.getElementById('parse-tree-container');
  const checkBtn = document.getElementById('check-btn');
  const parseBtn = document.getElementById('parse-btn');
  const railroadBtn = document.getElementById('railroad-btn');

  // Theme toggle functionality
  themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    themeToggleBtn.textContent = body.classList.contains('dark-theme') ? '🌞' : '🌙';
    
    // Save theme preference to localStorage
    const isDarkMode = body.classList.contains('dark-theme');
    localStorage.setItem('darkMode', isDarkMode);
  });

  // Load saved theme preference
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    body.classList.add('dark-theme');
    themeToggleBtn.textContent = '🌞';
  }

  // Validate regex on check button click
  checkBtn.addEventListener('click', () => {
    const pattern = regexInput.value.trim();
    
    if (!pattern) {
      resultMessage.textContent = 'Please enter a regex pattern';
      resultMessage.style.color = 'orange';
      extraButtons.classList.add('hidden');
      railroadContainer.classList.add('hidden');
      parseTreeContainer.classList.add('hidden');
      return;
    }

    // Validate through our API
    fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ regex: pattern }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.valid) {
        resultMessage.textContent = 'Valid';
        resultMessage.style.color = 'limegreen';
        extraButtons.classList.remove('hidden');
      } else {
        resultMessage.textContent = 'Invalid Expression: ' + (data.error || '');
        resultMessage.style.color = 'red';
        extraButtons.classList.add('hidden');
        railroadContainer.classList.add('hidden');
        parseTreeContainer.classList.add('hidden');
      }
    })
    .catch(error => {
      console.error('Error validating regex:', error);
      resultMessage.textContent = 'Error validating regex';
      resultMessage.style.color = 'red';
    });
  });

  // Parse Tree button click
  parseBtn.addEventListener('click', () => {
    const pattern = regexInput.value.trim();
    
    fetch('/api/parse-tree', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ regex: pattern }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.valid) {
        try {
          // Show parse tree container
          parseTreeContainer.classList.remove('hidden');
          railroadContainer.classList.add('hidden');
          
          // Generate parse tree using the utility function
          generateParseTree(pattern);
        } catch (error) {
          console.error('Error generating parse tree:', error);
          document.getElementById('parse-tree-area').innerHTML = 
            '<div class="error">Error generating parse tree: ' + error.message + '</div>';
        }
      }
    })
    .catch(error => {
      console.error('Error getting parse tree data:', error);
    });
  });

  // Railroad button click
  railroadBtn.addEventListener('click', () => {
    const pattern = regexInput.value.trim();
    
    fetch('/api/railroad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ regex: pattern }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.valid) {
        try {
          // Show railroad container
          railroadContainer.classList.remove('hidden');
          parseTreeContainer.classList.add('hidden');
          
          // Generate railroad diagram using the imported function
          drawRegexDiagram(pattern);
        } catch (error) {
          console.error('Error generating railroad diagram:', error);
          document.getElementById('diagram-area').innerHTML = 
            '<div class="error">Error generating railroad diagram: ' + error.message + '</div>';
        }
      }
    })
    .catch(error => {
      console.error('Error getting railroad data:', error);
    });
  });

  // Add animations
  const animateElement = (element) => {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = 'fadeIn 0.5s ease';
  };

  // Animate elements when they become visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateElement(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // Observe containers
  [railroadContainer, parseTreeContainer].forEach(container => {
    observer.observe(container);
  });

  // Add Enter key support for regex input
  regexInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      checkBtn.click();
    }
  });
});