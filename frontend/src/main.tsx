import dayjs from './lib/dayjs';
import React from 'react';
import ReactDOM from 'react-dom/client';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
TimeAgo.addDefaultLocale(en)
import App from './App.tsx';
import './index.css';

dayjs();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
