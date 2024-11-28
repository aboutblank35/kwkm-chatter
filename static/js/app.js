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
    const emailWarning = warnings.find(warning => warning.email_id === email.id);

    detailView.innerHTML = `
        ${emailWarning ? `
        <div class="email-warning">
            <p>${emailWarning.warning}</p>
        </div>` : ''}
        <h2>${email.subject}</h2>
        <p><strong>From:</strong> ${email.sender}</p>
        <p><strong>Sent:</strong> ${new Date(email.timestamp).toLocaleString()}</p>
        <hr>
        <p>${email.content}</p>
    `;
}

loadEmails();
