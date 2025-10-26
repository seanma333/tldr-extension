import React, { useState, useEffect } from 'react';
import './Popup.css';

const Popup = () => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved API key when popup opens
    chrome.storage.sync.get(['openai_api_key'], (result) => {
      if (result.openai_api_key) {
        setApiKey(result.openai_api_key);
      }
    });
  }, []);

  const handleSave = () => {
    setIsLoading(true);
    setStatus('');

    chrome.storage.sync.set(
      {
        openai_api_key: apiKey,
      },
      () => {
        setStatus('API key saved successfully!');
        setIsLoading(false);
      }
    );
  };

  const handleKeyChange = (e) => {
    setApiKey(e.target.value);
    setStatus('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">TLDR</h1>
        <p className="App-description">
          Summarize any webpage with the power of AI
        </p>
      </header>

      <div className="input-group">
        <label className="input-label" htmlFor="api-key">
          OpenAI API Key
        </label>
        <input
          id="api-key"
          type="password"
          className="api-key-input"
          value={apiKey}
          onChange={handleKeyChange}
          placeholder="sk-..."
        />
      </div>

      <button
        className="save-button"
        onClick={handleSave}
        disabled={!apiKey || isLoading}
      >
        {isLoading ? 'Saving...' : 'Save API Key'}
      </button>

      {status && (
        <p className={`status-message ${status.includes('error') ? 'error' : 'success'}`}>
          {status}
        </p>
      )}
    </div>
  );
};

export default Popup;
