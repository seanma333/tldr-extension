<img src="src/assets/img/icon-128.png" width="64"/>

# TLDR - Chrome Extension

A Chrome extension that summarizes webpage content using AI. Simply click the floating TLDR button on any webpage to get a concise summary of the content.

## Features

- **AI-Powered Summarization**: Uses OpenAI's GPT-4o-mini model to generate concise summaries
- **Floating Button**: Easy-to-access TLDR button on every webpage
- **Smart Caching**: Summaries are cached to avoid unnecessary API calls
- **Regenerate Option**: Get a fresh summary with the click of a button
- **Copy to Clipboard**: Copy summaries with one click
- **Clean UI**: Modern, responsive dialog with proper HTML formatting

## Installation

### Development Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked extension"
   - Select the `build` folder

### Production Build

```bash
npm run build
```

## Usage

1. **Set up your OpenAI API key**:
   - Click the extension icon in your browser toolbar
   - Enter your OpenAI API key
   - Click "Save API Key"

2. **Get summaries**:
   - Visit any webpage
   - Click the floating "TLDR" button in the bottom-left corner
   - View the AI-generated summary in the dialog
   - Use "Copy" to copy the summary to clipboard
   - Use "Regenerate" to get a fresh summary

## Technical Details

- **Manifest Version**: 3
- **Framework**: React 18
- **Build Tool**: Webpack 5
- **AI Model**: GPT-4o-mini
- **Storage**: Chrome Sync Storage for API key
- **Caching**: In-memory caching for summaries

## API Key Setup

You'll need an OpenAI API key to use this extension:

1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Create a new API key
3. Enter the key in the extension popup
4. The key is stored securely in Chrome's sync storage

## Privacy

- Your API key is stored locally in Chrome's sync storage
- Page content is only sent to OpenAI for summarization
- No data is collected or stored by the extension
- Summaries are cached locally in memory

## Development

The extension is built with:
- React 18 for the popup UI
- Webpack 5 for bundling
- OpenAI API for AI summarization
- Chrome Extension Manifest V3

## License

MIT License
