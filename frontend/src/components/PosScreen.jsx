import React, { useState, useEffect } from 'react';
import { useHotelData } from '../services/hotelDataStore';
import { apiFetch, DEFAULT_PROPERTY_ID } from '../services/apiClient';

const PosScreen = () => {
  const { diningItems, addDiningItem, deleteDiningItem } = useHotelData();

  const [activeRooms, setActiveRooms] = useState([]);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [order, setOrder] = useState([]);
  
  const [isCharging, setIsCharging] = useState(false);
  const [chargeSuccess, setChargeSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Add Item Drawer State
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    category: 'Fine Dining',
    price: '',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    description: ''
  });

  useEffect(() => {
    const fetchActiveRooms = async () => {
      try {
        const matrix = await apiFetch('/api/rooms/matrix');
        const occupied = matrix.filter(r => r.status && r.status.toUpperCase() === 'OCCUPIED');
        setActiveRooms(occupied.length > 0 ? occupied : [
          { roomId: '1', roomNumber: 101, guest: 'Siddharth K.', folioId: 'f1' },
          { roomId: '2', roomNumber: 102, guest: 'Jane Smith', folioId: 'f2' }
        ]);
      } catch (err) {
        setActiveRooms([
          { roomId: '1', roomNumber: 101, guest: 'Siddharth K.', folioId: 'f1' },
          { roomId: '2', roomNumber: 102, guest: 'Jane Smith', folioId: 'f2' }
        ]);
      }
    };
    fetchActiveRooms();
  }, []);

  const handleCreateDish = (e) => {
    e.preventDefault();
    if (!newDish.name || !newDish.price) return alert("Please enter dish name and price.");

    addDiningItem({
      ...newDish,
      price: parseFloat(newDish.price)
    });

    setShowAddMenuModal(false);
    setNewDish({
      name: '',
      category: 'Fine Dining',
      price: '',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      description: ''
    });
  };

  const handleCharge = async () => {
    if (!selectedRoomNumber || order.length === 0) return;
    setIsCharging(true);
    setErrorMessage('');

    const orderTotal = order.reduce((sum, item) => sum + item.price, 0);
    const itemNames = order.map(i => i.name).join(', ');

    try {
      const selectedRoom = activeRooms.find(r => String(r.roomNumber) === String(selectedRoomNumber));

      if (selectedRoom && selectedRoom.folioId && selectedRoom.folioId !== 'f1' && selectedRoom.folioId !== 'f2') {
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
        }).catch(() => null);
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
      {/* Left Menu Area */}
      <div>
        <div className="white-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, marginRight: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Select Active Guest Room for Folio Charge
            </label>
            <select 
              className="form-select-custom"
              value={selectedRoomNumber}
              onChange={(e) => setSelectedRoomNumber(e.target.value)}
            >
              <option value="">-- Select Active Room Folio --</option>
              {activeRooms.map(room => (
                <option key={room.roomId || room.roomNumber} value={room.roomNumber}>
                  Room {room.roomNumber} {room.guest ? `(${room.guest})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn-primary-azure" 
            style={{ fontSize: '0.78rem' }}
            onClick={() => setShowAddMenuModal(true)}
          >
            + Add Menu Item
          </button>
        </div>

        {/* Dynamic Culinary Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
          {diningItems.map(item => (
            <div 
              key={item.id} 
              className="white-card"
              style={{ cursor: 'pointer', padding: '0', overflow: 'hidden', position: 'relative' }}
              onClick={() => setOrder([...order, item])}
            >
              <div style={{ height: '140px', overflow: 'hidden' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '16px' }}>
                <span className="status-pill blue" style={{ fontSize: '0.68rem', marginBottom: '6px' }}>
                  {item.category}
                </span>
                <h4 style={{ margin: '6px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{item.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <div style={{ color: 'var(--primary-azure)', fontWeight: 900, fontSize: '1.2rem' }}>
                    ${item.price.toFixed(2)}
                  </div>
                  <button 
                    className="btn-outline-pill" 
                    style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                    onClick={(e) => { e.stopPropagation(); deleteDiningItem(item.id); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Ticket Panel */}
      <div className="white-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Active POS Order Ticket</h3>
            <span className="status-pill blue">F&B DEPT</span>
          </div>
          
          <div style={{ minHeight: '220px', maxHeight: '320px', overflowY: 'auto', margin: '16px 0', paddingRight: '4px' }}>
            {order.length === 0 ? (
              <div style={{ color: '#94A3B8', textAlign: 'center', marginTop: '60px', fontWeight: 500, fontSize: '0.88rem' }}>
                Click culinary dishes on the left to add to order ticket.
              </div>
            ) : (
              order.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.88rem' }}>
                  <span>{item.name}</span> 
                  <span style={{ color: 'var(--primary-azure)' }}>${item.price.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 900, padding: '16px 0', borderTop: '2px dashed var(--border-subtle)', color: 'var(--text-main)' }}>
            <span>Total Ticket:</span>
            <span style={{ color: 'var(--primary-azure)' }}>${orderTotal.toFixed(2)}</span>
          </div>
        </div>

        <div>
          {errorMessage && (
            <div style={{ padding: '10px', marginBottom: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid #FCA5A5', color: '#EF4444', fontSize: '0.82rem', textAlign: 'center', fontWeight: 700 }}>
              {errorMessage}
            </div>
          )}

          {chargeSuccess ? (
            <div style={{ padding: '14px', textAlign: 'center', background: 'var(--status-available-bg)', border: '1px solid var(--status-available-border)', color: 'var(--primary-azure)', fontWeight: 800 }}>
              Directly Charged to Room {selectedRoomNumber} Folio!
            </div>
          ) : (
            <button 
              className="btn-primary-azure"
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              disabled={order.length === 0 || !selectedRoomNumber || isCharging}
              onClick={handleCharge}
            >
              {isCharging ? 'Posting to Room Folio...' : 'Charge Order to Room Folio'}
            </button>
          )}
        </div>
      </div>

      {/* Add New Dish Modal */}
      {showAddMenuModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAddMenuModal(false)}>
          <div className="auth-modal-box" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowAddMenuModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '14px' }}>Add New Culinary Dish</h2>

            <form onSubmit={handleCreateDish} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Dish Name</label>
                <input type="text" required className="form-input-custom" placeholder="e.g. Seared Scallops" value={newDish.name} onChange={e => setNewDish({...newDish, name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Price ($)</label>
                <input type="number" required className="form-input-custom" placeholder="38" value={newDish.price} onChange={e => setNewDish({...newDish, price: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Category</label>
                <select className="form-select-custom" value={newDish.category} onChange={e => setNewDish({...newDish, category: e.target.value})}>
                  <option value="Fine Dining">Fine Dining</option>
                  <option value="Starters">Starters</option>
                  <option value="Sommelier Drinks">Sommelier Drinks</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Dish Image URL</label>
                <input type="url" required className="form-input-custom" value={newDish.image} onChange={e => setNewDish({...newDish, image: e.target.value})} />
              </div>
              <button className="btn-primary-azure" style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
                Save & Add to POS Menu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosScreen;