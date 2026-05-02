import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectService from '../../services/projectService';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await projectService.getAll();
    return data.projects ?? data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to load projects');
  }
});

export const fetchProjectById = createAsyncThunk('projects/fetchById', async (id, { rejectWithValue }) => {
  try {
    const data = await projectService.getById(id);
    return data.project ?? data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to load project');
  }
});

export const createProject = createAsyncThunk('projects/create', async (payload, { rejectWithValue }) => {
  try {
    const data = await projectService.create(payload);
    return data.project ?? data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to create project');
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await projectService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to delete project');
  }
});

export const addProjectMember = createAsyncThunk('projects/addMember', async ({ projectId, userId }, { dispatch, rejectWithValue }) => {
  try {
    await projectService.addMember(projectId, userId);
    dispatch(fetchProjectById(projectId));
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to add member');
  }
});

export const removeProjectMember = createAsyncThunk('projects/removeMember', async ({ projectId, userId }, { dispatch, rejectWithValue }) => {
  try {
    await projectService.removeMember(projectId, userId);
    dispatch(fetchProjectById(projectId));
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to remove member');
  }
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    list: [],
    currentProject: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProject(state) { state.currentProject = null; },
    clearProjectError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProjects.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchProjectById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProjectById.fulfilled, (state, action) => { state.loading = false; state.currentProject = action.payload; })
      .addCase(fetchProjectById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createProject.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(createProject.rejected, (state, action) => { state.error = action.payload; })

      .addCase(deleteProject.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProject.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearCurrentProject, clearProjectError } = projectsSlice.actions;
export default projectsSlice.reducer;
