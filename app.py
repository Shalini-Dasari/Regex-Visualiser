from flask import Flask, render_template, request, jsonify
import re

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/validate', methods=['POST'])
def validate_regex():
    data = request.json
    regex_pattern = data.get('regex', '')
    
    try:
        re.compile(regex_pattern)
        return jsonify({'valid': True})
    except re.error as e:
        return jsonify({'valid': False, 'error': str(e)})

@app.route('/api/parse-tree', methods=['POST'])
def parse_tree():
    data = request.json
    regex_pattern = data.get('regex', '')
    
    try:
        re.compile(regex_pattern)
        # The actual parsing will be done client-side with PEG.js
        return jsonify({'valid': True})
    except re.error:
        return jsonify({'valid': False})

@app.route('/api/railroad', methods=['POST'])
def railroad():
    data = request.json
    regex_pattern = data.get('regex', '')
    
    try:
        re.compile(regex_pattern)
        # The actual diagram generation will be done client-side
        return jsonify({'valid': True})
    except re.error:
        return jsonify({'valid': False})

if __name__ == '__main__':
    app.run(debug=True)