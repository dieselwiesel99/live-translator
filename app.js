// Elemente
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const recognized = document.getElementById('recognized');
const translated = document.getElementById('translated');
const sourceLanguage = document.getElementById('sourceLanguage');
const targetLanguage = document.getElementById('targetLanguage');

let recognition;
let isListening = false;
let microphoneGranted = false;

// Mikrofon-Berechtigung prüfen
async function requestMicrophone() {
    try {
        // Erst Mikrofon-Zugriff über getUserMedia anfordern
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stream sofort wieder stoppen
        stream.getTracks().forEach(track => track.stop());
        microphoneGranted = true;
        status.textContent = '✅ Mikrofon bereit';
        status.style.color = '#4CAF50';
        return true;
    } catch (err) {
        status.textContent = '❌ Mikrofon verweigert';
        status.style.color = '#f44336';
        alert('Bitte erlaube den Mikrofon-Zugriff in den Einstellungen!');
        return false;
    }
}

// Speech Recognition initialisieren
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isListening = true;
        status.textContent = '🎤 Höre zu...';
        status.style.color = '#4CAF50';
        startBtn.disabled = true;
        stopBtn.disabled = false;
    };

    recognition.onend = () => {
        if (isListening) {
            try {
                recognition.start();
            } catch (e) {
                console.log('Restart failed:', e);
            }
        }
    };

    recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                final += transcript + ' ';
            } else {
                interim += transcript;
            }
        }

        const text = final || interim;
        recognized.textContent = text;

        if (final) {
            translate(final.trim());
        }
    };

    recognition.onerror = (event) => {
        console.error('Error:', event.error);
        if (event.error === 'not-allowed') {
            status.textContent = '❌ Mikrofon verweigert';
            status.style.color = '#f44336';
            stopListening();
        }
    };

} else {
    status.textContent = '❌ Nicht unterstützt';
    startBtn.disabled = true;
}

// Start Button
startBtn.addEventListener('click', async () => {
    // Erst Mikrofon-Berechtigung holen
    if (!microphoneGranted) {
        const granted = await requestMicrophone();
        if (!granted) return;
    }

    // Dann Speech Recognition starten
    if (recognition) {
        recognition.lang = sourceLanguage.value;
        try {
            recognition.start();
        } catch (e) {
            console.log('Start error:', e);
        }
    }
});

// Stop Button
stopBtn.addEventListener('click', stopListening);

function stopListening() {
    isListening = false;
    if (recognition) {
        recognition.stop();
    }
    status.textContent = 'Bereit';
    status.style.color = '#333';
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// Übersetzung
async function translate(text) {
    if (!text) return;

    const sourceLang = sourceLanguage.value.split('-')[0];
    const targetLang = targetLanguage.value;

    if (sourceLang === targetLang) {
        translated.textContent = text;
        return;
    }

    translated.textContent = '⏳ Übersetze...';

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            translated.textContent = data.responseData.translatedText;
        } else {
            translated.textContent = '❌ Fehler';
        }
    } catch (error) {
        console.error('Translation error:', error);
        translated.textContent = '❌ Verbindungsfehler';
    }
}

// Sprache wechseln während Zuhören
sourceLanguage.addEventListener('change', () => {
    if (isListening) {
        recognition.stop();
        setTimeout(() => {
            recognition.lang = sourceLanguage.value;
            recognition.start();
        }, 100);
    }
});

// Beim Laden der App schon nach Mikrofon fragen
window.addEventListener('load', () => {
    setTimeout(() => {
        requestMicrophone();
    }, 500);
});
