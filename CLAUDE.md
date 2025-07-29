# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Vite dev server
- **Build**: `npm run build` - Creates production build
- **Lint**: `npm run lint` - Runs ESLint on the codebase
- **Preview**: `npm run preview` - Preview production build locally

## Architecture Overview

This is a React-based pastebin application built with Vite. The app allows users to write and share code snippets using the Monaco Editor.

### Key Components

- **Main App** (`src/App.jsx`): Single-page application with Monaco Editor integration
- **Monaco Editor**: Code editor with syntax highlighting for multiple languages (JavaScript, TypeScript, Python, HTML, CSS, JSON)
- **Language Selection**: Dropdown to choose syntax highlighting language
- **Save Functionality**: Currently placeholder - needs implementation for storing snippets

### Project Structure

```
src/
├── App.jsx          # Main application component
├── App.css          # Application styles
├── main.jsx         # React entry point
├── index.css        # Global styles
└── assets/          # Static assets
```

### Technology Stack

- **React 19.1.0** with functional components and hooks
- **Vite** for build tooling and development server
- **Monaco Editor** (`react-monaco-editor`) for code editing
- **ESLint** with React-specific rules for code quality

### Current Implementation Status

The application currently provides:
- Code editing interface with Monaco Editor
- Language selection dropdown
- Basic UI structure
- Development environment setup

**Next Steps** (from blueprint.md):
1. Implement save functionality to store snippets and generate unique URLs
2. Create component to display saved snippets based on URL
3. Add routing to handle displaying snippets at their unique URLs

### Development Notes

- Uses modern React patterns with functional components and hooks
- ESLint configured with React hooks and refresh plugins
- Monaco Editor configured with dark theme and auto-layout
- Project follows standard Vite + React project structure

### Code Quality

- ESLint configured with recommended rules plus React-specific linting
- Custom rule for unused variables with pattern exceptions
- Code uses modern ES2020+ features

### Implementation Requirements

- The final implementation must automatically purge the shared content after 2 weeks

### Storage Backend

- Implement using Valkey as the backend storage