
import React from 'react';
import ReactDOM from 'react-dom/client';
// Import self-hosted Inter variable font
import '@fontsource-variable/inter';
import './index.css';
import SimpleRouter from './SimpleRouter';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <SimpleRouter />
    </React.StrictMode>
);
