from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
model = M2M100ForConditionalGeneration.from_pretrained("facebook/m2m100_418M", device_map="auto")
tokenizer = M2M100Tokenizer.from_pretrained("facebook/m2m100_418M")
def translate_text(st,src_lang, tgt_lang):
    tokenizer.src_lang = src_lang
    encoded_hi = tokenizer(st, return_tensors="pt").to(model.device)
    generated_tokens = model.generate(**encoded_hi, forced_bos_token_id=tokenizer.get_lang_id(tgt_lang))
    return tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

if __name__ == "__main__":
    hi_text = "Hey Hi, I am Sri Shma. I am studying in 30 years and it will be a rewatch by Indian Institute of Information Technology and Management. Currently I am working on this project and I find it really, really cool. I want to learn real true projects rather than learning it through theory. Wow, that is so funny. It's so, so funny. I am so done right now. Okay, bye bye. See you later. Have a nice time. Have a nice day. Have a very, very, very good time."
    print("Translating...")
    t = translate_text(hi_text, src_lang="en", tgt_lang="hi")
    print("\n--- Translation Output ---")
    print(t)
