import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";

import reducer from "./reducer";

const middleware = [thunk];
const composeEnhancers = compose(applyMiddleware(...middleware));

const configureStore = () => {
  return createStore(reducer, composeEnhancers);
};

const store = configureStore();

export default store;
