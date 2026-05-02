import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import videoReducer from './videoSlice';
import uploadReducer from './uploadSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        videos: videoReducer,
        upload: uploadReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;