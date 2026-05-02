import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

export const fetchOrgMembers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await userService.getOrgMembers();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to load members');
  }
});

export const createOrgUser = createAsyncThunk('users/create', async (payload, { rejectWithValue }) => {
  try {
    return await userService.createUser(payload);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to create user');
  }
});

export const changeUserRole = createAsyncThunk('users/updateRole', async ({ userId, role }, { rejectWithValue }) => {
  try {
    return await userService.updateRole(userId, role);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to update role');
  }
});

export const removeOrgUser = createAsyncThunk('users/remove', async (userId, { rejectWithValue }) => {
  try {
    await userService.removeUser(userId);
    return userId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to remove user');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    error: null,
    actionError: null,
  },
  reducers: {
    clearUsersError(state) {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgMembers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrgMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.users ?? action.payload ?? [];
      })
      .addCase(fetchOrgMembers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createOrgUser.fulfilled, (state, action) => {
        const user = action.payload?.user ?? action.payload;
        if (user) state.list.unshift(user);
        state.actionError = null;
      })
      .addCase(createOrgUser.rejected, (state, action) => { state.actionError = action.payload; })

      .addCase(changeUserRole.fulfilled, (state, action) => {
        const updated = action.payload?.user ?? action.payload;
        if (updated) {
          const idx = state.list.findIndex((u) => (u._id ?? u.id) === (updated._id ?? updated.id));
          if (idx !== -1) state.list[idx] = { ...state.list[idx], role: updated.role };
        }
        state.actionError = null;
      })
      .addCase(changeUserRole.rejected, (state, action) => { state.actionError = action.payload; })

      .addCase(removeOrgUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => (u._id ?? u.id) !== action.payload);
        state.actionError = null;
      })
      .addCase(removeOrgUser.rejected, (state, action) => { state.actionError = action.payload; });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
