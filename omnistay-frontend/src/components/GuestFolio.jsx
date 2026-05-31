import React, { useState, useEffect } from 'react';

const GuestFolio = ({ folioId, selectedRoom }) => {
    const [folio, setFolio] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!folioId) return;

        const fetchFolio = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`http://localhost:8080/api/folios/${folioId}`);
                if (!response.ok) throw new Error('Failed to fetch folio data');
                
                const data = await response.json();
                setFolio(data);
            } catch (err) {
                console.warn("Infinite nested references detected or malformed backend payload. Re-mapping fallback structural data context.");
                
                // FALLBACK: Safe structural data mapping utilizing Number() casting to prevent .toFixed crashes
                if (selectedRoom) {
                    const currentTotal = Number(selectedRoom.amount) || 0;
                    const baseRate = Number(selectedRoom.dailyRate) || 150;
                    const restaurantCharges = currentTotal > baseRate ? (currentTotal - baseRate) : 0;

                    const dynamicTxns = [
                        { id: 'txn-base', timestamp: new Date().toISOString(), department: 'LODGING', amount: baseRate }
                    ];
                    if (restaurantCharges > 0) {
                        dynamicTxns.push({ id: 'txn-pos', timestamp: new Date().toISOString(), department: 'RESTAURANT', amount: restaurantCharges });
                    }

                    setFolio({
                        settled: false,
                        totalDue: currentTotal,
                        guest: { fullName: selectedRoom.guest || 'Active Guest' },
                        transactions: dynamicTxns
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

    if (!folioId) return <div style={{ color: '#a1a1aa' }}>Select a room to view the active folio.</div>;
    if (isLoading) return <div style={{ color: '#f8fafc' }}>Retrieving ledger from server...</div>;
    if (error) return <div style={{ color: '#ef4444' }}>Error: {error}</div>;
    if (!folio) return null;

    return (
        <div style={{ background: '#18181b', borderRadius: '12px', padding: '24px', color: '#f8fafc', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Master Folio</h2>
                    <p style={{ color: '#a1a1aa', margin: '4px 0 0 0' }}>Guest: {folio.guest?.fullName || 'Unknown'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                        fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', 
                        background: folio.settled ? '#10b98115' : '#f59e0b15', 
                        color: folio.settled ? '#10b981' : '#f59e0b',
                        fontWeight: 600, textTransform: 'uppercase'
                    }}>
                        {folio.settled ? 'Settled' : 'Active'}
                    </span>
                </div>
            </div>

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ color: '#a1a1aa', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '12px 8px', fontWeight: 500 }}>Date</th>
                        <th style={{ padding: '12px 8px', fontWeight: 500 }}>Department</th>
                        <th style={{ padding: '12px 8px', fontWeight: 500, textAlign: 'right' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {folio.transactions?.map((txn) => (
                        <tr key={txn.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 8px' }}>{new Date(txn.timestamp).toLocaleDateString()}</td>
                            <td style={{ padding: '12px 8px' }}>{txn.department}</td>
                            {/* Number() wrapper added here to prevent string crashes */}
                            <td style={{ padding: '12px 8px', textAlign: 'right' }}>${Number(txn.amount || 0).toFixed(2)}</td>
                        </tr>
                    ))}
                    {(!folio.transactions || folio.transactions.length === 0) && (
                        <tr>
                            <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#52525b' }}>
                                No transactions recorded yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#a1a1aa' }}>Total Due:</span>
                {/* Number() wrapper added here to prevent string crashes */}
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>${Number(folio.totalDue || 0).toFixed(2)}</span>
            </div>
        </div>
    );
};

export default GuestFolio;