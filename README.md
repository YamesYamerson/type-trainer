# Typing Trainer

A modern, keyboard-first typing practice application built with React, TypeScript, and Tailwind CSS. Modeled after popular typing tutors like Monkeytype and Mavis Beacon, this app provides multiple practice modes with real-time feedback and performance tracking.

## Features

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
- **Persistent Storage**: Results saved locally using localStorage

### 🎨 Modern UI/UX
- **Keyboard-first Design**: Complete functionality without mouse dependency
- **Responsive Layout**: Works on desktop and mobile devices
- **Clean Interface**: Minimalist design focused on typing practice
- **Real-time Feedback**: Color-coded character highlighting

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Hooks + Custom Hooks
- **Storage**: localStorage (client-side persistence)
- **Development**: ESLint + Prettier

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd type-trainer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Usage

1. **Login**: Enter any email and password to access the app
2. **Choose Mode**: Select from Basic Words, Punctuation, Code, or Data Entry
3. **Start Practice**: Click "Start Typing Test" to begin
4. **Type**: Focus on the text area and start typing - the app will track your progress
5. **Review Results**: See your WPM, accuracy, and error count
6. **View Profile**: Check your overall statistics and test history

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── LoginForm.tsx   # Authentication form
│   ├── ModeSelector.tsx # Practice mode selection
│   ├── StatsDisplay.tsx # Performance statistics
│   └── TypingTestEngine.tsx # Core typing logic
├── hooks/              # Custom React hooks
│   ├── useTypingResults.ts # Results management
│   └── useUser.ts      # User state management
├── pages/              # Page components
│   ├── ProfilePage.tsx # User profile and stats
│   └── TestPage.tsx    # Main practice interface
├── types/              # TypeScript type definitions
│   └── index.ts        # Core interfaces
├── utils/              # Utility functions
│   └── testLoader.ts   # Test data management
└── data/               # Static data files
    ├── typing-modes.json # Mode configurations
    └── typing-tests.json # Practice content
```

## Development Phases

This project was built following a structured development protocol:

1. **Phase 1**: Environment setup and project scaffolding
2. **Phase 2**: Core typing engine implementation
3. **Phase 3**: Multiple practice modes
4. **Phase 4**: UI/UX improvements and layout system
5. **Phase 5**: User management and local persistence

## Future Enhancements

- **Backend Integration**: Real user accounts and cloud storage
- **Advanced Analytics**: Detailed performance insights
- **Custom Content**: User-uploaded practice texts
- **Multiplayer**: Real-time typing competitions
- **Accessibility**: Screen reader support and keyboard shortcuts
- **Theming**: Dark mode and custom color schemes

## Contributing

This is a solo developer project following the master protocol for efficient development. The codebase is designed to be maintainable and extensible for future enhancements.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Inspired by Monkeytype and Mavis Beacon
- Built following modern React best practices
- Designed for keyboard-first user experience
