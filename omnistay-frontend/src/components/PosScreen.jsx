import React, { useState, useEffect } from 'react';

const PosScreen = () => {
    const [menu, setMenu] = useState([]);
    const [activeRooms, setActiveRooms] = useState([]); 
    const [selectedFolioId, setSelectedFolioId] = useState('');
    const [order, setOrder] = useState([]);
    
    const [isCharging, setIsCharging] = useState(false);
    const [chargeSuccess, setChargeSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:8080/api/v1/restaurant/menu').catch(() => null),
            fetch('http://localhost:8080/api/rooms/matrix').catch(() => null)
        ]).then(async ([menuRes, matrixRes]) => {
            
            if (!menuRes || !menuRes.ok) {
                setMenu([
                    { itemId: 'uuid-1', itemName: "Truffle Burger", price: 24.00 },
                    { itemId: 'uuid-2', itemName: "Ribeye Steak", price: 55.00 },
                    { itemId: 'uuid-3', itemName: "Craft Old Fashioned", price: 18.00 },
                ]);
            } else {
                setMenu(await menuRes.json());
            }

            if (matrixRes && matrixRes.ok) {
                const allRooms = await matrixRes.json();
                // FIXED: Enforced case-insensitive string check to correctly read "OCCUPIED" from database data mappings
                const occupiedRooms = allRooms.filter(room => room.status && room.status.toUpperCase() === 'OCCUPIED' && room.folioId);
                setActiveRooms(occupiedRooms);
            } else {
                console.error("Failed to fetch live guests from matrix.");
            }
        });
    }, []);

    const handleCharge = async () => {
        setIsCharging(true);
        setErrorMessage('');

        try {
            const itemIds = order.map(item => item.id || item.itemId);

            const payload = {
                folioId: selectedFolioId,
                itemIds: itemIds
            };

            const response = await fetch('http://localhost:8080/api/v1/restaurant/charge-to-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to charge to room');
            }

            setChargeSuccess(true);
            setTimeout(() => {
                setChargeSuccess(false);
                setOrder([]);
                setSelectedFolioId('');
            }, 3000);

        } catch (error) {
            console.error("Transaction Error:", error);
            setErrorMessage(error.message);
        } finally {
            setIsCharging(false);
        }
    };

    const orderTotal = order.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="pos-layout">
            <div>
                <select style={{width: '100%', padding: '14px', marginBottom: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1rem'}} 
                        value={selectedFolioId}
                        onChange={(e) => setSelectedFolioId(e.target.value)}>
                    <option value="" style={{color: 'black'}}>-- Select Active Guest Room --</option>
                    {activeRooms.map(room => (
                        <option key={room.id || room.roomId} value={room.folioId} style={{color: 'black'}}>
                            Room {room.roomNumber} - {room.guest || "Active Guest"}
                        </option>
                    ))}
                </select>

                <div className="menu-grid">
                    {menu.map(item => (
                        <div key={item.id || item.itemId} className="menu-item-btn" onClick={() => setOrder([...order, item])}>
                            <strong>{item.itemName}</strong>
                            <span>${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ticket-panel">
                <h3 style={{margin: '0 0 15px 0', color: 'white'}}>Active Ticket</h3>
                <hr style={{borderColor: 'rgba(255,255,255,0.1)', marginBottom: '15px'}} />
                
                <div style={{minHeight: '250px', maxHeight: '350px', overflowY: 'auto', marginBottom: '20px'}}>
                    {order.length === 0 ? (
                        <p style={{color: '#64748b', textAlign: 'center', marginTop: '40px'}}>No items added.</p>
                    ) : (
                        order.map((item, i) => (
                            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0'}}>
                                <span>{item.itemName}</span> 
                                <span style={{fontWeight: 600}}>${item.price.toFixed(2)}</span>
                            </div>
                        ))
                    )}
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: 'white'}}>
                    <span>Total:</span>
                    <span>${orderTotal.toFixed(2)}</span>
                </div>
                
                {errorMessage && (
                    <div style={{ padding: '10px', marginBottom: '15px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '6px', color: '#fca5a5', fontSize: '0.9rem', textAlign: 'center' }}>
                        {errorMessage}
                    </div>
                )}

                {chargeSuccess ? (
                    <div style={{ padding: '15px', textAlign: 'center', background: '#059669', borderRadius: '8px', color: 'white', fontWeight: 'bold' }}>
                        Successfully Charged to Room!
                    </div>
                ) : (
                    <button className="apple-btn massive-btn" 
                            style={{background: '#3b82f6', color: 'white', opacity: (order.length === 0 || !selectedFolioId || isCharging) ? 0.5 : 1}}
                            disabled={order.length === 0 || !selectedFolioId || isCharging}
                            onClick={handleCharge}>
                        {isCharging ? 'Processing...' : 'Charge to Room Folio'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PosScreen;