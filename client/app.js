const text_box = document.getElementById('text');
const button = document.getElementById('go_button');
const voiceDropdown = document.getElementById('spokenVoice');
const finalLanguageDropdown = document.getElementById('finalLanguage');

button.onclick = () => {
  const text = text_box.value;
  const voiceEl = voiceDropdown.querySelectorAll('option')[voiceDropdown.selectedIndex];
  const voice = {
    name: voiceEl.value,
    code: voiceEl.getAttribute('code'),
  };
  const language = finalLanguageDropdown.value;
  button.disabled = true;
  fetch('/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, voice, language }),
  })
    .then((res) => res.json())
    .then((res) => {
      const audioEl = document.createElement('audio');
      const textEl = document.createElement('p');
      const textEl2 = document.createElement('p');
      const linkEl = document.createElement('a');

      linkEl.innerText = 'Download Zip';
      linkEl.href = res.zip;
      textEl.innerText = 'Original: ' + text;
      textEl2.innerText = 'Translation: ' + res.text;

      audioEl.src = res.filename;
      audioEl.controls = true;
      audioEl.autoplay = true;

      document.body.append(textEl);
      document.body.append(textEl2);
      document.body.append(audioEl);
      document.body.append(linkEl);

      button.disabled = false;
    });
};

fetch('init')
  .then((res) => res.json())
  .then((json) => {
    console.log(json);
    json.voices.forEach((voice) => {
      const option = document.createElement('option');
      option.innerText = `${voice.name} - ${voice.ssmlGender}`;
      option.value = voice.name;
      option.setAttribute('code', voice.languageCodes[0]);
      if (voice.name === 'de-DE-Wavenet-D') option.selected = true;
      voiceDropdown.appendChild(option);
    });

    json.languages.forEach((language) => {
      const option = document.createElement('option');
      option.innerText = `${language.name}`;
      option.value = language.code;
      if (language.code === 'en') option.selected = true;
      finalLanguageDropdown.appendChild(option);
    });
  });
