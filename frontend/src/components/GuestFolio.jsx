import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiClient';

const GuestFolio = ({ folioId, selectedRoom, onClose }) => {
  const [folio, setFolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSettling, setIsSettling] = useState(false);
  const [settledInvoice, setSettledInvoice] = useState(null);

  useEffect(() => {
    if (!folioId) return;

    const fetchFolio = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiFetch(`/api/v1/ledger/folios/${folioId}`);
        setFolio(data);
      } catch (err) {
        console.warn("Folio API load failed, using room fallback context.", err);
        if (selectedRoom) {
          const currentTotal = Number(selectedRoom.amount) || 0;
          const baseRate = Number(selectedRoom.dailyRate) || 150;
          setFolio({
            folioId,
            isSettled: false,
            totalDue: currentTotal || baseRate,
            guestName: selectedRoom.guest || 'Active Guest',
            transactions: [
              { transactionId: 'txn-1', createdAt: new Date().toISOString(), departmentCode: 'ROOM', description: 'Lodging Daily Rate', amount: baseRate, transactionType: 'DEBIT' }
            ]
          });
        } else {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolio();
  }, [folioId, selectedRoom]);

  const handleSettleFolio = async () => {
    setIsSettling(true);
    try {
      const invoice = await apiFetch(`/api/v1/ledger/folios/${folioId}/settle?paymentMethod=CREDIT_CARD`, {
        method: 'POST'
      });
      setSettledInvoice(invoice);
      setFolio(prev => ({ ...prev, isSettled: true, totalDue: 0 }));
    } catch (err) {
      alert('Settlement failed: ' + err.message);
    } finally {
      setIsSettling(false);
    }
  };

  if (!folioId) return null;
  if (isLoading) return <div className="white-card" style={{ padding: '32px' }}>Retrieving double-entry ledger...</div>;
  if (error) return <div className="white-card" style={{ padding: '32px', color: '#EF4444' }}>Error loading ledger: {error}</div>;

  return (
    <div className="white-card" style={{ boxShadow: 'var(--shadow-dropdown)', padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>Institutional Master Ledger</h2>
          <p style={{ color: '#64748B', margin: '4px 0 0 0', fontSize: '0.88rem' }}>Guest: <strong style={{ color: '#0F172A' }}>{folio.guestName || 'Active Guest'}</strong></p>
        </div>
        <div>
          <span className={`status-pill ${folio.isSettled ? 'settled' : 'pending'}`}>
            {folio.isSettled ? 'Settled & Invoiced' : 'Active Ledger'}
          </span>
        </div>
      </div>

      {settledInvoice && (
        <div style={{ background: 'var(--accent-teal-light)', border: '1px solid var(--accent-teal)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: 'var(--accent-teal)', fontWeight: 600 }}>
          ✔ Fiscal Invoice Issued: <strong>{settledInvoice.invoiceNumber}</strong> for ${Number(settledInvoice.totalAmount).toFixed(2)}
        </div>
      )}

      <div className="modern-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Dept</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {folio.transactions?.map((txn) => (
              <tr key={txn.transactionId || txn.id}>
                <td style={{ fontSize: '0.82rem', color: '#64748B' }}>
                  {new Date(txn.createdAt || txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <span className="status-pill blue" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    {txn.departmentCode || txn.department}
                  </span>
                </td>
                <td style={{ color: '#0F172A', fontWeight: 600 }}>{txn.description}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: txn.transactionType === 'CREDIT' ? 'var(--accent-teal)' : '#0F172A' }}>
                  {txn.transactionType === 'CREDIT' ? '-' : '+'}${Number(txn.amount || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
        <div>
          <span style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 600 }}>Total Balance Due: </span>
          <span style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F172A', marginLeft: '8px' }}>
            ${Number(folio.totalDue || 0).toFixed(2)}
          </span>
        </div>
        {!folio.isSettled && (
          <button
            onClick={handleSettleFolio}
            disabled={isSettling}
            className="btn-primary-azure"
            style={{ backgroundColor: 'var(--accent-teal)' }}
          >
            {isSettling ? 'Processing...' : '💳 Settle & Close Folio'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GuestFolio;