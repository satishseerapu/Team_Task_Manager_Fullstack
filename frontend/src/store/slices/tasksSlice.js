import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taskService from '../../services/taskService';

export const fetchTasksByProject = createAsyncThunk('tasks/fetchByProject', async (projectId, { rejectWithValue }) => {
  try {
    const data = await taskService.getByProject(projectId);
    return data.tasks ?? data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to load tasks');
  }
});

export const createTask = createAsyncThunk('tasks/create', async (payload, { rejectWithValue }) => {
  try {
    const data = await taskService.create(payload);
    return data.task ?? data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const data = await taskService.update(id, payload);
    return data.task ?? data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await taskService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to delete task');
  }
});

export const updateTaskStatus = createAsyncThunk('tasks/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const data = await taskService.updateStatus(id, status);
    return data.task ?? { _id: id, status };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to update status');
  }
});

export const assignTask = createAsyncThunk('tasks/assign', async ({ id, assignedTo }, { rejectWithValue }) => {
  try {
    const data = await taskService.assign(id, assignedTo);
    return data.task ?? data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? 'Failed to assign task');
  }
});

function patchTask(list, updated) {
  const idx = list.findIndex((t) => t._id === updated._id);
  if (idx !== -1) list[idx] = { ...list[idx], ...updated };
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    projectTasks: [],
    allProjectTasks: [],
    fetchedProjectIds: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTaskError(state) { state.error = null; },
    clearProjectTasks(state) { state.projectTasks = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByProject.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projectTasks = action.payload;
        const projectId = action.meta.arg;
        if (!state.fetchedProjectIds.includes(projectId)) {
          state.fetchedProjectIds.push(projectId);
        }
        const existing = new Map(state.allProjectTasks.map((task) => [task._id, task]));
        action.payload.forEach((task) => {
          if (task && task._id) {
            existing.set(task._id, { ...existing.get(task._id), ...task });
          }
        });
        state.allProjectTasks = Array.from(existing.values());
      })
      .addCase(fetchTasksByProject.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createTask.fulfilled, (state, action) => {
        state.projectTasks.push(action.payload);
        if (!state.allProjectTasks.find((task) => task._id === action.payload._id)) {
          state.allProjectTasks.push(action.payload);
        }
      })
      .addCase(createTask.rejected, (state, action) => { state.error = action.payload; })

      .addCase(updateTask.fulfilled, (state, action) => {
        patchTask(state.projectTasks, action.payload);
        patchTask(state.allProjectTasks, action.payload);
      })
      .addCase(updateTask.rejected, (state, action) => { state.error = action.payload; })

      .addCase(deleteTask.fulfilled, (state, action) => {
        state.projectTasks = state.projectTasks.filter((t) => t._id !== action.payload);
        state.allProjectTasks = state.allProjectTasks.filter((t) => t._id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => { state.error = action.payload; })

      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        patchTask(state.projectTasks, action.payload);
        patchTask(state.allProjectTasks, action.payload);
      })

      .addCase(assignTask.fulfilled, (state, action) => {
        patchTask(state.projectTasks, action.payload);
        patchTask(state.allProjectTasks, action.payload);
      });
  },
});

export const { clearTaskError, clearProjectTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
