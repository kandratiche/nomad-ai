import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("roles", "guide")
  .limit(1);

if (error) {
  console.error("Error:", error);
  process.exit(1);
}

if (data.length > 0) {
  console.log("All columns in users table:");
  console.log(Object.keys(data[0]).join(", "));
  console.log("\nFull guide row:");
  console.log(JSON.stringify(data[0], null, 2));
}
