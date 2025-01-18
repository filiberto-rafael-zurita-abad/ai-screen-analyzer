let chatboxVisible = false;
let chatboxContainer;

function createChatbox() {
  chatboxContainer = document.createElement('div');
  chatboxContainer.id = 'chatbox-container';
  chatboxContainer.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: 300px;
    background-color: white;
    border-left: 1px solid #ccc;
    z-index: 1000;
    display: none;
  `;

  fetch(chrome.runtime.getURL('chatbox.html'))
    .then(response => response.text())
    .then(html => {
      chatboxContainer.innerHTML = html;
      document.body.appendChild(chatboxContainer);
      
      const chatMessages = chatboxContainer.querySelector('.chat-messages');
      const chatInput = chatboxContainer.querySelector('.chat-input input');
      const sendButton = chatboxContainer.querySelector('.chat-input button');

      sendButton.addEventListener('click', function() {
        const message = chatInput.value;
        if (message.trim() !== '') {
          addMessage('user', message);
          chatInput.value = '';
          // Send message to background script
          chrome.runtime.sendMessage({ type: 'send_message', message: message }, (response) => {
            console.log('Response from background script:', response);
          });
        }
      });

      function addMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    });

  fetch(chrome.runtime.getURL('chatbox.css'))
    .then(response => response.text())
    .then(css => {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    });
}

function toggleChatbox() {
  if (!chatboxContainer) {
    createChatbox();
  }
  chatboxVisible = !chatboxVisible;
  chatboxContainer.style.display = chatboxVisible ? 'block' : 'none';
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'receive_message') {
    console.log('Message from background script:', request.message);
    // Handle message from background script
    const chatMessages = chatboxContainer.querySelector('.chat-messages');
    addMessage('ai', request.message);
    sendResponse({ response: 'Message received by content script' });
  }
});

function addMessage(sender, message) {
  const chatMessages = chatboxContainer.querySelector('.chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add a button to toggle the chatbox
const toggleButton = document.createElement('button');
toggleButton.textContent = 'Toggle Chat';
toggleButton.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1001;
`;
document.body.appendChild(toggleButton);
toggleButton.addEventListener('click', toggleChatbox);
