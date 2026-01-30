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
let audioStream = null;

// Speech Recognition initialisieren
function initRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = sourceLanguage.value;

        recognition.onstart = () => {
            console.log('Recognition started');
            isListening = true;
            status.textContent = '🎤 Höre zu...';
            status.style.color = '#4CAF50';
            startBtn.disabled = true;
            stopBtn.disabled = false;
        };

        recognition.onend = () => {
            console.log('Recognition ended');
            if (isListening) {
                console.log('Auto-restarting...');
                setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.log('Restart failed:', e);
                        stopListening();
                    }
                }, 100);
            }
        };

        recognition.onresult = (event) => {
            console.log('Got result');
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
            console.error('Recognition error:', event.error);
            status.textContent = '❌ Fehler: ' + event.error;
            status.style.color = '#f44336';
            
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                alert('Mikrofon-Zugriff wurde verweigert. Bitte in Safari öffnen und Berechtigung erteilen.');
                stopListening();
            }
        };

        return true;
    } else {
        status.textContent = '❌ Browser nicht unterstützt';
        startBtn.disabled = true;
        return false;
    }
}

// Start Button
startBtn.addEventListener('click', async () => {
    console.log('Start clicked');
    
    try {
        // Erst Mikrofon-Stream holen
        if (!audioStream) {
            console.log('Requesting microphone...');
            audioStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            console.log('Microphone granted');
        }

        // Recognition initialisieren falls noch nicht geschehen
        if (!recognition) {
            const success = initRecognition();
            if (!success) return;
        }

        // Sprache setzen
        recognition.lang = sourceLanguage.value;
        console.log('Starting recognition with lang:', sourceLanguage.value);

        // Recognition starten
        recognition.start();
        
    } catch (err) {
        console.error('Error:', err);
        status.textContent = '❌ Fehler: ' + err.message;
        status.style.color = '#f44336';
        alert('Fehler beim Starten:\n' + err.message + '\n\nBitte die App in normalem Safari öffnen!');
    }
});

// Stop Button
stopBtn.addEventListener('click', stopListening);

function stopListening() {
    console.log('Stopping...');
    isListening = false;
    
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {
            console.log('Stop error:', e);
        }
    }
    
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
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
    if (isListening && recognition) {
        recognition.stop();
        setTimeout(() => {
            recognition.lang = sourceLanguage.value;
            recognition.start();
        }, 300);
    }
});

// Check ob Browser unterstützt wird
window.addEventListener('load', () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        status.textContent = '❌ Nur Safari unterstützt';
        status.style.color = '#f44336';
        startBtn.disabled = true;
    } else {
        status.textContent = 'Bereit - Klicke auf Start';
        status.style.color = '#333';
    }
});
