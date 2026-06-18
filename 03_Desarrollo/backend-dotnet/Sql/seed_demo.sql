-- =============================================================
-- Seed de demo para LURE:
--   * 30 cuentas con avatares de stock (i.pravatar.cc)
--   * 4 tweets por cuenta: imagen, vídeo, PDF y texto (orden aleatorio)
--   * seguidores aleatorios SOLO entre las cuentas sembradas (sin falsos)
-- Idempotente: si ya existe 'lure_seed_01' no vuelve a sembrar.
-- Contraseña de todas las cuentas: secreto123
-- =============================================================
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF EXISTS (SELECT 1 FROM dbo.users WHERE user_handle = 'lure_seed_01')
BEGIN
    PRINT 'Ya sembrado (lure_seed_01 existe). Abortando.';
    RETURN;
END

-- Hash bcrypt reutilizado (cualquier hash válido de "secreto123" sirve).
DECLARE @pwd VARCHAR(255) = (SELECT TOP 1 password FROM dbo.users WHERE password LIKE '$2%' ORDER BY user_id);
IF @pwd IS NULL
BEGIN
    PRINT 'No hay ningun hash bcrypt previo. Registra un usuario antes de sembrar.';
    RETURN;
END

-- ---- Catálogos ----
DECLARE @names TABLE (n INT IDENTITY(1,1), nombre NVARCHAR(50), apellido NVARCHAR(50));
INSERT INTO @names (nombre, apellido) VALUES
(N'Lucía',N'García'),(N'Martín',N'Fernández'),(N'Sofía',N'Martínez'),(N'Hugo',N'López'),
(N'Valeria',N'Sánchez'),(N'Mateo',N'Pérez'),(N'Daniela',N'Gómez'),(N'Leo',N'Díaz'),
(N'Martina',N'Ruiz'),(N'Pablo',N'Moreno'),(N'Emma',N'Muñoz'),(N'Bruno',N'Álvarez'),
(N'Carla',N'Romero'),(N'Diego',N'Alonso'),(N'Noa',N'Gutiérrez'),(N'Álex',N'Navarro'),
(N'Julia',N'Torres'),(N'Marcos',N'Domínguez'),(N'Vega',N'Vázquez'),(N'Iker',N'Ramos'),
(N'Alba',N'Gil'),(N'Adriana',N'Serrano'),(N'Nico',N'Blanco'),(N'Lía',N'Molina'),
(N'Gael',N'Castro'),(N'Olivia',N'Ortega'),(N'Thiago',N'Rubio'),(N'Chloe',N'Marín'),
(N'Enzo',N'Suárez'),(N'India',N'Ortiz');

DECLARE @videos TABLE (id INT IDENTITY, url NVARCHAR(300));
INSERT INTO @videos(url) VALUES
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4');

