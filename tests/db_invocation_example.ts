import { DatabaseManager } from '../Utility/DatabaseManager';

(async () => {
    const dbManager = new DatabaseManager();

    // ─── PostgreSQL Examples ──────────────────────────────────────────────────

    console.log('=== PostgreSQL Examples ===\n');

    try {
        // Replace with actual PG connection details
        await dbManager.connectPostgres({
            user: 'your_user',
            host: 'localhost',
            database: 'your_db',
            password: 'your_password',
            port: 5432,
        });

        console.log('Postgres connected?', dbManager.isPostgresConnected());

        // Execute a SELECT query
        const selectResult = await dbManager.executePostgresQuery('SELECT * FROM users LIMIT 5');
        console.log('SELECT result:', selectResult.rows);

        // Insert a row using the helper
        const insertResult = await dbManager.insertPostgresRow('users', {
            username: 'sdet_master',
            email: 'sdet@example.com',
            role: 'admin',
        });
        console.log('Inserted row:', insertResult.rows[0]);

        // Execute a parameterized UPDATE query
        const updateResult = await dbManager.executePostgresQuery(
            'UPDATE users SET role = $1 WHERE username = $2',
            ['superadmin', 'sdet_master']
        );
        console.log('Rows updated:', updateResult.rowCount);

        // Execute a DELETE query
        const deleteResult = await dbManager.executePostgresQuery(
            'DELETE FROM users WHERE username = $1',
            ['sdet_master']
        );
        console.log('Rows deleted:', deleteResult.rowCount);

    } catch (err) {
        console.error('PostgreSQL example failed:', err instanceof Error ? err.message : String(err));
    }

    // ─── MongoDB Examples ─────────────────────────────────────────────────────

    console.log('\n=== MongoDB Examples ===\n');

    try {
        // Replace with actual Mongo URI
        await dbManager.connectMongo('mongodb://localhost:27017');

        console.log('Mongo connected?', dbManager.isMongoConnected());

        // Insert a document
        const insertedId = await dbManager.insertMongoDocument('test_db', 'users', {
            username: 'sdet_master',
            role: 'admin',
            created_at: new Date(),
        });
        console.log('Inserted document ID:', insertedId);

        // Find documents with sort, limit, and skip
        const docs = await dbManager.executeMongoQuery(
            'test_db',
            'users',
            { role: 'admin' },
            { sort: { created_at: -1 }, limit: 5, skip: 0 }
        );
        console.log('Query result:', docs);

        // Update matching documents
        const modifiedCount = await dbManager.updateMongoDocument(
            'test_db',
            'users',
            { username: 'sdet_master' },
            { $set: { role: 'superadmin' } }
        );
        console.log('Documents updated:', modifiedCount);

        // Delete matching documents
        const deletedCount = await dbManager.deleteMongoDocument(
            'test_db',
            'users',
            { username: 'sdet_master' }
        );
        console.log('Documents deleted:', deletedCount);

    } catch (err) {
        console.error('MongoDB example failed:', err instanceof Error ? err.message : String(err));
    }

    // ─── Teardown ─────────────────────────────────────────────────────────────

    console.log('\n=== Closing all connections ===');
    await dbManager.closeAll();
    console.log('Done.');

})();
