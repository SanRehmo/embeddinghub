import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { resourceTypes } from "api/resources";

const assertAndCheck = (assertion, errorMessage) => {
  console.assert(assertion, { errorMsg: errorMessage });
  return assertion;
};

const hasRequiredObjects = (resources) => {
  let af = true;
  af &= assertAndCheck(
    Array.isArray(resources),
    "Resource list fetch not an array"
  );

  resources.forEach((resource) => {
    af &= assertAndCheck("name" in resource, "Resource has no name element");
    af &= assertAndCheck(
      "default-version" in resource,
      "Resource has no default version"
    );
    af &= assertAndCheck(
      "all-versions" in resource,
      "Resource has no versions list"
    );
    af &= assertAndCheck(
      "versions" in resource,
      "Resource has no versions object"
    );
    resource["all-versions"].forEach((version) => {
      af &= assertAndCheck(
        Object.keys(resource["versions"]).includes(version),
        "Element of version list not in versions"
      );
    });
    af &= assertAndCheck(
      Object.keys(resource["versions"]).includes(resource["default-version"]),
      "Default version not included in resource"
    );
    Object.keys(resource["versions"]).forEach((key) => {
      af &= assertAndCheck(
        resource["all-versions"].includes(key),
        "Version in version object not in version list"
      );
    });
  });
  return af;
};

export const fetchResources = createAsyncThunk(
  "resourceList/fetchByType",
  async ({ api, type }, { signal }) => {
    const response = await api.fetchResources(type, signal);
    return response.data;
  },
  {
    condition: ({ type }, { getState }) => {
      const { resources, loading } = getState().resourceList[type];

      if (loading || resources) {
        return false;
      }
    },
  }
);

const reduceFn = (map, type) => {
  map[type] = {};
  return map;
};
const reduceFnInitial = {};
export const initialState = Object.values(resourceTypes).reduce(
  reduceFn,
  reduceFnInitial
);

const resourceSlice = createSlice({
  name: "resourceList",
  // initialState is a map between each resource type to an empty object.
  initialState: initialState,
  extraReducers: {
    [fetchResources.pending]: (state, action) => {
      const type = action.meta.arg.type;
      const requestId = action.meta.requestId;
      state[type].requestId = requestId;
      state[type].resources = null;
      state[type].loading = true;
      state[type].failed = false;
    },
    [fetchResources.fulfilled]: (state, action) => {
      const type = action.meta.arg.type;
      const requestId = action.meta.requestId;
      if (requestId !== state[type].requestId) {
        return;
      }
      const hasRequired = hasRequiredObjects(action.payload);
      if (hasRequired) {
        state[type].resources = action.payload;
        state[type].loading = false;
        state[type].failed = false;
      } else {
        state[type].resources = null;
        state[type].loading = false;
        state[type].failed = true;
      }
    },
    [fetchResources.rejected]: (state, action) => {
      const type = action.meta.arg.type;
      const requestId = action.meta.requestId;
      if (requestId !== state[type].requestId) {
        return;
      }
      state[type].loading = false;
      state[type].failed = true;
    },
  },
});

export default resourceSlice.reducer;
