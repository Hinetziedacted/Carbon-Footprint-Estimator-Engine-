import React, { useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet-draw';

// Fix for leaflet's default icon path in modern build tools
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Customize leaflet-draw tooltips for better UX. This sets the 'title' attribute on the buttons.
L.drawLocal.draw.toolbar.buttons.polygon = 'Draw a polygon zone';
L.drawLocal.draw.toolbar.buttons.rectangle = 'Draw a rectangular zone';
L.drawLocal.edit.toolbar.buttons.edit = 'Edit the zone';
L.drawLocal.edit.toolbar.buttons.remove = 'Delete the zone';

// Also customize the instructional tooltips that appear during drawing/editing.
L.drawLocal.draw.handlers.polygon.tooltip.start = 'Click on the map to start drawing the zone.';
L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Click to continue drawing the zone.';
L.drawLocal.draw.handlers.polygon.tooltip.end = 'Click the first point to close this zone.';
L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Click and drag to draw a rectangular zone.';

L.drawLocal.edit.handlers.edit.tooltip.text = 'Drag handles to reshape the zone.';
L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Click cancel to undo changes.';
L.drawLocal.edit.handlers.remove.tooltip.text = 'Click on the zone to delete it.';


interface MapCanvasProps {
  onPolygon: (geojson: any | null) => void;
}

const MapCanvas: React.FC<MapCanvasProps> = ({ onPolygon }) => {
  const fgRef = useRef<L.FeatureGroup>(null);
  
  const center: LatLngExpression = [51.505, -0.09]; // Default to London

  const toGeoJSON = () => {
    const fg = fgRef.current;
    if (!fg) return null;
    
    const layers = fg.getLayers();
    if (layers.length === 0) return null;

    // Assuming a single polygon layer for simplicity
    const drawnLayer = layers[0];
    if (drawnLayer && 'toGeoJSON' in drawnLayer && typeof drawnLayer.toGeoJSON === 'function') {
      return drawnLayer.toGeoJSON();
    }
    return null;
  };
  
  const handleCreate = (e: any) => {
    const { layer } = e;
    const fg = fgRef.current;
    if (!fg) return;

    // Clear previous layers
    fg.clearLayers();
    // Add new layer
    fg.addLayer(layer);
    onPolygon(layer.toGeoJSON());
  }
  
  const handleEdit = () => {
    onPolygon(toGeoJSON());
  }

  const handleDelete = () => {
    onPolygon(null);
  }

  return (
    <MapContainer center={center} zoom={10} className="h-full w-full">
      <TileLayer
        attribution=""
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FeatureGroup ref={fgRef}>
          <EditControl
            position="topright"
            onCreated={handleCreate}
            onEdited={handleEdit}
            onDeleted={handleDelete}
            draw={{
              marker: false,
              circle: false,
              circlemarker: false,
              polyline: false,
              rectangle: true,
              polygon: true,
            }}
            edit={{
              edit: {},
              remove: true,
            }}
          />
      </FeatureGroup>
    </MapContainer>
  );
};

export default MapCanvas;