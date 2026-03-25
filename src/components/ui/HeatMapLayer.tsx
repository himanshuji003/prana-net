import { useMap } from "@/components/ui/map"
import { useEffect } from "react"
import type { FeatureCollection } from "geojson";

export default function HeatmapLayer() {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Sample pollution points (replace later with real data)
    const data: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [77.21, 28.61],
      },
      properties: { intensity: 0.8 },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [77.22, 28.62],
      },
      properties: { intensity: 0.6 },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [77.23, 28.60],
      },
      properties: { intensity: 1.0 },
    },
  ],
};

    // Add source
    if (!map.getSource("heat")) {
      map.addSource("heat", {
        type: "geojson",
        data,
      });
    }

    // Add heatmap layer
    if (!map.getLayer("heat-layer")) {
      map.addLayer({
        id: "heat-layer",
        type: "heatmap",
        source: "heat",
       paint: {
  "heatmap-weight": ["get", "intensity"],
  "heatmap-radius": 30,
  "heatmap-intensity": 1.5,
  "heatmap-color": [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0, "transparent",
    0.2, "blue",
    0.4, "lime",
    0.6, "yellow",
    0.8, "orange",
    1, "red"
  ]
},
      });
    }

  }, [map, isLoaded]);

  return null;
}
