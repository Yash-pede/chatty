-- Extensions (enable once)
CREATE EXTENSION IF EXISTS "uuid-ossp";  -- For UUIDs
CREATE EXTENSION IF EXISTS pg_trgm;      -- For fuzzy search

-- Users Table (All roles: admin, team, agent, customer)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cognito_sub TEXT UNIQUE NOT NULL,  -- Link to Cognito
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'team', 'agent', 'customer')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search/performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Conversations (1:1 customer-agent or groups)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('direct', 'group')),  -- direct=1:1, group=multi
    name TEXT,  -- Optional for groups
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);

CREATE INDEX idx_conversations_type ON conversations(type);

-- Conversation Participants (for groups or direct)
CREATE TABLE conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),  -- For group admins
    PRIMARY KEY (conversation_id, user_id)
);

-- For direct chats: Auto-add customer + selected agent

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file')),
    media_url TEXT,  -- S3 link
    metadata JSONB,  -- Future: reactions, quotes, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ
);

-- Indexes for performance & search
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE FULLTEXT INDEX idx_messages_content ON messages USING GIN (to_tsvector('english', content));  -- For search

-- Read Receipts (Scalable for groups)
CREATE TABLE message_reads (
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (message_id, user_id)
);

-- Future: Partition messages by created_at (monthly) for huge scale
-- Example: CREATE TABLE messages_2025_12 PARTITION OF messages FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Triggers example (update last_message_at)
CREATE OR REPLACE FUNCTION update_last_message() RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_last_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_last_message();