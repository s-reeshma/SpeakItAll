from stt import transcribe_audio
from translation import translate_text
from tts import clone_voice
from clean_audio import prepare_voice_profile
from langcodes import Language
def get_language_code(user_input):
        try:
            code = Language.find(user_input).language
            return code
        except LookupError:
            return None
def run_pipeline(t: str, input_file_path: str):
    t=get_language_code(t)
    test_file_path = input_file_path
    cleaned_profile_path = r"C:\Users\csekh\OneDrive\Desktop\SpeakItAllAI\SpeakItAll\backend\samples\user_sample.wav"
    output_audio = r"C:\Users\csekh\OneDrive\Desktop\SpeakItAllAI\SpeakItAll\backend\samples\output_cloned.wav"
    prepare_voice_profile(
            input_file_path=test_file_path,
            output_file_path=cleaned_profile_path
        )
    transcript, detected_lang = transcribe_audio(cleaned_profile_path)
    translated_input=translate_text(transcript, src_lang=detected_lang, tgt_lang=t)
    t = "zh-cn" if t == "zh" else t
    clone_voice(
            text=translated_input, 
            language=t, 
            speaker_audio_path=cleaned_profile_path, 
            output_path=output_audio
        )
    return output_audio