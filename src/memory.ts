import { MongoClient } from "mongodb";
import chalk from "chalk";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const EMBED_MODEL = "nomic-embed-text"; // Very fast, lightweight embedding model

let client: MongoClient | null = null;
let db: any = null;
let engramsCollection: any = null;

export async function initMemory() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log(chalk.yellow("⚠️  MONGODB_URI is not set. Episodic Memory (Engrams) will be disabled."));
    return;
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db("aya_agent");
    engramsCollection = db.collection("engrams");
    
    console.log(chalk.green("🧠 Subconscious Vector Memory connected (MongoDB)."));

    // Check and create Vector Search Index automatically
    try {
      const indexes = await engramsCollection.listSearchIndexes().toArray();
      const hasIndex = indexes.some((idx: any) => idx.name === "vector_index");
      
      if (!hasIndex) {
        console.log(chalk.gray("⏳ Initializing Vector Search index for the first time..."));
        await engramsCollection.createSearchIndex({
          name: "vector_index",
          definition: {
            "mappings": {
              "dynamic": true,
              "fields": {
                "embedding": {
                  "dimensions": 768, // nomic-embed-text generates 768 dimensions
                  "similarity": "cosine",
                  "type": "knnVector"
                }
              }
            }
          }
        });
        console.log(chalk.green("✨ Vector Search index 'vector_index' created successfully."));
      }
    } catch (e: any) {
      // It might throw if the user is not running MongoDB Atlas (e.g. running local Community standard edition)
      console.log(chalk.yellow(`⚠️ Could not auto-create search index (Requires Atlas). Error: ${e.message}`));
    }
    
  } catch (e: any) {
    console.error(chalk.red(`❌ Failed to connect to MongoDB: ${e.message}`));
    client = null;
  }
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: EMBED_MODEL,
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama Embedding failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding;
}

export async function writeEngram(topic: string, text: string): Promise<{ok: boolean, id?: string, error?: string}> {
  if (!engramsCollection) return { ok: false, error: "Database not connected." };

  try {
    const embedding = await getEmbedding(`${topic}: ${text}`);
    
    const result = await engramsCollection.insertOne({
      topic,
      text,
      embedding,
      createdAt: new Date()
    });

    return { ok: true, id: result.insertedId.toString() };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function searchEngrams(query: string, limit = 3): Promise<{ok: boolean, results?: any[], error?: string}> {
  if (!engramsCollection) return { ok: false, error: "Database not connected." };

  try {
    const queryVector = await getEmbedding(query);
    
    // Uses MongoDB Atlas Vector Search
    // Requires an index named "vector_index" mapping "embedding" to vector type.
    const results = await engramsCollection.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 20,
          limit: limit
        }
      },
      {
        $project: {
          _id: 0,
          topic: 1,
          text: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]).toArray();

    return { ok: true, results };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
