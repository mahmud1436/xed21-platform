const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
    origin: [
        'https://mahmud1436.github.io/xed21-platform/',  // Replace with your GitHub Pages URL
        'http://localhost:3000',
        'http://localhost:3001'
    ],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve admin panel
app.use(express.static(path.join(__dirname, '..')));

// ... rest of the server code ...
