"""
Docstring for services.vector_store
Vector store management using ChromaDB
"""

import chromadb
from chromadb.config import Settings
import os
#initialize ChromaDB client
data_dir = os.path.join(os.path.dirname(__file__), '..', 'data','resume_embeddings')
os.makedis(data_dir, exist_ok=True)

client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory=data_dir
))

#Get collection (create if not exists)
collection = client.get_or_create_collection(
    name = "resume_sections"
    metadata = {"description": "Collection of resume section embeddings"}
)

print(f"🤖 ChromaDB vector store initialized at:", {data_dir})

def store_resume_embeddings(resume_data , user_id ="default"):
    try:
        sections = resume_data['sections']
        section_embeddings = resume_data['section_embeddings']

        #Clear existing data for this user
        clear_user_data(user_id)

        #Store each section with its embedding
        ids = [f"{user_id}_section_{i}" for i in range(len(sections))]
        metadatas = [{"user_id": user_id, "section_index": i} for i in range(len(sections))]

        collection.add(
            embeddings = section_embeddings,
            documents = sections,
            ids = ids,
            metadatas = metadatas
        )

        print(f"🤖 Stored {len(sections)} sections for user {user_id} in vector store.")

    except Exception as e:
        raise ValueError(f"🤖 Error storing embeddings: {str(e)}")
    
def querry_relevant_sections(job_embedding,user_id = "default", top_k =5):
    try:
        results = collection.query(
            query_embeddings = [job_embedding.tolist()],
            n_results = top_k,
            where = {"user_id": user_id}
        )
        if not results['document'] or not results['documents'][0]:
            return []
        return results['documents'][0]
    
    except Exception as e:
        print(f"⚠️ Error querying embeddings: {str(e)}")
        return []

def clear_user_data(user_id="default"):
    """Clear all data for a specific user"""
    try:
        # Get all IDs for this user
        results = collection.get(where={"user_id": user_id})
        
        if results['ids']:
            collection.delete(ids=results['ids'])
            print(f"🗑️ Cleared existing data for user: {user_id}")
    
    except Exception as e:
        print(f"⚠️ Error clearing data: {str(e)}")

def get_stored_resume(user_id="default"):
    """Retrieve stored resume for a specific user"""
    try:
        results = collection.get(
            where={"user_id": user_id},
            limit=1
        )
        
        if results['documents']:
            # Return first section (or we could reconstruct full text)
            return results['documents'][0]
        
        return None
    
    except Exception as e:
        print(f"⚠️ Error getting resume: {str(e)}")
        return None