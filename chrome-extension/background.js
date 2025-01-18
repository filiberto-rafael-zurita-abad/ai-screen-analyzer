chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed.');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'send_message') {
    // Handle message from popup
    console.log('Message from popup:', request.message);
    const apiKey = process.env.GEMINI_API_KEY;
    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: request.message }]
        }]
      })
    })
    .then(response => response.json())
    .then(data => {
      const aiResponse = data.candidates[0].content.parts[0].text;
      // Send message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
const sendMessageWithRetry = (tabId, message, maxRetries = 3, retryDelay = 100) => {
  let retries = 0;
  const attemptSendMessage = () => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to content script:', chrome.runtime.lastError.message);
        if (retries < maxRetries) {
          retries++;
          console.log(`Retrying message send, attempt ${retries}`);
          setTimeout(attemptSendMessage, retryDelay);
        } else {
          console.error('Max retries reached, message not sent.');
        }
      } else {
        console.log('Response from content script:', response);
        sendResponse({ response: 'Message sent to content script' });
      }
    });
  };
  attemptSendMessage();
};

chrome.tabs.sendMessage(tabs[0].id, { type: 'receive_message', message: aiResponse }, (response) => {
  if (chrome.runtime.lastError) {
    sendMessageWithRetry(tabs[0].id, { type: 'receive_message', message: aiResponse });
  } else {
    console.log('Response from content script:', response);
    sendResponse({ response: 'Message sent to content script' });
  }
});
        }
      });
    })
    .catch(error => {
      console.error('Error sending message to Gemini API:', error);
      // Send error message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'receive_message', message: 'Error communicating with Gemini API.' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message to content script:', chrome.runtime.lastError.message);
            } else {
              console.log('Response from content script:', response);
              sendResponse({ response: 'Error message sent to content script' });
            }
          });
        }
      });
    });
    return true; // Indicate that the response will be sent asynchronously
  }
});
