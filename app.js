// Web Speech API Setup
let recognition;
let isListening = false;

// Elemente
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const recognizedText = document.getElementById('sourceText');
const translatedText = document.getElementById('translatedText');
const sourceLanguage = document.getElementById('sourceLanguage');
const targetLanguage = document.getElementById('targetLanguage');

// Speech Recognition Setup
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    // Events
    recognition.onstart = () => {
        isListening = true;
        status.textContent = '🎤 Zuhören...';
        status.classList.add('listening');
        startBtn.disabled = true;
        stopBtn.disabled = false;
    };

    recognition.onend = () => {
        if (isListening) {
            recognition.start(); // Auto-restart
        }
    };

    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        const currentText = finalTranscript || interimTranscript;
        recognizedText.textContent = currentText;

        // Übersetzen wenn finaler Text
        if (finalTranscript) {
            translateText(finalTranscript.trim());
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
            status.textContent = '❌ Mikrofon-Zugriff verweigert';
            status.classList.remove('listening');
            stopListening();
        }
    };

} else {
    status.textContent = '❌ Browser unterstützt keine Spracherkennung';
    startBtn.disabled = true;
}

// Start Listening
startBtn.addEventListener('click', () => {
    recognition.lang = sourceLanguage.value;
    recognition.start();
});

// Stop Listening
stopBtn.addEventListener('click', stopListening);

function stopListening() {
    isListening = false;
    if (recognition) {
        recognition.stop();
    }
    status.textContent = 'Bereit zum Übersetzen';
    status.classList.remove('listening');
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// Übersetzungs-Funktion (MyMemory API - kostenlos)
async function translateText(text) {
    if (!text) return;

    const sourceLang = sourceLanguage.value.split('-')[0]; // z.B. "de" aus "de-DE"
    const targetLang = targetLanguage.value;

    if (sourceLang === targetLang) {
        translatedText.textContent = text;
        return;
    }

    translatedText.textContent = 'Übersetze...';

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            translatedText.textContent = data.responseData.translatedText;
        } else {
            translatedText.textContent = '❌ Übersetzung fehlgeschlagen';
        }
    } catch (error) {
        console.error('Translation error:', error);
        translatedText.textContent = '❌ Fehler bei der Übersetzung';
    }
}

// Sprache wechseln während des Zuhörens
sourceLanguage.addEventListener('change', () => {
    if (isListening) {
        recognition.stop();
        setTimeout(() => {
            recognition.lang = sourceLanguage.value;
            recognition.start();
        }, 100);
    }
});
