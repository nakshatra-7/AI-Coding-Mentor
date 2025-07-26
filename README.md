AI Code Mentor - DeepDiff & Tree-Sitter Integration
This document explains how to use the enhanced code analysis features using deepdiff and tree-sitter in the AI Code Mentor project.

1. Code Comparison with DeepDiff
Purpose: Compare two code snippets and identify differences
Endpoint: POST /compare
Input: JSON with original_code and modified_code
Output: Detailed comparison analysis
2. Code Structure Analysis
Purpose: Analyze code quality and structure
Endpoint: POST /analyze
Input: JSON with code
Output: Comprehensive code metrics
3. Improvement Suggestions
Purpose: Get suggestions for code improvements
Endpoint: POST /improve
Input: JSON with original_code and modified_code
Output: Analysis and improvement suggestions
📊 Analysis Metrics
The code analyzer provides the following metrics:

Basic Metrics
Total Lines: Total number of lines in the code
Non-empty Lines: Lines with actual content
Function Count: Number of function definitions
Class Count: Number of class definitions
Import Count: Number of import statements
Comment Count: Number of comment lines
Complexity Metrics
Control Flow Statements: Count of if, for, while, try, etc.
Average Line Length: Average characters per line
Max Line Length: Longest line in the code
Indentation Levels: Different indentation patterns used
