import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchQuizzes = createAsyncThunk(
  "quizzes/fetchQuizzes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/quizzes");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load quizzes."
      );
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  "quizzes/fetchQuizById",
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load quiz details."
      );
    }
  }
);

export const submitQuiz = createAsyncThunk(
  "quizzes/submitQuiz",
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit quiz."
      );
    }
  }
);

const initialState = {
  items: [],
  currentQuiz: null,
  result: null,
  listStatus: "idle",
  detailStatus: "idle",
  submitStatus: "idle",
  listError: "",
  detailError: "",
  submitError: "",
};

const quizSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    clearQuizResult: (state) => {
      state.result = null;
      state.submitStatus = "idle";
      state.submitError = "";
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
      state.detailStatus = "idle";
      state.detailError = "";
      state.result = null;
      state.submitStatus = "idle";
      state.submitError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.listStatus = "loading";
        state.listError = "";
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      })
      .addCase(fetchQuizById.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = "";
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError = action.payload;
        state.currentQuiz = null;
      })
      .addCase(submitQuiz.pending, (state) => {
        state.submitStatus = "loading";
        state.submitError = "";
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.submitStatus = "succeeded";
        state.result = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.submitStatus = "failed";
        state.submitError = action.payload;
      });
  },
});

export const { clearQuizResult, clearCurrentQuiz } = quizSlice.actions;
export default quizSlice.reducer;
