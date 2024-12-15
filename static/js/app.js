let warnings = [];

async function loadWarnings() {
    try {
        const response = await fetch("/api/warnings");
        warnings = await response.json();
        console.log("Warnings loaded:", warnings);
    } catch (error) {
        console.error("Error loading warnings:", error);
    }
}

async function loadEmails() {
    try {
        const emailResponse = await fetch("/api/emails");
        const emails = await emailResponse.json();
        console.log("Emails loaded:", emails);

        await loadWarnings();

        const emailList = document.getElementById("email-list");
        emailList.innerHTML = "";

        emails.forEach((email) => {
            const listItem = document.createElement("li");
            listItem.classList.add("email-item");
            listItem.innerHTML = `
                <span class="email-sender">${email.id}</span>
                <span class="email-sender">${email.sender}</span>
                <span class="email-subject">${email.subject}</span>
                <span class="email-timestamp">${new Date(email.timestamp).toLocaleString()}</span>
            `;
            listItem.onclick = () => showEmail(email);
            emailList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading emails:", error);
    }
}

function showEmail(email) {
    const detailView = document.getElementById("email-detail");
    const emailWarning = warnings.find(warning => warning.id === email.id);

    detailView.innerHTML = `
        ${emailWarning ? `
        <div class="email-warning" style="display: ${!document.getElementById("variant-toggle").checked ? "block" : "none"};">
            <p>${emailWarning.text}</p>
        </div>` : ''}
        <h2>${email.subject}</h2>
        <p><strong>From:</strong> ${email.sender}</p>
        <p><strong>Sent:</strong> ${new Date(email.timestamp).toLocaleString()}</p>
        <hr>
        <p>${email.content}</p>
    `;
}

async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput) return;

    const messages = document.getElementById("messages");
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = userInput;
    messages.appendChild(userMessage);
    messages.scrollTop = messages.scrollHeight;

    document.getElementById("user-input").value = "";

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: userInput })
        });

        const data = await response.json();

        if (data.response) {
            const botMessage = document.createElement("div");
            botMessage.className = "message bot";
            botMessage.textContent = data.response.response;
            messages.appendChild(botMessage);

            if (data.response.sources && data.response.sources.length > 0) {
                const sourceMessage = document.createElement("div");
                sourceMessage.className = "message bot";
                sourceMessage.textContent = `Sources: ${data.response.sources.join(", ")}`;
                sourceMessage.style.fontSize = "0.8em";
                sourceMessage.style.color = "gray";
                messages.appendChild(sourceMessage);
            }
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error("Error:", error);
        const errorMessage = document.createElement("div");
        errorMessage.className = "message bot";
        errorMessage.textContent = "Error: Unable to fetch response.";
        messages.appendChild(errorMessage);
        messages.scrollTop = messages.scrollHeight;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("variant-toggle");
    const label = document.getElementById("variant-label");
    const chatContainer = document.getElementById("chat-container");
    const chatToggleButton = document.getElementById("chat-toggle-button");
    const emailDetail = document.getElementById("email-detail");
    const topBox = document.getElementById("top-box");

    const updateUI = (isVariantB) => {
        const chatContainer = document.getElementById("chat-container");
        const chatToggleButton = document.getElementById("chat-toggle-button");
        const emailDetail = document.getElementById("email-detail");
        const warnings = emailDetail.querySelectorAll(".email-warning");
        const topBox = document.getElementById("top-box");
    
        if (!isVariantB) { 
            chatContainer.style.display = "block";
            chatToggleButton.style.display = "block";
            warnings.forEach(warning => warning.style.display = "block");
            topBox.classList.remove("hidden"); 
        } else { 
            chatContainer.style.display = "none";
            chatToggleButton.style.display = "none";
            warnings.forEach(warning => warning.style.display = "none");
            topBox.classList.add("hidden"); 
        }
        
        label.textContent = isVariantB ? "Variante B" : "Variante A";
    };


    toggle.addEventListener("change", () => {
        updateUI(toggle.checked);
    });

    updateUI(toggle.checked);
});

loadEmails();
