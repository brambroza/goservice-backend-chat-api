-- Chat API schema (MSSQL/Postgres-compatible with minor tweaks)
CREATE TABLE dbo.chat_messages (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    user_id VARCHAR(200) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_chat_messages_created_at DEFAULT (SYSDATETIME())
);

CREATE INDEX IX_chat_messages_provider ON dbo.chat_messages(provider);
CREATE INDEX IX_chat_messages_user_id ON dbo.chat_messages(user_id);
