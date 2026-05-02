import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { uploadApi } from '../api/api';

interface UploadState {
    uploading: boolean;
    progress: number;
    success: boolean;
    error: string | null;
}

const initialState: UploadState = {
    uploading: false,
    progress: 0,
    success: false,
    error: null,
};

export const uploadVideo = createAsyncThunk(
    'upload/video',
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const response = await uploadApi.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // You can add onUploadProgress here if needed
            });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Upload failed');
        }
    }
);

const uploadSlice = createSlice({
    name: 'upload',
    initialState,
    reducers: {
        resetUpload: (state) => {
            state.uploading = false;
            state.progress = 0;
            state.success = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadVideo.pending, (state) => {
                state.uploading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(uploadVideo.fulfilled, (state) => {
                state.uploading = false;
                state.success = true;
            })
            .addCase(uploadVideo.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetUpload } = uploadSlice.actions;
export default uploadSlice.reducer;
