let rasaServerUrl = "https://bar-img-820874387134.europe-west2.run.app/webhooks/rest/webhook";

// Potential chatbot responses, literally hardcoded in -> when working with real chatbot, will need to change this
let responses = {
    utter_greet: "Hey! How are you?",
    utter_cheer_up: "Here is something to cheer you up:",
    utter_did_that_help: "Did that help you?",
    utter_happy: "Great, carry on!",
    utter_goodbye: "Bye",
    utter_iamabot:"I am a bot, powered by Rasa."
}

document.addEventListener("DOMContentLoaded", async function () {
    sendInitialMessage();
});

document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Extracting the message sending into its own function for reusability
async function rasaInteraction(msg) {
    // Remove all children of the div (i.e. remove the buttons) 
    // Avoids the bug with incorrect buttons being displayed
    document.getElementById("button_space").replaceChildren();

    let chatBox = document.getElementById("chat-box");

    try {
        // Perform a POST request on the server, using the message passed in as the message
        let response = await fetch(rasaServerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // So these message with "/" actually follow intents instead of responses (see domain.yml)
            body: JSON.stringify({ sender: "user", message: msg }),
        });

        // Store the response
        let data = await response.json();

        // We keep track of the last message - that is so the correct buttons can be displayed later
        let lastMsg = "";

        // Display bot response
        data.forEach((msg) => {
            let botMessageContainer = document.createElement("div");
            botMessageContainer.classList.add('message', 'bot-message-container');

            let botImage = document.createElement('img');
            botImage.className = 'avatar';
            botImage.src = "https://cdn-icons-png.flaticon.com/512/8649/8649607.png";
            botImage.alt = "Bot Avatar";

            let botMessage = document.createElement("div");
            botMessage.className = "bot-message";
            botMessage.innerText = msg.text;
            
            botMessageContainer.appendChild(botImage);
            botMessageContainer.appendChild(botMessage);
            
            chatBox.appendChild(botMessageContainer);

            lastMsg = msg.text;
        });

        // Scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;

        // Create the buttons, passing in lastMsg as a variable
        makeButtons(lastMsg);

    } catch (error) {
        console.error("Error connecting to Rasa:", error);
    }
}

// Extract the button making code into its own separate function (need to pass in the lassMsg as a local var)
function makeButtons(lastMsg) {
    
    // Depending on the chatbot response, we replace the currently empty buttonVals with a set of responses appropriate for the response
    let buttonVals = [];
    switch (lastMsg) {
        case responses.utter_greet:
            buttonVals = ["Great", "Bad"];
            break;
        case responses.utter_goodbye:
            buttonVals = [];
            break;
        case responses.utter_cheer_up:
            buttonVals = [];
            break;
        case responses.utter_did_that_help:
            buttonVals = ["Yes", "No"];
            break;
        case responses.utter_happy:
            buttonVals = [];
            break;
        case responses.utter_iamabot:
            buttonVals = [];
            break;
    }

    // Then we make the buttons, where we give button a value corresponding with the text (https://www.w3schools.com/JSREF/prop_pushbutton_value.asp) 
    // and an onclick function that sends the message displayed in the button as a response
    let buttonPlace = document.getElementById("button_space");

    buttonVals.forEach((buttonValue) =>{
        let responseButton = document.createElement("button");
        responseButton.innerText = buttonValue;
        responseButton.value = buttonValue;
        responseButton.className = "input_button";
        responseButton.onclick = () => autofillResponse(responseButton.value);
        buttonPlace.appendChild(responseButton);
    })
}

// The onClick button function
function autofillResponse(buttonVal) {
    // Render the message, presented in the button, in the chatbot
    makeUserMessage(buttonVal);
    // Sending the message, rendering the message from the server and creating a new set of buttons (if applicable)
    rasaInteraction(buttonVal);
}

// A function that displays the user message
function makeUserMessage(msg) {
    let chatBox = document.getElementById("chat-box");

    // Display user message
    let userMessageContainer = document.createElement("div");
    userMessageContainer.classList.add('message', 'user-message-container');
    
    let userImage = document.createElement('img');
    userImage.className = 'avatar';
    userImage.src = "https://cdn-icons-png.flaticon.com/512/8649/8649607.png";
    userImage.alt = "User Avatar";

    let userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.innerText = msg;

    userMessageContainer.appendChild(userImage);
    userMessageContainer.appendChild(userMessage);

    chatBox.appendChild(userMessageContainer);

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Send the initial message - use the greet intent (see domain.yml)
async function sendInitialMessage() {
    await rasaInteraction("/greet");
}

// Functions to send messages through the text input 
async function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return; // Ignore empty messages

    // Create the chat bubble for the user's input
    makeUserMessage(userInput);

    // Clear input field
    document.getElementById("user-input").value = "";

    // Send message to Rasa
    rasaInteraction(userInput);
}