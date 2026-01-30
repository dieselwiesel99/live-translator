let recognition;
let isListening = false;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const recognized = document.getElementById('recognized');
const translated = document.getElementById('translated');
const sourceLanguage = document.getElementById('sourceLanguage');
const targetLanguage = document.getElementById('targetLanguage');

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isListening = true;
        status.textContent = '🎤 Zuhören...';
        status.classList.add('listening');
        startBtn.disabled = true;
        stopBtn.disabled = false;
    };

    recognition.onend = () => {
        if (isListening) {
            recognition.start();
        }
    };

    recognition.onresult = (event) => {
        let final = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                final += event.results[i][0].transcript + ' ';
            } else {
                interim += event.results[i][0].transcript;
            }
        }

        recognized.textContent = final || interim;

        if (final) {
            translate(final.trim());
        }
    };

    recognition.onerror = (event) => {
        console.error('Error:', event.error);
        status.textContent = '❌ Fehler: ' + event.error;
        status.classList.remove('listening');
    };
}

startBtn.addEventListener('click', () => {
    recognition.lang = sourceLanguage.value;
    recognition.start();
});

stopBtn.addEventListener('click', () => {
    isListening = false;
    recognition.stop();
    status.textContent = 'Bereit';
    status.classList.remove('listening');
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

async function translate(text) {
    const sourceLang = sourceLanguage.value.split('-')[0];
    const targetLang = targetLanguage.value;

    if (sourceLang === targetLang) {
        translated.textContent = text;
        return;
    }

    translated.textContent = '⏳...';

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        const res = await fetch(url);
        const data = await res.json();
        translated.textContent = data.responseData.translatedText || '❌';
    } catch (e) {
        translated.textContent = '❌';
    }
}
