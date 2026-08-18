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
print("hi welcome to speech to speech translation AI cloning of your voice want to try it on: enter your target lang")
t=input()
t=get_language_code(t)
if t is None:
    print("Error: Could not recognize that language. Please try again.")
    exit()
test_file_path = r"C:\Users\csekh\OneDrive\Desktop\SpeakItAllAI\SpeakItAll\samples\input_audio.wav"
cleaned_profile_path = r"C:\Users\csekh\OneDrive\Desktop\SpeakItAllAI\SpeakItAll\samples\user_sample.wav"
output_audio = r"C:\Users\csekh\OneDrive\Desktop\SpeakItAllAI\SpeakItAll\samples\output_cloned.wav"
prepare_voice_profile(
            input_file_path=test_file_path,
            output_file_path=cleaned_profile_path
        )
transcript, detected_lang = transcribe_audio(cleaned_profile_path)
translated_input=translate_text(transcript, src_lang=detected_lang, tgt_lang=t)
tts_lang = "zh-cn" if t == "zh" else t
clone_voice(
            text=translated_input, 
            language=t, 
            speaker_audio_path=cleaned_profile_path, 
            output_path=output_audio
        )