DECLARE @pdfs TABLE (id INT IDENTITY, url NVARCHAR(300));
INSERT INTO @pdfs(url) VALUES
('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'),
('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
('https://www.africau.edu/images/default/sample.pdf');

DECLARE @phrases TABLE (id INT IDENTITY, t NVARCHAR(200));
INSERT INTO @phrases(t) VALUES
(N'Hoy ha sido un gran día programando 🚀'),
(N'¿Alguien más enganchado a las nuevas series? 🍿'),
(N'Acabo de terminar mi proyecto y estoy muy contento 💪'),
(N'El café de esta mañana sabía a victoria ☕'),
(N'Compartiendo un poco de lo que estoy aprendiendo estos días 📚'),
(N'Qué ganas de que llegue el finde 😎'),
(N'Pequeños pasos cada día llevan a grandes resultados ✨'),
(N'Probando cosas nuevas en el laboratorio de ideas 🧪'),
(N'Hilo sobre lo que he descubierto hoy 👇'),
(N'La constancia siempre gana a la motivación 🔥'),
(N'Un atardecer increíble desde la ventana 🌇'),
(N'Recomendadme música para concentrarme 🎧'),
(N'Hoy toca repasar y ordenar ideas 📝'),
(N'Nada como una buena charla entre amigos 🙌'),
(N'Aprendiendo algo nuevo cada día en Lure 🐟'),
(N'El mejor momento para empezar fue ayer; el segundo mejor es hoy.');

-- ---- Variables de trabajo ----
DECLARE @i INT = 1, @j INT, @offset INT, @mtype INT;
DECLARE @nombre NVARCHAR(50), @apellido NVARCHAR(50);
DECLARE @handle VARCHAR(50), @email VARCHAR(50), @avatar VARCHAR(255), @bio NVARCHAR(280);
DECLARE @uid INT, @text NVARCHAR(200), @media NVARCHAR(MAX), @created DATETIME;

WHILE @i <= 30
BEGIN
    SELECT @nombre = nombre, @apellido = apellido FROM @names WHERE n = @i;
    SET @handle = 'lure_seed_' + RIGHT('0' + CAST(@i AS VARCHAR(2)), 2);
    SET @email  = @handle + '@lure.test';
    SET @avatar = 'https://i.pravatar.cc/150?img=' + CAST(((@i - 1) % 70) + 1 AS VARCHAR(3));
    SET @bio    = N'Cuenta de demo de Lure · ' + @nombre + N' ' + @apellido;

    INSERT INTO dbo.users
        (user_handle, email_address, first_name, last_name, password, follower_count, avatar_url, bio, is_verified, user_role)
    VALUES
        (@handle, @email, @nombre, @apellido, @pwd, 0, @avatar, @bio, ABS(CHECKSUM(NEWID())) % 5, 'user');

    SET @uid = SCOPE_IDENTITY();

    -- 4 tweets: tipos {0 img, 1 video, 2 pdf, 3 texto} rotados aleatoriamente.
    SET @offset = ABS(CHECKSUM(NEWID())) % 4;
    SET @j = 1;
    WHILE @j <= 4
    BEGIN
        SET @mtype = (@j - 1 + @offset) % 4;
        SET @text = (SELECT TOP 1 t FROM @phrases ORDER BY NEWID());
        SET @created = DATEADD(MINUTE, -(ABS(CHECKSUM(NEWID())) % 20160), GETDATE());

        IF @mtype = 0
            SET @media = N'{"type":"image","url":"https://picsum.photos/seed/' + @handle + CAST(@j AS VARCHAR(2)) + N'/640/400"}';
        ELSE IF @mtype = 1
            SET @media = N'{"type":"video","url":"' + (SELECT TOP 1 url FROM @videos ORDER BY NEWID()) + N'"}';
        ELSE IF @mtype = 2
            SET @media = N'{"type":"pdf","url":"' + (SELECT TOP 1 url FROM @pdfs ORDER BY NEWID()) + N'"}';
        ELSE
            SET @media = NULL;

        INSERT INTO dbo.tweets
            (user_id, tweet_text, num_likes, num_retweets, num_comments, created_at, media_urls)
        VALUES
            (@uid, @text, ABS(CHECKSUM(NEWID())) % 50, ABS(CHECKSUM(NEWID())) % 20, ABS(CHECKSUM(NEWID())) % 15, @created, @media);

        SET @j = @j + 1;
    END

    SET @i = @i + 1;
END

-- ---- Seguidores aleatorios SOLO entre las cuentas sembradas ----
DECLARE @seed TABLE (uid INT);
INSERT INTO @seed (uid) SELECT user_id FROM dbo.users WHERE user_handle LIKE 'lure_seed_%';

DECLARE @follower INT;
DECLARE seed_cur CURSOR LOCAL FAST_FORWARD FOR SELECT uid FROM @seed;
OPEN seed_cur;
FETCH NEXT FROM seed_cur INTO @follower;
WHILE @@FETCH_STATUS = 0
BEGIN
    INSERT INTO dbo.followers (follower_id, following_id)
    SELECT TOP (3 + ABS(CHECKSUM(NEWID())) % 9) @follower, s.uid
    FROM @seed s
    WHERE s.uid <> @follower
      AND NOT EXISTS (SELECT 1 FROM dbo.followers f WHERE f.follower_id = @follower AND f.following_id = s.uid)
    ORDER BY NEWID();

    FETCH NEXT FROM seed_cur INTO @follower;
END
CLOSE seed_cur;
DEALLOCATE seed_cur;

-- ---- Recalcular follower_count denormalizado ----
UPDATE u
SET follower_count = (SELECT COUNT(*) FROM dbo.followers f WHERE f.following_id = u.user_id)
FROM dbo.users u
WHERE u.user_handle LIKE 'lure_seed_%';

PRINT 'Seed completado: 30 cuentas, ~120 tweets, seguidores aleatorios.';
