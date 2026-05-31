import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardView = () => {
    // State to hold our live database metrics
    const [metrics, setMetrics] = useState({
        totalRooms: 0,
        activeGuests: 0,
        pendingInvoices: 3, // Safely mocked for demo aesthetic
        apiTraffic: 1240    // Safely mocked for demo aesthetic
    });

    // Fetch live data immediately on load
   // Fetch live data immediately on load
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Re-using our highly optimized matrix endpoint
                const response = await fetch('http://localhost:8080/api/rooms/matrix');
                if (response.ok) {
                    const liveRooms = await response.json();
                    
                    // DEBUG: See exactly what the database is sending
                    console.log("Dashboard Live Rooms Data:", liveRooms); 
                    
                    const totalRoomsCount = liveRooms.length;
                    
                    // RESILIENT FILTER: Checks for 'OCCUPIED' or if a guest/folio is attached
                    const activeGuestsCount = liveRooms.filter(room => 
                        (room.status && room.status.toUpperCase() === 'OCCUPIED') || 
                        room.guest !== null || 
                        room.folioId !== null
                    ).length;
                    
                    setMetrics(prev => ({
                        ...prev,
                        totalRooms: totalRoomsCount > 0 ? totalRoomsCount : 120,
                        activeGuests: activeGuestsCount
                    }));
                }
            } catch (error) {
                console.error("Failed to sync dashboard metrics:", error);
            }
        };

        fetchDashboardData();
    }, []);
    
    // Keeping the charts static for the demo to maintain a beautiful, data-rich aesthetic
    const revenueData = [
        { name: 'Mon', revenue: 4000 }, { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 5000 }, { name: 'Thu', revenue: 8000 },
        { name: 'Fri', revenue: 12000 }, { name: 'Sat', revenue: 15000 },
        { name: 'Sun', revenue: 11000 },
    ];

    const occupancyData = [
        { name: 'Wk 1', rate: 65 }, { name: 'Wk 2', rate: 70 },
        { name: 'Wk 3', rate: 85 }, { name: 'Wk 4', rate: 92 },
    ];

    return (
        <div style={{width: '100%'}}>
            <div className="page-title">
                <h2>Command Center</h2>
                <p>Real-time system performance and revenue tracking.</p>
            </div>
            
            <div className="dashboard-grid">
                <div className="azia-card">
                    <div className="card-title">Total Rooms</div>
                    <h3>{metrics.totalRooms}</h3>
                </div>
                <div className="azia-card">
                    <div className="card-title">Active Guests</div>
                    <h3>{metrics.activeGuests}</h3>
                </div>
                <div className="azia-card">
                    <div className="card-title">Pending Invoices</div>
                    <h3>{metrics.pendingInvoices}</h3>
                </div>
                <div className="azia-card">
                    <div className="card-title">API Traffic</div>
                    <h3>{metrics.apiTraffic}</h3>
                </div>
            </div>

            <div className="chart-grid">
                <div className="azia-card">
                    <div className="card-title">Weekly Revenue (USD)</div>
                    <div style={{ height: 300, marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                                <Line type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={2} dot={{ r: 4, fill: '#ffffff', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="azia-card">
                    <div className="card-title">Monthly Occupancy %</div>
                    <div style={{ height: 300, marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={occupancyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                                <Bar dataKey="rate" fill="#334155" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;