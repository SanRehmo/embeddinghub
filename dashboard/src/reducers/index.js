import { combineReducers } from "redux";
import { navSectionsReducer } from "components/app";
import {
  resourceReducer,
  versionReducer,
  tagReducer,
} from "components/resource-list";
import { homePageReducer } from "components/homepage";
import { breadCrumbsReducer } from "components/breadcrumbs";
import { entityPageReducer } from "components/entitypage";
import { searchResultsReducer } from "components/searchresults";

export default combineReducers({
  navSections: navSectionsReducer,
  resourceList: resourceReducer,
  selectedVersion: versionReducer,
  selectedTags: tagReducer,
  homePageSections: homePageReducer,
  breadCrumbs: breadCrumbsReducer,
  entityPage: entityPageReducer,
  searchResults: searchResultsReducer,
});
