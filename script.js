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

// Rivien määrittely
const subjects = {
    1: { name: "Fysiikka", code: "FY05.2", teacher: "AM", room: "B046", color: "physics" },
    2: { name: "Englanti", code: "ENA06.1", teacher: "JL", room: "A307", color: "english" },
    3: { name: "Matematiikka", code: "MAA06.3", teacher: "MHEL", room: "A003", color: "math" },
    4: { name: "Maantieto", code: "GE02.1", teacher: "JLT", room: "B221", color: "geography" },
    5: { name: "Ruotsi", code: "RUB4.7", teacher: "SK", room: "B221", color: "swedish" },
    6: { name: "Uskonto", code: "UE02.4", teacher: "JLE", room: "A211", color: "religion" },
    7: { name: "Äidinkieli", code: "ÄI05.6", teacher: "LH", room: "A311", color: "finnish" },
};

// Tuntien aikataulut
const times = [
    "08:10 - 09:25",
    "09:40 - 10:55",
    "11:10 - 12:00",
    "12:05 - 13:20",
    "13:35 - 14:50"
];

// Miten rivit sijoittuvat päiviin
const schedule = {
    1: [ // Maanantai
        { row: 6, hour: 1 },
        { row: 3, hour: 2 },
        { row: 7, hour: 3 },
        { row: 1, hour: 4 },
    ],
    2: [ // Tiistai
        { row: 4, hour: 1 },
        { row: 6, hour: 2 },
        { row: 5, hour: 3 },
        { row: 2, hour: 4 },
    ],
    3: [ // Keskiviikko
        { row: 5, hour: 1 },
        { row: 1, hour: 2 },
        { row: 2, hour: 3 },
        { row: 3, hour: 4 },
    ],
    4: [ // Torstai
        { row: 4, hour: 1 },
        { row: 6, hour: 2 },
        { row: 1, hour: 3 },
        { row: 7, hour: 4 },
    ],
    5: [ // Perjantai
        { row: 5, hour: 1 },
        { row: 3, hour: 2 },
        { row: 4, hour: 3 },
        { row: 2, hour: 4 },
    ],
};

// Luo lukujärjestys automaattisesti
function generateTimetable() {
    const timetable = document.getElementById("timetable");
    const days = ["", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai"];
    timetable.innerHTML = "";

    for (let d = 1; d <= 5; d++) {
        const dayCard = document.createElement("div");
        dayCard.className = "day-card";
        dayCard.innerHTML = `<h2><i class="fas fa-calendar-day"></i> ${days[d]}</h2>
            <div class="lessons-container"></div>`;

        const container = dayCard.querySelector(".lessons-container");

        schedule[d].forEach(item => {
            const subj = subjects[item.row];
            const time = times[item.hour - 1];
            container.innerHTML += `
                <div class="lesson ${subj.color}">
                    <span class="lesson-time">${time}</span>
                    <div class="lesson-main">
                        <span class="lesson-subject">${subj.name}</span>
                        <span class="lesson-code">${subj.code}</span>
                    </div>
                    <div class="lesson-info">
                        <span class="lesson-room"><i class="fas fa-door-open"></i> ${subj.room}</span>
                        <span class="lesson-teacher"><i class="fas fa-chalkboard-teacher"></i> ${subj.teacher}</span>
                    </div>
                </div>`;
        });

const meals = JSON.parse(localStorage.getItem("meals")) || {};
const mealKeys = ["mon", "tue", "wed", "thu", "fri"];
const mealText = meals[mealKeys[d - 1]] || "Ei ruokalistaa";

dayCard.innerHTML += `
    <div class="meal">
        <i class="fas fa-utensils"></i>
        <span>${mealText}</span>
    </div>
`;


        timetable.appendChild(dayCard);
    }
}

// Säätiedot Raumalle
async function updateWeather() {
    const apiKey = 'd6149ddcc486b4c7e8b6cf842aa88d49'; // korvaa oikealla
    const city = 'Rauma,FI';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=fi`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.cod === 200) {
            const weatherWidget = document.querySelector('.weather-widget');
            const weatherIcon = weatherWidget.querySelector('.weather-icon');
            const weatherTemp = weatherWidget.querySelector('.weather-temp');
            const weatherDetails = weatherWidget.querySelector('.weather-details');

            const temp = Math.round(data.main.temp);
            const desc = data.weather[0].description;
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
            weatherDetails.textContent = `${desc.charAt(0).toUpperCase() + desc.slice(1)}`;
        } else {
            throw new Error('Säätietoja ei saatavilla');
        }
    } catch (err) {
        console.error('Virhe säätietojen haussa:', err);
        document.querySelector('.weather-temp').textContent = 'Ei yhteyttä';
    }
}

// Korostaa nykyisen tunnin ja näyttää jäljellä olevan ajan
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
            lesson.querySelectorAll('.time-remaining').forEach(el => el.remove());
        });
        card.querySelector('.meal').classList.remove('highlight-meal');
    });

    // viikonloppu -> ei mitään
    if (day === 0 || day === 6) return;

    const todayCard = document.querySelector(`.day-card[data-day="${day}"]`);
    if (!todayCard) return;

    todayCard.classList.add('highlight-day');
    todayCard.querySelector('.meal').classList.add('highlight-meal');

    todayCard.querySelectorAll('.lesson').forEach(lesson => {
        const [lh, lm] = lesson.dataset.time.split(':').map(Number);
        const duration = parseInt(lesson.dataset.duration) || 75; // oletus 75 min
        const lessonStart = lh * 60 + lm;
        const lessonEnd = lessonStart + duration;
        const nowSeconds = h * 3600 + m * 60 + s;

        if (nowSeconds >= lessonStart * 60 && nowSeconds < lessonEnd * 60) {
            lesson.classList.add('highlight-lesson');

            let remainingSec = lessonEnd * 60 - nowSeconds;
            let remMin = Math.floor(remainingSec / 60);
            let remSec = remainingSec % 60;

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

// Alustus
updateClock();
updateWeather();
setInterval(updateClock, 1000);
setInterval(updateWeather, 3600000);

// Interaktiivisuus
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
    "history", "physics", "sports", "economics", "event",
    "geography", "religion",
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
    showToast("🍽️ Ruokalista tallennettu!");
    updateMeals();
});

function updateMeals() {
    const savedMeals = JSON.parse(localStorage.getItem("meals"));
    if (!savedMeals) return;

    // Päivien avaimet ja kortit
    const dayKeys = ["mon", "tue", "wed", "thu", "fri"];
    const dayCards = document.querySelectorAll(".day-card");

    dayCards.forEach((card, index) => {
        // Hae vastaava ruoka tallennuksesta
        const mealText = savedMeals[dayKeys[index]] || "Ei ruokalistaa";

        // Hae kortin ruokaelementti
        const mealEl = card.querySelector(".meal span");

        // Jos löytyy, vaihda teksti
        if (mealEl) mealEl.textContent = mealText;
    });

    // Päivitä myös asetuskentät, jos ne on olemassa
    if (document.getElementById("meal-mon")) {
        document.getElementById("meal-mon").value = savedMeals.mon || "";
        document.getElementById("meal-tue").value = savedMeals.tue || "";
        document.getElementById("meal-wed").value = savedMeals.wed || "";
        document.getElementById("meal-thu").value = savedMeals.thu || "";
        document.getElementById("meal-fri").value = savedMeals.fri || "";
    }
}



window.addEventListener("DOMContentLoaded", () => {
    generateTimetable();
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

// Näyttää hienon toast-ilmoituksen
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    // Piilota 2.5 sekunnin kuluttua
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}
