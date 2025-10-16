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

let subjects = JSON.parse(localStorage.getItem("customSubjects")) || {
  1: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
  2: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
  3: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
  4: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
  5: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
  6: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
  7: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
};


// Tuntien aikataulut
const times = [
    "08:10 - 09:25",
    "09:40 - 10:55",
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

function generateTimetable() {
    const timetable = document.getElementById("timetable");
    const days = ["", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai"];
    timetable.innerHTML = "";

    for (let d = 1; d <= 5; d++) {
        const dayCard = document.createElement("div");
        dayCard.className = "day-card";
        dayCard.dataset.day = d; // TÄRKEÄ: jotta highlightCurrent löytää oikean päivän
        dayCard.innerHTML = `<h2><i class="fas fa-calendar-day"></i> ${days[d]}</h2>
            <div class="lessons-container"></div>`;

        const container = dayCard.querySelector(".lessons-container");

        schedule[d].forEach(item => {
            const subj = subjects[item.row];
            const time = times[item.hour - 1]; // esim. "08:10 - 09:25"
            const [startHour, startMin] = time.split(" - ")[0].split(":").map(Number);

            container.innerHTML += `
                <div class="lesson ${subj.color}" data-time="${startHour}:${startMin}" data-duration="75">
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

        // Ruokalista
        const meals = JSON.parse(localStorage.getItem("meals")) || {};
        const mealKeys = ["mon", "tue", "wed", "thu", "fri"];
        const mealText = meals[mealKeys[d - 1]] || "Ei ruokalistaa";
        dayCard.innerHTML += `
            <div class="meal">
                <i class="fas fa-utensils"></i>
                <span>${mealText}</span>
            </div>`;

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
function highlightCurrent() 
{ const now = new Date(); 
    let day = now.getDay();
    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();

     // Poistetaan aiemmat korostukset
    document.querySelectorAll('.day-card').forEach(card => {
        card.classList.remove('highlight-day');
        card.querySelectorAll('.lesson').forEach(lesson => {
            lesson.classList.remove('highlight-lesson');
            lesson.querySelectorAll('.time-remaining').forEach(el => el.remove());
        });
        const meal = card.querySelector('.meal');
        if (meal) meal.classList.remove('highlight-meal');
    });

    if (day === 0 || day === 6) return; // viikonloppu

    const todayCard = document.querySelector(`.day-card[data-day="${day}"]`);
    if (!todayCard) return;

    todayCard.classList.add('highlight-day');
    const meal = todayCard.querySelector('.meal');
    if (meal) meal.classList.add('highlight-meal');

    todayCard.querySelectorAll('.lesson').forEach(lesson => {
        const [lh, lm] = lesson.dataset.time.split(':').map(Number);
        const duration = parseInt(lesson.dataset.duration) || 75;
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
            remainingText.textContent = `Jäljellä ${remMin} min ${remSec.toString().padStart(2,'0')} s`;
            lesson.appendChild(remainingText);

            remainingText.addEventListener('click', () => {
    // Pomppiva, heiluva ja väriä vaihtava surprise-laatikko
    const egg = document.createElement('div');
    egg.textContent = '🎉 Yllätys! 🎉';
    egg.style.position = 'absolute';
    egg.style.top = '50%';
    egg.style.left = '50%';
    egg.style.transform = 'translate(-50%, -50%)';
    egg.style.padding = '12px 20px';
    egg.style.borderRadius = '12px';
    egg.style.boxShadow = '0 0 15px #000';
    egg.style.zIndex = 9999;
    egg.style.fontSize = '24px';
    egg.style.fontWeight = 'bold';
    egg.style.textAlign = 'center';
    document.body.appendChild(egg);

    let angle = 0;
    let scale = 1;
    let direction = 1;

    const eggAnim = setInterval(() => {
        angle += (Math.random() * 20 - 10);
        scale += 0.05 * direction;
        if (scale > 1.5 || scale < 0.8) direction *= -1;
        egg.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`;

        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        egg.style.backgroundColor = `rgb(${r},${g},${b})`;
        egg.style.color = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
    }, 50);

    // Konfettisade
    const confettiCount = 150;
    const confettis = [];
    for (let i = 0; i < confettiCount; i++) {
        const c = document.createElement('div');
        c.style.position = 'absolute';
        c.style.width = '8px';
        c.style.height = '8px';
        c.style.backgroundColor = `hsl(${Math.random()*360}, 100%, 50%)`;
        c.style.left = Math.random() * window.innerWidth + 'px';
        c.style.top = Math.random() * window.innerHeight - window.innerHeight + 'px';
        c.style.opacity = Math.random();
        c.style.borderRadius = '50%';
        c.style.zIndex = 9998;
        document.body.appendChild(c);
        confettis.push({el: c, speed: Math.random()*3 + 2});
    }

    const confettiAnim = setInterval(() => {
        confettis.forEach(c => {
            let top = parseFloat(c.el.style.top);
            top += c.speed;
            if (top > window.innerHeight) top = -10;
            c.el.style.top = top + 'px';
        });
    }, 30);

    // Ääni
    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
    audio.volume = 0.3;
    audio.play();

    // Poistetaan efektit 3 sekunnin kuluttua
    setTimeout(() => {
        clearInterval(eggAnim);
        clearInterval(confettiAnim);
        egg.remove();
        confettis.forEach(c => c.el.remove());
    }, 3000);
});

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


// 🎨 Alusta aineiden värit sivun latautuessa
window.addEventListener('DOMContentLoaded', () => {
    // Lataa tallennetut värit tai käytä oletusarvoja
    Object.entries(subjectColorDefinitions).forEach(([key, config]) => {
        const savedColor = localStorage.getItem(`color-${key}`);
        if (savedColor) {
            document.documentElement.style.setProperty(`--color-${key}`, savedColor);
        } else {
            document.documentElement.style.setProperty(`--color-${key}`, config.default);
        }
    });
    
    // Alusta värimuokkauskentät heti
    initializeSubjectColors();
});

// 🎨 Aineiden värit - automatisoidut asetukset
const subjectColorDefinitions = {
    "default": { name: "Oletus", default: "#1f3d41" },
    "freetime": { name: "Hyppytunti", default: "#eeff00" },
    "math": { name: "Matematiikka", default: "#007bff" },
    "finnish": { name: "Äidinkieli", default: "#ff4081" },
    "english": { name: "Englanti", default: "#00c853" },
    "swedish": { name: "Ruotsi", default: "#ffc107" },
    "physics": { name: "Fysiikka", default: "#9c27b0" },
    "geography": { name: "Maantieto", default: "#038d5f" },
    "biology": { name: "Biologia", default: "#b69430" },
    "health": { name: "Terveystieto", default: "#ffc107" },
    "psychology": { name: "Psykologia", default: "#b69430" },
    "economics": { name: "Yhteiskuntaoppi", default: "#2196f3" },
    "history": { name: "Historia", default: "#b69430" },
    "religion": { name: "Uskonto", default: "#f5ff70" },
    "philosophy": { name: "Filosofia", default: "#9c27b0" },
    "sports": { name: "Liikunta", default: "#ff5722" },
    "arts": { name: "Kuvataide", default: "#ffc107" },
    "event": { name: "Tapahtuma", default: "#26c6da" }
};

function initializeSubjectColors() {
    const container = document.getElementById("subjectColorsContainer");
    if (!container) {
        console.error("subjectColorsContainer-elementtiä ei löydy");
        return;
    }
    
    // Luo siisti grid-asetelu
    container.innerHTML = `
        <div class="subject-color-grid" id="subjectColorGrid">
            <!-- Värit generoidaan JavaScriptillä -->
        </div>
    `;
    const grid = document.getElementById("subjectColorGrid");

    // Luo väriasettelu jokaiselle aineelle
    Object.entries(subjectColorDefinitions).forEach(([key, config]) => {
        const colorItem = document.createElement("div");
        colorItem.className = "subject-color-item";
        colorItem.title = `Muokkaa ${config.name} väriä`;
        
        // Lataa tallennettu väri tai käytä oletusarvoa
        const savedColor = localStorage.getItem(`color-${key}`);
        const currentColor = savedColor || config.default;
        
        colorItem.innerHTML = `
            <div class="color-preview" style="background-color: ${currentColor}"></div>
            <div class="color-info">
                <label for="color-${key}">${config.name}</label>
                <input type="color" id="color-${key}" value="${currentColor}" 
                       class="color-input">
            </div>
        `;
        grid.appendChild(colorItem);

        // Aseta väri CSS-muuttujaan
        document.documentElement.style.setProperty(`--color-${key}`, currentColor);

        // Kuuntele värin muutoksia
        const colorInput = colorItem.querySelector('.color-input');
        const colorPreview = colorItem.querySelector('.color-preview');
        
        colorInput.addEventListener("input", (e) => {
            const newColor = e.target.value;
            document.documentElement.style.setProperty(`--color-${key}`, newColor);
            localStorage.setItem(`color-${key}`, newColor);
            colorPreview.style.backgroundColor = newColor;
            
            // Päivitä lukujärjestys reaaliaikaisesti
            generateTimetable();
        });
    });

    // Palauta oletusvärit -nappi
    const resetButton = document.getElementById("resetColors");
    if (resetButton) {
        resetButton.addEventListener("click", resetSubjectColors);
    }
}

function resetSubjectColors() {
    if (confirm("Haluatko varmasti palauttaa kaikki värit oletusarvoihin?")) {
        Object.entries(subjectColorDefinitions).forEach(([key, config]) => {
            // Poista tallennetut värit
            localStorage.removeItem(`color-${key}`);
            
            // Palauta oletusväri
            document.documentElement.style.setProperty(`--color-${key}`, config.default);
            
            // Päivitä input-kenttä
            const colorInput = document.getElementById(`color-${key}`);
            if (colorInput) {
                colorInput.value = config.default;
            }
        });
        
        // Päivitä lukujärjestys
        generateTimetable();
        showToast("🎨 Värit palautettu oletusarvoihin!");
    }
}

// 🎨 Aineiden värien lista auki/kiinni
const subjectColorsToggle = document.getElementById("subjectColorsToggle");
const subjectColorsGroup = document.getElementById("subjectColorsGroup");
const subjectColorsArrow = document.getElementById("subjectColorsArrow");

if (subjectColorsToggle && subjectColorsGroup) {
    subjectColorsToggle.addEventListener("click", () => {
        if (subjectColorsGroup.style.display === "none" || subjectColorsGroup.style.display === "") {
            subjectColorsGroup.style.display = "block";
            subjectColorsArrow.classList.remove("fa-chevron-down");
            subjectColorsArrow.classList.add("fa-chevron-up");
        } else {
            subjectColorsGroup.style.display = "none";
            subjectColorsArrow.classList.remove("fa-chevron-up");
            subjectColorsArrow.classList.add("fa-chevron-down");
        }
    });
}

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

// 📚 Lukujärjestyksen muokkaus
const editScheduleToggle = document.getElementById("editScheduleToggle");
const editScheduleGroup = document.getElementById("editScheduleGroup");
const editScheduleArrow = document.getElementById("editScheduleArrow");
const editScheduleRows = document.getElementById("editScheduleRows");
const saveSchedule = document.getElementById("saveSchedule");

editScheduleToggle.addEventListener("click", () => {
  if (editScheduleGroup.style.display === "none") {
    editScheduleGroup.style.display = "block";
    editScheduleArrow.classList.replace("fa-chevron-down", "fa-chevron-up");
    renderScheduleEditor();
  } else {
    editScheduleGroup.style.display = "none";
    editScheduleArrow.classList.replace("fa-chevron-up", "fa-chevron-down");
  }
});

function renderScheduleEditor() {
  editScheduleRows.innerHTML = "";
  for (let i = 1; i <= 7; i++) {
    const s = subjects[i];
    const row = document.createElement("div");
    row.classList.add("schedule-row");
    row.innerHTML = `
      <label><b>Rivi ${i}</b></label>
        <select id="subj-color-${i}">
        <option value="default">(Ei asetettu)</option>
        <option value="freetime">Hyppytunti</option>
        <option value="math">Matematiikka</option>
        <option value="finnish">Äidinkieli</option>
        <option value="english">Englanti</option>
        <option value="swedish">Ruotsi</option>
        <option value="physics">Fysiikka</option>
        <option value="geography">Maantieto</option>
        <option value="biology">Biologia</option>
        <option value="health">Terveystieto</option>
        <option value="psychology">Psykologia</option>
        <option value="economics">Yhteiskuntaoppi</option>
        <option value="history">Historia</option>
        <option value="religion">Uskonto</option>
        <option value="philosophy">Filosofia</option>
        <option value="sports">Liikunta</option>
        <option value="arts">Kuvataide</option>
        <option value="event">Tapahtuma</option>
      </select>
      <input type="text" id="subj-code-${i}" placeholder="Koodi" value="${s.code}">
      <input type="text" id="subj-teacher-${i}" placeholder="Opettaja" value="${s.teacher}">
      <input type="text" id="subj-room-${i}" placeholder="Luokka" value="${s.room}">
    `;
    editScheduleRows.appendChild(row);
    document.getElementById(`subj-color-${i}`).value = s.color;
  }
}

saveSchedule.addEventListener("click", () => {
  const updatedSubjects = {};

  for (let i = 1; i <= 7; i++) {
    const selectEl = document.getElementById(`subj-color-${i}`);
    const selectedName = selectEl.options[selectEl.selectedIndex].text;
    const colorVal = selectEl.value;

    updatedSubjects[i] = {
      name: colorVal === "default" ? "(Ei asetettu)" : selectedName,
      code: document.getElementById(`subj-code-${i}`).value || "",
      teacher: document.getElementById(`subj-teacher-${i}`).value || "",
      room: document.getElementById(`subj-room-${i}`).value || "",
      color: colorVal === "default" ? "default" : colorVal
    };
  }

  localStorage.setItem("customSubjects", JSON.stringify(updatedSubjects));
  subjects = updatedSubjects;
  generateTimetable();
  showToast("📅 Lukujärjestys tallennettu!");
});
