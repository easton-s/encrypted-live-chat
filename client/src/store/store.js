import { applyMiddleware, compose, configureStore } from "redux";
import thunk from "redux-thunk";

import reducer from "./reducer";

const middleware = [thunk];
const composeEnhancers = compose(applyMiddleware(...middleware));

const createStore = () => {
  return configureStore(reducer, composeEnhancers);
};

const store = createStore();

export default store;
