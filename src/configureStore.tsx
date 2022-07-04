import { createStore,applyMiddleware, compose } from 'redux'
import rootReducer from './reducers'
import { composeWithDevTools } from 'redux-devtools-extension'

export default function configureStore(){
    // const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    
    const store = createStore(rootReducer,{},composeWithDevTools())
    return store
}