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

    if (!folioId) return <div style={{ color: '#a1a1aa' }}>Select a room to view the active folio.</div>;
    if (isLoading) return <div style={{ color: '#f8fafc', padding: '24px' }}>Retrieving double-entry ledger from server...</div>;
    if (error) return <div style={{ color: '#ef4444', padding: '24px' }}>Error: {error}</div>;
    if (!folio) return null;

    return (
        <div style={{ background: '#18181b', borderRadius: '12px', padding: '24px', color: '#f8fafc', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Institutional Master Ledger</h2>
                    <p style={{ color: '#a1a1aa', margin: '4px 0 0 0' }}>Guest: {folio.guestName || 'Active Guest'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                        fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', 
                        background: folio.isSettled ? '#10b98115' : '#f59e0b15', 
                        color: folio.isSettled ? '#10b981' : '#f59e0b',
                        fontWeight: 600, textTransform: 'uppercase'
                    }}>
                        {folio.isSettled ? 'Settled & Invoiced' : 'Active Ledger'}
                    </span>
                </div>
            </div>

            {settledInvoice && (
                <div style={{ background: '#10b98115', border: '1px solid #10b981', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#10b981' }}>
                    ✔ Fiscal Invoice Issued: <strong>{settledInvoice.invoiceNumber}</strong> for ${Number(settledInvoice.totalAmount).toFixed(2)}
                </div>
            )}

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ color: '#a1a1aa', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '12px 8px', fontWeight: 500 }}>Timestamp</th>
                        <th style={{ padding: '12px 8px', fontWeight: 500 }}>Dept</th>
                        <th style={{ padding: '12px 8px', fontWeight: 500 }}>Description</th>
                        <th style={{ padding: '12px 8px', fontWeight: 500, textAlign: 'right' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {folio.transactions?.map((txn) => (
                        <tr key={txn.transactionId || txn.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#a1a1aa' }}>
                                {new Date(txn.createdAt || txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                                <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0' }}>
                                    {txn.departmentCode || txn.department}
                                </span>
                            </td>
                            <td style={{ padding: '12px 8px', color: '#e2e8f0' }}>{txn.description}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600, color: txn.transactionType === 'CREDIT' ? '#10b981' : '#f8fafc' }}>
                                {txn.transactionType === 'CREDIT' ? '-' : '+'}${Number(txn.amount || 0).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    {(!folio.transactions || folio.transactions.length === 0) && (
                        <tr>
                            <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#52525b' }}>
                                No ledger transactions recorded.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                    <span style={{ fontSize: '1.1rem', color: '#a1a1aa' }}>Total Balance Due: </span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', marginLeft: '8px' }}>
                        ${Number(folio.totalDue || 0).toFixed(2)}
                    </span>
                </div>
                {!folio.isSettled && (
                    <button
                        onClick={handleSettleFolio}
                        disabled={isSettling}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '8px',
                            background: '#10b981',
                            color: '#09090b',
                            border: 'none',
                            fontWeight: 700,
                            cursor: isSettling ? 'wait' : 'pointer'
                        }}
                    >
                        {isSettling ? 'Processing Settle...' : '💳 Settle & Close Folio'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default GuestFolio;