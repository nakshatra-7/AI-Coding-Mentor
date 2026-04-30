from deepdiff import DeepDiff
from tree_sitter import Language, Parser
import json
import os
import difflib

class CodeAnalyzer:
    def __init__(self):
        self.parser = Parser()
        # Note: You'll need to build tree-sitter grammars for specific languages
        # This is a basic setup - you can extend it for Python, JavaScript, etc.
        
    def compare_code(self, original_code: str, modified_code: str) -> dict:
        """
        Compare two code snippets using deepdiff with visual highlights
        """
        try:
            # Parse both code snippets
            original_lines = original_code.strip().split('\n')
            modified_lines = modified_code.strip().split('\n')
            
            # Create a diff using deepdiff
            diff = DeepDiff(original_lines, modified_lines, ignore_order=False)
            
            # Generate visual diff using difflib
            visual_diff = self._generate_visual_diff(original_lines, modified_lines)
            
            # Generate detailed change information
            detailed_changes = self._analyze_detailed_changes(diff, original_lines, modified_lines)
            
            return {
                'changes': {
                    'values_changed': len(diff.get('values_changed', {})),
                    'dictionary_item_added': len(diff.get('dictionary_item_added', [])),
                    'dictionary_item_removed': len(diff.get('dictionary_item_removed', [])),
                    'iterable_item_added': len(diff.get('iterable_item_added', [])),
                    'iterable_item_removed': len(diff.get('iterable_item_removed', [])),
                },
                'detailed_diff': diff.to_dict() if diff else {},
                'visual_diff': visual_diff,
                'detailed_changes': detailed_changes,
                'summary': self._generate_diff_summary(diff)
            }
        except Exception as e:
            return {
                'error': f'Error comparing code: {str(e)}',
                'changes': {},
                'detailed_diff': {},
                'visual_diff': [],
                'detailed_changes': [],
                'summary': 'Unable to compare code'
            }
    
    def _generate_visual_diff(self, original_lines: list, modified_lines: list) -> list:
        """
        Generate visual diff with line-by-line changes
        """
        diff_result = []
        
        # Use difflib to generate unified diff
        diff_lines = list(difflib.unified_diff(
            original_lines, 
            modified_lines, 
            fromfile='original', 
            tofile='modified',
            lineterm=''
        ))
        
        # Parse the diff lines to extract meaningful information
        for line in diff_lines:
            if line.startswith('---') or line.startswith('+++'):
                continue
            elif line.startswith('@@'):
                # This is a hunk header
                diff_result.append({
                    'type': 'hunk_header',
                    'content': line,
                    'line_number': None
                })
            elif line.startswith('+'):
                # Added line
                diff_result.append({
                    'type': 'added',
                    'content': line[1:],  # Remove the + prefix
                    'line_number': None,
                    'highlight': True
                })
            elif line.startswith('-'):
                # Removed line
                diff_result.append({
                    'type': 'removed',
                    'content': line[1:],  # Remove the - prefix
                    'line_number': None,
                    'highlight': True
                })
            elif line.startswith(' '):
                # Unchanged line
                diff_result.append({
                    'type': 'unchanged',
                    'content': line[1:],  # Remove the space prefix
                    'line_number': None,
                    'highlight': False
                })
            else:
                # Other diff information
                diff_result.append({
                    'type': 'info',
                    'content': line,
                    'line_number': None
                })
        
        # If no diff lines were generated, create a simple line-by-line comparison
        if not diff_result:
            diff_result = self._simple_line_comparison(original_lines, modified_lines)
        
        return diff_result
    
    def _simple_line_comparison(self, original_lines: list, modified_lines: list) -> list:
        """
        Simple line-by-line comparison when difflib doesn't generate output
        """
        diff_result = []
        max_lines = max(len(original_lines), len(modified_lines))
        
        for i in range(max_lines):
            original_line = original_lines[i] if i < len(original_lines) else None
            modified_line = modified_lines[i] if i < len(modified_lines) else None
            
            if original_line != modified_line:
                if original_line is not None and modified_line is not None:
                    # Line was modified
                    diff_result.append({
                        'type': 'removed',
                        'content': original_line,
                        'line_number': i + 1,
                        'highlight': True
                    })
                    diff_result.append({
                        'type': 'added',
                        'content': modified_line,
                        'line_number': i + 1,
                        'highlight': True
                    })
                elif original_line is not None:
                    # Line was removed
                    diff_result.append({
                        'type': 'removed',
                        'content': original_line,
                        'line_number': i + 1,
                        'highlight': True
                    })
                elif modified_line is not None:
                    # Line was added
                    diff_result.append({
                        'type': 'added',
                        'content': modified_line,
                        'line_number': i + 1,
                        'highlight': True
                    })
            else:
                # Line unchanged
                diff_result.append({
                    'type': 'unchanged',
                    'content': original_line or modified_line,
                    'line_number': i + 1,
                    'highlight': False
                })
        
        return diff_result
    
    def _analyze_detailed_changes(self, diff, original_lines: list, modified_lines: list) -> list:
        """
        Analyze detailed changes with line numbers and context
        """
        changes = []
        
        # Handle added lines
        if 'iterable_item_added' in diff:
            for item in diff['iterable_item_added']:
                line_num = item.get('index', 0)
                content = item.get('value', '')
                changes.append({
                    'type': 'added',
                    'line_number': line_num + 1,  # Convert to 1-based indexing
                    'content': content,
                    'context': self._get_context(modified_lines, line_num)
                })
        
        # Handle removed lines
        if 'iterable_item_removed' in diff:
            for item in diff['iterable_item_removed']:
                line_num = item.get('index', 0)
                content = item.get('value', '')
                changes.append({
                    'type': 'removed',
                    'line_number': line_num + 1,  # Convert to 1-based indexing
                    'content': content,
                    'context': self._get_context(original_lines, line_num)
                })
        
        # Handle changed lines
        if 'values_changed' in diff:
            for key, change in diff['values_changed'].items():
                # Extract line number from key (e.g., "root[0]" -> 0)
                try:
                    line_num = int(key.split('[')[1].split(']')[0]) + 1
                except:
                    line_num = None
                
                changes.append({
                    'type': 'modified',
                    'line_number': line_num,
                    'old_value': change.get('old_value', ''),
                    'new_value': change.get('new_value', ''),
                    'context': self._get_context(modified_lines, line_num - 1 if line_num else 0)
                })
        
        return sorted(changes, key=lambda x: x.get('line_number', 0) or 0)
    
    def _get_context(self, lines: list, line_num: int, context_lines: int = 2) -> list:
        """
        Get context around a specific line
        """
        start = max(0, line_num - context_lines)
        end = min(len(lines), line_num + context_lines + 1)
        return lines[start:end]
    
    def _generate_diff_summary(self, diff) -> str:
        """
        Generate a human-readable summary of the changes
        """
        if not diff:
            return "No changes detected"
        
        summary_parts = []
        
        if 'values_changed' in diff:
            summary_parts.append(f"{len(diff['values_changed'])} values changed")
        
        if 'dictionary_item_added' in diff:
            summary_parts.append(f"{len(diff['dictionary_item_added'])} items added")
            
        if 'dictionary_item_removed' in diff:
            summary_parts.append(f"{len(diff['dictionary_item_removed'])} items removed")
            
        if 'iterable_item_added' in diff:
            summary_parts.append(f"{len(diff['iterable_item_added'])} lines added")
            
        if 'iterable_item_removed' in diff:
            summary_parts.append(f"{len(diff['iterable_item_removed'])} lines removed")
        
        return ", ".join(summary_parts) if summary_parts else "Changes detected"
    
    def analyze_code_structure(self, code: str, language: str = 'python') -> dict:
        """
        Analyze code structure using tree-sitter (basic implementation)
        """
        try:
            # This is a simplified analysis - you can extend it with proper grammar files
            lines = code.split('\n')
            
            analysis = {
                'total_lines': len(lines),
                'non_empty_lines': len([line for line in lines if line.strip()]),
                'indentation_levels': self._analyze_indentation(lines),
                'function_count': self._count_functions(code),
                'class_count': self._count_classes(code),
                'import_count': self._count_imports(code),
                'comment_count': self._count_comments(code),
                'complexity_metrics': self._calculate_complexity(code)
            }
            
            return analysis
        except Exception as e:
            return {
                'error': f'Error analyzing code structure: {str(e)}',
                'total_lines': 0,
                'non_empty_lines': 0,
                'indentation_levels': [],
                'function_count': 0,
                'class_count': 0,
                'import_count': 0,
                'comment_count': 0,
                'complexity_metrics': {}
            }
    
    def _analyze_indentation(self, lines: list) -> list:
        """Analyze indentation patterns"""
        indent_levels = []
        for line in lines:
            if line.strip():
                indent = len(line) - len(line.lstrip())
                indent_levels.append(indent)
        return list(set(indent_levels))
    
    def _count_functions(self, code: str) -> int:
        """Count function definitions"""
        lines = code.split('\n')
        count = 0
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('def ') or stripped.startswith('async def '):
                count += 1
        return count
    
    def _count_classes(self, code: str) -> int:
        """Count class definitions"""
        lines = code.split('\n')
        count = 0
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('class '):
                count += 1
        return count
    
    def _count_imports(self, code: str) -> int:
        """Count import statements"""
        lines = code.split('\n')
        count = 0
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('import ') or stripped.startswith('from '):
                count += 1
        return count
    
    def _count_comments(self, code: str) -> int:
        """Count comment lines"""
        lines = code.split('\n')
        count = 0
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('#') or stripped.startswith('"""') or stripped.startswith("'''"):
                count += 1
        return count
    
    def _calculate_complexity(self, code: str) -> dict:
        """Calculate basic complexity metrics"""
        lines = code.split('\n')
        
        # Count control flow statements
        control_flow_keywords = ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally']
        control_flow_count = 0
        
        for line in lines:
            stripped = line.strip()
            for keyword in control_flow_keywords:
                if stripped.startswith(keyword + ' ') or stripped.startswith(keyword + ':'):
                    control_flow_count += 1
                    break
        
        return {
            'control_flow_statements': control_flow_count,
            'average_line_length': sum(len(line) for line in lines) / len(lines) if lines else 0,
            'max_line_length': max(len(line) for line in lines) if lines else 0
        }

