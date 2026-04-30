#!/usr/bin/env python3
"""
Test script to demonstrate deepdiff and tree-sitter functionality
"""

from code_analysis import CodeAnalyzer, compare_code_snippets, analyze_code_quality, get_code_improvement_suggestions

def test_code_comparison():
    """Test deepdiff functionality with visual highlights"""
    print("=== Testing Code Comparison with DeepDiff ===\n")
    
    original_code = """
def calculate_sum(a, b):
    return a + b

def calculate_product(a, b):
    return a * b
"""
    
    modified_code = """
def calculate_sum(a, b):
    # Add input validation
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Inputs must be numbers")
    return a + b

def calculate_product(a, b):
    return a * b

def calculate_average(a, b):
    return (a + b) / 2
"""
    
    comparison = compare_code_snippets(original_code, modified_code)
    
    print("Original Code:")
    print(original_code)
    print("\nModified Code:")
    print(modified_code)
    print("\n=== Comparison Results ===")
    print(f"Summary: {comparison['summary']}")
    print(f"Changes: {comparison['changes']}")
    
    print("\n=== Visual Diff Highlights ===")
    for item in comparison['visual_diff']:
        if item['type'] == 'added':
            print(f"➕ ADDED: {item['content']}")
        elif item['type'] == 'removed':
            print(f"➖ REMOVED: {item['content']}")
        elif item['type'] == 'modified':
            print(f"🔄 MODIFIED: {item['content']}")
        elif item['type'] == 'hunk_header':
            print(f"📋 {item['content']}")
    
    print("\n=== Detailed Changes ===")
    for change in comparison['detailed_changes']:
        if change['type'] == 'added':
            print(f"➕ Line {change['line_number']}: ADDED - {change['content']}")
        elif change['type'] == 'removed':
            print(f"➖ Line {change['line_number']}: REMOVED - {change['content']}")
        elif change['type'] == 'modified':
            print(f"🔄 Line {change['line_number']}: MODIFIED")
            print(f"   Old: {change['old_value']}")
            print(f"   New: {change['new_value']}")
    
    return comparison

def test_code_analysis():
    """Test tree-sitter inspired analysis"""
    print("\n=== Testing Code Analysis ===\n")
    
    sample_code = """
import os
import sys

class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        # Add two numbers
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def multiply(self, a, b):
        # Multiply two numbers
        if a == 0 or b == 0:
            return 0
        result = a * b
        self.history.append(f"{a} * {b} = {result}")
        return result

def main():
    calc = Calculator()
    print(calc.add(5, 3))
    print(calc.multiply(4, 6))
"""
    
    analysis = analyze_code_quality(sample_code)
    
    print("Sample Code:")
    print(sample_code)
    print("\nAnalysis Results:")
    print(f"Total lines: {analysis['total_lines']}")
    print(f"Non-empty lines: {analysis['non_empty_lines']}")
    print(f"Functions: {analysis['function_count']}")
    print(f"Classes: {analysis['class_count']}")
    print(f"Imports: {analysis['import_count']}")
    print(f"Comments: {analysis['comment_count']}")
    print(f"Indentation levels: {analysis['indentation_levels']}")
    print(f"Complexity metrics: {analysis['complexity_metrics']}")
    
    return analysis

def test_improvement_suggestions():
    """Test improvement suggestions"""
    print("\n=== Testing Improvement Suggestions ===\n")
    
    original_code = """
def process_data(data):
    result = []
    for item in data:
        if item > 0:
            if item % 2 == 0:
                result.append(item * 2)
            else:
                result.append(item * 3)
        else:
            result.append(0)
    return result
"""
    
    improved_code = """
def process_data(data):
    # Process data with improved structure
    result = []
    
    for item in data:
        processed_item = process_single_item(item)
        result.append(processed_item)
    
    return result

def process_single_item(item):
    # Process a single data item
    if item <= 0:
        return 0
    
    if item % 2 == 0:
        return item * 2
    else:
        return item * 3
"""
    
    improvements = get_code_improvement_suggestions(original_code, improved_code)
    
    print("Original Code:")
    print(original_code)
    print("\nImproved Code:")
    print(improved_code)
    print("\nImprovement Analysis:")
    print(f"Comparison Summary: {improvements['comparison']['summary']}")
    print(f"Suggestions: {improvements['suggestions']}")
    
    print("\n=== Visual Highlights of Changes ===")
    for item in improvements['comparison']['visual_diff']:
        if item['type'] == 'added':
            print(f"➕ ADDED: {item['content']}")
        elif item['type'] == 'removed':
            print(f"➖ REMOVED: {item['content']}")
        elif item['type'] == 'modified':
            print(f"🔄 MODIFIED: {item['content']}")
    
    return improvements

def test_simple_comparison():
    """Test a simple line-by-line comparison"""
    print("\n=== Testing Simple Line-by-Line Comparison ===\n")
    
    original = "def hello():\n    print('Hello')\n    return True"
    modified = "def hello():\n    print('Hello World')\n    return True"
    
    comparison = compare_code_snippets(original, modified)
    
    print("Original:")
    print(original)
    print("\nModified:")
    print(modified)
    print("\nVisual Diff:")
    for item in comparison['visual_diff']:
        if item['type'] == 'added':
            print(f"➕ {item['content']}")
        elif item['type'] == 'removed':
            print(f"➖ {item['content']}")
        elif item['type'] == 'unchanged':
            print(f"  {item['content']}")
    
    return comparison

if __name__ == "__main__":
    print("🧪 Testing DeepDiff and Tree-Sitter Integration with Visual Highlights\n")
    
    # Run all tests
    comparison_result = test_code_comparison()
    analysis_result = test_code_analysis()
    improvements_result = test_improvement_suggestions()
    simple_result = test_simple_comparison()
    
    print("\n✅ All tests completed successfully!")
    print("\n📊 Summary:")
    print(f"- Code comparison: {comparison_result['summary']}")
    print(f"- Code analysis: {analysis_result['function_count']} functions, {analysis_result['class_count']} classes")
    print(f"- Improvement suggestions: {len(improvements_result['suggestions'])} suggestions generated")
    print(f"- Visual highlights: {len(comparison_result['visual_diff'])} diff items shown") 