import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [rooms, setRooms] = useState([]);
    const [guests, setGuests] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [metrics, setMetrics] = useState({ totalCount: 0 });

    const fetchEnterpriseData = async () => {
        try {
            // Fetching directly from your EnterpriseController.java endpoints
            const roomRes = await fetch('http://localhost:8080/api/v1/enterprise/rooms');
            if (roomRes.ok) setRooms(await roomRes.json());

            const guestRes = await fetch('http://localhost:8080/api/v1/enterprise/guests');
            if (guestRes.ok) setGuests(await guestRes.json());

            const invoiceRes = await fetch('http://localhost:8080/api/v1/enterprise/invoices');
            if (invoiceRes.ok) setInvoices(await invoiceRes.json());

            const metricRes = await fetch('http://localhost:8080/api/v1/enterprise/telemetry');
            if (metricRes.ok) {
                const logs = await metricRes.json();
                setMetrics({ totalCount: logs.length });
            }
        } catch (error) {
            console.error("Backend connection failed. Is Spring Boot running?", error);
        }
    };

    // Auto-fetch when the app loads
    useEffect(() => {
        fetchEnterpriseData();
    }, []);

    return (
        <DataContext.Provider value={{ rooms, guests, invoices, metrics, fetchEnterpriseData }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);