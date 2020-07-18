const textToSpeech = require("@google-cloud/text-to-speech");
const { nanoid } = require("nanoid");
const fs = require("fs");
const child_process = require("child_process");
const util = require("util");
const { Translate } = require("@google-cloud/translate").v2;
const { shuffle } = require("d3-array");

const client = new textToSpeech.TextToSpeechClient();
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const exec = util.promisify(child_process.exec);

const translate = new Translate();

async function init() {
  const voices = await client.listVoices();
  const languages = await translate.getLanguages();
  return {
    voices: voices[0].voices.filter((voice) => voice.name.includes("Wavenet")),
    languages: languages[0],
  };
}

async function translateText(text, language) {
  let translation = [text];
  console.log("in: ", translation[0]);
  const q = await translate.getLanguages();
  const langs = shuffle(q[0]);

  for (const lang of langs.slice(0, 16)) {
    console.log(lang);
    translation = await translate.translate(translation[0], lang.code);
  }

  translation = await translate.translate(translation[0], language);
  console.log("out: ", translation[0]);

  return translation[0];
}

async function getVoice(text, voice) {
  const request = {
    input: { text: text },
    // voice: { languageCode: 'de-DE', name: 'de-DE-Wavenet-D' }, //en-US-Wavenet-B'},
    voice: { languageCode: voice.code, name: voice.name }, //en-US-Wavenet-B'},
    audioConfig: { audioEncoding: "MP3" },
  };

  const [response] = await client.synthesizeSpeech(request);

  const filename = `audio/output-${nanoid()}.mp3`;
  await writeFile(filename, response.audioContent, "binary");
  console.log(`Audio content written to file: ${filename}`);
  return filename;
}

async function getVoiceZip(text, voice) {
  const dir = nanoid();

  await mkdir(`audio/${dir}`);

  const results = [];
  const words = text.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    const request = {
      input: { text: word },
      voice: { languageCode: voice.code, name: voice.name }, //en-US-Wavenet-B'},
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await client.synthesizeSpeech(request);

    const filename = `audio/${dir}/${i}-${word.replace(/[^\w\d]/g, "")}.mp3`;
    await writeFile(filename, response.audioContent, "binary");

    results.push(filename);
  }

  const zip = `audio/zip-${nanoid()}.zip`;

  await exec(`zip -j ${zip} ${results.join(" ")}`);
  console.log(
    `Zip file written to file: ${zip}\n-------------------------------\n`
  );

  return zip;
}

module.exports = {
  getVoice,
  translateText,
  getVoiceZip,
  init,
};
