const conversationElement = document.getElementById('conversation');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const toggleDarkModeButton = document.getElementById('toggle-dark-mode');
const clearChatsButton = document.getElementById('clear-chats');
const botTabs = document.querySelectorAll('.bot-tab');
const addBotButton = document.getElementById('add-bot');
const toggleSidebarButton = document.getElementById('toggle-sidebar');
const sidebar = document.querySelector('.sidebar');
const body = document.body;

let conversations = {}; // Stores conversations for each bot
let currentBot = 'ManisAI'; // Tracks the currently active bot
let darkMode = false;

// Initialize conversations for existing bots
document.querySelectorAll('.bot-tab').forEach((tab) => {
  const botName = tab.getAttribute('data-bot');
  conversations[botName] = [];
  if (botName === currentBot) {
    addMessage('model', 'Hello, I am Mani\'s AI Bot. How can I assist you?');
    conversations[botName].push({ role: 'model', content: 'Hello, I am Mani\'s AI Bot. How can I assist you?' });
  }
});

// Function to add a message to the conversation
function addMessage(role, content) {
  const messageBubble = document.createElement('div');
  messageBubble.classList.add('message-bubble');
  messageBubble.classList.add(role === 'user' ? 'user-bubble' : 'ai-bubble');
  messageBubble.textContent = content;
  conversationElement.appendChild(messageBubble);
  conversationElement.scrollTop = conversationElement.scrollHeight; // Scroll to bottom
}

// Function to show loading animation
function showLoading() {
  const loadingBubble = document.createElement('div');
  loadingBubble.classList.add('message-bubble', 'ai-bubble', 'loading-bubble');
  loadingBubble.innerHTML = '<span class="loading-dots"></span>';
  conversationElement.appendChild(loadingBubble);
  conversationElement.scrollTop = conversationElement.scrollHeight;
  return loadingBubble;
}

// Function to remove loading animation
function removeLoading(loadingBubble) {
  if (loadingBubble) {
    loadingBubble.remove();
  }
}

// Function to handle sending a message
function handleSendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  addMessage('user', message);
  conversations[currentBot].push({ role: 'user', content: message });
  messageInput.value = '';

  getResponse(conversations[currentBot]);
}

// Function to get AI response
async function getResponse(conversation) {
  const userMessage = conversation[conversation.length - 1].content.toLowerCase();
  const loadingBubble = showLoading();

  // Check for specific keywords
  if (userMessage.includes('name') && (userMessage.includes('your') || userMessage.includes('bot'))) {
    removeLoading(loadingBubble);
    addMessage('model', 'My name is ManisAI.');
    conversations[currentBot].push({ role: 'model', content: 'My name is ManisAI.' });
    return;
  }

  if (userMessage.includes('developer') || userMessage.includes('abdul rehman') || userMessage.includes('creator')) {
    removeLoading(loadingBubble);
    addMessage('model', 'Abdul Rehman developed me.');
    conversations[currentBot].push({ role: 'model', content: 'Abdul Rehman developed me.' });
    return;
  }

  if (userMessage.includes('where') || userMessage.includes('study')) {
    removeLoading(loadingBubble);
    addMessage('model', 'Abdul Rehman studies at Abasyn University.');
    conversations[currentBot].push({ role: 'model', content: 'Abdul Rehman studies at Abasyn University.' });
    return;
  }

   if (userMessage.includes('Dad') || userMessage.includes('dad')) {
    removeLoading(loadingBubble);
    addMessage('model', 'I dont have a dad in the traditional sense. I was created by Abdul Rehman, so you could say  that Abdul Rehman is my parent or creator or everything.');
    conversations[currentBot].push({ role: 'model', content: 'I dont have a dad in the traditional sense. I was created by Abdul Rehman, so you could say  that Abdul Rehman is my parent or creator or everything.' });
    return;
  }
  // Call Gemini API
  const API_KEY = 'AIzaSyDd2tyi1VQZlQ09Gghn1ALOtWNUpvPxpaE';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  try {
    const payload = {
      contents: conversation.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    removeLoading(loadingBubble);
    if (data.candidates && data.candidates.length > 0) {
      const aiMessage = data.candidates[0].content.parts[0].text;
      addMessage('model', aiMessage);
      conversations[currentBot].push({ role: 'model', content: aiMessage });
    }
  } catch (error) {
    removeLoading(loadingBubble);
    console.error('Error fetching response:', error);
    addMessage('model', 'Sorry, something went wrong. Please try again.');
    conversations[currentBot].push({ role: 'model', content: 'Sorry, something went wrong. Please try again.' });
  }
}

// Toggle dark mode
function toggleDarkMode() {
  darkMode = !darkMode;
  body.classList.toggle('dark-mode', darkMode);
  toggleDarkModeButton.textContent = darkMode ? '🌞' : '🌙';
}

// Clear all chats for the current bot
function clearChats() {
  conversations[currentBot] = [];
  conversationElement.innerHTML = '';
  addMessage('model', 'Hello, I am Mani\'s AI Bot. How can I assist you?');
  conversations[currentBot].push({ role: 'model', content: 'Hello, I am Mani\'s AI Bot. How can I assist you?' });
}

// Switch bot tabs
botTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    botTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentBot = tab.getAttribute('data-bot');
    document.querySelector('.name-card').textContent = currentBot;
    conversationElement.innerHTML = ''; // Clear the current conversation view
    conversations[currentBot].forEach((msg) => addMessage(msg.role, msg.content)); // Load the bot's conversation
  });
});

