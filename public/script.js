// --- JAVASCRIPT LOGIC ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Background Animation ---
    const canvas = document.getElementById('background-animation');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray;

    const mouse = { x: null, y: null, radius: (canvas.height / 120) * (canvas.width / 120) };
    window.addEventListener('mousemove', e => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY;
            this.size = size; this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        update() {
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
            
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 5;
                if (mouse.x > this.x && this.x > this.size * 10) this.x -= 5;
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 5;
                if (mouse.y > this.y && this.y > this.size * 10) this.y -= 5;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 3) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            let color = 'rgba(224, 64, 251, 0.5)';
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
    }
    
    init();
    animate();

    window.addEventListener('resize', () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        mouse.radius = (canvas.height / 120) * (canvas.width / 120);
        init();
    });

    // --- Chat Logic ---
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const SERVER_URL = 'http://localhost:3000/chat';
    // 'http://localhost:3000/chat'

    // Store the chat history on the frontend
    let chatHistory = [];

    // Add initial welcome message
    displayMessage("Hiii Raks! Kya kar rahi ho?", "bot");

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        displayMessage(messageText, 'user');
        chatHistory.push({ role: 'user', parts: [{ text: messageText }] });
        userInput.value = '';
        
        showTypingIndicator();

        try {
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: chatHistory,
                    message: messageText
                }),
            });
            
            removeTypingIndicator();
            if (!response.ok) throw new Error("Network response was not ok.");

            const data = await response.json();
            const botReply = data.reply;
            
            displayMessage(botReply, 'bot');
            chatHistory.push({ role: 'model', parts: [{ text: botReply }] });

        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            displayMessage("Sorry, I'm feeling a bit off right now... talk later.", 'bot');
        }
    });

    function displayMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.classList.add('message', 'bot', 'typing-indicator');
        typingElement.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
        chatMessages.appendChild(typingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) indicator.remove();
    }
});