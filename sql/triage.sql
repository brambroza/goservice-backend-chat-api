-- TABLE: dbo.chat_threads
IF OBJECT_ID('dbo.chat_threads', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.chat_threads (
        id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_chat_threads PRIMARY KEY,
        provider VARCHAR(50) NOT NULL,
        user_id VARCHAR(200) NOT NULL,
        ticket_id VARCHAR(200) NULL,
        latest_message NVARCHAR(MAX) NULL,
        classification NVARCHAR(MAX) NULL,
        created_at DATETIME2(0) NOT NULL CONSTRAINT DF_chat_threads_created_at DEFAULT (SYSDATETIME()),

        CONSTRAINT CK_chat_threads_classification_isjson
            CHECK (classification IS NULL OR ISJSON(classification) = 1)
    );
END
GO

-- INDEX: IX_chat_threads_provider_user
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_chat_threads_provider_user'
      AND object_id = OBJECT_ID('dbo.chat_threads')
)
BEGIN
    CREATE INDEX IX_chat_threads_provider_user
    ON dbo.chat_threads (provider, user_id);
END
GO
