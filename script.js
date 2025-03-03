let rasaServerUrl = "https://bar-img-820874387134.europe-west2.run.app/webhooks/rest/webhook";

document.addEventListener("DOMContentLoaded", function () {
    sendInitialMessage();
});

document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendInitialMessage() {
    let chatBox = document.getElementById("chat-box");

    try {
        let response = await fetch(rasaServerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender: "user", message: "/greet" }),
        });

        let data = await response.json();

        // Display bot response
        data.forEach((msg) => {
            let botMessage = document.createElement("div");
            botMessage.className = "bot-message";
            botMessage.innerText = msg.text;
            chatBox.appendChild(botMessage);
        });

        // Scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error("Error sending initial message:", error);
    }
}

async function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return; // Ignore empty messages

    let chatBox = document.getElementById("chat-box");

    // Display user message
    let userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.innerText = userInput;
    chatBox.appendChild(userMessage);

    // Clear input field
    document.getElementById("user-input").value = "";

    // Send message to Rasa
    try {
        let response = await fetch(rasaServerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender: "user", message: userInput }),
        });

        let data = await response.json();

        // Display bot response
        data.forEach((msg) => {
            let botMessage = document.createElement("div");
            botMessage.className = "bot-message";
            botMessage.innerText = msg.text;
            chatBox.appendChild(botMessage);
        });

        // Scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error("Error connecting to Rasa:", error);
    }
}