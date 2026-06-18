-- Reemplaza las URLs de vídeo rotas (gtv-videos-bucket de Google, ahora 403)
-- por URLs públicas que sí sirven video/mp4.
SET NOCOUNT ON;

UPDATE dbo.tweets
SET media_urls = '{"type":"video","url":"' +
    (CASE ABS(CHECKSUM(NEWID())) % 3
        WHEN 0 THEN 'https://www.w3schools.com/html/mov_bbb.mp4'
        WHEN 1 THEN 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'
        ELSE 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
     END) + '"}'
WHERE media_urls LIKE '%"type":"video"%';

PRINT 'URLs de vídeo actualizadas.';
