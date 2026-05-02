import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { watchApi, authApi } from '../api/api';
import axios from 'axios';

export interface Video {
    id: string;
    title: string;
    user_id?: string;
    userId?: string;
    created_at?: string;
    createdAt?: string;
    status?: string;
    streamUrl?: string;
    thumbnailUrl?: string;
}

export interface SubscriptionStatus {
    isSubscribed: boolean;
    subscriberCount: number;
}

interface VideoState {
    videos: Video[];
    currentVideo: Video | null;
    loading: boolean;
    error: string | null;
    subscribedVideos: Video[];
    trendingVideos: Video[];
    subscriptionStatus: SubscriptionStatus | null;
    isLiked: boolean;
    likedVideos: Video[];
    watchHistory: Video[];
    myVideos: Video[];
}

const initialState: VideoState = {
    videos: [],
    currentVideo: null,
    loading: false,
    error: null,
    subscribedVideos: [],
    trendingVideos: [],
    subscriptionStatus: null,
    isLiked: false,
    likedVideos: [],
    watchHistory: [],
    myVideos: [],
};

export const fetchVideos = createAsyncThunk(
    'videos/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await watchApi.get('/');
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch videos');
        }
    }
);

export const fetchVideoById = createAsyncThunk(
    'videos/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await watchApi.get(`/${id}`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch video details');
        }
    }
);

export const fetchSubscribedVideos = createAsyncThunk(
    'videos/fetchSubscribed',
    async (_, { rejectWithValue }) => {
        try {
            const response = await watchApi.get('/subscribed');
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch subscribed videos');
        }
    }
);

export const subscribeToCreator = createAsyncThunk(
    'videos/subscribe',
    async (creatorId: string, { rejectWithValue, dispatch, getState }) => {
        try {
            await authApi.post('/v1/subscriptions/subscribe', { creatorId });
            // Refresh status after subscribing
            dispatch(checkSubscriptionStatus(creatorId));
            return true;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to subscribe');
        }
    }
);

export const unsubscribeFromCreator = createAsyncThunk(
    'videos/unsubscribe',
    async (creatorId: string, { rejectWithValue, dispatch }) => {
        try {
            await authApi.post('/v1/subscriptions/unsubscribe', { creatorId });
            // Refresh status after unsubscribing
            dispatch(checkSubscriptionStatus(creatorId));
            return false;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Failed to unsubscribe');
        }
    }
);

export const checkSubscriptionStatus = createAsyncThunk(
    'videos/checkStatus',
    async (creatorId: string, { rejectWithValue }) => {
        try {
            const response = await authApi.get(`/v1/subscriptions/status/${creatorId}`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Failed to check subscription status');
        }
    }
);

export const fetchTrendingVideos = createAsyncThunk(
    'videos/fetchTrending',
    async (_, { rejectWithValue }) => {
        try {
            const response = await watchApi.get('/trending');
            // Axios stores the JSON body in .data
            return response.data;
        } catch (error) {
            // 1. Check if the error came from the server (Axios specific)
            if (axios.isAxiosError(error) && error.response && error.response.data) {
                // Return the custom error message from your backend
                return rejectWithValue(error.response.data.message || "Failed to fetch trending videos");
            }
            // 2. Fallback for network errors (e.g., server is down)
            return rejectWithValue(error.message);
        }
    }
);

export const incrementView = createAsyncThunk(
    'videos/incrementView',
    async (id: string, { rejectWithValue }) => {
        try {
            await watchApi.post(`/${id}/view`);
            return true;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to increment view count');
        }
    }
);

export const toggleLike = createAsyncThunk(
    'videos/toggleLike',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await watchApi.post(`/${id}/like`);
            return response.data.liked;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to toggle like');
        }
    }
);

export const fetchLikeStatus = createAsyncThunk(
    'videos/fetchLikeStatus',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await watchApi.get(`/${id}/like-status`);
            return response.data.liked;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch like status');
        }
    }
);

export const fetchLikedVideos = createAsyncThunk(
    'videos/fetchLiked',
    async (_, { rejectWithValue }) => {
        try {
            const response = await watchApi.get('/liked');
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch liked videos');
        }
    }
);

export const fetchWatchHistory = createAsyncThunk(
    'videos/fetchHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await watchApi.get('/history');
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch watch history');
        }
    }
);

export const fetchMyVideos = createAsyncThunk(
    'videos/fetchMyVideos',
    async (_, { rejectWithValue }) => {
        try {
            const response = await watchApi.get('/my-videos');
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch your videos');
        }
    }
);


const videoSlice = createSlice({
    name: 'videos',
    initialState,
    reducers: {
        clearCurrentVideo: (state) => {
            state.currentVideo = null;
        },
        clearVideoError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVideos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
                state.loading = false;
                state.videos = action.payload;
            })
            .addCase(fetchVideos.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchVideoById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVideoById.fulfilled, (state, action: PayloadAction<Video>) => {
                state.loading = false;
                state.currentVideo = action.payload;
            })
            .addCase(fetchVideoById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchSubscribedVideos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubscribedVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
                state.loading = false;
                state.subscribedVideos = action.payload;
            })
            .addCase(fetchSubscribedVideos.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(checkSubscriptionStatus.fulfilled, (state, action: PayloadAction<SubscriptionStatus>) => {
                state.subscriptionStatus = action.payload;
            })
            .addCase(fetchTrendingVideos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTrendingVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
                state.loading = false;
                state.trendingVideos = action.payload;
            })
            .addCase(fetchTrendingVideos.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(toggleLike.fulfilled, (state, action: PayloadAction<boolean>) => {
                state.isLiked = action.payload;
            })
            .addCase(fetchLikeStatus.fulfilled, (state, action: PayloadAction<boolean>) => {
                state.isLiked = action.payload;
            })
            .addCase(fetchLikedVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
                state.likedVideos = action.payload;
            })
            .addCase(fetchWatchHistory.fulfilled, (state, action: PayloadAction<Video[]>) => {
                state.watchHistory = action.payload;
            })
            .addCase(fetchMyVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
                state.myVideos = action.payload;
            });
    },
});

export const { clearCurrentVideo, clearVideoError } = videoSlice.actions;
export default videoSlice.reducer;
