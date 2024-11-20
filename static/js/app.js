// Lade Mock-Daten über die API
async function loadEmails() {
    const response = await fetch("/api/emails");
    const emails = await response.json();

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
}

// Details der E-Mail anzeigen
function showEmail(email) {
    const detailView = document.getElementById("email-detail");
    detailView.innerHTML = `
        <h2>${email.subject}</h2>
        <p><strong>Von:</strong> ${email.sender}</p>
        <p><strong>Gesendet:</strong> ${new Date(email.timestamp).toLocaleString()}</p>
        <hr>
        <p>${email.content}</p>
    `;
}

// Initialisiere die Anwendung
loadEmails();
