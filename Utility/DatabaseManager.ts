import { MongoClient, Db, Filter, Document, UpdateFilter, WithId } from 'mongodb';
import { Client, QueryResult, ClientConfig } from 'pg';

/**
 * Options for MongoDB find queries.
 */
interface MongoQueryOptions {
    sort?: Record<string, 1 | -1>;
    limit?: number;
    skip?: number;
}

/**
 * DatabaseManager handles connections and queries for both MongoDB and PostgreSQL.
 */
export class DatabaseManager {
    private mongoClient: MongoClient | null = null;
    private pgClient: Client | null = null;

    // ─── Connection Health ────────────────────────────────────────────────────

    /** Returns true if the MongoDB client is currently connected. */
    isMongoConnected(): boolean {
        return this.mongoClient !== null;
    }

    /** Returns true if the PostgreSQL client is currently connected. */
    isPostgresConnected(): boolean {
        return this.pgClient !== null;
    }

    // ─── MongoDB Methods ──────────────────────────────────────────────────────

    /**
     * Connect to MongoDB. If already connected, closes the existing connection first.
     * @param uri MongoDB connection string
     */
    async connectMongo(uri: string): Promise<void> {
        if (this.mongoClient) {
            console.warn('MongoDB already connected. Closing existing connection first.');
            await this.closeMongo();
        }
        try {
            this.mongoClient = new MongoClient(uri);
            await this.mongoClient.connect();
            console.log('Connected successfully to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    /**
     * Get a MongoDB Database instance.
     * @param dbName Name of the database
     */
    getMongoDb(dbName: string): Db {
        if (!this.mongoClient) {
            throw new Error('MongoDB client not connected. Call connectMongo() first.');
        }
        return this.mongoClient.db(dbName);
    }

    /**
     * Execute a find query on a MongoDB collection.
     * @param dbName Name of the database
     * @param collectionName Name of the collection
     * @param query MongoDB filter object
     * @param options Optional query options (sort, limit, skip)
     */
    async executeMongoQuery<T extends Document = Document>(
        dbName: string,
        collectionName: string,
        query: Filter<T> = {},
        options: MongoQueryOptions = {}
    ): Promise<WithId<T>[]> {
        const collection = this.getMongoDb(dbName).collection<T>(collectionName);
        let cursor = collection.find(query);
        if (options.sort) cursor = cursor.sort(options.sort);
        if (options.limit) cursor = cursor.limit(options.limit);
        if (options.skip) cursor = cursor.skip(options.skip);
        return cursor.toArray();
    }

    /**
     * Insert a single document into a MongoDB collection.
     * @param dbName Name of the database
     * @param collectionName Name of the collection
     * @param document Document to insert
     */
    async insertMongoDocument<T extends Document = Document>(
        dbName: string,
        collectionName: string,
        document: T
    ): Promise<string> {
        const collection = this.getMongoDb(dbName).collection<T>(collectionName);
        const result = await collection.insertOne(document as any);
        console.log(`Inserted document with _id: ${result.insertedId}`);
        return result.insertedId.toString();
    }

    /**
     * Update documents in a MongoDB collection matching the filter.
     * @param dbName Name of the database
     * @param collectionName Name of the collection
     * @param filter Filter to match documents
     * @param update Update operations to apply
     */
    async updateMongoDocument<T extends Document = Document>(
        dbName: string,
        collectionName: string,
        filter: Filter<T>,
        update: UpdateFilter<T>
    ): Promise<number> {
        const collection = this.getMongoDb(dbName).collection<T>(collectionName);
        const result = await collection.updateMany(filter, update);
        console.log(`Modified ${result.modifiedCount} document(s)`);
        return result.modifiedCount;
    }

    /**
     * Delete documents from a MongoDB collection matching the filter.
     * @param dbName Name of the database
     * @param collectionName Name of the collection
     * @param filter Filter to match documents to delete
     */
    async deleteMongoDocument<T extends Document = Document>(
        dbName: string,
        collectionName: string,
        filter: Filter<T>
    ): Promise<number> {
        const collection = this.getMongoDb(dbName).collection<T>(collectionName);
        const result = await collection.deleteMany(filter);
        console.log(`Deleted ${result.deletedCount} document(s)`);
        return result.deletedCount;
    }

    /**
     * Close the MongoDB connection.
     */
    async closeMongo(): Promise<void> {
        if (this.mongoClient) {
            await this.mongoClient.close();
            this.mongoClient = null;
            console.log('MongoDB connection closed');
        }
    }

    // ─── PostgreSQL Methods ───────────────────────────────────────────────────

    /**
     * Connect to PostgreSQL. If already connected, closes the existing connection first.
     * @param connectionConfig pg ClientConfig object
     */
    async connectPostgres(connectionConfig: ClientConfig): Promise<void> {
        if (this.pgClient) {
            console.warn('PostgreSQL already connected. Closing existing connection first.');
            await this.closePostgres();
        }
        try {
            this.pgClient = new Client(connectionConfig);
            await this.pgClient.connect();
            console.log('Connected successfully to PostgreSQL');
        } catch (error) {
            console.error('Error connecting to PostgreSQL:', error);
            throw error;
        }
    }

    /**
     * Execute a parameterized SQL query on PostgreSQL.
     * @param query SQL query string
     * @param params Optional query parameters
     */
    async executePostgresQuery(query: string, params: unknown[] = []): Promise<QueryResult> {
        if (!this.pgClient) {
            throw new Error('PostgreSQL client not connected. Call connectPostgres() first.');
        }
        try {
            return await this.pgClient.query(query, params);
        } catch (error) {
            console.error('Error executing PostgreSQL query:', error);
            throw error;
        }
    }

    /**
     * Insert a row into a PostgreSQL table using key-value data.
     * @param table Target table name
     * @param data Object whose keys are column names and values are the row values
     */
    async insertPostgresRow(table: string, data: Record<string, unknown>): Promise<QueryResult> {
        const keys = Object.keys(data).join(', ');
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        return this.executePostgresQuery(
            `INSERT INTO ${table} (${keys}) VALUES (${placeholders}) RETURNING *`,
            values
        );
    }

    /**
     * Close the PostgreSQL connection.
     */
    async closePostgres(): Promise<void> {
        if (this.pgClient) {
            await this.pgClient.end();
            this.pgClient = null;
            console.log('PostgreSQL connection closed');
        }
    }

    // ─── Shared Utilities ─────────────────────────────────────────────────────

    /**
     * Close all active database connections (MongoDB and PostgreSQL).
     */
    async closeAll(): Promise<void> {
        await Promise.all([this.closeMongo(), this.closePostgres()]);
        console.log('All database connections closed');
    }
}
