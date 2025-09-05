import { createStore, combineReducers } from 'redux';
import {clientReducer} from './clientReducer';
import uiReducer from './uiReducer'; // 👈 import ui slice

// Combine reducers
const rootReducer = combineReducers({
  client: clientReducer,
  ui: uiReducer, // 👈 add ui reducer
});

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('reduxState', serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

const persistedState = loadState();

const store = createStore(
  rootReducer,
  persistedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

// Save state on change
store.subscribe(() => {
  saveState(store.getState());
});

export default store;
