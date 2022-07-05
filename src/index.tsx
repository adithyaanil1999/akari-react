import React from 'react';
import { Provider } from 'react-redux'
// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import configureStore from './configureStore';
import { BrowserRouter } from "react-router-dom";

export const store = configureStore()
const container = document.getElementById('root');
const root = createRoot(container!);
const routerBaseName = process.env.PUBLIC_URL;

root.render(
  <BrowserRouter  basename={routerBaseName}>
    <Provider store={store}>
      <App />
    </Provider>,
  </BrowserRouter>,
);

serviceWorkerRegistration.unregister();

reportWebVitals();
