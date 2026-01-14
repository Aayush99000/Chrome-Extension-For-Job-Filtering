"""Match Routes - Handles job matching requests"""

from flask import Blueprint, request, jsonify
from services.rag_pipeline import match_job_to_resume

match_bp = Blueprint('match', __name__)

@match_bp.route('/job',methods=['POST'])
def match_job():
    """Match job posting against stored Resume"""
    try:
        job_data = request.get_json()

        if not job_data:
            return jsonify({
                'success': False,
                'message': '🤖 No job data provided in the request.'
            }), 400
        
        title = job_data.get('title', '')
        description = job_data.get('description', '')

        if not title or not description:
            return jsonify({
                'success': False,
                'message': '🤖 Job title and description are required.'
            }), 400
        
        print(f"\n🎯 Matching job: {title} ...")

        #Match job to resume
        match_result = match_job_to_resume(job_data, user_id='default')

        print(f". -> Match Score: {match_result['similarity_score']:.4f}")
        print(f" ->Skills Matched: {', '.join(match_result['matched_skills']) if match_result['matched_skills'] else 'None'}")
        print("✅ Job matching completed.\n")

        return jsonify({
            'success': True,
            'message': '✅ Job matched against resume successfully.',
            'data': match_result
        }), 200
    
    except Exception as e:
        print(f"❌ Error matching job: {str(e)}\n")
        return jsonify({
            'success': False,
            'message': f'🤖 Error matching job: {str(e)}'
        }), 500
    
@match_bp.route('/batch', methods=['POST'])
def match_batch()
    """Match multiple job postings against stored Resume"""
    try:
        data = request.get_json()
        jobs= data.get('jobs', [])

        if not jobs:
            return jsonify({
                'success': False,
                'message': '🤖 No job postings provided in the request.'
            }), 400
        
        results = []
        for job in jobs:
            match_result = match_job_to_resume(job, user_id='default')
            results.append({
                'job_title': job.get('title', ''),
                'match_result': match_result
            })
        return jsonify({
            'success': True,
            'message': '✅ Batch job matching completed successfully.',
            'data': results
        }), 200
    
    except Exception as e:
        print(f"❌ Error in batch job matching: {str(e)}\n")
        return jsonify({
            'success': False,
            'message': f'🤖 Error in batch job matching: {str(e)}'
        }), 500