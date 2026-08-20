import os
from pydub import AudioSegment
from pydub.effects import normalize
from pydub.silence import split_on_silence

def prepare_voice_profile(input_file_path: str, output_file_path: str, max_duration_sec: int = 10):
    """
    Cleans and standardizes an audio file to act as a perfect reference profile 
    for XTTS-v2 zero-shot voice cloning.
    """
    print(f"Loading audio profile from: {input_file_path}...")
    audio = AudioSegment.from_file(input_file_path)
    audio = audio.set_channels(1)
    print("Normalizing volume...")
    audio = normalize(audio)
    print("Removing dead air and excessive silences...")
    chunks = split_on_silence(
        audio,
        min_silence_len=500,               
        silence_thresh=audio.dBFS - 16,    
        keep_silence=200                   
    )

    if chunks:
        cleaned_audio = chunks[0]
        for chunk in chunks[1:]:
            cleaned_audio += chunk
    else:
        cleaned_audio = audio

    max_len_ms = max_duration_sec * 1000
    if len(cleaned_audio) > max_len_ms:
        print(f"Trimming audio down to optimal {max_duration_sec} seconds...")
        cleaned_audio = cleaned_audio[:max_len_ms]

    os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
    cleaned_audio.export(output_file_path, format="wav")
    
    final_duration = len(cleaned_audio) / 1000
    print(f"Success! Cleaned voice profile saved to: {output_file_path} ({final_duration:.2f}s)")
    
    return output_file_path
if __name__ == "__main__":
    raw_input_audio = r"C:\Users\csekh\OneDrive\Desktop\SpeakItAllAI\SpeakItAll\samples\input_audio.wav"
    cleaned_profile_path = r"C:\Users\csekh\OneDrive\Desktop\SpeakItAllAI\SpeakItAll\samples\user_reference.wav"

    if not os.path.exists(raw_input_audio):
        print(f"Error: Could not find raw audio file at {raw_input_audio}")
    else:
        prepare_voice_profile(
            input_file_path=raw_input_audio,
            output_file_path=cleaned_profile_path
        )