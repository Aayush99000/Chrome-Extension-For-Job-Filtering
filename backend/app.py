from flask import Flask 
from flask_cors import CORS
from routes.resume import resume_bp
from routes.match import match_bp

app = Flask(__name__)
CORS(app)  #Allow cross-origin requests

app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(match_bp, url_prefix='/api/match')

#health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return{
        'status': 'ok',
        'message': 'API is running',
        'version': '1.0.0'
    },200

#Root endpoint
@app.route('/', methods=['GET'])
def home():
    return{
        'message' : 'Job Resume Matcher API',
        'endpoints' : {
        'health' : '/api/health',
        'resume_upload' : '/api/resume/upload',
        'job_match' : '/api/match/jobs'
    }
},200

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Job Filter AI Backend Starting...")
    print("=" * 60)
    print("📍 Server: http://localhost:5000")
    print("🔍 Health: http://localhost:5000/api/health")
    print("📤 Upload: POST http://localhost:5000/api/resume/upload")
    print("🎯 Match:  POST http://localhost:5000/api/match/job")
    print("=" * 60)
    print("\n✨ Ready to process resumes and match jobs!\n")
        
    app.run(debug=True, port=5000, host='0.0.0.0')