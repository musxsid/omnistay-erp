import React, { useState, useEffect } from 'react';
import { apiFetch, DEFAULT_PROPERTY_ID } from '../services/apiClient';

const PosScreen = () => {
    const [menu, setMenu] = useState([
        { itemId: '1', itemName: "Truffle Wagyu Burger", price: 28.00 },
        { itemId: '2', itemName: "Dry-Aged Ribeye Steak", price: 65.00 },
        { itemId: '3', itemName: "Craft Smoked Cocktail", price: 20.00 },
        { itemId: '4', itemName: "Artisanal Cheese Board", price: 22.00 }
    ]);
    const [activeRooms, setActiveRooms] = useState([]);
    const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
    const [order, setOrder] = useState([]);
    
    const [isCharging, setIsCharging] = useState(false);
    const [chargeSuccess, setChargeSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchActiveRooms = async () => {
            try {
                const matrix = await apiFetch('/api/rooms/matrix');
                const occupied = matrix.filter(r => r.status && r.status.toUpperCase() === 'OCCUPIED');
                setActiveRooms(occupied.length > 0 ? occupied : [
                    { roomId: '1', roomNumber: 101, guest: 'John Doe', folioId: 'f1' },
                    { roomId: '2', roomNumber: 102, guest: 'Jane Smith', folioId: 'f2' }
                ]);
            } catch (err) {
                console.warn("Using sample room matrix fallback for POS.");
                setActiveRooms([
                    { roomId: '1', roomNumber: 101, guest: 'John Doe', folioId: 'f1' },
                    { roomId: '2', roomNumber: 102, guest: 'Jane Smith', folioId: 'f2' }
                ]);
            }
        };
        fetchActiveRooms();
    }, []);

    const handleCharge = async () => {
        if (!selectedRoomNumber || order.length === 0) return;
        setIsCharging(true);
        setErrorMessage('');

        const orderTotal = order.reduce((sum, item) => sum + item.price, 0);
        const itemNames = order.map(i => i.itemName).join(', ');

        try {
            const selectedRoom = activeRooms.find(r => String(r.roomNumber) === String(selectedRoomNumber));

            if (selectedRoom && selectedRoom.folioId && selectedRoom.folioId !== 'f1' && selectedRoom.folioId !== 'f2') {
                // Charge directly to backend double-entry ledger
                await apiFetch('/api/v1/ledger/transactions', {
                    method: 'POST',
                    body: JSON.stringify({
                        folioId: selectedRoom.folioId,
                        transactionType: 'DEBIT',
                        departmentCode: 'F_AND_B',
                        description: `Restaurant POS: ${itemNames}`,
                        amount: orderTotal,
                        referenceCode: `POS-${Date.now()}`
                    })
                });
            } else {
                // Charge using POS microservice endpoint
                await apiFetch('/api/v1/pos/charge-to-room', {
                    method: 'POST',
                    body: JSON.stringify({
                        propertyId: DEFAULT_PROPERTY_ID,
                        roomNumber: parseInt(selectedRoomNumber, 10),
                        itemName: itemNames,
                        amount: orderTotal,
                        referenceTicket: `POS-${Date.now()}`,
                        operatorName: "RESTAURANT_POS"
                    })
                });
            }

            setChargeSuccess(true);
            setTimeout(() => {
                setChargeSuccess(false);
                setOrder([]);
                setSelectedRoomNumber('');
            }, 3000);

        } catch (error) {
            console.error("POS Charge Error:", error);
            setErrorMessage(error.message);
        } finally {
            setIsCharging(false);
        }
    };

    const orderTotal = order.reduce((sum, item) => sum + item.price, 0);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', color: '#f8fafc' }}>
            <div>
                <select style={{ width: '100%', padding: '14px', marginBottom: '24px', borderRadius: '8px', background: '#18181b', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1rem' }} 
                        value={selectedRoomNumber}
                        onChange={(e) => setSelectedRoomNumber(e.target.value)}>
                    <option value="" style={{ color: 'black' }}>-- Select Active Guest Room for Folio Charge --</option>
                    {activeRooms.map(room => (
                        <option key={room.roomId || room.roomNumber} value={room.roomNumber} style={{ color: 'black' }}>
                            Room {room.roomNumber} {room.guest ? `- ${room.guest}` : ''}
                        </option>
                    ))}
                </select>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {menu.map(item => (
                        <div key={item.itemId} onClick={() => setOrder([...order, item])} style={{ background: '#18181b', borderRadius: '10px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: '8px', color: '#f8fafc' }}>{item.itemName}</strong>
                            <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '1.1rem' }}>${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ background: '#18181b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.3rem' }}>Active POS Ticket</h3>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)', marginBottom: '16px' }} />
                    
                    <div style={{ minHeight: '200px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                        {order.length === 0 ? (
                            <p style={{ color: '#52525b', textAlign: 'center', marginTop: '40px' }}>Click menu items to add to order.</p>
                        ) : (
                            order.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                                    <span>{item.itemName}</span> 
                                    <span style={{ fontWeight: 600 }}>${item.price.toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '20px' }}>
                        <span>Total:</span>
                        <span style={{ color: '#38bdf8' }}>${orderTotal.toFixed(2)}</span>
                    </div>
                </div>

                <div>
                    {errorMessage && (
                        <div style={{ padding: '10px', marginBottom: '15px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '6px', color: '#fca5a5', fontSize: '0.9rem', textAlign: 'center' }}>
                            {errorMessage}
                        </div>
                    )}

                    {chargeSuccess ? (
                        <div style={{ padding: '15px', textAlign: 'center', background: '#10b981', borderRadius: '8px', color: '#09090b', fontWeight: 'bold' }}>
                            ✔ Charged to Room {selectedRoomNumber} Folio!
                        </div>
                    ) : (
                        <button 
                            style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: (order.length === 0 || !selectedRoomNumber || isCharging) ? 'not-allowed' : 'pointer', opacity: (order.length === 0 || !selectedRoomNumber || isCharging) ? 0.5 : 1 }}
                            disabled={order.length === 0 || !selectedRoomNumber || isCharging}
                            onClick={handleCharge}>
                            {isCharging ? 'Posting to Ledger...' : '⚡ Charge to Room Folio'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PosScreen;