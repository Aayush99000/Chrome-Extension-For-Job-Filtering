"""
Embeddings generator
"""

from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_resume_embeddings(resume_text):
    try:
        from services.parser import extract_sections
        sections = extract_sections(resume_text)
        #Generate embeddings for each section
        section_embeddings = model.encode(sections)
        #Generate embeddings for full text
        full_embedding = model.encode([resume_text])[0]
        return {
            'full_text': resume_text,
            'sections': sections,
            'section_embeddings': section_embeddings.tolist(),
            'full_embedding': full_embedding.tolist()
        }
    except Exception as e:
        raise ValueError(f"🤖 Error generating embeddings: {str(e)}")
    
def generate_job_embedding(job_title, job_description):
    try:
        job_text = f"{job_title}\n\n{job_description}"
        job_embedding = model.encode([job_text])[0]
        return job_embedding.tolist()
    except Exception as e:
        raise ValueError(f"🤖 Error generating job embedding: {str(e)}")
    
def calculate_similarity(embedding1, embedding2):
    
    # Reshape to 2D arrays
    emb1 = np.array(embedding1).reshape(1, -1)
    emb2 = np.array(embedding2).reshape(1, -1)
    
    # Calculate cosine similarity
    similarity = cosine_similarity(emb1, emb2)[0][0]
    
    return float(similarity)