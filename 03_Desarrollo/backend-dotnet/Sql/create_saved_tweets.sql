-- Tabla de tweets guardados (bookmarks). No existía en el esquema original.
SET NOCOUNT ON;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'saved_tweets')
BEGIN
    CREATE TABLE dbo.saved_tweets (
        user_id  INT NOT NULL,
        tweet_id INT NOT NULL,
        saved_at DATETIME NOT NULL CONSTRAINT DF_saved_tweets_saved_at DEFAULT (GETDATE()),
        CONSTRAINT PK_saved_tweets PRIMARY KEY (user_id, tweet_id)
    );
    PRINT 'Tabla saved_tweets creada.';
END
ELSE
    PRINT 'saved_tweets ya existe.';
