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

const fontSizeInput = document.getElementById('fontSize');

fontSizeInput.addEventListener('input', () => {
    document.body.style.fontSize = fontSizeInput.value + 'px';
    localStorage.setItem('fontSize', fontSizeInput.value);
});

// Ladataan tallennettu
const savedFontSize = localStorage.getItem('fontSize');
if (savedFontSize) {
    fontSizeInput.value = savedFontSize;
    document.body.style.fontSize = savedFontSize + 'px';
}


// Aineiden värit
const subjectColors = [
    "math", "finnish", "english", "swedish", "languages",
    "history", "physics", "sports", "economics", "event"
];

subjectColors.forEach(subject => {
    const input = document.getElementById(`color-${subject}`);
    if (input) {
        // Lataa tallennettu väri jos löytyy
        const saved = localStorage.getItem(`color-${subject}`);
        if (saved) {
            input.value = saved;
            document.documentElement.style.setProperty(`--color-${subject}`, saved);
        }

        // Päivitä kun käyttäjä vaihtaa
        input.addEventListener("input", () => {
            document.documentElement.style.setProperty(`--color-${subject}`, input.value);
            localStorage.setItem(`color-${subject}`, input.value);
        });
    }
});

// 🎨 Aineiden värien lista auki/kiinni
const subjectColorsToggle = document.getElementById("subjectColorsToggle");
const subjectColorsGroup = document.getElementById("subjectColorsGroup");
const subjectColorsArrow = document.getElementById("subjectColorsArrow");

subjectColorsToggle.addEventListener("click", () => {
    if (subjectColorsGroup.style.display === "none") {
        subjectColorsGroup.style.display = "block";
        subjectColorsArrow.classList.remove("fa-chevron-down");
        subjectColorsArrow.classList.add("fa-chevron-up");
    } else {
        subjectColorsGroup.style.display = "none";
        subjectColorsArrow.classList.remove("fa-chevron-up");
        subjectColorsArrow.classList.add("fa-chevron-down");
    }
});

function openExternalGame(url) {
    window.open(url, "_blank");
}

function openInternalGame(game) {
    document.getElementById("rpsGame").style.display = "none";
    if (game === "rps") {
        document.getElementById("rpsGame").style.display = "block";
    }
}

let rpsInterval;

function startRPS(playerChoice) {
    const popup = document.getElementById("rpsPopup");
    const anim = document.getElementById("rpsAnimation");
    const resultBox = document.getElementById("rpsResult");

    const symbols = ["🪨", "📄", "✂️"];
    const names = ["kivi", "paperi", "sakset"];

    popup.style.display = "flex"; // näytä popup
    resultBox.textContent = "Arvotaan...";
    let i = 0;

    // Käynnistetään pyöritys
    clearInterval(rpsInterval);
    rpsInterval = setInterval(() => {
        anim.textContent = symbols[i];
        i = (i + 1) % symbols.length;
    }, 120);

    // Arvotaan tietokoneen lopullinen valinta
    const computerChoice = names[Math.floor(Math.random() * 3)];

    // Lopetetaan pyöritys 2 sekunnin päästä
    setTimeout(() => {
        clearInterval(rpsInterval);
        anim.textContent = symbols[names.indexOf(computerChoice)];

        // Tuloksen laskenta
        let result = "";
        if (playerChoice === computerChoice) {
            result = `Tasapeli! Molemmat valitsivat ${playerChoice}.`;
        } else if (
            (playerChoice === "kivi" && computerChoice === "sakset") ||
            (playerChoice === "paperi" && computerChoice === "kivi") ||
            (playerChoice === "sakset" && computerChoice === "paperi")
        ) {
            result = `🎉 Voitit! ${playerChoice} voittaa ${computerChoice}.`;
        } else {
            result = `❌ Hävisit! ${computerChoice} voittaa ${playerChoice}.`;
        }

        resultBox.textContent = result;

        // ✅ Suljetaan popup automaattisesti 1.5 sek kuluttua
        setTimeout(() => {
            popup.style.display = "none";
        }, 1500);

    }, 2000);
}

function closeRpsPopup() {
    document.getElementById("rpsPopup").style.display = "none";
}

// Tallennetaan ruokalista localStorageen
document.getElementById("saveMeals").addEventListener("click", () => {
    const meals = {
        mon: document.getElementById("meal-mon").value,
        tue: document.getElementById("meal-tue").value,
        wed: document.getElementById("meal-wed").value,
        thu: document.getElementById("meal-thu").value,
        fri: document.getElementById("meal-fri").value,
    };
    localStorage.setItem("meals", JSON.stringify(meals));
    alert("Ruokalista tallennettu!");
    updateMeals();
});

// Päivitetään näkyviin ruokalista
function updateMeals() {
    const savedMeals = JSON.parse(localStorage.getItem("meals"));
    if (!savedMeals) return;

    const days = ["mon", "tue", "wed", "thu", "fri"];
    const dayCards = document.querySelectorAll(".day-card");

    dayCards.forEach((card, index) => {
        const mealEl = card.querySelector(".meal span");
        if (mealEl && savedMeals[days[index]]) {
            mealEl.textContent = savedMeals[days[index]];
        }
    });

    // Esitäytetään asetuksissa kentät tallennetuilla arvoilla
    if (document.getElementById("meal-mon")) {
        document.getElementById("meal-mon").value = savedMeals.mon || "";
        document.getElementById("meal-tue").value = savedMeals.tue || "";
        document.getElementById("meal-wed").value = savedMeals.wed || "";
        document.getElementById("meal-thu").value = savedMeals.thu || "";
        document.getElementById("meal-fri").value = savedMeals.fri || "";
    }
}

// Käynnistyksessä päivitä
window.addEventListener("DOMContentLoaded", () => {
    updateMeals();
});

// 🍽 Ruokalista toggle
const mealsToggle = document.getElementById("mealsToggle");
const mealsGroup = document.getElementById("mealsGroup");
const mealsArrow = document.getElementById("mealsArrow");

mealsToggle.addEventListener("click", () => {
    if (mealsGroup.style.display === "none") {
        mealsGroup.style.display = "block";
        mealsArrow.classList.remove("fa-chevron-down");
        mealsArrow.classList.add("fa-chevron-up");
    } else {
        mealsGroup.style.display = "none";
        mealsArrow.classList.remove("fa-chevron-up");
        mealsArrow.classList.add("fa-chevron-down");
    }
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