# Type Trainer

A modern, keyboard-first typing practice application built with React, TypeScript, and Tailwind CSS. Modeled after popular typing tutors like Monkeytype and Mavis Beacon, this app provides multiple practice modes with real-time feedback and performance tracking.

## 🎯 Current Status

**Phase:** 6 Complete (Backend API & SQLite Database)  
**Overall Progress:** 95% Complete  
**Next Phase:** 7 (Deployment)  
**Ready for:** Production Deployment

### ✅ Completed Features

- **Typing Engine**: Real-time WPM and accuracy calculation with character-by-character tracking
- **Multiple Practice Modes**: Basic Words, Punctuation, Code, Data Entry
- **User Management**: Dummy authentication with localStorage persistence
- **Backend API**: Node.js + Express server with SQLite database
- **Hybrid Storage**: localStorage + SQLite with automatic synchronization
- **Hash-based System**: Duplicate prevention and data integrity
- **Environment Variables**: Secure configuration management
- **Testing Framework**: Comprehensive test suite for all components
- **Performance Optimized**: O(1) operations for high-speed typing

## 🚀 Features

### 🎯 Multiple Practice Modes
- **Basic Words**: Lowercase word practice for beginners
- **Punctuation & Capitalization**: Full sentences with proper punctuation
- **Programming Code**: JavaScript and Python code snippets with syntax symbols
- **Data Entry**: Form-like content with tab navigation

### 📊 Real-time Performance Tracking
- **WPM (Words Per Minute)**: Standard calculation (5 characters = 1 word)
- **Accuracy**: Percentage of correctly typed characters
- **Error Tracking**: Real-time error highlighting and correction
- **Time Measurement**: Precise timing from first keystroke to completion

### 👤 User Management
- **Dummy Authentication**: Simple login system (any email/password works)
- **Profile Dashboard**: Comprehensive statistics and test history
- **Mode-specific Stats**: Performance breakdown by practice type
- **Persistent Storage**: Results saved locally and in SQLite database

### 🎨 Modern UI/UX
- **Keyboard-first Design**: Complete functionality without mouse dependency
- **Responsive Layout**: Works on desktop and mobile devices
- **Clean Interface**: Minimalist design focused on typing practice
- **Real-time Feedback**: Color-coded character highlighting
- **Virtual Keyboard**: Real-time key highlighting

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Custom Hooks
- **Backend**: Node.js + Express
- **Database**: SQLite (local) → PostgreSQL (production ready)
- **Storage**: Hybrid localStorage + SQLite
- **Testing**: Comprehensive test suite
- **Environment**: Secure environment variable management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd type-trainer
```

2. **Install dependencies:**
```bash
npm install
cd server && npm install && cd ..
```

3. **Set up environment variables:**
```bash
# Create .env file in root directory
cp .env.example .env  # if available
# Or create manually with:
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Type Trainer
VITE_APP_VERSION=1.0.0
```

4. **Start the backend server:**
```bash
cd server && npm start
```

5. **Start the frontend development server:**
```bash
npm run dev
```

6. **Open your browser and navigate to `http://localhost:5173`**

## 🧪 Testing

### Backend Tests
```bash
# Test category filtering
npm run test:category

# Test hash-based system
npm run test:hash
```

### Frontend Tests
```javascript
// In browser console
// Load test utilities
// Copy content from test-frontend-hash.js

// Run tests
window.hashSystemTests.runAllTests()
testNewSystem()
testFrontendSave()
```

### Database Management
```bash
# Clear database stats
npm run clear-stats

# Clear all data
node clear-all-data.js

# Check database contents
node server/check-db.js
```

## 📁 Project Structure

```
type-trainer/
├── AI_DOCS/                    # Historical documentation
│   ├── DEVELOPMENT_LOG.md      # Complete development history
│   └── base-material/          # Original project requirements
├── src/                        # Frontend source code
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── pages/                  # Page components
│   ├── types/                  # TypeScript definitions
│   ├── utils/                  # Utility functions
│   └── config/                 # Environment configuration
├── server/                     # Backend source code
│   ├── index.js               # Express server
│   ├── config.js              # Server configuration
│   └── init-db.js             # Database initialization
├── test-*.js                   # Testing utilities
├── clear-*.js                  # Data management utilities
├── README.md                   # This file
├── QUICK_COMMANDS.md           # Development utilities
└── [other project files]
```

## 🔧 Development

### Environment Variables

#### Frontend (Vite)
```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Type Trainer
VITE_APP_VERSION=1.0.0
```

#### Backend (Node.js)
```bash
PORT=3001
NODE_ENV=development
DB_PATH=./typing_trainer.db
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

### Key Commands

```bash
# Development
npm run dev                    # Start frontend
cd server && npm start        # Start backend

# Testing
npm run test:category         # Test category filtering
npm run test:hash            # Test hash system

# Database
npm run clear-stats          # Clear database stats
node clear-all-data.js       # Clear all data

# Building
npm run build                # Build for production
npm run preview              # Preview production build
```

## 🎯 Usage

1. **Login**: Enter any email and password to access the app
2. **Choose Mode**: Select from Basic Words, Punctuation, Code, or Data Entry
3. **Start Practice**: Click "Start Typing Test" to begin
4. **Type**: Focus on the text area and start typing - the app will track your progress
5. **Review Results**: See your WPM, accuracy, and error count
6. **View Profile**: Check your overall statistics and test history

## 🔒 Security

- **Environment Variables**: Sensitive data not committed to repository
- **Database Security**: Database files excluded from version control
- **Hash-based System**: Duplicate prevention and data integrity
- **CORS Configuration**: Secure cross-origin requests

## 📊 Performance

- **O(1) Operations**: Character-by-character tracking for high-speed typing
- **Memoized Rendering**: Efficient UI updates
- **Hybrid Storage**: Best of localStorage and database
- **Optimized State Management**: React Hooks with proper optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🎉 Acknowledgments

- Inspired by Monkeytype and Mavis Beacon
- Built with modern web technologies
- Designed for keyboard-first interaction
- Optimized for performance and user experience
