import { MongoClient } from "mongodb";
import "dotenv/config";

async function test() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27018/aya_agent?directConnection=true";
  console.log(`Connecting to: ${uri}`);
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log("✅ Connected to Atlas Local!");
    const db = client.db("aya_agent");
    console.log("Checking search indexes...");
    const indexes = await db.collection("engrams").listSearchIndexes().toArray();
    console.log("✅ Search Indexes count:", indexes.length);
  } catch (e) {
    console.log("❌ Error:", e.message);
  } finally {
    await client.close();
  }
}

test();
