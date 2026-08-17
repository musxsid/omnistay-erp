const BASE_URL = 'http://localhost:8080';

// Fallback Default Property ID for local testing
export const DEFAULT_PROPERTY_ID = '00000000-0000-0000-0000-000000000001';

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('kc_token') || localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        'X-Property-ID': localStorage.getItem('propertyId') || DEFAULT_PROPERTY_ID,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
};

export default apiFetch;
