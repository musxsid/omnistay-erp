import React, { useState } from 'react';

const AiConcierge = () => {
    const [review, setReview] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [reportHistory, setReportHistory] = useState([]);
    
    // NEW: State to track which report was just copied
    const [copiedId, setCopiedId] = useState(null);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!review) return;

        setIsAnalyzing(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/v1/ai/analyze-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review: review })
            });

            if (!response.ok) throw new Error('AI Gateway communication failed.');

            const data = await response.json();
            if (data.status === 'SUCCESS') {
                const newReport = {
                    id: Date.now(),
                    timestamp: new Date().toLocaleString(),
                    originalText: review,
                    analysis: data.aiAnalysisReport
                };
                setReportHistory([newReport, ...reportHistory]);
                setReview(''); 
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // NEW: Copy to Clipboard handler
    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000); // Reset button after 2 seconds
    };

    // NEW: Native, lightweight Markdown-to-HTML parser for Llama outputs
    const formatMarkdown = (text) => {
        if (!text) return { __html: '' };
        let formatted = text
            // Replace **bold** with actual HTML <strong> tags
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f8fafc; font-weight: 700;">$1</strong>')
            // Replace generic Llama bullets (+ or *) with clean dot bullets
            .replace(/^(\s*)[\*\+]\s+(.*)/gm, '$1<span style="color: #38bdf8; font-weight: bold; margin-right: 8px;">•</span>$2');
            
        return { __html: formatted };
    };

    return (
        <div style={{ width: '100%', color: '#f8fafc' }}>
            <div className="page-title" style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600 }}>AI Concierge Operations</h2>
                <p style={{ color: '#a1a1aa', margin: '8px 0 0 0' }}>Powered by Llama-3.1-8b for automated guest sentiment resolution.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Input Panel */}
                <div style={{ background: '#18181b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#e2e8f0' }}>Input Guest Feedback</h3>
                    <form onSubmit={handleAnalyze}>
                        <textarea 
                            style={{ 
                                width: '100%', height: '100px', padding: '12px', borderRadius: '8px', 
                                background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', 
                                fontSize: '1rem', marginBottom: '16px', resize: 'vertical', fontFamily: 'inherit'
                            }}
                            placeholder="Paste guest review or maintenance complaint here..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={isAnalyzing || !review}
                            style={{ 
                                width: '200px', padding: '12px', borderRadius: '8px', background: '#3b82f6', color: 'white', 
                                border: 'none', fontWeight: 600, cursor: (isAnalyzing || !review) ? 'not-allowed' : 'pointer',
                                opacity: (isAnalyzing || !review) ? 0.6 : 1, transition: 'all 0.2s'
                            }}
                        >
                            {isAnalyzing ? 'Processing via Groq API...' : 'Run Analysis'}
                        </button>
                    </form>
                    {error && <p style={{ color: '#ef4444', marginTop: '16px', fontSize: '0.9rem' }}>{error}</p>}
                </div>

                {/* AI History Log */}
                <h3 style={{ margin: '10px 0 0 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚡</span> Generated Analysis Reports
                </h3>
                
                {reportHistory.length === 0 && !isAnalyzing && (
                    <div style={{ color: '#52525b', textAlign: 'center', padding: '40px', background: '#18181b', borderRadius: '12px' }}>
                        No reports generated yet.
                    </div>
                )}

                {isAnalyzing && (
                    <div style={{ padding: '24px', background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '80%', animation: 'pulse 1.5s infinite' }}></div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', width: '60%', animation: 'pulse 1.5s infinite delay-100' }}></div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reportHistory.map((report) => (
                        <div key={report.id} style={{ background: '#18181b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            
                            {/* Header Section with Copy Button */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                                <div style={{ flex: 1, paddingRight: '20px' }}>
                                    <span style={{ color: '#a1a1aa', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
                                        <strong>Input:</strong> "{report.originalText}"
                                    </span>
                                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{report.timestamp}</span>
                                </div>
                                
                                {/* COPY BUTTON */}
                                <button 
                                    onClick={() => handleCopy(report.analysis, report.id)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: copiedId === report.id ? '#10b981' : '#cbd5e1', 
                                        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
                                        transition: 'all 0.2s', minWidth: '85px', justifyContent: 'center'
                                    }}
                                >
                                    {copiedId === report.id ? (
                                        <><span>✓</span> Copied</>
                                    ) : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg> 
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {/* Rendered Markdown Output */}
                            <div 
                                style={{ color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap' }} 
                                dangerouslySetInnerHTML={formatMarkdown(report.analysis)} 
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AiConcierge;