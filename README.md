# XED21 Platform

A comprehensive NCERT learning platform for grades 1-12 with interactive educational content.

## 🚀 Live Demo

- **Student Platform**: [https://mahmud1436.github.io/xed21-platform/](https://mahmud1436.github.io/xed21-platform/)
- **Admin Panel**: [https://xed21-backend.onrender.com/admin.html](https://xed21-backend.onrender.com/admin.html)  
  *(Make sure your backend is deployed and the API URL in `admin.html` is set to your Render backend)*

## 🔗 API URL Configuration

For production, update the API URL in both `index.html` and `admin.html`:

```javascript
// In index.html and admin.html
const API_BASE_URL = "https://xed21-backend.onrender.com/api";
```

For local development, use:

```javascript
const API_BASE_URL = "http://localhost:3001/api";
```

**Note:**  
- The admin panel (`admin.html`) must reference the correct API URL for uploads and management.
- The student platform (`index.html`) must reference the correct API URL for fetching curriculum and topics.

## 📚 Features

- **Grade-wise Learning**: Structured content for grades 1-12
- **NCERT Aligned**: Following NCERT curriculum guidelines
- **Interactive Content**: HTML5 games and interactive lessons
- **Admin Panel**: Easy content management system
- **Responsive Design**: Works on all devices

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Storage**: File-based JSON storage
- **Hosting**: GitHub Pages (Frontend) + Render.com (Backend)

## 📁 Project Structure

```
xed21-platform/
├── index.html          # Main platform interface
├── admin.html          # Admin panel for content management
├── backend/            # Backend API server
│   ├── server.js       # Express server
│   ├── package.json    # Node dependencies
│   ├── data/           # JSON data storage
│   └── uploads/        # Uploaded HTML topic files
└── README.md           # This file
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Git
- GitHub account
- Render.com account (free)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/mahmud1436/xed21-platform.git
   cd xed21-platform
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm start
   ```

4. **Access the platform**
   - Frontend: Open `index.html` in your browser
   - Admin Panel: `http://localhost:3001/admin.html`
   - API: `http://localhost:3001/api`

### Production Deployment

1. **Deploy Backend to Render.com**
   - Connect your GitHub repository
   - Create new Web Service
   - Set root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`

2. **Update API URLs**
   - In `index.html`: Update `API_BASE_URL` to your Render URL
   - In `admin.html`: Update `API_BASE_URL` to your Render URL

3. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from branch (main)
   - Folder: / (root)

## 📝 Usage Guide

### For Administrators

1. Access the admin panel at your backend URL + `/admin.html`
2. Upload HTML topic files:
   - Select grade (1-12)
   - Choose subject
   - Enter topic name
   - Upload HTML file
3. Manage existing topics:
   - Preview content
   - Delete topics
   - View statistics

### For Students

1. Visit the main platform
2. Click "School Login"
3. Select Grade → Subject → Topic
4. Interactive content loads in the browser

## 🎮 Creating Topic Content

Topic files should be self-contained HTML files with:
- All styles included (internal CSS)
- All scripts included (internal JavaScript)
- Interactive elements and games
- Educational content following NCERT guidelines

Example structure:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Topic Name</title>
    <style>
        /* Your styles here */
    </style>
</head>
<body>
    <!-- Your content here -->
    <script>
        // Your scripts here
    </script>
</body>
</html>
```

## 🔧 Configuration

### CORS Settings
Update `backend/server.js` with your domain:
```javascript
const corsOptions = {
    origin: ['https://yourusername.github.io']
};
```

### API Endpoints

- `GET /api/curriculum` - Get curriculum structure
- `GET /api/topics` - Get all topics
- `GET /api/topics/:id` - Get specific topic content
- `POST /api/topics/upload` - Upload new topic
- `DELETE /api/topics/:id` - Delete topic
- `GET /api/stats` - Get platform statistics

## 🐛 Troubleshooting

### Backend not responding
- Check if Render deployment is successful
- First request after 15 min takes ~30 seconds (free tier)

### CORS errors
- Ensure your GitHub Pages URL is in CORS whitelist
- Check for trailing slashes in URLs

### Upload failing
- Verify file is HTML format
- Check file size < 10MB
- Ensure backend is running

## 📈 Future Enhancements

- [ ] User authentication system
- [ ] Progress tracking
- [ ] Quiz integration
- [ ] Offline mode
- [ ] Mobile app
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Mahmud** - Initial work - [mahmud1436](https://github.com/mahmud1436)

## 🙏 Acknowledgments

- NCERT for curriculum guidelines
- Open source community for tools and libraries
