import { v4 as uuidv4 } from "uuid";
import { generateEmbedding } from "./embeddings";
import {
  upsertVectors,
  queryVectors,
  deleteVectors,
  type VectorMetadata,
} from "./pinecone";
import type { QueryResult } from "./pinecone";

// ===========================================
// Types
// ===========================================

export type ContextType = "job" | "feedback" | "guideline";

export interface ContextItem {
  id: string;
  type: ContextType;
  content: string;
  metadata: {
    clientId: string;
    jobId?: string;
    createdAt: Date;
  };
  similarity: number;
}

export interface StoreContextParams {
  type: ContextType;
  content: string;
  clientId: string;
  jobId?: string;
}

// ===========================================
// Store Context
// ===========================================

/**
 * Embed and store content in the context cloud
 */
export async function storeContext(params: StoreContextParams): Promise<string> {
  const { type, content, clientId, jobId } = params;

  // Generate embedding
  const embedding = await generateEmbedding(content);

  // Create unique ID
  const id = `${type}-${jobId || clientId}-${uuidv4().slice(0, 8)}`;

  // Build metadata (only include jobId if defined)
  const metadata: VectorMetadata = {
    type,
    clientId,
    content: content.slice(0, 1000), // Truncate for metadata storage
    createdAt: new Date().toISOString(),
  };
  if (jobId) {
    metadata.jobId = jobId;
  }

  // Store in Pinecone
  await upsertVectors([
    {
      id,
      embedding,
      metadata,
    },
  ]);

  return id;
}

/**
 * Store a completed job in the context cloud
 */
export async function storeJobContext(
  jobId: string,
  clientId: string,
  title: string,
  description: string,
  feedback?: string
): Promise<string[]> {
  const ids: string[] = [];

  // Store job description
  const jobContent = `Job: ${title}\n\nDescription: ${description}`;
  const jobContextId = await storeContext({
    type: "job",
    content: jobContent,
    clientId,
    jobId,
  });
  ids.push(jobContextId);

  // Store feedback if provided
  if (feedback) {
    const feedbackContextId = await storeContext({
      type: "feedback",
      content: `Client feedback for "${title}": ${feedback}`,
      clientId,
      jobId,
    });
    ids.push(feedbackContextId);
  }

  return ids;
}

/**
 * Store a client guideline in the context cloud
 */
export async function storeGuideline(
  clientId: string,
  guideline: string
): Promise<string> {
  return storeContext({
    type: "guideline",
    content: guideline,
    clientId,
  });
}

// ===========================================
// Retrieve Context
// ===========================================

/**
 * Retrieve relevant context for a query
 */
export async function retrieveContext(
  clientId: string,
  query: string,
  topK = 5
): Promise<ContextItem[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Query Pinecone
  const results = await queryVectors(queryEmbedding, clientId, topK);

  // Transform results
  return results.map((result: QueryResult) => ({
    id: result.id,
    type: result.metadata.type as ContextType,
    content: result.metadata.content,
    metadata: {
      clientId: result.metadata.clientId,
      jobId: result.metadata.jobId,
      createdAt: new Date(result.metadata.createdAt),
    },
    similarity: result.score,
  }));
}

/**
 * Get context for a new job based on title and description
 */
export async function getJobContext(
  clientId: string,
  title: string,
  description: string,
  topK = 5
): Promise<ContextItem[]> {
  const query = `${title}\n\n${description}`;
  return retrieveContext(clientId, query, topK);
}

// ===========================================
// Delete Context
// ===========================================

/**
 * Delete specific context items
 */
export async function deleteContext(ids: string[]): Promise<void> {
  await deleteVectors(ids);
}

// ===========================================
// Format Context for Display
// ===========================================

/**
 * Format context items for display to workers
 */
export function formatContextForWorker(items: ContextItem[]): string {
  if (items.length === 0) {
    return "No relevant context from previous work.";
  }

  const sections: string[] = [];

  // Group by type
  const jobs = items.filter((i) => i.type === "job");
  const feedback = items.filter((i) => i.type === "feedback");
  const guidelines = items.filter((i) => i.type === "guideline");

  if (guidelines.length > 0) {
    sections.push("## Client Guidelines\n" + guidelines.map((g) => `- ${g.content}`).join("\n"));
  }

  if (jobs.length > 0) {
    sections.push(
      "## Similar Past Jobs\n" +
        jobs.map((j) => `- ${j.content.slice(0, 200)}...`).join("\n\n")
    );
  }

  if (feedback.length > 0) {
    sections.push(
      "## Past Feedback\n" + feedback.map((f) => `- ${f.content}`).join("\n")
    );
  }

  return sections.join("\n\n");
}
