"""Handels resume-related routes."""

from flask import Blueprint, request, jsonify
from services.parser import parse_resume
from services.vector_store import store_resume_embeddings
from services.embeddings import generate_resume_embeddings
from services.vector_store import get_stored_resume

resume_bp = Blueprint('resume', __name__)

@resume_bp.route('/upload', methods = ['POST'])
def upload_resume():
    """Upload and process resume"""
    try :
        if 'resume' not in request.files:
            return jsonify({
                'success': False,
                'message': '🤖 No resume file part in the request.'
            }), 400
        file = request.files['resume']
        if file.filename =='':
            return jsonify({
                'success' :False , 
                'message' : '🤖 No selected file.'
            }),400
        
        print(f"\n📄 Parsing resume: {file.filename} ...")

        #Parse resume (Extract text from the file)
        print("  ➜ Parsing document...")
        resume_text = parse_resume(file)
        print(f"  ✓ Extracted {len(resume_text)} characters")

        #Generate embeddings
        print("  ➜ Generating embeddings...")
        resume_data = generate_resume_embeddings(resume_text)
        print("  ✓ Embeddings generated")

        #Store embeddings in vector store
        print("  ➜ Storing embeddings...")
        store_resume_embeddings(resume_data, user_id='default')
        print("  ✓ Embeddings stored in vector store")

        print("✅ Resume processing completed.\n")

        return jsonify({
            'success': True,
            'message': '✅ Resume uploaded and processed successfully.',
            'data': {
                'filename' : file.filename,
                'text_length': len(resume_text),
                'sections_count': len(resume_data['sections'])
            }
        }), 200
    
    except Exception as e:
        print(f"❌ Error processing resume: {str(e)}\n")
        return jsonify({
            'success': False,
            'message': f'🤖 Error processing resume: {str(e)}'
        }), 500
    
@resume_bp.route('/status' , methods = ['GET'])
def get_resume_status():
    """Check resume processing status"""
    resume =get_stored_resume()
    if resume:
        return jsonify({
            'success': True,
            'message': '✅ Resume found in the system.',
            'data': {
                'sections_count': len(resume['sections'])
            }
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': '🤖 No resume found. Please upload a resume first.'
        }), 404
    