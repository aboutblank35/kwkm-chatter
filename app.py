import json

from flask import Flask, jsonify, render_template, request

from services.chroma_service import (
    add_to_chroma,
    clear_database,
    load_documents,
    split_documents,
)
from services.ollama_service import query_rag

app = Flask(__name__)


def initialize_chroma():
    clear_database()
    documents = load_documents()
    chunks = split_documents(documents)
    add_to_chroma(chunks)


def load_mock_emails():
    with open("./assets/mock_emails.json", "r", encoding="utf-8") as file:
        return json.load(file)


def load_mock_warnings():
    with open("./assets/mock_warnings.json", "r", encoding="utf-8") as file:
        return json.load(file)


@app.route("/api/emails")
def get_emails():
    emails = load_mock_emails()
    return jsonify(emails)


@app.route("/api/warnings")
def get_warnings():
    return jsonify(load_mock_warnings())


@app.route("/")
def index():
    emails = load_mock_emails()
    warnings = load_mock_warnings()
    return render_template("outlook.html", emails=emails, warnings=warnings)


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "Question is required"}), 400

    try:
        # Nutze die bestehende `query_rag`-Funktion
        response = query_rag(question)
        return jsonify({"response": response})
    except Exception as e:
        print(f"Error during query processing: {e}")
        return jsonify(
            {"error": "An error occurred while processing your request."}
        ), 500


if __name__ == "__main__":
    # Chroma-Service initialisieren
    initialize_chroma()

    app.run(debug=True, port=5000)
