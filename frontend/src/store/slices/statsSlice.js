import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchOrgStats = createAsyncThunk('stats/fetchOrg', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/api/stats/org');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to load org stats');
  }
});

const statsSlice = createSlice({
  name: 'stats',
  initialState: {
    orgStats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgStats.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrgStats.fulfilled, (state, action) => { state.loading = false; state.orgStats = action.payload; })
      .addCase(fetchOrgStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default statsSlice.reducer;
