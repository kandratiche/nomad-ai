// Add real coordinates to all places that are missing them
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nznswtsayytpdbijjqhj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bnN3dHNheXl0cGRiaWpqcWhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI3OTI4OSwiZXhwIjoyMDg1ODU1Mjg5fQ.q1jSwTMcGfgT7bB_X6DmfM7BnrQ996SBRO0Vjx6-UMk"
);

// Real coordinates for known places
const COORDS = {
  // ── Astana ──
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

  // ── Almaty ──
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

async function main() {
  // Fetch all places
  const { data: places, error } = await supabase
    .from("places")
    .select("id, title, coordinates");

  if (error) {
    console.error("Error fetching places:", error);
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const place of places) {
    // Skip if already has valid coordinates
    if (place.coordinates?.latitude && place.coordinates?.longitude) {
      console.log(`✓ ${place.title} — already has coords (${place.coordinates.latitude}, ${place.coordinates.longitude})`);
      skipped++;
      continue;
    }

    // Look up coordinates
    const coords = COORDS[place.title];
    if (!coords) {
      console.log(`✗ ${place.title} — NO COORDS AVAILABLE (add manually)`);
      continue;
    }

    // Update in Supabase
    const { error: updateErr } = await supabase
      .from("places")
      .update({ coordinates: coords })
      .eq("id", place.id);

    if (updateErr) {
      console.log(`✗ ${place.title} — UPDATE FAILED: ${updateErr.message}`);
    } else {
      console.log(`✅ ${place.title} — UPDATED to (${coords.latitude}, ${coords.longitude})`);
      updated++;
    }
  }

  console.log(`\nDone! Updated: ${updated}, Already had coords: ${skipped}`);
}

main();
