import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nznswtsayytpdbijjqhj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bnN3dHNheXl0cGRiaWpqcWhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI3OTI4OSwiZXhwIjoyMDg1ODU1Mjg5fQ.q1jSwTMcGfgT7bB_X6DmfM7BnrQ996SBRO0Vjx6-UMk"
);

// Fetch all places
const { data: places, error } = await supabase
  .from("places")
  .select("id, title, coordinates");

if (error) {
  console.error("Error:", error);
  process.exit(1);
}

console.log(`Found ${places.length} places\n`);

// Show raw data
for (const p of places) {
  console.log(`"${p.title}" | coords: ${JSON.stringify(p.coordinates)} | type: ${typeof p.coordinates}`);
}

// Real coordinates for known places
const COORDS = {
  "Baiterek Tower":                { latitude: 51.1283, longitude: 71.4304 },
  "Bayterek Tower":                { latitude: 51.1283, longitude: 71.4304 },
  "Khan Shatyr":                   { latitude: 51.1323, longitude: 71.4037 },
  "Hazret Sultan Mosque":          { latitude: 51.1260, longitude: 71.4163 },
  "Nur Alem Future Energy Museum": { latitude: 51.0878, longitude: 71.4164 },
  "Astana Ballet Theater":         { latitude: 51.1240, longitude: 71.4301 },
  "Central Park (Ishim Embankment)": { latitude: 51.1200, longitude: 71.4280 },
  "Astana Botanical Garden":       { latitude: 51.1400, longitude: 71.3700 },
  "Vechnoe Nebo":                  { latitude: 51.1285, longitude: 71.4310 },
  "Mega Silk Way":                 { latitude: 51.0900, longitude: 71.4097 },
  "Coffee Boom (Central)":         { latitude: 51.1290, longitude: 71.4270 },
  "Medeu Rink":                    { latitude: 43.1574, longitude: 77.0588 },
  "Medeu Skating Rink":            { latitude: 43.1574, longitude: 77.0588 },
  "Shymbulak Mountain Resort":     { latitude: 43.1365, longitude: 77.0753 },
  "Kok Tobe Park":                 { latitude: 43.2290, longitude: 76.9620 },
  "Kok Tobe":                      { latitude: 43.2290, longitude: 76.9620 },
  "Zenkov Cathedral":              { latitude: 43.2580, longitude: 76.9520 },
  "Green Bazaar (Zelyony Bazar)":  { latitude: 43.2564, longitude: 76.9427 },
  "Navat Teahouse":                { latitude: 43.2380, longitude: 76.9440 },
  "Big Almaty Lake (BAO)":         { latitude: 43.0534, longitude: 76.9835 },
  "Terrenkur Health Path":         { latitude: 43.2050, longitude: 77.0050 },
  "Nedelka Cafe":                  { latitude: 43.2370, longitude: 76.9480 },
  "Arbat (Panfilov Street)":       { latitude: 43.2580, longitude: 76.9480 },
};

console.log("\n=== UPDATING ===\n");

let updated = 0;
for (const place of places) {
  const hasCoords = place.coordinates && typeof place.coordinates === "object" && place.coordinates.latitude;
  
  if (hasCoords) {
    console.log(`SKIP: "${place.title}" already has coords`);
    continue;
  }

  const newCoords = COORDS[place.title];
  if (!newCoords) {
    console.log(`NO MAP: "${place.title}" — not in our coords map`);
    continue;
  }

  const { error: uErr } = await supabase
    .from("places")
    .update({ coordinates: newCoords })
    .eq("id", place.id);

  if (uErr) {
    console.log(`FAIL: "${place.title}" — ${uErr.message}`);
  } else {
    console.log(`OK: "${place.title}" → (${newCoords.latitude}, ${newCoords.longitude})`);
    updated++;
  }
}

console.log(`\nUpdated ${updated} places`);
