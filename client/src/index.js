import React from 'react';
import ReactDOM from 'react-dom/client';
//import io from 'socket.io-client';

import { Provider } from 'react-redux';
import store from './store/store';

import App from './App';

import './styles/globals.css';

const main = ()=>{
  //const socket = io('http://localhost:8080');

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App /*socket={socket}*//>
      </Provider>
    </React.StrictMode>
  );  
};

main();