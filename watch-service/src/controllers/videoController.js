const db = require('../config/db');
const redisClient = require('../config/redis');

const MINIO_EXTERNAL_ENDPOINT = process.env.MINIO_EXTERNAL_ENDPOINT || 'http://localhost:9000';
const PROCESSED_BUCKET = process.env.MINIO_PROCESSED_BUCKET || 'processed-hls';

const getStreamUrl = (userId, videoId) => {
    return `${MINIO_EXTERNAL_ENDPOINT}/${PROCESSED_BUCKET}/processed/${userId}/${videoId}/master.m3u8`;
};

const getThumbnailUrl = (userId, videoId) => {
    return `${MINIO_EXTERNAL_ENDPOINT}/${PROCESSED_BUCKET}/processed/${userId}/${videoId}/thumbnail.jpg`;
};

const getVideos = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, title, user_id, created_at FROM videos WHERE status = 'READY' ORDER BY created_at DESC"
        );

        const videos = result.rows.map(video => ({
            ...video,
            streamUrl: getStreamUrl(video.user_id, video.id),
            thumbnailUrl: getThumbnailUrl(video.user_id, video.id)
        }));

        res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getSubscribedVideos = async (req, res) => {
    const subscriberId = req.user.userId;
    try {
        const query = `
            SELECT v.id, v.title, v.user_id, v.created_at 
            FROM videos v
            JOIN subscriptions s ON v.user_id = s.creator_id
            WHERE s.subscriber_id = $1 AND v.status = 'READY'
            ORDER BY v.created_at DESC
        `;
        const result = await db.query(query, [subscriberId]);

        const videos = result.rows.map(video => ({
            ...video,
            streamUrl: getStreamUrl(video.user_id, video.id),
            thumbnailUrl: getThumbnailUrl(video.user_id, video.id)
        }));

        res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching subscribed videos:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getVideoById = async (req, res) => {
    const { id } = req.params;
    console.log('DEBUG: getVideoById hit with id:', id);
    const cacheKey = `video:${id}`;

    try {
        // 1. Check Redis Cache
        const cachedVideo = await redisClient.get(cacheKey);
        if (cachedVideo) {
            console.log(`Cache hit for video: ${id}`);
            return res.status(200).json(JSON.parse(cachedVideo));
        }

        // 2. Query Database
        const result = await db.query(
            "SELECT id, title, user_id, created_at, status FROM videos WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const video = result.rows[0];

        if (video.status !== 'READY') {
            return res.status(403).json({ message: 'Video is not yet processed' });
        }

        const videoData = {
            id: video.id,
            title: video.title,
            userId: video.user_id,
            createdAt: video.created_at,
            streamUrl: getStreamUrl(video.user_id, video.id),
            thumbnailUrl: getThumbnailUrl(video.user_id, video.id)
        };

        // 3. Cache in Redis (TTL: 1 hour)
        await redisClient.set(cacheKey, JSON.stringify(videoData), {
            EX: 3600
        });

        res.status(200).json(videoData);
    } catch (error) {
        console.error('Error fetching video by id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const incrementVideoView = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const result = await db.query('SELECT * FROM videos WHERE id = $1', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const [updateResult] = await Promise.all([
            db.query('UPDATE videos SET view_count = view_count + 1 WHERE id = $1 RETURNING view_count', [id]),
            db.query(`
                INSERT INTO watch_history (user_id, video_id) 
                VALUES ($1, $2) 
                ON CONFLICT (user_id, video_id) 
                DO UPDATE SET viewed_at = CURRENT_TIMESTAMP
            `, [userId, id])
        ]);

        const historyKey = `user:history:${userId}`;
        await redisClient.lPush(historyKey, id);
        await redisClient.lTrim(historyKey, 0, 9);

        if (updateResult.rowCount > 0) {
            res.status(200).json({ message: 'View tracked and history updated', views: updateResult.rows[0].view_count });
        } else {
            res.status(500).json({ message: 'Failed to update view count' });
        }
    } catch (error) {
        console.error('Error updating video by id:', error);
        res.status(500).json({ message: 'Internal server error' });

    }


}

const getTrendingVideos = async (req, res) => {
    const readyStatus = 'READY'

    try {
        const result = await db.query('SELECT id, title, user_id, created_at, view_count FROM videos WHERE status = $1 ORDER BY view_count DESC LIMIT 20', [readyStatus]);
        console.log(result)

        const videos = result.rows.map(video => ({
            ...video,
            streamUrl: getStreamUrl(video.user_id, video.id),
            thumbnailUrl: getThumbnailUrl(video.user_id, video.id)
        }));

        return res.status(200).json(videos);

    } catch (error) {

        console.error('Error fetching trending videos:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });

    }
}

const toggleLikeVideo = async (req, res) => {
    const { id: videoId } = req.params;
    const userId = req.user.userId;

    try {
        // Check if already liked
        const checkLike = await db.query(
            'SELECT * FROM video_likes WHERE user_id = $1 AND video_id = $2',
            [userId, videoId]
        );

        if (checkLike.rowCount > 0) {
            // Unlike
            await db.query(
                'DELETE FROM video_likes WHERE user_id = $1 AND video_id = $2',
                [userId, videoId]
            );
            return res.status(200).json({ liked: false, message: 'Video unliked' });
        } else {
            // Like
            await db.query(
                'INSERT INTO video_likes (user_id, video_id) VALUES ($1, $2)',
                [userId, videoId]
            );
            return res.status(200).json({ liked: true, message: 'Video liked' });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getLikedVideos = async (req, res) => {
    const userId = req.user.userId;

    try {
        const query = `
            SELECT v.id, v.title, v.user_id, v.created_at, v.view_count
            FROM videos v
            JOIN video_likes l ON v.id = l.video_id
            WHERE l.user_id = $1
            ORDER BY v.created_at DESC
        `;
        const result = await db.query(query, [userId]);

        const videos = result.rows.map(video => ({
            ...video,
            streamUrl: getStreamUrl(video.user_id, video.id),
            thumbnailUrl: getThumbnailUrl(video.user_id, video.id)
        }));

        res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching liked videos:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const checkLikeStatus = async (req, res) => {
    const { id: videoId } = req.params;
    const userId = req.user.userId;

    try {
        const result = await db.query(
            'SELECT * FROM video_likes WHERE user_id = $1 AND video_id = $2',
            [userId, videoId]
        );
        res.status(200).json({ liked: result.rowCount > 0 });
    } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getWatchHistory = async (req, res) => {
    const userId = req.user.userId;

    try {
        const query = `
            SELECT v.id, v.title, v.user_id, v.created_at, v.view_count, h.viewed_at
            FROM videos v
            JOIN watch_history h ON v.id = h.video_id
            WHERE h.user_id = $1
            ORDER BY h.viewed_at DESC
            LIMIT 50
        `;
        const result = await db.query(query, [userId]);

        const videos = result.rows.map(video => ({
            ...video,
            streamUrl: getStreamUrl(video.user_id, video.id),
            thumbnailUrl: getThumbnailUrl(video.user_id, video.id)
        }));

        res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching watch history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getMyVideos = async (req, res) => {
    console.log('DEBUG: getMyVideos hit');
    const userId = req.user.userId;

    try {
        const result = await db.query(
            "SELECT id, title, status, created_at, view_count FROM videos WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );

        const videos = result.rows.map(video => ({
            ...video,
            user_id: userId,
            streamUrl: video.status === 'READY' ? getStreamUrl(userId, video.id) : null,
            thumbnailUrl: video.status === 'READY' ? getThumbnailUrl(userId, video.id) : null
        }));

        res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching my videos:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getVideos,
    getVideoById,
    getSubscribedVideos,
    incrementVideoView,
    getTrendingVideos,
    toggleLikeVideo,
    getLikedVideos,
    checkLikeStatus,
    getWatchHistory,
    getMyVideos
};

