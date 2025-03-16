import React, { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MapProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

// Fix para o ícone do marker no Next.js
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para capturar cliques no mapa
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (coords: { lat: number; lng: number }) => void }) {
  useMapEvent("click", (e) => {
    console.log("Mapa clicado:", e.latlng);
    onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
  });

  return null; // Este componente não renderiza nada, apenas gerencia eventos do mapa
}

export default function Map({ onLocationSelect }: MapProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: -16.6869, lng: -49.2648 }); // Goiânia, GO
  const [showMarker, setShowMarker] = useState(false);

  const handleMapClick = useCallback((coords: { lat: number; lng: number }) => {
    console.log("Localização selecionada:", coords);
    setPosition(coords);
    setShowMarker(true);
    onLocationSelect(coords);
  }, [onLocationSelect]);

  return (
    <div className="w-full h-64 rounded-md overflow-hidden border border-gray-300 relative">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onLocationSelect={handleMapClick} />
        {showMarker && <Marker position={[position.lat, position.lng]} icon={markerIcon} />}
      </MapContainer>
      
      {/* Debug Info */}
      <div className="absolute bottom-0 left-0 bg-white bg-opacity-70 p-2 text-black text-xs z-[1000]">
        {showMarker ? `Selecionado: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : "Clique no mapa para selecionar um local"}
      </div>
    </div>
  );
}
