import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DocumentMetadata {
  type: "resume" | "job_description";
  id: string;
  title?: string;
  company?: string;
  userId?: string;
  industry?: string;
  level?: string;
  createdAt?: string;
}

export interface SimilarDocument {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  similarity: number;
}

export class VectorStoreManager {
  private pinecone: Pinecone | null;
  private genAI: GoogleGenerativeAI;
  private indexName = "resume-job-matcher";

  constructor() {
    // Only initialize Pinecone if API key is available
    if (process.env.PINECONE_API_KEY) {
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });
    } else {
      console.warn(
        "Pinecone API key not found. Vector store features will be limited.",
      );
      this.pinecone = null;
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
  }

  async initializeIndex() {
    if (!this.pinecone) {
      console.warn("Pinecone not available. Skipping index initialization.");
      return;
    }

    try {
      // Check if index exists
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.indexes?.some(
        (index) => index.name === this.indexName,
      );

      if (!indexExists) {
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: 768, // Gemini embedding dimension
          metric: "cosine",
          spec: {
            serverless: {
              cloud: "aws",
              region: "us-east-1",
            },
          },
        });

        console.log(`Created Pinecone index: ${this.indexName}`);

        // Wait for index to be ready
        await this.waitForIndexReady();
      }
    } catch (error) {
      console.error("Error initializing Pinecone index:", error);
      throw error;
    }
  }

  private async waitForIndexReady(maxWaitTime = 60000) {
    if (!this.pinecone) return;

    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const indexStats = await this.pinecone
          .Index(this.indexName)
          .describeIndexStats();
        if (indexStats) {
          console.log("Index is ready!");
          return;
        }
      } catch {
        // Index not ready yet, continue waiting
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Index initialization timeout");
  }

  private async ensureIndexExists(): Promise<void> {
    if (!this.pinecone) {
      return;
    }

    try {
      // Try to describe the index to check if it exists
      await this.pinecone.Index(this.indexName).describeIndexStats();
    } catch (error) {
      // If index doesn't exist, create it
      if (
        error.message?.includes("404") ||
        error.message?.includes("not found")
      ) {
        console.log("Index not found, creating...");
        await this.initializeIndex();
      } else {
        throw error;
      }
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use Gemini's embedding model
      const model = this.genAI.getGenerativeModel({
        model: "text-embedding-004",
      });
      const result = await model.embedContent(text);

      if (!result.embedding?.values) {
        throw new Error("No embedding returned from Gemini");
      }

      return result.embedding.values;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  }

  async addDocument(
    content: string,
    metadata: DocumentMetadata,
  ): Promise<void> {
    if (!this.pinecone) {
      console.warn(
        "Pinecone not available. Document not stored in vector database.",
      );
      return;
    }

    try {
      // Ensure index exists before adding documents
      await this.ensureIndexExists();

      const embedding = await this.generateEmbedding(content);
      const index = this.pinecone.Index(this.indexName);

      const vector = {
        id: metadata.id,
        values: embedding,
        metadata: {
          ...metadata,
          content: content.substring(0, 10000), // Store truncated content in metadata
          createdAt: new Date().toISOString(),
        },
      };

      await index.upsert([vector]);
      console.log(`Added document to vector store: ${metadata.id}`);
    } catch (error) {
      console.error("Error adding document to vector store:", error);
      throw error;
    }
  }

  async addDocuments(
    documents: Array<{
      content: string;
      metadata: DocumentMetadata;
    }>,
  ): Promise<void> {
    try {
      const vectors = await Promise.all(
        documents.map(async (doc) => {
          const embedding = await this.generateEmbedding(doc.content);
          return {
            id: doc.metadata.id,
            values: embedding,
            metadata: {
              ...doc.metadata,
              content: doc.content.substring(0, 10000),
              createdAt: new Date().toISOString(),
            },
          };
        }),
      );

      const index = this.pinecone.Index(this.indexName);
      await index.upsert(vectors);

      console.log(`Added ${documents.length} documents to vector store`);
    } catch (error) {
      console.error("Error adding documents to vector store:", error);
      throw error;
    }
  }

  async searchSimilar(
    query: string,
    filter?: Partial<DocumentMetadata>,
    topK: number = 5,
  ): Promise<SimilarDocument[]> {
    if (!this.pinecone) {
      console.warn("Pinecone not available. Returning empty search results.");
      return [];
    }

    try {
      // Ensure index exists before searching
      await this.ensureIndexExists();

      const queryEmbedding = await this.generateEmbedding(query);
      const index = this.pinecone.Index(this.indexName);

      const searchRequest = {
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        includeValues: false,
      };

      // Add filters if provided
      if (filter) {
        const pineconeFilter: Record<string, { $eq: string }> = {};

        if (filter.type) pineconeFilter.type = { $eq: filter.type };
        if (filter.industry) pineconeFilter.industry = { $eq: filter.industry };
        if (filter.level) pineconeFilter.level = { $eq: filter.level };
        if (filter.userId) pineconeFilter.userId = { $eq: filter.userId };

        if (Object.keys(pineconeFilter).length > 0) {
          (
            searchRequest as { filter?: Record<string, { $eq: string }> }
          ).filter = pineconeFilter;
        }
      }

      const results = await index.query(searchRequest);

      return (
        results.matches?.map((match) => {
          const metadata = match.metadata as Record<string, unknown>;
          return {
            id: match.id!,
            content: (metadata?.content as string) || "",
            metadata: {
              type: (metadata?.type as string) || "resume",
              id: match.id!,
              title: metadata?.title as string,
              company: metadata?.company as string,
              userId: metadata?.userId as string,
              industry: metadata?.industry as string,
              level: metadata?.level as string,
              createdAt: metadata?.createdAt as string,
            } as DocumentMetadata,
            similarity: match.score || 0,
          };
        }) || []
      );
    } catch (error) {
      console.error("Error searching vector store:", error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.pinecone) {
      console.warn("Pinecone not available. Cannot delete document.");
      return;
    }

    try {
      const index = this.pinecone.Index(this.indexName);
      await index.deleteOne(id);
      console.log(`Deleted document from vector store: ${id}`);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  async getIndexStats(): Promise<Record<string, unknown> | null> {
    if (!this.pinecone) {
      console.warn("Pinecone not available. Cannot get index stats.");
      return null;
    }

    try {
      const index = this.pinecone.Index(this.indexName);
      return await index.describeIndexStats();
    } catch (error) {
      console.error("Error getting index stats:", error);
      return null;
    }
  }

  // Find similar resumes for a given job description
  async findSimilarResumes(
    jobDescription: string,
    industry?: string,
    topK: number = 3,
  ): Promise<SimilarDocument[]> {
    const filter: Partial<DocumentMetadata> = { type: "resume" };
    if (industry) filter.industry = industry;

    return this.searchSimilar(jobDescription, filter, topK);
  }

  // Find similar job descriptions for a given resume
  async findSimilarJobs(
    resumeContent: string,
    industry?: string,
    topK: number = 5,
  ): Promise<SimilarDocument[]> {
    const filter: Partial<DocumentMetadata> = { type: "job_description" };
    if (industry) filter.industry = industry;

    return this.searchSimilar(resumeContent, filter, topK);
  }

  // Get industry-specific insights
  async getIndustryInsights(industry: string): Promise<{
    topSkills: string[];
    trendingKeywords: string[];
    avgRequirements: string[];
  }> {
    try {
      // Search for job descriptions in the industry
      const jobDocs = await this.searchSimilar(
        `${industry} job requirements skills`,
        { type: "job_description", industry },
        20,
      );

      // Extract common patterns (simplified version)
      const allContent = jobDocs.map((doc) => doc.content).join(" ");

      // This is a simplified analysis - in production, you'd use more sophisticated NLP
      const skillPatterns = [
        "javascript",
        "python",
        "react",
        "node.js",
        "aws",
        "docker",
        "leadership",
        "communication",
        "agile",
        "scrum",
        "sql",
      ];

      const topSkills = skillPatterns.filter((skill) =>
        allContent.toLowerCase().includes(skill),
      );

      return {
        topSkills: topSkills.slice(0, 10),
        trendingKeywords: [], // Would be populated with trending analysis
        avgRequirements: [], // Would be populated with requirement analysis
      };
    } catch (error) {
      console.error("Error getting industry insights:", error);
      return { topSkills: [], trendingKeywords: [], avgRequirements: [] };
    }
  }
}
