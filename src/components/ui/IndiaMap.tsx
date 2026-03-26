import { Card } from "@/components/ui/card"
import { Map, MapControls } from "@/components/ui/map"
import HeatmapLayer from "./HeatMapLayer"

export default function IndiaMap() {
  return (
    <Card className="w-full h-full p-0 overflow-hidden">
      <Map
        center={[77.2090, 28.6139]}
        zoom={11}
        styles={{
          dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
          light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        }}
      >

        <HeatmapLayer /> 
        <MapControls />
      </Map>
    </Card>
  )
}