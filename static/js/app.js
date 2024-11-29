let warnings = []; // Variable für Warnungen

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

    // Finde die zugehörige Warnung über die ID
    const emailWarning = warnings.find(warning => warning.id === email.id);

    detailView.innerHTML = `
        ${emailWarning ? `
        <div class="email-warning">
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

    // Zeige die Nutzer-Nachricht im Chat an
    const messages = document.getElementById("messages");
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = userInput;
    messages.appendChild(userMessage);
    messages.scrollTop = messages.scrollHeight;

    // Eingabe leeren
    document.getElementById("user-input").value = "";

    try {
        // API-Aufruf
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: userInput })
        });

        const data = await response.json();

        // Antwort anzeigen
        if (data.response) {
            const botMessage = document.createElement("div");
            botMessage.className = "message bot";
            botMessage.textContent = data.response.response; // Zeige die Antwort
            console.log(data.response)
            messages.appendChild(botMessage);

            // Quellen anzeigen (optional)
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



loadEmails();
