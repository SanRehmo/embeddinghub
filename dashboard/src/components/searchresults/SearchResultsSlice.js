import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import SearchEngine from "./searchengine/SearchEngine";

const searchEngine = new SearchEngine();

export const fetchSearch = createAsyncThunk(
  "searchResults/fetchSearch",
  async ({ api, query }, { signal }) => {
    const response = await api.fetchSearch(query, signal);
    const filteredResults = searchEngine.filterSearch(query, response.data);
    return filteredResults;
  },
  {
    condition: ({ api, query }, { getState }) => {
      const { loading } = getState().searchResults;
      if (loading) {
        return false;
      }
    },
  }
);

export const initialState = {};

const searchResultsSlice = createSlice({
  name: "searchResults",
  // initialState is a map between each resource type to an empty object.
  initialState: initialState,
  extraReducers: {
    [fetchSearch.pending]: (state, action) => {
      const requestId = action.meta.requestId;
      state.requestId = requestId;
      state.resources = null;
      state.loading = true;
      state.failed = false;
    },
    [fetchSearch.fulfilled]: (state, action) => {
      const requestId = action.meta.requestId;
      if (requestId !== state.requestId) {
        return;
      }
      state.resources = action.payload;
      state.loading = false;
      state.failed = false;
    },
    [fetchSearch.rejected]: (state, action) => {
      const requestId = action.meta.requestId;
      if (requestId !== state.requestId) {
        return;
      }
      state.loading = false;
      state.failed = true;
    },
  },
});

export default searchResultsSlice.reducer;
