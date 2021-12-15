import { createStore, applyMiddleware, compose } from "redux";
import {createLogger }from 'redux-logger';
import rootReducer from "./reducers";


const loggerMiddleware = createLogger()
const middleware = []

// For Redux Dev Tools
const composeEnhancers = window._REDUX_DEVTOOLD_EXTENSION_COMPOSE_ || compose

    export default function configureStore(preloadedState){
        return createStore(
            rootReducer,
            preloadedState,
            composeEnhancers(applyMiddleware(...middleware, loggerMiddleware))
        )
    }

