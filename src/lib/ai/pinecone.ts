import { Pinecone, type RecordMetadata } from "@pinecone-database/pinecone";

let pineconeInstance: Pinecone | null = null;

function getPinecone(): Pinecone {
  if (!pineconeInstance) {
    pineconeInstance = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeInstance;
}

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || "nimmit-context";

/**
 * Get the Pinecone index for context storage
 */
export function getContextIndex() {
  const pinecone = getPinecone();
  return pinecone.index(INDEX_NAME);
}

export interface VectorMetadata {
  type: string;
  clientId: string;
  jobId?: string;
  content: string;
  createdAt: string;
}

export interface UpsertVectorParams {
  id: string;
  embedding: number[];
  metadata: VectorMetadata;
}

/**
 * Upsert vectors into the index
 */
export async function upsertVectors(vectors: UpsertVectorParams[]): Promise<void> {
  const index = getContextIndex();

  const records = vectors.map((v) => ({
    id: v.id,
    values: v.embedding,
    metadata: v.metadata as unknown as RecordMetadata,
  }));

  await index.upsert(records);
}

export interface QueryResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
}

/**
 * Query similar vectors
 */
export async function queryVectors(
  embedding: number[],
  clientId: string,
  topK = 5
): Promise<QueryResult[]> {
  const index = getContextIndex();

  const response = await index.query({
    vector: embedding,
    topK,
    filter: {
      clientId: { $eq: clientId },
    },
    includeMetadata: true,
  });

  return (response.matches || []).map((match) => ({
    id: match.id,
    score: match.score || 0,
    metadata: match.metadata as unknown as VectorMetadata,
  }));
}

/**
 * Delete vectors by IDs
 */
export async function deleteVectors(ids: string[]): Promise<void> {
  const index = getContextIndex();
  await index.deleteMany(ids);
}

/**
 * Delete all vectors for a client
 */
export async function deleteClientVectors(clientId: string): Promise<void> {
  const index = getContextIndex();
  await index.deleteMany({
    filter: {
      clientId: { $eq: clientId },
    },
  });
}

export { getPinecone, INDEX_NAME };
