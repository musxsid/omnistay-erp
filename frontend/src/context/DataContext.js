import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, DEFAULT_PROPERTY_ID } from '../services/apiClient';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [rooms, setRooms] = useState([]);
    const [guests, setGuests] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [properties, setProperties] = useState([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState(DEFAULT_PROPERTY_ID);
    const [isLoading, setIsLoading] = useState(false);

    const fetchEnterpriseData = async () => {
        setIsLoading(true);
        try {
            // Fetch live room matrix
            const roomData = await apiFetch('/api/rooms/matrix').catch(() => []);
            setRooms(roomData);

            // Fetch live properties
            const propData = await apiFetch('/api/v1/properties').catch(() => []);
            setProperties(propData);
            if (propData.length > 0 && !selectedPropertyId) {
                setSelectedPropertyId(propData[0].propertyId);
            }

            // Fetch live reservations for property
            if (selectedPropertyId) {
                const resData = await apiFetch(`/api/v1/reservations/property/${selectedPropertyId}`).catch(() => []);
                setReservations(resData);
            }
        } catch (error) {
            console.error("Backend synchronization error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEnterpriseData();
    }, [selectedPropertyId]);

    return (
        <DataContext.Provider value={{
            rooms,
            setRooms,
            guests,
            reservations,
            properties,
            selectedPropertyId,
            setSelectedPropertyId,
            isLoading,
            fetchEnterpriseData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);