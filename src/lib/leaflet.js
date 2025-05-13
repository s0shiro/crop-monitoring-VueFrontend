// Import Leaflet and its styles
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'

// Fix the Leaflet icon paths issue in production builds
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('../assets/leaflet/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('../assets/leaflet/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('../assets/leaflet/marker-shadow.png', import.meta.url).href,
})

// Export the Leaflet instance so components can use it
export default L
