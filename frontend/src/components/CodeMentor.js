import React, { useState, useRef } from 'react';
import { sendCode } from '../api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DiffViewer from './DiffViewer';

const CodeMentor = () => {
  const [code, setCode] = useState('');
  const [mode, setMode] = useState('walkthrough');
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visualDiff, setVisualDiff] = useState(null);
  const outputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('Please enter some code first!');
      return;
    }

    setLoading(true);
    setOutput('');
    setVisualDiff(null);
    
    try {
      const result = await sendCode(mode, code, error);
      setOutput(result);
      if (result && typeof result === 'object' && result.visual_diff) {
        setVisualDiff(result.visual_diff);
      } else if (result && typeof result === 'string') {
        try {
          const parsed = JSON.parse(result);
          if (parsed.visual_diff) setVisualDiff(parsed.visual_diff);
        } catch {}
      }
      
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
      
    } catch (err) {
      setOutput(`Error: ${err.message}`);
      setVisualDiff(null);
      
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const extractCodeBlocks = (text) => {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = text.match(codeBlockRegex) || [];
    return matches.map(block => block.replace(/```[\w]*\n?/, '').replace(/```$/, ''));
  };

  const extractExplanation = (text) => {
    const codeBlockRegex = /```[\s\S]*?```/g;
    return text.replace(codeBlockRegex, '').trim();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const codeBlocks = extractCodeBlocks(output);
  const explanation = extractExplanation(output);
  const allCode = codeBlocks.join('\n\n');

  return (
    <div style={{ 
      maxWidth: 1400, 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '30px'
      }}>
        <div style={{
          border: '2px solid #00ffff',
          borderRadius: '12px',
          padding: '20px 40px',
          backgroundColor: 'rgba(0, 255, 255, 0.05)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            color: '#00ffff',
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: 0,
            textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
            textDecoration: 'underline',
            textDecorationColor: '#00ffff',
            textUnderlineOffset: '8px'
          }}>
            AI Coding Mentor
          </h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
                      <label style={{ 
              display: 'block', 
              marginBottom: '10px',
              fontWeight: '600',
              color: '#e0e0e0',
              fontSize: '1.1rem'
            }}>
              Paste your code here:
            </label>
          <textarea
            rows={12}
            style={{
              width: '100%',
              padding: '20px',
              border: '2px solid #1a1a1a',
              borderRadius: '12px',
              fontFamily: 'JetBrains Mono, Consolas, monospace',
              fontSize: '14px',
              resize: 'vertical',
              backgroundColor: '#111111',
              color: '#ffffff',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box',
              minHeight: '300px',
              maxHeight: '600px'
            }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste your code here...
// Example:
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}"
            onFocus={(e) => e.target.style.borderColor = '#00ffff'}
            onBlur={(e) => e.target.style.borderColor = '#1a1a1a'}
          />
        </div>


        <div style={{ 
          marginBottom: '20px',
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '12px 20px',
            backgroundColor: mode === 'walkthrough' ? '#00ffff' : '#1a1a1a',
            color: mode === 'walkthrough' ? '#000000' : '#e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '500'
          }}>
            <input
              type="radio"
              value="walkthrough"
              checked={mode === "walkthrough"}
              onChange={() => setMode("walkthrough")}
              style={{ display: 'none' }}
            />
            Walkthrough
          </label>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '12px 20px',
            backgroundColor: mode === 'debug' ? '#00ffff' : '#1a1a1a',
            color: mode === 'debug' ? '#000000' : '#e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '500'
          }}>
            <input
              type="radio"
              value="debug"
              checked={mode === "debug"}
              onChange={() => setMode("debug")}
              style={{ display: 'none' }}
            />
            Debug
          </label>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '12px 20px',
            backgroundColor: mode === 'refactor' ? '#00ffff' : '#1a1a1a',
            color: mode === 'refactor' ? '#000000' : '#e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '500'
          }}>
            <input
              type="radio"
              value="refactor"
              checked={mode === "refactor"}
              onChange={() => setMode("refactor")}
              style={{ display: 'none' }}
            />
            Refactor
          </label>
        </div>


        {mode === "debug" && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px',
              fontWeight: '600',
              color: '#e0e0e0',
              fontSize: '1.1rem'
            }}>
              Error message (optional):
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #1a1a1a',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#111111',
                color: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              value={error}
              onChange={(e) => setError(e.target.value)}
              placeholder="Paste any error messages here..."
              onFocus={(e) => e.target.style.borderColor = '#00ffff'}
              onBlur={(e) => e.target.style.borderColor = '#1a1a1a'}
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '18px',
            backgroundColor: loading ? '#1a1a1a' : '#00ffff',
            color: loading ? '#666' : '#000000',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            transition: 'all 0.3s ease',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(0, 255, 255, 0.4)',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
        >
          {loading ? 'Processing...' : 'Get AI Assistance'}
        </button>
      </form>

      {output && (
        <div 
          ref={outputRef}
          style={{ 
            marginTop: '20px',
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >

          <div style={{ 
            flex: '1',
            minWidth: '400px',
            border: '2px solid #1a1a1a',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#111111'
          }}>
            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '18px',
              borderBottom: '2px solid #1a1a1a',
              fontWeight: '600',
              color: '#00ffff',
              fontSize: '1.1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                Code Output:
              </span>
              {codeBlocks.length > 0 && (
                <button
                  onClick={() => copyToClipboard(allCode)}
                  style={{
                    backgroundColor: copied ? '#10b981' : '#00ffff',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => !copied && (e.target.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => !copied && (e.target.style.transform = 'translateY(0)')}
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              )}
            </div>
            <div style={{
              maxHeight: '500px',
              overflowY: 'auto',
              padding: '25px',
              backgroundColor: '#111111'
            }}>
              {codeBlocks.length > 0 ? (
                codeBlocks.map((block, index) => (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    <SyntaxHighlighter 
                      language="python"
                      style={tomorrow}
                      customStyle={{
                        margin: 0,
                        backgroundColor: 'transparent',
                        fontSize: '14px'
                      }}
                    >
                      {block}
                    </SyntaxHighlighter>
                  </div>
                ))
              ) : (
                <div style={{ color: '#888', fontStyle: 'italic' }}>
                  No code blocks found in the response.
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            flex: '1',
            minWidth: '400px',
            border: '2px solid #1a1a1a',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#111111'
          }}>
            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '18px',
              borderBottom: '2px solid #1a1a1a',
              fontWeight: '600',
              color: '#00ffff',
              fontSize: '1.1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                Explanation:
              </span>
            </div>
            <div style={{
              maxHeight: '500px',
              overflowY: 'auto',
              padding: '25px',
              backgroundColor: '#111111'
            }}>
              {explanation ? (
                <SyntaxHighlighter 
                  language="markdown" 
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    backgroundColor: 'transparent',
                    fontSize: '14px'
                  }}
                >
                  {explanation}
                </SyntaxHighlighter>
              ) : (
                <div style={{ color: '#888', fontStyle: 'italic' }}>
                  No explanation found in the response.
                </div>
              )}
            </div>
          </div>

          {visualDiff && Array.isArray(visualDiff) && (
            <div style={{
              flex: '1',
              minWidth: '400px',
              border: '2px solid #1a1a1a',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#111111',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '600px'
            }}>
              <div style={{
                backgroundColor: '#1a1a1a',
                padding: '18px',
                borderBottom: '2px solid #1a1a1a',
                fontWeight: '600',
                color: '#00ffff',
                fontSize: '1.1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Visual Diff:</span>
              </div>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '25px',
                backgroundColor: '#111111'
              }}>
                <DiffViewer visualDiff={visualDiff} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeMentor; 