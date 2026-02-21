import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const { data, error } = await supabase
  .from("users")
  .select("id, name, roles, guide_info, home_city")
  .eq("roles", "guide");

if (error) {
  console.error("Error:", error);
  process.exit(1);
}

console.log(`Found ${data.length} guides:\n`);
for (const g of data) {
  console.log(`--- ${g.name} (${g.home_city}) ---`);
  console.log("guide_info:", JSON.stringify(g.guide_info, null, 2));
  console.log();
}
