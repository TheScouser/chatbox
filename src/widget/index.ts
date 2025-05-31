import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatBubbleWidget from '../components/ChatBubbleWidget';

// Widget initialization function
function initChatboxWidget() {
  // Get the script tag that loaded this widget
  const scriptTag = document.getElementById('chatbox-widget') || 
                   document.querySelector('script[src*="widget.min.js"]');
  
  if (!scriptTag) {
    console.error('Chatbox Widget: Could not find script tag');
    return;
  }

  // Extract agent ID from script tag
  const agentId = scriptTag.getAttribute('data-agent-id') || 
                 scriptTag.id || 
                 new URLSearchParams((scriptTag as HTMLScriptElement).src?.split('?')[1] || '').get('agentId');

  if (!agentId) {
    console.error('Chatbox Widget: Agent ID not found. Please set data-agent-id attribute or id on script tag.');
    return;
  }

  // Get configuration from script attributes or URL params
  const config = {
    agentId,
    apiUrl: scriptTag.getAttribute('data-api-url') || window.location.origin,
    primaryColor: scriptTag.getAttribute('data-primary-color') || '#2563eb',
    position: (scriptTag.getAttribute('data-position') as 'bottom-right' | 'bottom-left') || 'bottom-right',
    offset: {
      x: parseInt(scriptTag.getAttribute('data-offset-x') || '20'),
      y: parseInt(scriptTag.getAttribute('data-offset-y') || '20')
    }
  };

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'chatbox-widget-container';
  document.body.appendChild(widgetContainer);

  // Render the widget
  const root = createRoot(widgetContainer);
  root.render(React.createElement(ChatBubbleWidget, config));

  // Set state to initialized
  if (window.ChatboxWidget) {
    window.ChatboxWidget.state = 'initialized';
  }

  console.log('Chatbox Widget initialized for agent:', agentId);
}

// Global widget API
declare global {
  interface Window {
    ChatboxWidget: any;
  }
}

// Initialize the widget API if it doesn't exist
if (!window.ChatboxWidget) {
  window.ChatboxWidget = function(...args: any[]) {
    if (!window.ChatboxWidget.q) {
      window.ChatboxWidget.q = [];
    }
    window.ChatboxWidget.q.push(args);
  };
}

// Add methods to the widget API
window.ChatboxWidget.getState = () => window.ChatboxWidget.state || 'loading';

window.ChatboxWidget.open = () => {
  // Implementation to open the widget
  const event = new CustomEvent('chatbox-widget-open');
  window.dispatchEvent(event);
};

window.ChatboxWidget.close = () => {
  // Implementation to close the widget
  const event = new CustomEvent('chatbox-widget-close');
  window.dispatchEvent(event);
};

window.ChatboxWidget.destroy = () => {
  const container = document.getElementById('chatbox-widget-container');
  if (container) {
    container.remove();
  }
  window.ChatboxWidget.state = 'destroyed';
};

// Process any queued commands
if (window.ChatboxWidget.q) {
  window.ChatboxWidget.q.forEach((args: any[]) => {
    const [command, ...params] = args;
    if (typeof window.ChatboxWidget[command] === 'function') {
      window.ChatboxWidget[command](...params);
    }
  });
  window.ChatboxWidget.q = [];
}

// Initialize the widget when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatboxWidget);
} else {
  initChatboxWidget();
} 