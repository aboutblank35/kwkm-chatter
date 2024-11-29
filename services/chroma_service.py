import os
import shutil

from dotenv import load_dotenv
from langchain.schema.document import Document
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

# DATA_PATH = "/Users/can/Projects/Python/kwkm-chatter/data"
DATA_PATH = os.getenv("DATA_PATH", "../data")
CHROMA_PATH = os.getenv("CHROMA_DB_PATH", "../chroma")


def get_embedding_function():
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    return embeddings


def load_documents():
    print(f"DATA_PATH: {DATA_PATH}")
    if not os.path.exists(DATA_PATH):
        print("DATA_PATH existiert nicht.")
        return []
    files = os.listdir(DATA_PATH)
    print(f"Dateien im DATA_PATH: {files}")
    pdf_files = [f for f in files if f.lower().endswith(".pdf")]
    if not pdf_files:
        print("Keine PDF-Dateien im DATA_PATH gefunden.")
        return []
    document_loader = PyPDFDirectoryLoader(DATA_PATH)
    documents = document_loader.load()
    print(f"Anzahl der geladenen Dokumente: {len(documents)}")
    return documents


def split_documents(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=80,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Anzahl der erstellten Chunks: {len(chunks)}")
    return chunks


def add_to_chroma(chunks: list[Document]):
    # Load the existing database.
    db = Chroma(
        persist_directory=CHROMA_PATH, embedding_function=get_embedding_function()
    )

    # Calculate Page IDs.
    chunks_with_ids = calculate_chunk_ids(chunks)

    # Add or Update the documents.
    existing_items = db.get(include=[])  # IDs are always included by default
    existing_ids = set(existing_items["ids"])
    print(f"Anzahl der vorhandenen Dokumente in der DB: {len(existing_ids)}")
    print(f"Anzahl der zu verarbeitenden Chunks: {len(chunks_with_ids)}")

    # Only add documents that don't exist in the DB.
    new_chunks = []
    for chunk in chunks_with_ids:
        if chunk.metadata["id"] not in existing_ids:
            new_chunks.append(chunk)

    if len(new_chunks):
        print(f"👉 Hinzufügen neuer Dokumente: {len(new_chunks)}")
        new_chunk_ids = [chunk.metadata["id"] for chunk in new_chunks]
        db.add_documents(new_chunks, ids=new_chunk_ids)
        print("✅ Chunks wurden erfolgreich hinzugefügt.")
    else:
        print("✅ Keine neuen Dokumente zum Hinzufügen")


def calculate_chunk_ids(chunks):
    last_page_id = None
    current_chunk_index = 0

    for chunk in chunks:
        source = chunk.metadata.get("source")
        page = chunk.metadata.get("page")
        current_page_id = f"{source}:{page}"

        if current_page_id == last_page_id:
            current_chunk_index += 1
        else:
            current_chunk_index = 0

        chunk_id = f"{current_page_id}:{current_chunk_index}"
        last_page_id = current_page_id

        chunk.metadata["id"] = chunk_id

        # Debug Print
        print(f"Chunk ID: {chunk_id}")

    return chunks


def clear_database():
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)


def test_embeddings():
    embedding_function = get_embedding_function()
    test_text = "Dies ist ein Test."
    embedding = embedding_function.embed_documents([test_text])
    print(f"Länge des Embeddings: {len(embedding[0])}")


documents = load_documents()
chunks = split_documents(documents)
add_to_chroma(chunks)
test_embeddings()
