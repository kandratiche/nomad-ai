// Quick diagnostic: see what's in the Supabase places table
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nznswtsayytpdbijjqhj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bnN3dHNheXl0cGRiaWpqcWhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI3OTI4OSwiZXhwIjoyMDg1ODU1Mjg5fQ.q1jSwTMcGfgT7bB_X6DmfM7BnrQ996SBRO0Vjx6-UMk"
);

// 1. Get all columns (schema check)
const { data: sample, error: sErr } = await supabase.from("places").select("*").limit(1);
if (sErr) {
  console.error("Error:", sErr);
  process.exit(1);
}
console.log("=== COLUMNS ===");
console.log(Object.keys(sample[0]).join(", "));
console.log();

// 2. Get all places
const { data: all, error } = await supabase
  .from("places")
  .select("id, title, type, tags, city_id, latitude, longitude, safety_score, rating")
  .order("city_id");

if (error) {
  // Maybe no lat/lng columns
  console.log("Error with lat/lng:", error.message);
  const { data: all2 } = await supabase
    .from("places")
    .select("id, title, type, tags, city_id, safety_score, rating")
    .order("city_id");
  console.log(`\n=== ALL PLACES (${all2.length}) ===`);
  for (const p of all2) {
    console.log(`[${p.city_id}] ${p.title} | type: ${p.type} | tags: ${(p.tags || []).join(", ")} | rating: ${p.rating}`);
  }
} else {
  console.log(`=== ALL PLACES (${all.length}) ===`);
  for (const p of all) {
    const coords = p.latitude ? `(${p.latitude}, ${p.longitude})` : "NO COORDS";
    console.log(`[${p.city_id}] ${p.title} | type: ${p.type} | tags: ${(p.tags || []).join(", ")} | ${coords}`);
  }
}

// 3. City breakdown
const cities = {};
for (const p of (all || [])) {
  cities[p.city_id] = (cities[p.city_id] || 0) + 1;
}
console.log("\n=== CITY BREAKDOWN ===");
for (const [cid, count] of Object.entries(cities)) {
  console.log(`  ${cid}: ${count} places`);
}
