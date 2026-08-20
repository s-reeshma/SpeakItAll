import os
import torch
from TTS.api import TTS
print("Loading XTTS-v2 Voice Cloning Model...")
device = "cuda" if torch.cuda.is_available() else "cpu"
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

def clone_voice(text, language, speaker_audio_path, output_path):
    """
    Clones the voice from speaker_audio_path and speaks the text in the target language.
    """
    print(f"Generating cloned audio in language: '{language}'...")
    tts.tts_to_file(
        text=text,
        speaker_wav=speaker_audio_path,
        language=language,
        file_path=output_path,
        temperature=0.50,          
        repetition_penalty=2.0,    
        speed=1.05
    )
    
    print(f"Success! Audio saved to: {output_path}")
    return output_path
if __name__ == "__main__":
    reference_audio = r"C:\Users\csekh\OneDrive\Desktop\SpeakItAllAI\SpeakItAll\samples\user_reference.wav"
    output_audio = r"C:\Users\csekh\OneDrive\Desktop\SpeakItAllAI\SpeakItAll\samples\output_cloned.wav"
    test_text = "यह मेरी एआई आवाज़ है, जो मेरे कंप्यूटर पर चल रही है।"
    test_lang = "hi"  # "hi" for Hindi, "fr" for French, "es" for Spanish
    
    if not os.path.exists(reference_audio):
        print(f"Error: Could not find reference audio at {reference_audio}")
    else:
        clone_voice(
            text=test_text, 
            language=test_lang, 
            speaker_audio_path=reference_audio, 
            output_path=output_audio
        )