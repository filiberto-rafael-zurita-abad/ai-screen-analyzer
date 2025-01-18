document.addEventListener('DOMContentLoaded', function() {
  const chatMessages = document.querySelector('.chat-messages');
  const chatInput = document.querySelector('.chat-input input');
  const sendButton = document.querySelector('.chat-input button');

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
