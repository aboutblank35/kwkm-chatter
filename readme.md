## KWKM Chatter ####

Eine RAG-App (Retrieval Augmented Generation), die kontextbasierte Antworten liefert.

### Voraussetzungen
- Python 3.9+
- Flask
- Ollama (inklusive der Modelle llama3.2 und nomic-embed-text)
- Passende Embeddings für das Modell

## Schritt-für-Schritt Anleitung
### 1. Python-Umgebung einrichten
Erstelle und aktiviere ein virtuelles Environment:
```bash
python -m venv venv
# (Linux/macOS)
source venv/bin/activate
# (Windows)
venv\Scripts\activate
```
### 2. Abhängigkeiten installieren
```bash
pip install -r requirements.txt
```

### 3. Ollama installieren und Modelle herunterladen
Lade Ollama herunter und installiere die benötigten Modelle. Siehe die Ollama-Dokumentation für weitere Details.

Installation auf Linux/macOS:
```bash
curl -O https://ollama.ai/download/ollama-latest.tar.gz
tar -xzvf ollama-latest.tar.gz
./install.sh
```

Modelle laden:
```bash
ollama pull llama3.2:latest
ollama pull nomic-embed-text:latest
```

### 4. Embeddings herunterladen
Stelle sicher, dass du die passenden Embeddings für llama3.2 installierst. Falls notwendig, ersetze diesen Befehl durch die korrekten Befehle aus der Ollama-Dokumentation:

```bash
ollama embeddings download llama3.2
```
### 5. Environment-Variablen konfigurieren
Erstelle eine .env-Datei im Projektverzeichnis und setze den Chroma-DB-Pfad:

- DATA_PATH=data
- CHROMA_DB_PATH=chroma

### 6. App starten
Starte die Flask-App:
```bash
ollama serve
flask run
```
## Funktionsweise der App
### Datenbank & Embeddings:
Die App nutzt Chroma zur Speicherung von Dokumenten und eine Embedding-Funktion zur semantischen Suche.

### Anfrageverarbeitung:
Die Funktion query_rag(query_text: str) sucht die 5 ähnlichsten Dokumente, erstellt einen Kontext und generiert einen Prompt, der an das llama3.2 Modell übergeben wird.

### Antwort:
Das Modell liefert eine Antwort. Falls keine passenden Dokumente gefunden werden, wird eine Standardmeldung ausgegeben.
