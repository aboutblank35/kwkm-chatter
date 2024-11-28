import json

from flask import Flask, jsonify, render_template

app = Flask(__name__)


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
