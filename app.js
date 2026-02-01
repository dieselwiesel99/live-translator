// Web Speech API Setup
let recognition;
let isListening = false;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// Elemente
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const recognizedText = document.getElementById('recognized');
const translatedText = document.getElementById('translated');
const sourceLanguage = document.getElementById('sourceLanguage');
const targetLanguage = document.getElementById('targetLanguage');
const speechToggle = document.getElementById('speechToggle');
const repeatBtn = document.getElementById('repeatBtn');
const textInput = document.getElementById('textInput');
const translateBtn = document.getElementById('translateBtn');

// Sprachcode-Mapping für Text-to-Speech
const voiceMap = {
    'de': 'de-DE',
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'it': 'it-IT',
    'sv': 'sv-SE',
    'no': 'nb-NO',
    'pl': 'pl-PL'
};

// Text-Eingabe übersetzen
translateBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
        recognizedText.textContent = text;
        translateText(text);
        textInput.value = ''; // Eingabefeld leeren
    }
});

// Enter-Taste im Textfeld
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        translateBtn.click();
    }
});

// Text vorlesen
function speakText(text, lang) {
    // Stoppe vorherige Ausgabe
    if (currentUtterance) {
        speechSynthesis.cancel();
    }

    if (!text || !speechToggle.checked) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceMap[lang] || lang;
    utterance.rate = 0.9; // Geschwindigkeit
    utterance.pitch = 1.0; // Tonhöhe
    utterance.volume = 1.0; // Lautstärke

    currentUtterance = utterance;
    speechSynthesis.speak(utterance);

    // Zeige Wiederholen-Button
    repeatBtn.style.display = 'inline-block';
}

// Wiederholen-Button
repeatBtn.addEventListener('click', () => {
    const text = translatedText.textContent;
    const lang = targetLanguage.value;
    if (text && text !== 'Hier erscheint die Übersetzung...' && text !== 'Übersetze...') {
        speakText(text, lang);
    }
});

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
        
        // Deaktiviere Text-Eingabe während Mikrofon aktiv
        textInput.disabled = true;
        translateBtn.disabled = true;
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
            status.textContent = '❌ Mikrofon verweigert';
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
    // Stoppe auch Sprachausgabe
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    status.textContent = 'Bereit zum Übersetzen';
    status.classList.remove('listening');
    startBtn.disabled = false;
    stopBtn.disabled = true;
    
    // Aktiviere Text-Eingabe wieder
    textInput.disabled = false;
    translateBtn.disabled = false;
}

// Übersetzungs-Funktion (MyMemory API - kostenlos)
async function translateText(text) {
    if (!text) return;

    const sourceLang = sourceLanguage.value.split('-')[0]; // z.B. "de" aus "de-DE"
    const targetLang = targetLanguage.value;

    if (sourceLang === targetLang) {
        translatedText.textContent = text;
        speakText(text, targetLang);
        return;
    }

    translatedText.textContent = 'Übersetze...';

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            const translation = data.responseData.translatedText;
            translatedText.textContent = translation;
            
            // Sprachausgabe der Übersetzung
            speakText(translation, targetLang);
        } else {
            translatedText.textContent = '❌ Übersetzung fehlgeschlagen';
        }
    } catch (error) {
        console.error('Translation error:', error);
        translatedText.textContent = '❌ Verbindungsfehler';
    }
}

// Sprache während Zuhören ändern
sourceLanguage.addEventListener('change', () => {
    if (isListening) {
        recognition.stop();
        setTimeout(() => {
            recognition.lang = sourceLanguage.value;
            recognition.start();
        }, 100);
    }
});

// Sprachausgabe aktivieren/deaktivieren
speechToggle.addEventListener('change', () => {
    if (!speechToggle.checked && speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
});
