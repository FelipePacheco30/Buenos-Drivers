import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import driverIconImg from "../../../assets/icons/driver.png";
import userIconImg from "../../../assets/icons/arg.mark.png";

/* 🇦🇷 Limites da Argentina */
const ARGENTINA_BOUNDS = [
  [-55.0, -73.5],
  [-21.5, -53.5],
];

/* 📍 Buenos Aires */
const DRIVER_POSITION = [-34.6083, -58.3712];
const USER_POSITION = [-34.6037, -58.3816];

/* 🚗 Ícone do motorista */
const driverIcon = new L.Icon({
  iconUrl: driverIconImg,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
});

/* 📌 Ícone do usuário */
const userIcon = new L.Icon({
  iconUrl: userIconImg,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function DriverMap() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={DRIVER_POSITION}
        zoom={15}
        minZoom={6}
        maxZoom={18}
        maxBounds={ARGENTINA_BOUNDS}
        maxBoundsViscosity={1}
        zoomControl={false}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        {/* 🗺️ Mapa clean estilo Uber */}
        <TileLayer
          attribution="&copy; CartoDB"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* 🚗 Motorista */}
        <Marker position={DRIVER_POSITION} icon={driverIcon} />

        {/* 📍 Usuário */}
        <Marker position={USER_POSITION} icon={userIcon} />

        {/* 🔍 Zoom longe da sidebar */}
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}
