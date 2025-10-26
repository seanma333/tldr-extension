import OpenAI from 'openai';

// Create and inject the TLDR button
function createTldrButton() {
    const button = document.createElement('button');
    button.className = 'tldr-floating-button';
    button.textContent = 'TLDR';
    button.addEventListener('click', handleTldrClick);
    document.body.appendChild(button);
}

// Create and show the dialog
function createDialog() {
    const overlay = document.createElement('div');
    overlay.className = 'tldr-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'tldr-dialog';

    const header = document.createElement('div');
    header.className = 'tldr-dialog-header';

    const title = document.createElement('h2');
    title.className = 'tldr-dialog-title';
    title.textContent = 'Summary';

    const closeButton = document.createElement('button');
    closeButton.className = 'tldr-dialog-close';
    closeButton.textContent = '×';
    closeButton.onclick = () => overlay.remove();

    const content = document.createElement('div');
    content.className = 'tldr-dialog-content';

    const actions = document.createElement('div');
    actions.className = 'tldr-dialog-actions';

    const copyButton = document.createElement('button');
    copyButton.className = 'tldr-dialog-button primary';
    copyButton.textContent = 'Copy';
    copyButton.onclick = () => {
        // Get text content without HTML tags for copying
        const textContent = content.textContent;
        navigator.clipboard.writeText(textContent);
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = 'Copy';
        }, 2000);
    };

    const regenerateButton = document.createElement('button');
    regenerateButton.className = 'tldr-dialog-button secondary';
    regenerateButton.textContent = 'Regenerate';
    regenerateButton.onclick = async () => {
        content.innerHTML = '<div class="tldr-loading">Regenerating summary...</div>';
        regenerateButton.disabled = true;

        try {
            const result = await chrome.storage.sync.get(['openai_api_key']);
            if (!result.openai_api_key) {
                content.innerHTML = `
          <div class="tldr-error">
            Please set your OpenAI API key in the extension popup first.
          </div>
        `;
                return;
            }

            const pageText = extractMainContent();
            const summary = await summarizeText(pageText, result.openai_api_key);
            cacheSummary(summary);
            content.innerHTML = summary;
        } catch (error) {
            content.innerHTML = `
        <div class="tldr-error">
          Error: ${error.message}
        </div>
      `;
        } finally {
            regenerateButton.disabled = false;
        }
    };

    header.appendChild(title);
    header.appendChild(closeButton);
    actions.appendChild(copyButton);
    actions.appendChild(regenerateButton);

    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(actions);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    return { overlay, content };
}

// Extract main content from the page
function extractMainContent() {
    // Remove script tags, style tags, and hidden elements
    const clonedBody = document.body.cloneNode(true);
    const scripts = clonedBody.getElementsByTagName('script');
    const styles = clonedBody.getElementsByTagName('style');

    while (scripts.length > 0) {
        scripts[0].parentNode.removeChild(scripts[0]);
    }
    while (styles.length > 0) {
        styles[0].parentNode.removeChild(styles[0]);
    }

    // Get text content
    let text = clonedBody.innerText;

    // Remove extra whitespace and normalize
    text = text.replace(/\\s+/g, ' ').trim();

    // Limit to first 4000 tokens (approximately 16000 characters)
    // This ensures we stay within OpenAI's token limits while leaving room for the prompt
    return text.slice(0, 16000);
}

// Summarize text using OpenAI
async function summarizeText(text, apiKey) {
    const client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });

    const prompt = `Please provide a clear and concise summary of the following text in less than 1000 words. Focus on the main points and key takeaways. Format the response in HTML paragraphs (<p> tags) for better readability. Use line breaks between major points:\n\n${text}`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.5
        });

        let summary = response.choices[0].message.content.trim();

        // Ensure the summary is properly wrapped in paragraphs
        if (!summary.includes('<p>')) {
            summary = summary.split('\n\n').map(para => `<p>${para}</p>`).join('');
        }

        return summary;
    } catch (error) {
        throw new Error('Failed to generate summary: ' + error.message);
    }
}

// Store summaries in memory cache
const summaryCache = new Map();

// Get cached summary for current URL
async function getCachedSummary() {
    const url = window.location.href;
    const cachedData = summaryCache.get(url);

    if (cachedData) {
        // Check if the page content has changed
        const currentContent = extractMainContent();
        if (cachedData.content === currentContent) {
            return cachedData.summary;
        }
    }
    return null;
}

// Cache a summary for current URL
function cacheSummary(summary) {
    const url = window.location.href;
    const content = extractMainContent();
    summaryCache.set(url, { content, summary });
}

// Handle TLDR button click
async function handleTldrClick() {
    const { overlay, content } = createDialog();
    content.innerHTML = '<div class="tldr-loading">Loading summary...</div>';

    try {
        // Check if API key exists
        const result = await chrome.storage.sync.get(['openai_api_key']);
        if (!result.openai_api_key) {
            content.innerHTML = `
        <div class="tldr-error">
          Please set your OpenAI API key in the extension popup first.
        </div>
      `;
            return;
        }

        // Extract main content
        const pageText = extractMainContent();

        if (!pageText) {
            content.innerHTML = `
        <div class="tldr-error">
          No content found to summarize.
        </div>
      `;
            return;
        }

        // Check cache first
        const cachedSummary = await getCachedSummary();
        if (cachedSummary) {
            content.innerHTML = cachedSummary;
            return;
        }

        // If no API key, show the extracted text
        if (!result.openai_api_key) {
            content.textContent = pageText;
            return;
        }

        // Generate summary
        const summary = await summarizeText(pageText, result.openai_api_key);
        // Cache the summary
        cacheSummary(summary);
        content.innerHTML = summary;

    } catch (error) {
        content.innerHTML = `
      <div class="tldr-error">
        Error: ${error.message}
      </div>
    `;
    }
}

// Initialize the extension
createTldrButton();
