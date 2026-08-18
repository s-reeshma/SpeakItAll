from faster_whisper import WhisperModel
import os
print("Loading STT Model...")
model_size = "small"
model = WhisperModel(model_size, device="cpu", compute_type="int8")
def transcribe_audio(file_path):
    print("Transcribing...")
    segments, info = model.transcribe(file_path, beam_size=5, vad_filter=True)
    
    clean_text_segments = []
    for segment in segments:
        clean_text_segments.append(segment.text.strip())
        
    full_transcript = " ".join(clean_text_segments)
    return full_transcript, info.language

if __name__ == "__main__":
    test_file_path = r"C:\Users\csekh\OneDrive\Desktop\SpeakItAllAI\SpeakItAll\samples\input_audio.wav"
    if not os.path.exists(test_file_path):
        print(f"Error: Could not find audio file at {test_file_path}")
    else:
        transcript, detected_lang = transcribe_audio(test_file_path)
        
        print(f"\nDetected Language: {detected_lang}")
        print("--- Final Clean Text ---")
        print(transcript)