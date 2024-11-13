import React from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { sendCoordinates } from '../services/api';

const MapComponent = () => {
    // Функція для обробки кліків на карті
    const MapClickHandler = () => {
        useMapEvents({
            click: async (event) => {
                const { lat, lng } = event.latlng;
                console.log(`Координати: ${lat}, ${lng}`);
                await sendCoordinates(lat, lng);
            },
        });
        return null;
    };

    return (
        <MapContainer center={[50.4501, 30.5234]} zoom={12} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
        </MapContainer>
    );
};

export default MapComponent;
