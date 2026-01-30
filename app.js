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

// Prüfen ob App im Standalone-Modus läuft
function isStandalone() {
    return (window.navigator.standalone === true) || 
           (window.matchMedia('(display-mode: standalone)').matches);
}

// Warnung anzeigen wenn im Standalone-Modus
if (isStandalone()) {
    status.textContent = '⚠️ Bitte in Safari öffnen!';
    status.style.color = '#ff9800';
    status.style.cursor = 'pointer';
    status.style.textDecoration = 'underline';
    
    // Bei Klick auf Status die URL kopieren
    status.addEventListener('click', () => {
        const url = window.location.href;
        
        // Versuche URL zu kopieren
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                alert('✅ Link kopiert!\n\nÖffne Safari und füge den Link ein.');
            });
        } else {
            alert('Öffne diese App in Safari:\n\n' + url + '\n\nDann funktioniert die Spracherkennung!');
        }
    });
    
    // Zeige auch einen Hinweis im erkannten Text
    recognized.innerHTML = '<strong>⚠️ Wichtig:</strong><br><br>Die Spracherkennung funktioniert nur in normalem Safari, nicht als Home-Screen-App.<br><br>📱 Bitte öffne diese Seite direkt in Safari!';
    recognized.style.color = '#ff9800';
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
        recognized.style.color = '#333';

        if (final) {
            translate(final.trim());
        }
    };

    recognition.onerror = (event) => {
        console.error('Error:', event.error);
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            if (isStandalone()) {
                status.textContent = '❌ Nur in Safari möglich!';
                alert('⚠️ Die Spracherkennung funktioniert nicht als Home-Screen-App.\n\n✅ Lösung:\nÖffne diese Seite direkt in Safari!');
            } else {
                status.textContent = '❌ Mikrofon verweigert';
                alert('Bitte erlaube den Mikrofon-Zugriff in den Safari-Einstellungen.');
            }
            status.style.color = '#f44336';
            stopListening();
        }
    };

} else {
    status.textContent = '❌ Browser nicht unterstützt';
    startBtn.disabled = true;
}

// Start Button
startBtn.addEventListener('click', async () => {
    if (isStandalone()) {
        alert('⚠️ Die App funktioniert nicht als Icon!\n\n✅ Bitte öffne:\nhttps://dieselwiesel99.github.io/live-translator/\n\ndirekt in Safari.');
        return;
    }

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
    if (!isStandalone()) {
        status.textContent = 'Bereit';
        status.style.color = '#333';
    }
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