# Example usage functions
def compare_code_snippets(original: str, modified: str) -> dict:
    """Compare two code snippets and return detailed analysis"""
    analyzer = CodeAnalyzer()
    return analyzer.compare_code(original, modified)

def analyze_code_quality(code: str) -> dict:
    """Analyze code quality and structure"""
    analyzer = CodeAnalyzer()
    return analyzer.analyze_code_structure(code)

def get_code_improvement_suggestions(original: str, modified: str) -> dict:
    """Get suggestions for code improvements based on comparison"""
    analyzer = CodeAnalyzer()
    
    comparison = analyzer.compare_code(original, modified)
    analysis = analyzer.analyze_code_structure(modified)
    
    suggestions = []
    
    # Generate suggestions based on analysis
    if analysis.get('function_count', 0) > 5:
        suggestions.append("Consider breaking down large functions into smaller, more focused functions")
    
    if analysis.get('complexity_metrics', {}).get('control_flow_statements', 0) > 10:
        suggestions.append("High complexity detected - consider simplifying control flow")
    
    if analysis.get('complexity_metrics', {}).get('average_line_length', 0) > 80:
        suggestions.append("Consider breaking long lines for better readability")
    
    return {
        'comparison': comparison,
        'analysis': analysis,
        'suggestions': suggestions
    } 