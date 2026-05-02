import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { storage } from '../../utils/storage';

export const loginThunk = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await authService.login(email, password);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Invalid credentials');
  }
});

export const signupThunk = createAsyncThunk('auth/signup', async (payload, { rejectWithValue }) => {
  try {
    return await authService.signup(payload);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Registration failed');
  }
});

export const updateProfileThunk = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    return await authService.updateProfile(payload);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to update profile');
  }
});

export const fetchProfileThunk = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    return await authService.getProfile();
  } catch (err) {
    storage.clear();
    return rejectWithValue('Session expired');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.loading = false;
      state.error = null;
      storage.clear();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; })
      .addCase(loginThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(signupThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signupThunk.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; })
      .addCase(signupThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProfileThunk.pending, (state) => { state.loading = true; })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? action.payload;
        storage.setUser(state.user);
      })
      .addCase(fetchProfileThunk.rejected, (state) => { state.loading = false; state.user = null; })

      .addCase(updateProfileThunk.pending, (state) => { state.error = null; })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        const updated = action.payload?.user ?? action.payload;
        if (updated) {
          state.user = { ...state.user, ...updated };
          storage.setUser(state.user);
        }
      })
      .addCase(updateProfileThunk.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
