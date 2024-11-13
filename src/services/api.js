import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const sendCoordinates = async (lat, lng) => {
    try {
        const response = await axios.post(`${API_URL}/coordinates`, {
            latitude: lat,
            longitude: lng
        });
        return response.data;
    } catch (error) {
        console.error("Error sending coordinates:", error);
    }
};
