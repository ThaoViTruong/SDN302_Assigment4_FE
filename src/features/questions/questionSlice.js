import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchQuestions = createAsyncThunk(
  "questions/fetchQuestions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/questions");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load questions."
      );
    }
  }
);

export const createQuestion = createAsyncThunk(
  "questions/createQuestion",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/questions", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create question."
      );
    }
  }
);

export const updateQuestion = createAsyncThunk(
  "questions/updateQuestion",
  async ({ questionId, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/questions/${questionId}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update question."
      );
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  "questions/deleteQuestion",
  async (questionId, { rejectWithValue }) => {
    try {
      await api.delete(`/questions/${questionId}`);
      return questionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete question."
      );
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  actionStatus: "idle",
  error: "",
  actionError: "",
};

const questionSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    clearQuestionFeedback: (state) => {
      state.actionStatus = "idle";
      state.actionError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createQuestion.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = "";
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload;
      })
      .addCase(updateQuestion.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = "";
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.items = state.items.map((question) =>
          question._id === action.payload._id ? action.payload : question
        );
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload;
      })
      .addCase(deleteQuestion.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = "";
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.items = state.items.filter(
          (question) => question._id !== action.payload
        );
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.actionError = action.payload;
      });
  },
});

export const { clearQuestionFeedback } = questionSlice.actions;
export default questionSlice.reducer;
