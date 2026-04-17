import chalk from "chalk";
import { MongoClient } from "mongodb";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const EMBED_MODEL = "nomic-embed-text";

let client: MongoClient | null = null;
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
    engramsCollection = client.db("aya_agent").collection("engrams");
    console.log(chalk.green("🧠 Subconscious Vector Memory connected (MongoDB)."));

    try {
      const indexes = await engramsCollection.listSearchIndexes().toArray();
      if (!indexes.some((index: any) => index.name === "vector_index")) {
        console.log(chalk.gray("⏳ Initializing Vector Search index for the first time..."));
        await engramsCollection.createSearchIndex({
          name: "vector_index",
          definition: {
            mappings: {
              dynamic: true,
              fields: {
                embedding: {
                  dimensions: 768,
                  similarity: "cosine",
                  type: "knnVector",
                },
              },
            },
          },
        });
        console.log(chalk.green("✨ Vector Search index 'vector_index' created successfully."));
      }
    } catch (e: any) {
      console.log(chalk.yellow(`⚠️ Could not auto-create search index (Requires Atlas). Error: ${e.message}`));
    }
  } catch (e: any) {
    console.error(chalk.red(`❌ Failed to connect to MongoDB: ${e.message}`));
    client = null;
    engramsCollection = null;
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

export async function writeEngram(
  topic: string,
  text: string
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!engramsCollection) return { ok: false, error: "Database not connected." };

  try {
    const result = await engramsCollection.insertOne({
      topic,
      text,
      embedding: await getEmbedding(`${topic}: ${text}`),
      createdAt: new Date(),
    });

    return { ok: true, id: result.insertedId.toString() };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function searchEngrams(
  query: string,
  limit = 3
): Promise<{ ok: boolean; results?: any[]; error?: string }> {
  if (!engramsCollection) return { ok: false, error: "Database not connected." };

  try {
    const results = await engramsCollection
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: await getEmbedding(query),
            numCandidates: 20,
            limit,
          },
        },
        {
          $project: {
            _id: 0,
            topic: 1,
            text: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ])
      .toArray();

    return { ok: true, results };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
