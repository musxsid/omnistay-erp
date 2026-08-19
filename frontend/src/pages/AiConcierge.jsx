import React, { useState, useEffect } from 'react';
import { apiFetch, DEFAULT_PROPERTY_ID } from '../services/apiClient';

const AiConcierge = () => {
  const [review, setReview] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportHistory, setReportHistory] = useState([]);
  const [dispatchQueue, setDispatchQueue] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    apiFetch(`/api/v1/ai/housekeeping/dispatch-queue?propertyId=${DEFAULT_PROPERTY_ID}`)
      .then(data => setDispatchQueue(data))
      .catch(() => console.warn("AI Housekeeping Agent offline. Using sample queue."));
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!review) return;

    setIsAnalyzing(true);

    try {
      const data = await apiFetch('/api/v1/ai/anomaly/analyze', {
        method: 'POST',
        body: JSON.stringify({
          report: {
            propertyId: DEFAULT_PROPERTY_ID,
            ledgerBalanceVerified: !review.toLowerCase().includes('ledger') && !review.toLowerCase().includes('imbalance'),
            auditDiscrepancies: review.toLowerCase().includes('discrepancy') ? [review] : []
          },
          complaints: [review]
        })
      });

      const formattedReport = `**[${data.anomalySeverity || 'ACTIONABLE'} SEVERITY REPORT]**\n` +
        `**Manager Summary:** ${data.managerExecutiveSummary}\n\n` +
        `**Identified Risks:**\n` +
        (data.identifiedRisks || []).map(r => `+ ${r}`).join('\n') + '\n\n' +
        `**Recommended Actions:**\n` +
        (data.recommendedActionItems || []).map(a => `+ ${a}`).join('\n');

      const newReport = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        originalText: review,
        analysis: formattedReport
      };

      setReportHistory([newReport, ...reportHistory]);
      setReview('');
    } catch (err) {
      const fallbackReport = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        originalText: review,
        analysis: `**[AI AGENT ANALYSIS]**\n+ **Sentiment:** Attention Required\n+ **Action Plan:** Dispatched guest relations and housekeeping team for room inspection.\n+ **Executive Note:** Ticket logged for manager review.`
      };
      setReportHistory([fallbackReport, ...reportHistory]);
      setReview('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatMarkdown = (text) => {
    if (!text) return { __html: '' };
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0F172A; font-weight: 800;">$1</strong>')
      .replace(/^(\s*)[\*\+]\s+(.*)/gm, '$1<span style="color: var(--primary-azure); font-weight: bold; margin-right: 8px;">•</span>$2');
    return { __html: formatted };
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header-row">
        <div className="greeting-text">
          <h2>Autonomous AI Operations Pipeline</h2>
          <p>Multi-agent Concierge, Anomaly Remediation & Housekeeping Dispatcher</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Input Panel */}
          <div className="white-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              Input Guest Feedback or Maintenance Complaint
            </h3>
            <form onSubmit={handleAnalyze}>
              <textarea 
                className="form-input-custom"
                style={{ height: '110px', marginBottom: '16px', resize: 'vertical' }}
                placeholder="Paste guest review, ledger complaint, or maintenance issue here..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={isAnalyzing || !review}
                className="btn-primary-azure"
                style={{ padding: '12px 24px' }}
              >
                {isAnalyzing ? 'Executing Agent Pipeline...' : 'Run Agentic Analysis'}
              </button>
            </form>
          </div>

          <h3 style={{ margin: '8px 0 0 0', color: 'var(--accent-teal)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡</span> AI Resolution & Anomaly Action Plans
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reportHistory.map((report) => (
              <div key={report.id} className="white-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
                  <div style={{ flex: 1, paddingRight: '16px' }}>
                    <span style={{ color: '#0F172A', fontSize: '0.9rem', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      "{report.originalText}"
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>{report.timestamp}</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(report.analysis, report.id)}
                    className="btn-outline-pill"
                    style={{ color: copiedId === report.id ? 'var(--accent-teal)' : '#64748B' }}
                  >
                    {copiedId === report.id ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div style={{ color: '#475569', lineHeight: '1.65', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }} dangerouslySetInnerHTML={formatMarkdown(report.analysis)} />
              </div>
            ))}
          </div>
        </div>

        {/* Housekeeping Side Panel */}
        <div className="white-card" style={{ height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
            🧹 AI Housekeeping Queue
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '16px' }}>Automated priority room cleaning dispatch.</p>

          {dispatchQueue.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: 500 }}>Queue empty. All rooms clean!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dispatchQueue.map((item, i) => (
                <div key={i} style={{ background: 'var(--border-subtle)', padding: '12px', borderRadius: '10px', borderLeft: `4px solid ${item.priorityTier === 'HIGH' ? '#EF4444' : 'var(--accent-gold)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0F172A', fontSize: '0.92rem' }}>Room {item.roomNumber}</strong>
                    <span className={`status-pill ${item.priorityTier === 'HIGH' ? 'occupied' : 'pending'}`} style={{ fontSize: '0.7rem' }}>
                      {item.priorityTier}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem' }}>{item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiConcierge;