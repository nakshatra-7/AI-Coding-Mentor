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
      padding: '28px 20px 48px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      background: '#0b0b0b',
      minHeight: '100vh',
      color: '#facc15'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '28px'
      }}>
        <div style={{
          border: '1px solid #3a3215',
          borderRadius: '18px',
          padding: '24px 42px',
          backgroundColor: '#111111',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
          width: 'min(100%, 720px)'
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            color: '#facc15',
            fontSize: '2.45rem',
            fontWeight: '750',
            margin: 0,
            letterSpacing: '0'
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
              color: '#fde68a',
              fontSize: '1.1rem'
            }}>
              Paste your code here:
            </label>
          <textarea
            rows={12}
            style={{
              width: '100%',
              padding: '20px',
              border: '1px solid #2a2a2a',
              borderRadius: '14px',
              fontFamily: 'JetBrains Mono, Consolas, monospace',
              fontSize: '14px',
              resize: 'vertical',
              backgroundColor: '#101010',
              color: '#fde68a',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxSizing: 'border-box',
              minHeight: '300px',
              maxHeight: '600px',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)'
            }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste your code here...
// Example:
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}"
            onFocus={(e) => {
              e.target.style.borderColor = '#facc15';
              e.target.style.boxShadow = '0 0 0 3px rgba(250, 204, 21, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.03)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#2a2a2a';
              e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.03)';
            }}
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
            backgroundColor: mode === 'walkthrough' ? '#2a2410' : '#151515',
            color: '#facc15',
            border: mode === 'walkthrough' ? '1px solid #facc15' : '1px solid #2a2a2a',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
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
            backgroundColor: mode === 'debug' ? '#2a2410' : '#151515',
            color: '#facc15',
            border: mode === 'debug' ? '1px solid #facc15' : '1px solid #2a2a2a',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
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
            backgroundColor: mode === 'refactor' ? '#2a2410' : '#151515',
            color: '#facc15',
            border: mode === 'refactor' ? '1px solid #facc15' : '1px solid #2a2a2a',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
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
              color: '#fde68a',
              fontSize: '1.1rem'
            }}>
              Error message (optional):
            </label>
            <input
              type="text"
              style={{
                width: '100%',
                padding: '15px',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                fontSize: '14px',
                backgroundColor: '#101010',
                color: '#fde68a',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxSizing: 'border-box'
              }}
              value={error}
              onChange={(e) => setError(e.target.value)}
              placeholder="Paste any error messages here..."
              onFocus={(e) => {
                e.target.style.borderColor = '#facc15';
                e.target.style.boxShadow = '0 0 0 3px rgba(250, 204, 21, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2a2a2a';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '18px',
            background: loading ? '#151515' : '#171717',
            color: loading ? '#7c6f36' : '#facc15',
            border: loading ? '1px solid #2a2a2a' : '1px solid #facc15',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            transition: 'all 0.2s ease',
            boxShadow: loading ? 'none' : '0 14px 34px rgba(0, 0, 0, 0.34)',
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
            border: '1px solid #2a2a2a',
            borderRadius: '14px',
            overflow: 'hidden',
            backgroundColor: '#101010',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.28)'
          }}>
            <div style={{
              backgroundColor: '#151515',
              padding: '18px',
              borderBottom: '1px solid #2a2a2a',
              fontWeight: '600',
              color: '#facc15',
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
                    backgroundColor: copied ? '#1f513a' : '#171717',
                    color: copied ? '#bbf7d0' : '#facc15',
                    border: copied ? '1px solid #52a477' : '1px solid #facc15',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
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
              backgroundColor: '#101010'
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
            border: '1px solid #2a2a2a',
            borderRadius: '14px',
            overflow: 'hidden',
            backgroundColor: '#101010',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.28)'
          }}>
            <div style={{
              backgroundColor: '#151515',
              padding: '18px',
              borderBottom: '1px solid #2a2a2a',
              fontWeight: '600',
              color: '#facc15',
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
              backgroundColor: '#101010'
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
              border: '1px solid #2a2a2a',
              borderRadius: '14px',
              overflow: 'hidden',
              backgroundColor: '#101010',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '600px',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.28)'
            }}>
              <div style={{
                backgroundColor: '#151515',
                padding: '18px',
                borderBottom: '1px solid #2a2a2a',
                fontWeight: '600',
                color: '#facc15',
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
                backgroundColor: '#101010'
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
