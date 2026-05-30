/**
 * City coordinate data for the India Map visualization.
 * Each city has [latitude, longitude] for geographic projection.
 */

export interface CityCoord {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  state: string;
}

export const INDIA_CITIES: CityCoord[] = [
  // — Metro Cities —
  { name: "Delhi", coordinates: [77.1025, 28.7041], state: "Delhi" },
  { name: "Mumbai", coordinates: [72.8777, 19.0760], state: "Maharashtra" },
  { name: "Kolkata", coordinates: [88.3639, 22.5726], state: "West Bengal" },
  { name: "Bengaluru", coordinates: [77.5946, 12.9716], state: "Karnataka" },
  { name: "Chennai", coordinates: [80.2707, 13.0827], state: "Tamil Nadu" },
  { name: "Hyderabad", coordinates: [78.4867, 17.3850], state: "Telangana" },

  // — Major Cities —
  { name: "Ahmedabad", coordinates: [72.5714, 23.0225], state: "Gujarat" },
  { name: "Pune", coordinates: [73.8567, 18.5204], state: "Maharashtra" },
  { name: "Surat", coordinates: [72.8311, 21.1702], state: "Gujarat" },
  { name: "Jaipur", coordinates: [75.7873, 26.9124], state: "Rajasthan" },
  { name: "Lucknow", coordinates: [80.9462, 26.8467], state: "Uttar Pradesh" },
  { name: "Kanpur", coordinates: [80.3319, 26.4499], state: "Uttar Pradesh" },
  { name: "Nagpur", coordinates: [79.0882, 21.1458], state: "Maharashtra" },
  { name: "Indore", coordinates: [75.8577, 22.7196], state: "Madhya Pradesh" },
  { name: "Thane", coordinates: [72.9781, 19.2183], state: "Maharashtra" },
  { name: "Bhopal", coordinates: [77.4126, 23.2599], state: "Madhya Pradesh" },
  { name: "Visakhapatnam", coordinates: [83.2185, 17.6868], state: "Andhra Pradesh" },
  { name: "Vadodara", coordinates: [73.1812, 22.3072], state: "Gujarat" },
  { name: "Firozabad", coordinates: [78.3957, 27.1591], state: "Uttar Pradesh" },
  { name: "Ludhiana", coordinates: [75.8573, 30.9010], state: "Punjab" },
  { name: "Rajkot", coordinates: [70.8022, 22.3039], state: "Gujarat" },
  { name: "Agra", coordinates: [78.0081, 27.1767], state: "Uttar Pradesh" },
  { name: "Siliguri", coordinates: [88.4275, 26.7271], state: "West Bengal" },
  { name: "Nashik", coordinates: [73.7898, 19.9975], state: "Maharashtra" },
  { name: "Faridabad", coordinates: [77.3178, 28.4089], state: "Haryana" },
  { name: "Patna", coordinates: [85.1376, 25.6093], state: "Bihar" },
  { name: "Meerut", coordinates: [77.7064, 28.9845], state: "Uttar Pradesh" },
  { name: "Kalyan-Dombivali", coordinates: [73.1305, 19.2403], state: "Maharashtra" },
  { name: "Vasai-Virar", coordinates: [72.8397, 19.3919], state: "Maharashtra" },
  { name: "Varanasi", coordinates: [82.9913, 25.3176], state: "Uttar Pradesh" },
  { name: "Srinagar", coordinates: [74.7973, 34.0837], state: "Jammu & Kashmir" },
  { name: "Aurangabad", coordinates: [75.3433, 19.8762], state: "Maharashtra" },
  { name: "Dhanbad", coordinates: [86.4304, 23.7957], state: "Jharkhand" },
  { name: "Amritsar", coordinates: [74.8723, 31.6340], state: "Punjab" },
  { name: "Aligarh", coordinates: [78.0880, 27.8974], state: "Uttar Pradesh" },
  { name: "Guwahati", coordinates: [91.7362, 26.1445], state: "Assam" },
  { name: "Ranchi", coordinates: [85.3096, 23.3441], state: "Jharkhand" },
  { name: "Haora", coordinates: [88.3119, 22.5958], state: "West Bengal" },
  { name: "Coimbatore", coordinates: [76.9558, 11.0168], state: "Tamil Nadu" },
  { name: "Jabalpur", coordinates: [79.9864, 23.1815], state: "Madhya Pradesh" },
  { name: "Bhubaneswar", coordinates: [85.8245, 20.2961], state: "Odisha" },
  { name: "Jodhpur", coordinates: [73.0243, 26.2389], state: "Rajasthan" },
  { name: "Tripunithura", coordinates: [76.3519, 9.9467], state: "Kerala" },
  { name: "Gwalior", coordinates: [78.1828, 26.2183], state: "Madhya Pradesh" },
  { name: "Bareilly", coordinates: [79.4304, 28.3670], state: "Uttar Pradesh" },
  { name: "Moradabad", coordinates: [78.7733, 28.8386], state: "Uttar Pradesh" },
  { name: "Raipur", coordinates: [81.6296, 21.2514], state: "Chhattisgarh" },
  { name: "Gorakhpur", coordinates: [83.3732, 26.7606], state: "Uttar Pradesh" },
  { name: "Bikaner", coordinates: [73.3119, 28.0229], state: "Rajasthan" },
  { name: "Chandigarh", coordinates: [76.7794, 30.7333], state: "Chandigarh" },
  { name: "Madurai", coordinates: [78.1198, 9.9252], state: "Tamil Nadu" },
  { name: "Tiruchirappalli", coordinates: [78.6569, 10.7905], state: "Tamil Nadu" },
  { name: "Tiruppur", coordinates: [77.3411, 11.1085], state: "Tamil Nadu" },
  { name: "Salem", coordinates: [78.1460, 11.6643], state: "Tamil Nadu" },
  { name: "Erode", coordinates: [77.7172, 11.3410], state: "Tamil Nadu" },
  { name: "Vellore", coordinates: [79.1325, 12.9165], state: "Tamil Nadu" },
  { name: "Mysuru", coordinates: [76.6394, 12.2958], state: "Karnataka" },
  { name: "Hubballi-Dharwad", coordinates: [75.1240, 15.3647], state: "Karnataka" },
  { name: "Mangaluru", coordinates: [74.8560, 12.9141], state: "Karnataka" },
  { name: "Belagavi", coordinates: [74.4977, 15.8497], state: "Karnataka" },
  { name: "Kochi", coordinates: [76.2673, 9.9312], state: "Kerala" },
  { name: "Thiruvananthapuram", coordinates: [76.9366, 8.5241], state: "Kerala" },
  { name: "Kozhikode", coordinates: [75.7804, 11.2588], state: "Kerala" },
  { name: "Vijayawada", coordinates: [80.6480, 16.5062], state: "Andhra Pradesh" },
  { name: "Guntur", coordinates: [80.4365, 16.3067], state: "Andhra Pradesh" },
  { name: "Tirupati", coordinates: [79.4192, 13.6288], state: "Andhra Pradesh" },
  { name: "Nellore", coordinates: [79.9865, 14.4426], state: "Andhra Pradesh" },
  { name: "Warangal", coordinates: [79.5941, 17.9784], state: "Telangana" },
  { name: "Nizamabad", coordinates: [78.0941, 18.6725], state: "Telangana" },
  { name: "Jamshedpur", coordinates: [86.2029, 22.8046], state: "Jharkhand" },
  { name: "Bokaro Steel City", coordinates: [86.1511, 23.6693], state: "Jharkhand" },
  { name: "Durg", coordinates: [81.2849, 21.1904], state: "Chhattisgarh" },
  { name: "Bhilai", coordinates: [81.3509, 21.2167], state: "Chhattisgarh" },
  { name: "Udaipur", coordinates: [73.7125, 24.5854], state: "Rajasthan" },
  { name: "Kota", coordinates: [75.8648, 25.2138], state: "Rajasthan" },
  { name: "Ajmer", coordinates: [74.6399, 26.4499], state: "Rajasthan" },
  { name: "Dehradun", coordinates: [78.0322, 30.3165], state: "Uttarakhand" },
  { name: "Haridwar", coordinates: [78.1642, 29.9457], state: "Uttarakhand" },
  { name: "Noida", coordinates: [77.3910, 28.5355], state: "Uttar Pradesh" },
  { name: "Ghaziabad", coordinates: [77.4538, 28.6692], state: "Uttar Pradesh" },
  { name: "Prayagraj", coordinates: [81.8463, 25.4358], state: "Uttar Pradesh" },
  { name: "Jhansi", coordinates: [78.5685, 25.4484], state: "Uttar Pradesh" },
  { name: "Gaya", coordinates: [84.9994, 24.7955], state: "Bihar" },
  { name: "Panaji", coordinates: [73.8278, 15.4909], state: "Goa" },
  { name: "Shimla", coordinates: [77.1734, 31.1048], state: "Himachal Pradesh" },
  { name: "Agartala", coordinates: [91.2868, 23.8315], state: "Tripura" },
];

/**
 * Maps location strings from global-directory.json to city names.
 * Handles variations like "Delhi", "Ansari Nagar, Delhi", etc.
 */
export function mapLocationToCity(location: string): string | null {
  const loc = location.trim();

  // Direct match
  const directMatch = INDIA_CITIES.find(c => c.name === loc);
  if (directMatch) return directMatch.name;

  // Check if location contains a known city name
  for (const city of INDIA_CITIES) {
    if (loc.includes(city.name)) return city.name;
  }

  // Special mappings
  if (loc.includes("Delhi") || loc === "Delhi Chapter" || loc.includes("Noida")) return "Delhi";
  if (loc.includes("Bengaluru") || loc.includes("Bangalore")) return "Bengaluru";
  if (loc.includes("Navi Mumbai") || loc.includes("Mumbai")) return "Mumbai";
  if (loc.includes("Kolkata") || loc.includes("Calcutta")) return "Kolkata";
  if (loc.includes("Chennai") || loc.includes("Madras")) return "Chennai";
  if (loc.includes("Allahabad") || loc.includes("Prayagraj")) return "Prayagraj";

  // Global/Worldwide entries
  if (loc === "Global" || loc === "Worldwide" || loc.includes("Global")) return null;

  return null;
}