// Add new bot tab
addBotButton.addEventListener('click', () => {
  const newBotName = prompt('Enter the name of the new bot:');
  if (newBotName) {
    const newTab = document.createElement('li');
    newTab.classList.add('bot-tab');
    newTab.setAttribute('data-bot', newBotName);
    newTab.innerHTML = `<span>${newBotName}</span><button class="delete-bot">🗑️</button>`;
    document.getElementById('bot-tabs').appendChild(newTab);
    conversations[newBotName] = []; // Initialize conversation for the new bot

    // Add click event listener to the new bot tab
    newTab.addEventListener('click', () => {
      botTabs.forEach((t) => t.classList.remove('active'));
      newTab.classList.add('active');
      currentBot = newBotName;
      document.querySelector('.name-card').textContent = currentBot;
      conversationElement.innerHTML = ''; // Clear the current conversation view
      conversations[currentBot].forEach((msg) => addMessage(msg.role, msg.content)); // Load the bot's conversation
    });

    // Add delete functionality to the new bot tab
    newTab.querySelector('.delete-bot').addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering the tab switch
      if (confirm(`Are you sure you want to delete ${newBotName}?`)) {
        newTab.remove();
        delete conversations[newBotName];
        if (currentBot === newBotName) {
          currentBot = 'ManisAI'; // Switch to default bot if the deleted bot was active
          document.querySelector('.name-card').textContent = currentBot;
          conversationElement.innerHTML = ''; // Clear the current conversation view
          conversations[currentBot].forEach((msg) => addMessage(msg.role, msg.content)); // Load the default bot's conversation
        }
      }
    });
  }
});

// Delete bot functionality
document.querySelectorAll('.delete-bot').forEach((deleteButton) => {
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering the tab switch
    const botTab = deleteButton.closest('.bot-tab');
    const botName = botTab.getAttribute('data-bot');
    if (confirm(`Are you sure you want to delete ${botName}?`)) {
      botTab.remove();
      delete conversations[botName];
      if (currentBot === botName) {
        currentBot = 'ManisAI'; // Switch to default bot if the deleted bot was active
        document.querySelector('.name-card').textContent = currentBot;
        conversationElement.innerHTML = ''; // Clear the current conversation view
        conversations[currentBot].forEach((msg) => addMessage(msg.role, msg.content)); // Load the default bot's conversation
      }
    }
  });
});

// Toggle sidebar collapse
toggleSidebarButton.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// Event Listeners
sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSendMessage();
});
toggleDarkModeButton.addEventListener('click', toggleDarkMode);
clearChatsButton.addEventListener('click', clearChats);