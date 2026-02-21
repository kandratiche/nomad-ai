import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nznswtsayytpdbijjqhj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bnN3dHNheXl0cGRiaWpqcWhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI3OTI4OSwiZXhwIjoyMDg1ODU1Mjg5fQ.q1jSwTMcGfgT7bB_X6DmfM7BnrQ996SBRO0Vjx6-UMk"
);

// 1. Check if cities table exists
console.log("=== CITIES TABLE ===");
const { data: cities, error: cErr } = await supabase.from("cities").select("*");
if (cErr) {
  console.log("No cities table or error:", cErr.message);
} else {
  for (const c of cities) {
    console.log(JSON.stringify(c));
  }
}

// 2. Check coordinates column format
console.log("\n=== COORDINATES COLUMN SAMPLE ===");
const { data: sample } = await supabase.from("places").select("id, title, city_id, coordinates").limit(5);
for (const p of sample) {
  console.log(`${p.title}: coordinates = ${JSON.stringify(p.coordinates)} (type: ${typeof p.coordinates})`);
}

// 3. Check users table to see home_city format
console.log("\n=== USERS home_city SAMPLE ===");
const { data: users, error: uErr } = await supabase.from("users").select("id, name, home_city, interests").limit(5);
if (uErr) {
  console.log("Error:", uErr.message);
} else {
  for (const u of users) {
    console.log(`${u.name}: home_city = "${u.home_city}", interests = ${JSON.stringify(u.interests)}`);
  }
}
