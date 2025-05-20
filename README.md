# Regex Visualizer

A web application that visualizes regex expressions as parse trees and railroad diagrams.

## Features

- Regex validation
- Parse tree visualization using PEG.js
- Railroad diagram generation
- Dark/light theme toggle

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   npm install
   ```

2. Run the application:
   ```
   python app.py
   ```

3. Open your browser and navigate to `http://localhost:5000`

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Parse Tree Generation**: PEG.js
- **Railroad Diagrams**: railroad-diagrams library

## Usage

1. Enter a regex expression in the input field
2. Click "Check" to validate the expression
3. If valid, click "Parse Tree" or "Railroad" to visualize the expression