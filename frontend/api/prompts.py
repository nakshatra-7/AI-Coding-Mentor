def walkthrough_prompt(code: str) -> str:
    return f"""Please provide a detailed line-by-line explanation of the following code:

{code}

Explain:
1. What each line does
2. The overall purpose of the code
3. Any important concepts or patterns used
4. The flow of execution

Make your explanation clear and beginner-friendly."""

def debug_prompt(code: str, error: str = None) -> str:
    prompt = f"""Please analyze the following code for bugs and provide fixes:

{code}

"""
    if error:
        prompt += f"Error message: {error}\n\n"
    
    prompt += """Please:
1. Identify any bugs or issues in the code
2. Explain what's causing the problem
3. Provide a corrected version of the code
4. Explain why your fix works

Be thorough in your analysis and provide clear explanations."""
    
    return prompt

def refactor_prompt(code: str) -> str:
    return f"""Please refactor and optimize the following code:

{code}

Please provide:
1. An optimized version of the code
2. Explanation of the improvements made
3. Any performance optimizations
4. Better practices applied
5. Maintainability improvements

Focus on making the code cleaner, more efficient, and easier to maintain."""
