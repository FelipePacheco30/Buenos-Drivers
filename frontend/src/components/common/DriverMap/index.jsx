import React, { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import driverIconImg from "../../../assets/icons/driver.png";
import userIconImg from "../../../assets/icons/arg.mark.png";
import destinyIconImg from "../../../assets/icons/arg.destiny.png";


const ARGENTINA_BOUNDS = [
  [-55.0, -73.5],
  [-21.5, -53.5],
];


const DEFAULT_DRIVER_POSITION = [-34.6083, -58.3712];

function imageDivIcon({ src, w, h, anchorX, anchorY, className = "" }) {
  return L.divIcon({
    className,
    html: `
      <div style="width:${w}px;height:${h}px;">
        <img
          src="${src}"
          style="width:100%;height:100%;display:block;object-fit:contain;"
        />
      </div>
    `,
    iconSize: [w, h],
    iconAnchor: [anchorX, anchorY],
  });
}


function driverDivIcon(angleDeg = 0) {
  const w = 44;
  const h = 44;
  return L.divIcon({
    className: "driver-rotated-marker",
    html: `
      <div style="
        width:${w}px;height:${h}px;
        transform: rotate(${angleDeg}deg);
        transform-origin: 50% 50%;
      ">
        <img
          src="${driverIconImg}"
          style="width:100%;height:100%;display:block;object-fit:contain;"
        />
      </div>
    `,
    iconSize: [w, h],
    iconAnchor: [w / 2, h / 2],
  });
}


function pickupIcon() {
  const w = 32;
  const h = 32;
  return imageDivIcon({
    src: userIconImg,
    w,
    h,
    anchorX: w / 2,
    anchorY: h,
    className: "pickup-marker",
  });
}


function destinyIcon() {
  const w = 34;
  const h = 34;
  return imageDivIcon({
    src: destinyIconImg,
    w,
    h,
    anchorX: w / 2,
    anchorY: h,
    className: "destiny-marker",
  });
}

export default function DriverMap({
  driverPosition,
  driverHeading,
  pickupPosition,
  destinationPosition,
  routePositions,
}) {
  const driverPos = useMemo(() => driverPosition || DEFAULT_DRIVER_POSITION, [driverPosition]);
  const heading = useMemo(
    () => (Number.isFinite(Number(driverHeading)) ? Number(driverHeading) : 0),
    [driverHeading]
  );
  const pickupPos = useMemo(() => pickupPosition || null, [pickupPosition]);
  const destPos = useMemo(() => destinationPosition || null, [destinationPosition]);
  const route = useMemo(() => (Array.isArray(routePositions) ? routePositions : null), [routePositions]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={driverPos}
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
        {}
        <TileLayer
          attribution="&copy; CartoDB"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {}
        <Marker position={driverPos} icon={driverDivIcon(heading)} />

        {}
        {pickupPos && <Marker position={pickupPos} icon={pickupIcon()} />}

        {}
        {destPos && <Marker position={destPos} icon={destinyIcon()} />}

        {}
        {route && route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{ color: "#75aadb", weight: 6, opacity: 0.7 }}
          />
        )}

        {}
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}
