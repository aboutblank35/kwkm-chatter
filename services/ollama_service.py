import os

from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain_chroma import Chroma
from langchain_ollama import ChatOllama

from services.chroma_service import get_embedding_function

load_dotenv()

CHROMA_PATH = os.getenv("CHROMA_DB_PATH", "../chroma")

PROMPT_TEMPLATE = """
Answer the following question solely based on the provided context. 
If the answer is not included in the context, please say: 
"Sorry, that information is not included in the provided context."

Context:
{context}

---

Question:
{question}

Answer:
"""


def query_rag(query_text: str):
    print(query_text)
    embedding_function = get_embedding_function()

    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    # Ähnlichkeitssuche durchführen
    results = db.similarity_search_with_score(query_text, k=5)

    if not results:
        print("Keine ähnlichen Dokumente für die Anfrage gefunden.")
        return {
            "response": "Entschuldigung, diese Information ist nicht im bereitgestellten Kontext enthalten.",
            "sources": [],
        }

    # Debug-Ausgabe der Ergebnisse
    print("Ähnlichkeitssuchergebnisse:")
    for doc, score in results:
        print(
            f"Score: {score}, Dokument ID: {doc.metadata.get('id')}, Inhalt: {doc.page_content[:100]}..."
        )

    # Kontext aus den Ergebnissen erstellen
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])

    # Debug-Ausgabe des Kontextes
    print("Kontexttext:")
    print(context_text)

    # Prompt erstellen
    prompt_template = PromptTemplate(
        input_variables=["context", "question"], template=PROMPT_TEMPLATE
    )
    prompt = prompt_template.format(context=context_text, question=query_text)

    # Modell abfragen
    model = ChatOllama(model="llama3.2")
    response = model.invoke(prompt)

    response_text = response.content if hasattr(response, "content") else str(response)
    sources = [doc.metadata.get("id", None) for doc, _score in results]

    return {
        "response": response_text.strip(),
        "sources": sources,
    }
