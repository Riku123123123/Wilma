// Intro näkyy vain ensimmäisellä kerralla
if (sessionStorage.getItem('introShown')) {
    document.querySelector('.intro').style.display = 'none';
    document.querySelector('.container').style.opacity = '1';
} else {
    sessionStorage.setItem('introShown', 'true');
}

// Kello
function updateClock() {
    const now = new Date();
    let h = now.getHours().toString().padStart(2, "0");
    let m = now.getMinutes().toString().padStart(2, "0");
    let s = now.getSeconds().toString().padStart(2, "0");
    document.getElementById("clock").textContent = `Kello ${h}:${m}:${s}`;

    highlightCurrent();
}

// Säädata Raumalle (OpenWeatherMap API)
async function updateWeather() {
    const apiKey = 'd6149ddcc486b4c7e8b6cf842aa88d49'; // Korvaa oikealla API-avaimella
    const city = 'Rauma,FI';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=fi`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            const weatherWidget = document.querySelector('.weather-widget');
            const weatherIcon = weatherWidget.querySelector('.weather-icon');
            const weatherTemp = weatherWidget.querySelector('.weather-temp');
            const weatherDetails = weatherWidget.querySelector('.weather-details');

            const temp = Math.round(data.main.temp);
            const description = data.weather[0].description;
            const iconCode = data.weather[0].icon;

            let iconClass;
            if (iconCode.includes('01')) iconClass = 'fas fa-sun';
            else if (iconCode.includes('02')) iconClass = 'fas fa-cloud-sun';
            else if (iconCode.includes('03') || iconCode.includes('04')) iconClass = 'fas fa-cloud';
            else if (iconCode.includes('09') || iconCode.includes('10')) iconClass = 'fas fa-cloud-rain';
            else if (iconCode.includes('11')) iconClass = 'fas fa-bolt';
            else if (iconCode.includes('13')) iconClass = 'fas fa-snowflake';
            else if (iconCode.includes('50')) iconClass = 'fas fa-smog';
            else iconClass = 'fas fa-cloud';

            weatherIcon.className = `${iconClass} weather-icon`;
            weatherTemp.textContent = `${temp}°C`;
            weatherDetails.textContent = `${description.charAt(0).toUpperCase() + description.slice(1)}`;
        } else {
            throw new Error('Säätietoja ei saatavilla');
        }
    } catch (error) {
        console.error('Virhe säätietojen haussa:', error);
        document.querySelector('.weather-temp').textContent = 'Ei yhteyttä';
    }
}

// Korostaa nykyisen päivän ja tunnin + näyttää jäljellä olevan ajan
function highlightCurrent() {
    const now = new Date();
    let day = now.getDay();
    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();

    document.querySelectorAll('.day-card').forEach(card => {
        card.classList.remove('highlight-day');
        card.querySelectorAll('.lesson').forEach(lesson => {
            lesson.classList.remove('highlight-lesson');
            // Poista kaikki vanhat jäljellä olevan ajan elementit
            lesson.querySelectorAll('.time-remaining').forEach(el => el.remove());
        });
        card.querySelector('.meal').classList.remove('highlight-meal');
    });

    // Viikonloppuna ei korosteta mitään
    if (day === 0 || day === 6) return;

    const todayCard = document.querySelector(`.day-card[data-day="${day}"]`);
    if (todayCard) {
        todayCard.classList.add('highlight-day');
        todayCard.querySelector('.meal').classList.add('highlight-meal');

        todayCard.querySelectorAll('.lesson').forEach(lesson => {
            const [lh, lm] = lesson.dataset.time.split(':').map(Number);
            const lessonStart = lh * 60 + lm;
            const lessonEnd = lessonStart + 75;
            const nowSeconds = h * 3600 + m * 60 + s;
            const lessonEndSeconds = lessonEnd * 60;

            if (nowSeconds >= lessonStart * 60 && nowSeconds < lessonEndSeconds) {
                lesson.classList.add('highlight-lesson');

                // Lasketaan jäljellä oleva aika
                let remainingSecTotal = lessonEndSeconds - nowSeconds;
                let remMin = Math.floor(remainingSecTotal / 60);
                let remSec = remainingSecTotal % 60;

                const remainingText = document.createElement('span');
                remainingText.className = 'time-remaining';
                remainingText.style.marginLeft = '10px';
                remainingText.style.padding = '2px 6px';
                remainingText.style.borderRadius = '6px';
                remainingText.style.backgroundColor = '#ff9800';
                remainingText.style.color = '#fff';
                remainingText.style.fontWeight = 'bold';
                remainingText.textContent = `Jäljellä ${remMin} min ${remSec.toString().padStart(2, '0')} s`;

                lesson.querySelector('.lesson-time').appendChild(remainingText);
            }
        });
    }
}

// Alustus
updateClock();
updateWeather();
setInterval(updateClock, 1000); // Päivitä kello ja jäljellä oleva aika joka sekunti
setInterval(updateWeather, 3600000);

// Lisää interaktiivisuutta
document.querySelectorAll('.lesson').forEach(lesson => {
    lesson.addEventListener('click', function () {
        alert(`Oppitunnin tiedot:\n${this.querySelector('.lesson-subject').textContent} (${this.querySelector('.lesson-code').textContent})\n` +
            `Aika: ${this.querySelector('.lesson-time').textContent}\n` +
            `Sali: ${this.querySelector('.lesson-room')?.textContent || 'Ei tietoa'}\n` +
            `Opettaja: ${this.querySelector('.lesson-teacher')?.textContent || 'Ei tietoa'}`);
    });
});

// Elementit
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');

const themeSelect = document.getElementById('themeSelect');
const fontSelect = document.getElementById('fontSelect');
const accentColor = document.getElementById('accentColor');

// Näytä asetukset
const settingsBtn = document.getElementById('settingsBtn');

settingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    settingsModal.style.display = 'flex';
});


// Sulje asetukset
closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// Teeman vaihto
themeSelect.addEventListener('change', () => {
    if (themeSelect.value === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', themeSelect.value);
});

// Fontin vaihto
fontSelect.addEventListener('change', () => {
    document.body.style.fontFamily = fontSelect.value;
    localStorage.setItem('font', fontSelect.value);
});

// Korostusväri
accentColor.addEventListener('input', () => {
    document.documentElement.style.setProperty('--accent-color', accentColor.value);
    localStorage.setItem('accentColor', accentColor.value);
});

// Lataa tallennetut asetukset
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const savedFont = localStorage.getItem('font');
    const savedAccent = localStorage.getItem('accentColor');

    if (savedTheme) {
        themeSelect.value = savedTheme;
        if (savedTheme === 'dark') document.body.classList.add('dark-theme');
    }
    if (savedFont) {
        fontSelect.value = savedFont;
        document.body.style.fontFamily = savedFont;
    }
    if (savedAccent) {
        accentColor.value = savedAccent;
        document.documentElement.style.setProperty('--accent-color', savedAccent);
    }
});
