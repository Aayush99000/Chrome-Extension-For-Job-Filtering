'''RAG Pipeline ( Main RAG Logic)'''

from services.embeddings import generate_job_embedding, calculate_similarity, model
from services.vector_store import query_relevant_sections
import numpy as np

def match_job_to_resume(job_data , user_id ="default"):
    """Match the job to the resume stored in vector store for the user"""
    try:
        job_title = job_data.get('title', '')
        job_description = job_data.get('description' , '')
        if not job_title or not job_description:
            raise ValueError("🤖 Job title and description are required for matching.")
        
        #Generate job embedding
        job_embedding = generate_job_embedding(job_title, job_description)

        #Query relevant resume sections from vector store
        relevant_sections = query_relevant_sections(job_embedding, user_id=user_id, top_k=5)

        if not relevant_sections:
            return {
                'similarity_score': 0.0,
                'matched_sections': [],
                'message': 'No relevant resume sections found for matching.'
            }
        
        #Calculate similarity between job and each relevant section
        section_embeddings = model.encode(relevant_sections)
        section_similarities = [
            calculate_similarity(job_embedding, emb.tolist()) 
            for emb in section_embeddings
        ]

        #Overall similarity score
        weights = [1.0 , 0.8 , 0.6 , 0.4 , 0.2][:len(section_similarities)]
        overall_score = np.average(section_similarities , weights =weights)

        #extract matched sections with their similarity scores
        matched_skills = extract_matched_skills(
            job_title + " " + job_description,
            relevant_sections
        )

        #Generate match reason
        reasons = generate_match_reasons(
            overall_score,
            matched_skills,
            relevant_sections
        )

        return {
            'similarity_score': overall_score,
            'matched_sections': relevant_sections,
            'matched_skills': matched_skills,
            'match_reasons': reasons
        }
    
    except Exception as e:
        raise ValueError(f"🤖 Error in RAG pipeline: {str(e)}")
    

def extract_matched_skills(job_text, resume_sections):
    """Extract skills that appear in both job and resumes"""

    #common tech skills to look for 
    skill_keyword = [
             'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
        'react', 'angular', 'vue', 'node', 'django', 'flask', 'fastapi',
        'sql', 'mongodb', 'postgresql', 'mysql', 'redis',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
        'git', 'agile', 'scrum', 'jira',
        'machine learning', 'deep learning', 'ai', 'nlp', 'computer vision',
        'data science', 'data analysis', 'statistics',
        'html', 'css', 'typescript', 'rest api', 'graphql',
        'linux', 'unix', 'bash', 'powershell',
        'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy'
        ]

    job_lower = job_text.lower()
    resume_text = " ".join(resume_sections).lower()

    matched = []
    for skill in skill_keyword:
        if skill in job_lower and skill in resume_text:
            matched.append(skill.title())

    return matched[:10]  #return top 10 matched skills
    

def generate_match_reasons(similarity_score, matched_skills, resume_sections):
    """Generate human readable reasons for the match score"""

    reasons = []
    #Reasons based on overall score
    if similarity_score > 0.75:
        reasons.append("Strong semantic match between job requirements and your experience")
    elif similarity_score > 0.6:
        reasons.append("Good alignment with job requirements")
    elif similarity_score > 0.4:
        reasons.append("Moderate match with some relevant experience")
    else:
        reasons.append("Limited alignment with job requirements")
    
    # Skills-based reason
    if len(matched_skills) > 5:
        reasons.append(f"Multiple matching skills: {', '.join(matched_skills[:5])}")
    elif len(matched_skills) > 0:
        reasons.append(f"Relevant skills: {', '.join(matched_skills)}")
    else:
        reasons.append("Few matching technical skills found")
    
    # Experience-based reason (simple keyword matching)
    resume_text = ' '.join(resume_sections).lower()
    
    if 'senior' in resume_text or 'lead' in resume_text:
        reasons.append("Senior-level experience indicated")
    elif 'years' in resume_text or 'experience' in resume_text:
        reasons.append("Relevant professional experience")
    
    return reasons
