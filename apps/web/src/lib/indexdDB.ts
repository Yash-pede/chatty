import { openDB } from 'idb';

export const dbPromise = openDB("chat-db", 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains("messages")) {
            const store = db.createObjectStore("messages", {
                keyPath: "clientMessageId",
            });
            store.createIndex("conversationId", "conversationId");
        }
    },
});


