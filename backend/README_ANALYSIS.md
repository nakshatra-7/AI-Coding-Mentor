# AI Code Mentor - DeepDiff & Tree-Sitter Integration

This document explains how to use the enhanced code analysis features using `deepdiff` and `tree-sitter` in the AI Code Mentor project.

## 🚀 New Features

### 1. Code Comparison with DeepDiff
- **Purpose**: Compare two code snippets and identify differences
- **Endpoint**: `POST /compare`
- **Input**: JSON with `original_code` and `modified_code`
- **Output**: Detailed comparison analysis

### 2. Code Structure Analysis
- **Purpose**: Analyze code quality and structure
- **Endpoint**: `POST /analyze`
- **Input**: JSON with `code`
- **Output**: Comprehensive code metrics

### 3. Improvement Suggestions
- **Purpose**: Get suggestions for code improvements
- **Endpoint**: `POST /improve`
- **Input**: JSON with `original_code` and `modified_code`
- **Output**: Analysis and improvement suggestions

## 📊 Analysis Metrics

The code analyzer provides the following metrics:

### Basic Metrics
- **Total Lines**: Total number of lines in the code
- **Non-empty Lines**: Lines with actual content
- **Function Count**: Number of function definitions
- **Class Count**: Number of class definitions
- **Import Count**: Number of import statements
- **Comment Count**: Number of comment lines

### Complexity Metrics
- **Control Flow Statements**: Count of if, for, while, try, etc.
- **Average Line Length**: Average characters per line
- **Max Line Length**: Longest line in the code
- **Indentation Levels**: Different indentation patterns used

## 🔧 Usage Examples

### 1. Compare Code Snippets

```python
import requests

# Compare two code versions
response = requests.post("http://localhost:8000/compare", json={
    "original_code": """
def add(a, b):
    return a + b
""",
    "modified_code": """
def add(a, b):
    # Add validation
    if not isinstance(a, (int, float)):
        raise ValueError("a must be a number")
    return a + b
"""
})

print(response.json())
```

### 2. Analyze Code Structure

```python
import requests

# Analyze code quality
response = requests.post("http://localhost:8000/analyze", json={
    "code": """
import os

class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        result = a + b
        self.history.append(result)
        return result
"""
})

print(response.json())
```

### 3. Get Improvement Suggestions

```python
import requests

# Get improvement suggestions
response = requests.post("http://localhost:8000/improve", json={
    "original_code": "original code here",
    "modified_code": "improved code here"
})

print(response.json())
```

## 🧪 Testing

Run the test script to see all features in action:

```bash
cd backend
source venv/bin/activate
python test_analysis.py
```

## 📈 Benefits

### DeepDiff Benefits
- **Precise Comparison**: Identifies exact differences between code versions
- **Change Tracking**: Tracks additions, removals, and modifications
- **Structured Output**: Provides organized comparison results
- **Error Handling**: Graceful handling of comparison errors

### Tree-Sitter Inspired Analysis
- **Code Structure**: Understands code organization
- **Quality Metrics**: Provides quantitative quality measures
- **Complexity Analysis**: Identifies potential complexity issues
- **Best Practices**: Suggests improvements based on metrics

## 🔮 Future Enhancements

### Planned Features
1. **Language-Specific Parsing**: Full tree-sitter grammar support for multiple languages
2. **AST Analysis**: Deep analysis of Abstract Syntax Trees
3. **Code Smell Detection**: Identify common code smells and anti-patterns
4. **Performance Analysis**: Analyze code performance characteristics
5. **Security Analysis**: Identify potential security vulnerabilities

### Advanced Tree-Sitter Integration
```python
# Future implementation with full tree-sitter support
from tree_sitter import Language, Parser

# Build language grammars
Language.build_library(
    'build/my-languages.so',
    [
        'vendor/tree-sitter-python',
        'vendor/tree-sitter-javascript',
        'vendor/tree-sitter-java'
    ]
)

# Use for advanced parsing
PY_LANGUAGE = Language('build/my-languages.so', 'python')
parser = Parser()
parser.set_language(PY_LANGUAGE)
```

## 🛠️ Installation

The required dependencies are already included in `requirements.txt`:

```bash
pip install deepdiff tree-sitter
```

## 📝 API Reference

### POST /compare
**Request Body:**
```json
{
    "original_code": "string",
    "modified_code": "string"
}
```

**Response:**
```json
{
    "comparison": {
        "changes": {...},
        "detailed_diff": {...},
        "summary": "string"
    },
    "message": "string"
}
```

### POST /analyze
**Request Body:**
```json
{
    "code": "string"
}
```

**Response:**
```json
{
    "analysis": {
        "total_lines": 0,
        "non_empty_lines": 0,
        "function_count": 0,
        "class_count": 0,
        "import_count": 0,
        "comment_count": 0,
        "complexity_metrics": {...}
    },
    "message": "string"
}
```

### POST /improve
**Request Body:**
```json
{
    "original_code": "string",
    "modified_code": "string"
}
```

**Response:**
```json
{
    "improvements": {
        "comparison": {...},
        "analysis": {...},
        "suggestions": ["string"]
    },
    "message": "string"
}
```

## 🎯 Use Cases

1. **Code Review**: Compare code changes and get improvement suggestions
2. **Refactoring**: Analyze code structure before and after refactoring
3. **Quality Assessment**: Evaluate code quality metrics
4. **Learning**: Understand code complexity and structure
5. **Documentation**: Generate code documentation based on analysis

## 🔍 Troubleshooting

### Common Issues
1. **Import Errors**: Ensure all dependencies are installed
2. **Memory Issues**: Large code files may require more memory
3. **Performance**: Complex analysis may take time for large codebases

### Error Handling
All endpoints include comprehensive error handling and will return meaningful error messages if something goes wrong. 