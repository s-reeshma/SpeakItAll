from stt import transcribe_audio
from translation import translate_text
from tts import clone_voice
from clean_audio import prepare_voice_profile
from pipeline import run_pipeline
import os
import shutil
from fastapi import FastAPI,UploadFile,File,Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="SpeakItAll AI Engine")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post('/api/translate')
async def translate(target_lang: str = Form(...), 
    audio_file: UploadFile = File(...)):
    temp_input_path = r"C:\Users\csekh\OneDrive\Desktop\SpeakItAllAI\SpeakItAll\backend\samples\input_audio.wav"
    with open(temp_input_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)
    final_output_path = run_pipeline(target_lang, temp_input_path)
    if isinstance(final_output_path, dict) and "error" in final_output_path:
        return final_output_path
        
    return FileResponse(final_output_path, media_type="audio/wav",filename="translated_audio.wav")
    