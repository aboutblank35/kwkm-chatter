import json
from flask import Flask, jsonify, render_template

app = Flask(__name__)

# E-Mails aus JSON-Datei laden
def load_mock_emails():
    with open("./assets/mock_emails.json", "r", encoding="utf-8") as file:
        return json.load(file)

@app.route("/api/emails")
def get_emails():
    emails = load_mock_emails()
    return jsonify(emails)


@app.route("/")
def index():
    # Mock-Daten laden und ins Template übergeben
    emails = load_mock_emails()
    return render_template("outlook.html", emails=emails)
