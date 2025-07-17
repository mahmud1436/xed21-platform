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
        'https://mahmud1436.github.io',
        'https://xed21-platform.onrender.com'
    ]
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve admin panel and static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Create necessary directories
const createDirectories = async () => {
    const dirs = ['uploads', 'data'];
    for (const dir of dirs) {
        try {
            await fs.mkdir(path.join(__dirname, dir), { recursive: true });
        } catch (error) {
            console.error(`Error creating directory ${dir}:`, error);
        }
    }
};

// Initialize data files
const initializeData = async () => {
    const curriculumPath = path.join(__dirname, 'data', 'curriculum.json');
    const topicsPath = path.join(__dirname, 'data', 'topics.json');
    
    try {
        await fs.access(curriculumPath);
    } catch {
        // Create initial curriculum structure
        const initialCurriculum = {
            grades: {}
        };
        for (let grade = 1; grade <= 12; grade++) {
            initialCurriculum.grades[grade] = {
                subjects: {}
            };
        }
        await fs.writeFile(curriculumPath, JSON.stringify(initialCurriculum, null, 2));
    }
    
    try {
        await fs.access(topicsPath);
    } catch {
        await fs.writeFile(topicsPath, JSON.stringify({}, null, 2));
    }
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `topic-${uniqueId}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/html') {
            cb(null, true);
        } else {
            cb(new Error('Only HTML files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Helper functions
const readJsonFile = async (filename) => {
    const filePath = path.join(__dirname, 'data', filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
};

const writeJsonFile = async (filename, data) => {
    const filePath = path.join(__dirname, 'data', filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// API Routes

// Get curriculum structure
app.get('/api/curriculum', async (req, res) => {
    try {
        const curriculum = await readJsonFile('curriculum.json');
        res.json(curriculum);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read curriculum' });
    }
});

// Get all topics
app.get('/api/topics', async (req, res) => {
    try {
        const topics = await readJsonFile('topics.json');
        res.json(topics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read topics' });
    }
});

// Get topic content by ID
app.get('/api/topics/:topicId', async (req, res) => {
    try {
        const topics = await readJsonFile('topics.json');
        const topic = topics[req.params.topicId];
        
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        
        // Read the HTML file
        const htmlContent = await fs.readFile(path.join(__dirname, topic.filePath), 'utf8');
        res.json({
            ...topic,
            content: htmlContent
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read topic content' });
    }
});

// Upload topic content
app.post('/api/topics/upload', upload.single('topicFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const { grade, subject, topicName, topicDescription } = req.body;
        
        if (!grade || !subject || !topicName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const topicId = uuidv4();
        const filePath = req.file.path.replace(__dirname + path.sep, ''); // Store relative path
        
        // Update topics database
        const topics = await readJsonFile('topics.json');
        topics[topicId] = {
            id: topicId,
            grade: parseInt(grade),
            subject,
            name: topicName,
            description: topicDescription || '',
            filePath,
            uploadedAt: new Date().toISOString(),
            originalFileName: req.file.originalname
        };
        await writeJsonFile('topics.json', topics);
        
        // Update curriculum structure
        const curriculum = await readJsonFile('curriculum.json');
        if (!curriculum.grades[grade]) {
            curriculum.grades[grade] = { subjects: {} };
        }
        if (!curriculum.grades[grade].subjects[subject]) {
            curriculum.grades[grade].subjects[subject] = {
                icon: subject === 'Mathematics' ? '🔢' : 
                      subject === 'Science' ? '🔬' : 
                      subject === 'EVS' ? '🌱' : '📚',
                description: `${subject} for Grade ${grade}`,
                topics: []
            };
        }
        
        // Add topic to curriculum
        const topicEntry = {
            id: topicId,
            name: topicName,
            file: `/api/topics/${topicId}`
        };
        
        // Check if topic already exists
        const existingIndex = curriculum.grades[grade].subjects[subject].topics
            .findIndex(t => t.name === topicName);
        
        if (existingIndex >= 0) {
            // Update existing topic
            curriculum.grades[grade].subjects[subject].topics[existingIndex] = topicEntry;
        } else {
            // Add new topic
            curriculum.grades[grade].subjects[subject].topics.push(topicEntry);
        }
        
        await writeJsonFile('curriculum.json', curriculum);
        
        res.json({
            success: true,
            topic: topics[topicId],
            message: 'Topic uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload topic' });
    }
});

// Update topic metadata
app.put('/api/topics/:topicId', async (req, res) => {
    try {
        const { topicId } = req.params;
        const { name, description } = req.body;
        
        const topics = await readJsonFile('topics.json');
        if (!topics[topicId]) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        
        topics[topicId] = {
            ...topics[topicId],
            name: name || topics[topicId].name,
            description: description !== undefined ? description : topics[topicId].description,
            updatedAt: new Date().toISOString()
        };
        
        await writeJsonFile('topics.json', topics);
        
        // Update curriculum if name changed
        if (name && name !== topics[topicId].name) {
            const curriculum = await readJsonFile('curriculum.json');
            const { grade, subject } = topics[topicId];
            
            if (curriculum.grades[grade]?.subjects[subject]?.topics) {
                const topicIndex = curriculum.grades[grade].subjects[subject].topics
                    .findIndex(t => t.id === topicId);
                
                if (topicIndex >= 0) {
                    curriculum.grades[grade].subjects[subject].topics[topicIndex].name = name;
                    await writeJsonFile('curriculum.json', curriculum);
                }
            }
        }
        
        res.json({
            success: true,
            topic: topics[topicId]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update topic' });
    }
});

// Delete topic
app.delete('/api/topics/:topicId', async (req, res) => {
    try {
        const { topicId } = req.params;
        
        const topics = await readJsonFile('topics.json');
        const topic = topics[topicId];
        
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        
        // Delete file
        try {
            await fs.unlink(path.join(__dirname, topic.filePath));
        } catch (error) {
            console.error('Error deleting file:', error);
        }
        
        // Remove from topics
        delete topics[topicId];
        await writeJsonFile('topics.json', topics);
        
        // Remove from curriculum
        const curriculum = await readJsonFile('curriculum.json');
        const { grade, subject } = topic;
        
        if (curriculum.grades[grade]?.subjects[subject]?.topics) {
            curriculum.grades[grade].subjects[subject].topics = 
                curriculum.grades[grade].subjects[subject].topics
                    .filter(t => t.id !== topicId);
            
            // Remove subject if no topics left
            if (curriculum.grades[grade].subjects[subject].topics.length === 0) {
                delete curriculum.grades[grade].subjects[subject];
            }
            
            await writeJsonFile('curriculum.json', curriculum);
        }
        
        res.json({
            success: true,
            message: 'Topic deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete topic' });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const curriculum = await readJsonFile('curriculum.json');
        const topics = await readJsonFile('topics.json');
        
        let totalTopics = 0;
        let gradeStats = {};
        
        for (let grade = 1; grade <= 12; grade++) {
            gradeStats[grade] = {
                subjects: 0,
                topics: 0
            };
            
            if (curriculum.grades[grade]?.subjects) {
                const subjects = Object.keys(curriculum.grades[grade].subjects);
                gradeStats[grade].subjects = subjects.length;
                
                subjects.forEach(subject => {
                    const topicCount = curriculum.grades[grade].subjects[subject].topics?.length || 0;
                    gradeStats[grade].topics += topicCount;
                    totalTopics += topicCount;
                });
            }
        }
        
        res.json({
            totalTopics,
            totalFiles: Object.keys(topics).length,
            gradeStats
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    res.status(500).json({ error: error.message });
});

// Initialize and start server
const startServer = async () => {
    await createDirectories();
    await initializeData();
    
    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
        console.log(`Admin panel available at http://localhost:${PORT}/admin.html`);
    });
};

startServer();
