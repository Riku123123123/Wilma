// Alustus kun sivu latautuu
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    
    // Intro näkyy vain ensimmäisellä kerralla
    if (sessionStorage.getItem('introShown')) {
        document.querySelector('.intro').style.display = 'none';
        document.querySelector('.container').style.opacity = '1';
    } else {
        sessionStorage.setItem('introShown', 'true');
    }

    // Lataa VAIKELLISET asetukset ENSIN (ei DOM-riippuvaisia)
    loadSavedSettings();
    
    // Alusta kaikki komponentit
    initializeQuickSchedules();
    initializeSubjectColors();
    initializeEventDates();
    initializeSettingsTabs();
    
    // Päivitä näkymä
    generateTimetable();
    updateMeals();
    updateStatistics();
    initializeStudyTools();
    initializeExamWeek();
    
    // Alusta bottom-navigaatio
    initializeBottomNav();

    setTimeout(() => {
    loadFontSettings();
    }, 300);

    // Aseta tapahtumakuuntelijat VIIMEISEKSI
    setupEventListeners();
    
    
    // Käynnistä ajastimet
    updateClock();
    updateWeather();
    setInterval(updateClock, 1000);
    setInterval(updateWeather, 3600000);
    setInterval(updateNextLessonInfo, 60000);
    
}

// Lisää tämä uusi funktio bottom-navigaation alustukseen
function initializeBottomNav() {
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Poista aktiivinen luokka kaikilta
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Lisää aktiivinen luokka klikatulle
            this.classList.add('active');
            
            const text = this.querySelector('span').textContent;
            
            // Toteuta navigointi
            switch(text) {
                case 'Lukujärjestys':
                    // Pysy nykyisellä näkymällä
                    break;
                case 'Asetukset':
                    document.getElementById('settingsModal').style.display = 'flex';
                    break;
                case 'Tehtävät':
                    showHomeworkManager();
                    break;
            }
        });
    });
}
// Alusta asetusten välilehdet
function initializeSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    const contents = document.querySelectorAll('.settings-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Poista aktiiviset luokat
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Aseta uusi aktiivinen välilehti
            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // Lataa välilehden sisältö tarvittaessa
            loadTabContent(tabId);
        });
    });
    
    // Lataa ensimmäinen välilehti
    loadTabContent('appearance');
}

// Lataa välilehden sisältö
function loadTabContent(tabId) {
    switch(tabId) {
        case 'appearance':
            loadAppearanceSettings();
            break;
        case 'schedule':
            loadScheduleSettings();
            break;
        case 'colors':
            loadColorSettings();
            break;
        case 'meals':
            loadMealSettings();
            break;
        case 'events':
            loadEventSettings();
            break;
    }
}

function setupSimpleModalClose() {
    // Sulje modaali klikkaamalla taustaa
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Sulje modaali Esc-näppäimellä
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
            });
        }
    });
}

// KORVAA loadAppearanceSettings-funktio tällä:
function loadAppearanceSettings() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedFont = localStorage.getItem('font') || 'Poppins, sans-serif';
    const savedFontSize = localStorage.getItem('fontSize') || '16';
    
    document.getElementById('themeSelect').value = savedTheme;
    document.getElementById('fontSelect').value = savedFont;
    document.getElementById('fontSize').value = savedFontSize;
    
    // Päivitä fonttikoon näyttö
    updateFontSizeDisplay(savedFontSize);
    
    // Aseta fonttikoon muutoskuuntelija
    document.getElementById('fontSize').addEventListener('input', function() {
        updateFontSizeDisplay(this.value);
    });
}

// LISÄÄ tämä funktio:
function updateFontSizeDisplay(size) {
    let fontSizeValue = document.getElementById('fontSizeValue');
    if (!fontSizeValue) {
        fontSizeValue = document.createElement('span');
        fontSizeValue.id = 'fontSizeValue';
        fontSizeValue.style.marginLeft = '10px';
        fontSizeValue.style.fontWeight = '600';
        fontSizeValue.style.color = 'var(--accent-color)';
        document.getElementById('fontSize').parentNode.appendChild(fontSizeValue);
    }
    fontSizeValue.textContent = `${size}px`;
}

// KORJATTU FONTIN VAIHTO - LISÄÄ TÄMÄ FUNKTIO
function initializeFontListeners() {
    
    // Odota että DOM on valmis
    setTimeout(() => {
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) {
            
            // Poista vanhat kuuntelijat ensin
            const newFontSelect = fontSelect.cloneNode(true);
            fontSelect.parentNode.replaceChild(newFontSelect, fontSelect);
            
            // Lisää uusi kuuntelija uudelle elementille
            document.getElementById('fontSelect').addEventListener('change', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const selectedFont = this.value;
                
                // Tallenna välittömästi
                localStorage.setItem('font', selectedFont);
                
                // Päivitä fontti välittömästi
                applyFontImmediately(selectedFont);
            });
            
            // Aseta tallennettu fontti heti
            const savedFont = localStorage.getItem('font');
            if (savedFont) {
                document.getElementById('fontSelect').value = savedFont;
                applyFontImmediately(savedFont);
            }
            
        } else {
            console.error('Fonttivalitsinta ei löytynyt!');
        }
    }, 100);
}

function updateAllFonts(fontFamily) {
    try {
        
        // 1. Päivitä body ensin
        document.body.style.fontFamily = fontFamily;
        
        // 2. Päivitä modaalit ja erikoiselementit
        const elementsToUpdate = [
            '.modal-content',
            '.modal',
            '#settingsModal',
            '#slotContextMenu',
            '.color-picker-modal',
            'input',
            'select',
            'textarea',
            'button',
            '.tools-section',
            '.tool-card',
            '.grade-item',
            '.single-grade-item'
        ];
        
        elementsToUpdate.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                try {
                    element.style.fontFamily = fontFamily;
                } catch (e) {
                    console.warn(`Ei voitu päivittää fonttia elementille: ${selector}`, e);
                }
            });
        });
        
        // 3. Pakota uudelleenpiirto
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
        
    } catch (error) {
        console.error('Kriittinen virhe fonttien päivittämisessä:', error);
    }
}

function loadFontSettings() {
    
    const savedFont = localStorage.getItem('font');
    const savedFontSize = localStorage.getItem('fontSize');
    
    // Odota että DOM on täysin valmis
    setTimeout(() => {
        try {
            if (savedFont) {
                applyFontImmediately(savedFont);
                
                // Päivitä myös valitsin
                const fontSelect = document.getElementById('fontSelect');
                if (fontSelect) {
                    fontSelect.value = savedFont;
                }
            }
            
            if (savedFontSize) {
                document.body.style.fontSize = savedFontSize + 'px';
                
                // Päivitä myös input-kentän arvo
                const fontSizeInput = document.getElementById('fontSize');
                if (fontSizeInput) {
                    fontSizeInput.value = savedFontSize;
                    updateFontSizeDisplay(savedFontSize);
                }
            }
            
            
        } catch (error) {
            console.error('Virhe fonttiasetusten lataamisessa:', error);
        }
    }, 200);
}

// Lataa lukujärjestysasetukset
function loadScheduleSettings() {
    const editSelect = document.getElementById('editPeriodSelect');
    if (editSelect) {
        // Täytä periodivalitsin
        editSelect.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.text = periods[i] ? periods[i].name : `Periodi ${i}`;
            editSelect.appendChild(opt);
        }
        editSelect.value = String(currentScheduleSlot || 1);
        
        // Lataa periodin asetukset
        editSelect.addEventListener('change', function() {
            const pid = parseInt(this.value);
            loadPeriodSettings(pid);
            document.getElementById('editPeriodDates').textContent = 
                periods[pid] ? `${periods[pid].start} - ${periods[pid].end}` : '';
            renderScheduleEditor();
        });
        
        // Alusta ensimmäinen periodi
        const initPid = parseInt(editSelect.value);
        document.getElementById('editPeriodDates').textContent = 
            periods[initPid] ? `${periods[initPid].start} - ${periods[initPid].end}` : '';
        renderScheduleEditor();
    }
    
    // Varmistetaan että skrollaus toimii
    setTimeout(() => {
        const scheduleTab = document.getElementById('tab-schedule');
        if (scheduleTab) {
            scheduleTab.scrollTop = 0;
        }
    }, 100);
}

// Lataa väriasetukset
function loadColorSettings() {
    initializeSubjectColors();
}

// Lataa ruokalista-asetukset
function loadMealSettings() {
    updateMeals(); // Päivitä ruokalistan kentät
}

// Lataa tapahtuma-asetukset
function loadEventSettings() {
    initializeEventDates();
}

// Lataa tallennetut asetukset - TÄYSIN UUSI TURVALLINEN VERSIO
function loadSavedSettings() {
    
    const savedTheme = localStorage.getItem('theme');
    const savedFont = localStorage.getItem('font');
    const savedFontSize = localStorage.getItem('fontSize');

    try {
        // Aseta teema (ei tarvitse DOM-elementtejä)
        if (savedTheme) {
            applyTheme(savedTheme);
        }

        // Aseta fontti
        if (savedFont) {
            document.body.style.fontFamily = savedFont;
            // updateAllFonts kutsutaan myöhemmin
        }

        // Aseta fonttikoko
        if (savedFontSize) {
            document.body.style.fontSize = savedFontSize + 'px';
        }

        
    } catch (error) {
        console.error('Virhe perusasetusten lataamisessa:', error);
    }
}

// Sovella teema
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Aseta tapahtumakuuntelijat - TURVALLINEN VERSIO
function setupEventListeners() {
    
    // Asetukset-nappi
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('settingsModal').style.display = 'flex';
        });
    }

    // Sulje asetukset
    const closeSettings = document.getElementById('closeSettings');
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            document.getElementById('settingsModal').style.display = 'none';
        });
    }
    
    // Alusta pelikortit
    initializeGameCards();
    
    // Alusta opiskelutyökalujen kortit
    initializeToolCards();

    setupSimpleModalClose();

    initializeToolsSection();

    initializeFontListeners();

    // Teeman vaihto - lisätään myöhemmin kun elementti on varmasti olemassa
    setTimeout(() => {
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', function() {
                applyTheme(this.value);
                localStorage.setItem('theme', this.value);
            });
        }
    }, 100);

    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        fontSize.addEventListener('input', function() {
            const newSize = this.value + 'px';
            document.body.style.fontSize = newSize;
            localStorage.setItem('fontSize', this.value);
            updateFontSizeDisplay(this.value);
        });
    }

    // Ruokalistan tallennus
    const saveMealsBtn = document.getElementById('saveMeals');
    if (saveMealsBtn) {
        saveMealsBtn.addEventListener('click', saveMeals);
    }

    const saveScheduleBtn = document.getElementById('saveSchedule');
    if (saveScheduleBtn) {
        saveScheduleBtn.addEventListener('click', saveSchedule);
    }

    // Aineiden värit
    const resetColors = document.getElementById('resetColors');
    if (resetColors) {
        resetColors.addEventListener('click', resetSubjectColors);
    }

    // Jakamis- ja vientitoiminnot
    const exportScheduleBtn = document.getElementById('exportSchedule');
    if (exportScheduleBtn) {
        exportScheduleBtn.addEventListener('click', exportSchedule);
    }

    const importScheduleBtn = document.getElementById('importSchedule');
    if (importScheduleBtn) {
        importScheduleBtn.addEventListener('click', importSchedule);
    }

    const applyImportedScheduleBtn = document.getElementById('applyImportedSchedule');
    if (applyImportedScheduleBtn) {
        applyImportedScheduleBtn.addEventListener('click', applyImportedSchedule);
    }

    // Periodivalitsin (sivun yläreunan)
    const periodSelect = document.getElementById('periodSelect');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            const selectedPeriod = periods[this.value];
            if (selectedPeriod) {
                document.getElementById('periodDates').textContent = `${selectedPeriod.start} - ${selectedPeriod.end}`;
                loadPeriodSettings(this.value);
                generateTimetable();
            }
        });
    }

    // Yksittäisten tapahtumien lisäys
    const addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', addSingleEvent);
    }

    // Hiiren klikkaus modalin ulkopuolelle
    window.addEventListener('click', (e) => {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Pikanäppäimet (päivitetty tukemaan periodi 1..5)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            loadPeriodSchedule(parseInt(e.key));
        }
    });

    // Sulje asetukset Esc-näppäimellä
    document.addEventListener('keydown', function(e) {
        const settingsModal = document.getElementById('settingsModal');
        if (e.key === 'Escape' && settingsModal && settingsModal.style.display === 'flex') {
            settingsModal.style.display = 'none';
        }
    });

}

// ========== LUKUJÄRJESTYS DATA ==========
let subjects = JSON.parse(localStorage.getItem("customSubjects")) || {
    1: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
    2: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
    3: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
    4: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
    5: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
    6: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
    7: { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" },
};

const times = [
    "08:10 - 09:25",
    "09:40 - 10:55",
    "12:05 - 13:20",
    "13:35 - 14:50"
];

const schedule = {
    1: [ 
        { row: 6, hour: 1 }, 
        { row: 3, hour: 2 }, 
        { row: 7, hour: 3 }, 
        { row: 1, hour: 4 } 
    ],
    2: [ 
        { row: 4, hour: 1 }, 
        { row: 6, hour: 2 }, 
        { row: 5, hour: 3 }, 
        { row: 2, hour: 4 } 
    ],
    3: [ 
        { row: 5, hour: 1 }, 
        { row: 1, hour: 2 }, 
        { row: 2, hour: 3 }, 
        { row: 3, hour: 4 } 
    ],
    4: [ 
        { row: 4, hour: 1 }, 
        { row: 6, hour: 2 }, 
        { row: 1, hour: 3 }, 
        { row: 7, hour: 4 } 
    ],
    5: [ 
        { row: 5, hour: 1 }, 
        { row: 3, hour: 2 }, 
        { row: 4, hour: 3 }, 
        { row: 2, hour: 4 } 
    ],
};

// Vaihtoehtoinen asettelu periodille 4..5
const scheduleLate = {
    1: [ 
        { row: 6, hour: 1 }, 
        { row: 2, hour: 2 }, 
        { row: 1, hour: 3 } 
    ],
    2: [ 
        { row: 4, hour: 1 }, 
        { row: 6, hour: 2 }, 
        { row: 5, hour: 3 }, 
        { row: 3, hour: 4 } 
    ],
    3: [ 
        { row: 5, hour: 1 }, 
        { row: 3, hour: 2 }, 
        { row: 2, hour: 3 }, 
        { row: 1, hour: 4 } 
    ],
    4: [ 
        { row: 4, hour: 1 }, 
        { row: 6, hour: 2 }, 
        { row: 1, hour: 3 }, 
        { row: 2, hour: 4 } 
    ],
    5: [ 
        { row: 5, hour: 1 }, 
        { row: 4, hour: 2 }, 
        { row: 3, hour: 3 } 
    ]
};

// ========== PERIODIEN HALLINTA ==========
const periods = {
    1: { name: "1. periodi", start: "14.08.2024", end: "27.09.2024" },
    2: { name: "2. periodi", start: "30.09.2024", end: "06.12.2024" },
    3: { name: "3. periodi", start: "09.12.2024", end: "14.02.2025" },
    4: { name: "4. periodi", start: "17.02.2025", end: "25.04.2025" },
    5: { name: "5. periodi", start: "28.04.2025", end: "06.06.2025" }
};

let currentScheduleSlot = 1;

function loadPeriodSettings(periodId) {
    const periodSettings = JSON.parse(localStorage.getItem(`periodSettings_${periodId}`)) || {};
    if (periodSettings.subjects) {
        subjects = periodSettings.subjects;
        localStorage.setItem("customSubjects", JSON.stringify(subjects));
    }
    updateStatistics();
}

// ========== NYKYISEN JÄRJESTYKSEN TALLENNUS ==========
function saveCurrentSchedule() {
    const targetSlot = prompt("Mihin periodiin haluat tallentaa nykyisen lukujärjestyksen?\n\nSyötä numero 1-5:", String(currentScheduleSlot));
    
    if (targetSlot && targetSlot >= 1 && targetSlot <= 5) {
        savePeriodSchedule(parseInt(targetSlot));
        showToast(`💾 Nykyinen lukujärjestys tallennettu periodiin ${targetSlot}`);
    } else if (targetSlot !== null) {
        showToast("❌ Syötä kelvollinen periodinumero (1-5)");
    }
}

// ========== LUKUJÄRJESTYKSEN GENEROINTI ==========
let currentWeekOffset = 0; // 0 = kuluva viikko, 1 = ensi viikko, -1 = viime viikko

function changeWeek(offsetDelta) {
    if (offsetDelta === 0) {
        currentWeekOffset = 0;
    } else {
        currentWeekOffset += offsetDelta;
    }
    generateTimetable();
    updateStatistics();
}

function getWeekDates(offset = 0) {
    const now = new Date();
    // Jos on viikonloppu (La=6, Su=0), näytetään oletuksena jo alkava maanantai
    const day = now.getDay();
    const diffToMonday = day === 0 ? 1 : (day === 6 ? 2 : 1 - day);
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + (offset * 7));
    monday.setHours(0, 0, 0, 0);

    const weekDates = [];
    for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        weekDates.push(d);
    }
    return weekDates;
}
function getISOWeekNumber(date) {
    const d = (date && typeof date.getFullYear === 'function') ? date : (date && date[0] ? date[0] : new Date());
    const temp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    return Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
}

function toggleWilmaReservations(checked) {
    localStorage.setItem('showWilmaReservations', checked ? 'true' : 'false');
    generateTimetable();
    updateStatistics();
}

function injectReservationToggleInSettings() {
    const tabSchedule = document.getElementById('tab-schedule');
    if (!tabSchedule || document.getElementById('wilmaReservationsToggleContainer')) return;

    const showRes = localStorage.getItem('showWilmaReservations') === 'true';
    const box = document.createElement('div');
    box.id = 'wilmaReservationsToggleContainer';
    box.style.cssText = 'margin: 12px 0; padding: 12px; border-radius: 10px; background: rgba(67, 97, 238, 0.08); border: 1px solid rgba(67, 97, 238, 0.25);';
    box.innerHTML = `
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 500;">
            <input type="checkbox" id="showWilmaReservationsChk" ${showRes ? 'checked' : ''} onchange="toggleWilmaReservations(this.checked)" style="width: 18px; height: 18px;">
            <span>Näytä Wilman ruokailuvuorot ja tukipajat lukujärjestyksessä</span>
        </label>
    `;
    tabSchedule.insertBefore(box, tabSchedule.firstChild);
}

function getPendingHomeworkCountForSubject(subjectName) {
    if (!Array.isArray(homeworkList) || !subjectName) return 0;
    const cleanTarget = subjectName.toLowerCase().split('(')[0].trim();
    return homeworkList.filter(hw => {
        if (hw.completed) return false;
        const hwSubj = hw.subject.toLowerCase().trim();
        return hwSubj.includes(cleanTarget) || cleanTarget.includes(hwSubj);
    }).length;
}


function generateTimetable() {
    const timetable = document.getElementById("timetable");
    if (!timetable) return;

    injectReservationToggleInSettings();

    const wilmaEvents = JSON.parse(localStorage.getItem('wilmaCalendarEvents'));
    const useWilmaCalendar = Array.isArray(wilmaEvents) && wilmaEvents.length > 0;
    const showReservations = localStorage.getItem('showWilmaReservations') === 'true';

    if (useWilmaCalendar) {
        updatePeriodSelectorUI();
    }

    const weekDates = getWeekDates(currentWeekOffset);
    const weekNum = getISOWeekNumber(weekDates[0]);
    const startStr = `${weekDates[0].getDate()}.${weekDates[0].getMonth() + 1}.`;
    const endStr = `${weekDates[4].getDate()}.${weekDates[4].getMonth() + 1}.${weekDates[4].getFullYear()}`;

    const detectedPeriods = JSON.parse(localStorage.getItem('wilmaDetectedPeriods')) || [];
    const currentMonISO = formatDateISO(weekDates[0]);
    const activePeriodObj = detectedPeriods.find(p => currentMonISO >= p.startISO && currentMonISO <= p.endISO);
    const isExamWeek = activePeriodObj ? activePeriodObj.isExamWeek : false;

    const periodDatesEl = document.getElementById('periodDates');
    if (periodDatesEl && useWilmaCalendar) {
        periodDatesEl.innerHTML = `
            <div style="display: inline-flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <button onclick="changeWeek(-1)" class="btn" style="padding: 4px 10px; font-size: 0.85rem;">◀</button>
                <span style="font-weight: 600;">Viikko ${weekNum} (${startStr} – ${endStr})</span>
                ${isExamWeek ? `<span style="background: #ff5722; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">KOEVIIKKO</span>` : ''}
                <button onclick="changeWeek(1)" class="btn" style="padding: 4px 10px; font-size: 0.85rem;">▶</button>
                ${currentWeekOffset !== 0 ? `<button onclick="changeWeek(0)" class="btn" style="padding: 4px 10px; font-size: 0.8rem; background: var(--accent-color); color: white;">Nykyinen viikko</button>` : ''}
            </div>
        `;
    }

    const days = ["", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai"];
    timetable.innerHTML = "";

    const singleEvents = JSON.parse(localStorage.getItem('singleEvents')) || [];
    const periodSelect = document.getElementById('periodSelect');
    const currentPeriod = periodSelect ? parseInt(periodSelect.value, 10) : 2;
    const fallbackSchedule = currentPeriod >= 4 ? scheduleLate : schedule;

    const standardSlots = [
        { start: "08:10", end: "09:25", startMins: 490, endMins: 565 },
        { start: "09:40", end: "10:55", startMins: 580, endMins: 655 },
        { start: "12:05", end: "13:20", startMins: 725, endMins: 800 },
        { start: "13:35", end: "14:50", startMins: 815, endMins: 890 }
    ];

    for (let d = 1; d <= 5; d++) {
        const currentDateObj = weekDates[d - 1];
        const dateISO = formatDateISO(currentDateObj);
        const dateLabel = `${currentDateObj.getDate()}.${currentDateObj.getMonth() + 1}.`;

        const dayCard = document.createElement("div");
        dayCard.className = "day-card";
        dayCard.dataset.day = d;
        dayCard.innerHTML = `<h2><i class="fas fa-calendar-day"></i> ${days[d]} <span style="font-size: 0.85em; opacity: 0.7; font-weight: normal;">${dateLabel}</span></h2><div class="lessons-container"></div>`;

        const container = dayCard.querySelector(".lessons-container");

        if (useWilmaCalendar) {
            const todaysLessons = wilmaEvents.filter(ev => {
                if (ev.dateStr !== dateISO) return false;
                if (ev.isReservation && !showReservations) return false;
                return true;
            });

            const educationOnly = todaysLessons.filter(ev => !ev.isReservation);
            
            if (todaysLessons.length === 0) {
                container.innerHTML = `<div style="padding: 15px; text-align: center; opacity: 0.6; font-size: 0.9rem;">Ei oppitunteja</div>`;
            } else {
                const lessonIntervals = educationOnly.map(ev => {
                    const [sh, sm] = ev.startTime.split(':').map(Number);
                    const [eh, em] = ev.endTime.split(':').map(Number);
                    return { startMins: sh * 60 + sm, endMins: eh * 60 + em };
                });

                const firstLessonStart = lessonIntervals.length > 0 ? Math.min(...lessonIntervals.map(i => i.startMins)) : 9999;
                const lastLessonEnd = lessonIntervals.length > 0 ? Math.max(...lessonIntervals.map(i => i.endMins)) : 0;

                todaysLessons.forEach(ev => {
                    const [startHour, startMin] = ev.startTime.split(":").map(Number);
                    const isExam = !ev.isReservation && ev.duration >= 120;
                    const scaleFactor = Math.max(1, ev.duration / 75);
                    
                    let customStyle = '';
                    if (isExam) {
                        customStyle = `min-height: ${Math.round(95 * scaleFactor)}px; display: flex; flex-direction: column; justify-content: space-between; border-left: 5px solid #ff5722;`;
                    } else if (ev.isReservation) {
                        customStyle = `opacity: 0.85; padding: 8px 12px; font-size: 0.9em;`;
                    }

                    const hwCount = !ev.isReservation ? getPendingHomeworkCountForSubject(ev.name) : 0;
                    const hwBadge = hwCount > 0 
                        ? `<span style="background: #ff9800; color: #fff; font-size: 0.72rem; padding: 2px 6px; border-radius: 10px; margin-left: 6px; font-weight: 600;">📝 ${hwCount} tehtävä${hwCount > 1 ? 'ä' : ''}</span>` 
                        : '';

                    container.innerHTML += `
                        <div class="lesson ${ev.color}" data-time="${startHour}:${startMin}" data-duration="${ev.duration}" style="${customStyle}">
                            <span class="lesson-time">
                                ${ev.startTime} - ${ev.endTime} 
                                ${isExam ? '<strong style="margin-left: 6px; color: #ff5722;">📝 KOE</strong>' : ''}
                                ${hwBadge}
                            </span>
                            <div class="lesson-main">
                                <span class="lesson-subject">${ev.name}</span>
                                <span class="lesson-code">${ev.code}</span>
                            </div>
                            <div class="lesson-info">
                                <span class="lesson-room"><i class="fas fa-door-open"></i> ${ev.room || '-'}</span>
                                <span class="lesson-teacher"><i class="fas fa-chalkboard-teacher"></i> ${ev.teacher || '-'}</span>
                            </div>
                        </div>`;
                });
                if (!isExamWeek && educationOnly.length > 0) {
                    standardSlots.forEach(slot => {
                        const isMorningSlot = slot.startMins === 490;
                        const isBetweenLessons = slot.startMins >= firstLessonStart && slot.endMins <= lastLessonEnd;

                        if (isMorningSlot || isBetweenLessons) {
                            const hasOverlap = lessonIntervals.some(li => 
                                (li.startMins < slot.endMins - 10) && (li.endMins > slot.startMins + 10)
                            );
                            if (!hasOverlap) {
                                const [sh, sm] = slot.start.split(':').map(Number);
                                container.innerHTML += `
                                    <div class="lesson freetime" data-time="${sh}:${sm}" data-duration="75" style="opacity: 0.85; border-style: dashed;">
                                        <span class="lesson-time">${slot.start} - ${slot.end}</span>
                                        <div class="lesson-main">
                                            <span class="lesson-subject">Hyppytunti</span>
                                            <span class="lesson-code">Vapaa</span>
                                        </div>
                                        <div class="lesson-info">
                                            <span class="lesson-room"><i class="fas fa-coffee"></i> Oma aika</span>
                                        </div>
                                    </div>`;
                            }
                        }
                    });
                }
            }
        } else {
            fallbackSchedule[d].forEach(item => {
                const subj = subjects[item.row];
                const time = times[item.hour - 1];
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
        }

        const dayEvents = singleEvents.filter(event => event.day === d);
        dayEvents.forEach(event => {
            const endTime = calculateEndTime(event.time, event.duration);
            container.innerHTML += `
                <div class="lesson event single-event" data-time="${event.time}" data-duration="${event.duration}" data-event-id="${event.id}">
                    <div class="lesson-header">
                        <span class="lesson-time">${event.time} - ${endTime}</span>
                        <button class="delete-event-btn" onclick="removeSingleEvent(${event.id})"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="lesson-main">
                        <span class="lesson-subject">${event.name}</span>
                        <span class="event-badge">Tapahtuma</span>
                    </div>
                    <div class="lesson-info">
                        <span class="lesson-room"><i class="fas fa-door-open"></i> ${event.room || 'Ei tietoa'}</span>
                        <span class="lesson-duration"><i class="fas fa-clock"></i> ${event.duration} min</span>
                    </div>
                </div>`;
        });

        sortLessonsByTime(container);

        const meals = JSON.parse(localStorage.getItem("meals")) || {};
        const mealKeys = ["mon", "tue", "wed", "thu", "fri"];
        const mealText = meals[mealKeys[d - 1]] || "Ei ruokalistaa";
        dayCard.innerHTML += `<div class="meal"><i class="fas fa-utensils"></i><span>${mealText}</span></div>`;

        timetable.appendChild(dayCard);
    }

    // Tyylikäs oppitunnin tietojen modaali alert()-ikkunan sijaan
    document.querySelectorAll('.lesson').forEach(lesson => {
        lesson.addEventListener('click', function(e) {
            if (e.target.closest('.delete-event-btn')) return;
            
            const subject = this.querySelector('.lesson-subject')?.textContent || 'Oppitunti';
            const time = this.querySelector('.lesson-time')?.textContent.trim() || '';
            const room = this.querySelector('.lesson-room')?.textContent.trim() || 'Ei tietoa';
            const teacher = this.querySelector('.lesson-teacher')?.textContent.trim() || 'Ei tietoa';
            const code = this.querySelector('.lesson-code')?.textContent.trim() || '';

            const modalHtml = `
                <div class="modal-header">
                    <h2>📚 ${subject} ${code ? `(${code})` : ''}</h2>
                    <button class="close-btn" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body" style="padding: 15px; line-height: 1.8;">
                    <p><strong><i class="fas fa-clock"></i> Aika:</strong> ${time}</p>
                    <p><strong><i class="fas fa-door-open"></i> Sali:</strong> ${room}</p>
                    <p><strong><i class="fas fa-chalkboard-teacher"></i> Opettaja:</strong> ${teacher}</p>
                    <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="closeModal(); showHomeworkManager();" class="btn" style="background: var(--accent-color); color: white;">
                            <i class="fas fa-plus"></i> Lisää kotitehtävä
                        </button>
                        <button onclick="closeModal()" class="btn">Sulje</button>
                    </div>
                </div>
            `;
            showCustomModal(modalHtml);
        });
    });
}

function parseICSDate(dtStr) {
    return new Date(
        parseInt(dtStr.substring(0, 4), 10),
        parseInt(dtStr.substring(4, 6), 10) - 1,
        parseInt(dtStr.substring(6, 8), 10),
        parseInt(dtStr.substring(9, 11), 10),
        parseInt(dtStr.substring(11, 13), 10)
    );
}

function formatDateISO(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function formatDateYYYYMMDD(date) {
    return formatDateISO(date).replace(/-/g, '');
}

function detectSubjectColor(code) {
    const c = code.toUpperCase();
    if (c.startsWith('MA')) return 'math';
    if (c.startsWith('ÄI')) return 'finnish';
    if (c.startsWith('EN')) return 'english';
    if (c.startsWith('RU')) return 'swedish';
    if (c.startsWith('FY') || c.startsWith('KE')) return 'physics';
    if (c.startsWith('GE')) return 'geography';
    if (c.startsWith('BI')) return 'biology';
    if (c.startsWith('TE')) return 'health';
    if (c.startsWith('PS')) return 'psychology';
    if (c.startsWith('YH')) return 'economics';
    if (c.startsWith('HI')) return 'history';
    if (c.startsWith('UE') || c.startsWith('ET')) return 'religion';
    if (c.startsWith('FI')) return 'philosophy';
    if (c.startsWith('LI')) return 'sports';
    if (c.startsWith('KU') || c.startsWith('MU')) return 'arts';
    if (c.startsWith('RO') || c.startsWith('OP')) return 'event';
    return 'default';
}

function getSubjectFullName(code) {
    const c = code.toUpperCase();
    if (c.startsWith('MAA')) return 'Matematiikka (pitkä)';
    if (c.startsWith('MAB')) return 'Matematiikka (lyhyt)';
    if (c.startsWith('MA')) return 'Matematiikka';
    if (c.startsWith('ÄI')) return 'Äidinkieli';
    if (c.startsWith('ENA')) return 'Englanti';
    if (c.startsWith('RUB')) return 'Ruotsi';
    if (c.startsWith('FY')) return 'Fysiikka';
    if (c.startsWith('KE')) return 'Kemia';
    if (c.startsWith('BI')) return 'Biologia';
    if (c.startsWith('GE')) return 'Maantieto';
    if (c.startsWith('TE')) return 'Terveystieto';
    if (c.startsWith('PS')) return 'Psykologia';
    if (c.startsWith('YH')) return 'Yhteiskuntaoppi';
    if (c.startsWith('HI')) return 'Historia';
    if (c.startsWith('UE')) return 'Uskonto';
    if (c.startsWith('ET')) return 'Elämänkatsomustieto';
    if (c.startsWith('FI')) return 'Filosofia';
    if (c.startsWith('LI')) return 'Liikunta';
    if (c.startsWith('KU')) return 'Kuvataide';
    if (c.startsWith('MU')) return 'Musiikki';
    if (c.startsWith('RO')) return 'Ryhmänohjaus';
    if (c.startsWith('OP')) return 'Opinto-ohjaus';
    return code;
}



// ========== KELLO JA SÄÄ ==========
function updateClock() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    const s = now.getSeconds().toString().padStart(2, "0");
    const clockElement = document.getElementById("clock");
    if (clockElement) {
        clockElement.textContent = `Kello ${h}:${m}:${s}`;
    }
    highlightCurrent();
}

async function updateWeather() {
    const apiKey = 'd6149ddcc486b4c7e8b6cf842aa88d49';
    const city = 'Rauma,FI';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=fi`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.cod === 200) {
            const weatherWidget = document.querySelector('.weather-widget');
            if (!weatherWidget) return;

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

            weatherWidget.querySelector('.weather-icon').className = `${iconClass} weather-icon`;
            weatherWidget.querySelector('.weather-temp').textContent = `${temp}°C`;
            weatherWidget.querySelector('.weather-details').textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
        }
    } catch (err) {
        console.error('Virhe säätietojen haussa:', err);
        const weatherTemp = document.querySelector('.weather-temp');
        if (weatherTemp) weatherTemp.textContent = 'Ei yhteyttä';
    }
}

// ========== NYKYISEN TUNNIN KOROSTUS ==========
function highlightCurrent() {
    const now = new Date();
    const day = now.getDay();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    // Poista aiemmat korostukset
    document.querySelectorAll('.day-card').forEach(card => {
        card.classList.remove('highlight-day');
        card.querySelectorAll('.lesson').forEach(lesson => {
            lesson.classList.remove('highlight-lesson');
            lesson.querySelectorAll('.time-remaining').forEach(el => el.remove());
        });
        const meal = card.querySelector('.meal');
        if (meal) meal.classList.remove('highlight-meal');
    });

    if (day === 0 || day === 6) return;

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

            // Yllätystoiminto
            remainingText.addEventListener('click', createSurpriseEffect);
        }
    });
}

function createSurpriseEffect() {
    const egg = document.createElement('div');
    egg.textContent = '🎉 Yllätys! 🎉';
    egg.style.position = 'fixed';
    egg.style.top = '50%';
    egg.style.left = '50%';
    egg.style.transform = 'translate(-50%, -50%)';
    egg.style.padding = '12px 20px';
    egg.style.borderRadius = '12px';
    egg.style.boxShadow = '0 0 15px #000';
    egg.style.zIndex = '9999';
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
        c.style.position = 'fixed';
        c.style.width = '8px';
        c.style.height = '8px';
        c.style.backgroundColor = `hsl(${Math.random()*360}, 100%, 50%)`;
        c.style.left = Math.random() * window.innerWidth + 'px';
        c.style.top = Math.random() * window.innerHeight - window.innerHeight + 'px';
        c.style.opacity = Math.random();
        c.style.borderRadius = '50%';
        c.style.zIndex = '9998';
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

    // Poista efektit 3 sekunnin kuluttua
    setTimeout(() => {
        clearInterval(eggAnim);
        clearInterval(confettiAnim);
        egg.remove();
        confettis.forEach(c => c.el.remove());
    }, 3000);
}

// ========== OMAT JÄRJESTYKSET ==========
function initializeQuickSchedules() {
    // Luo slotit 1..5 (periodit)
    for (let i = 1; i <= 5; i++) {
        const slotElement = document.querySelector(`.schedule-slot[data-slot="${i}"]`);
        const periodName = periods[i] ? periods[i].name : `Periodi ${i}`;
        if (!slotElement) continue;

        const saved = localStorage.getItem(`periodSettings_${i}`);
        if (saved) {
            slotElement.innerHTML = `<span>${periodName}</span><i class="fas fa-check"></i>`;
            slotElement.title = `Valmiina: ${periodName} — Klikkaa ladataaksesi\nHiiren oikealla: Lisää vaihtoehtoja`;
            slotElement.classList.add('saved');
        } else {
            slotElement.innerHTML = `<span>${periodName}</span><i class="fas fa-calendar-alt"></i>`;
            slotElement.title = `Tyhjä: ${periodName} — Klikkaa tallentaaksesi nykyinen\nHiiren oikealla: Lisää vaihtoehtoja`;
            slotElement.classList.remove('saved');
        }

        // Päivitä väri
        updateSlotAppearance(i);

        slotElement.addEventListener('click', function(e) {
            if (e.button === 0) { // Vasen klikkaus
                handlePeriodSlotClick(parseInt(this.getAttribute('data-slot')));
            }
        });

        slotElement.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showSlotContextMenu(e, parseInt(this.getAttribute('data-slot')));
        });
    }

    // Lataa aktiivinen periodi (oletus 1)
    loadPeriodSchedule(2);
    updateActiveSlot();
}

function handlePeriodSlotClick(slotNumber) {
    const saved = localStorage.getItem(`periodSettings_${slotNumber}`);
    if (saved) {
        loadPeriodSchedule(slotNumber);
    } else {
        if (confirm(`Tallennetaanko nykyinen lukujärjestys periodiin ${slotNumber}?`)) {
            savePeriodSchedule(slotNumber);
        }
    }
}

function loadPeriodSchedule(slotNumber) {
    // Lataa periodiasetukset (jos asetettu), muuten näytä viesti
    loadPeriodSettings(slotNumber); // päivittää subjects, jos tallennettu
    generateTimetable();
    updateStatistics();
    currentScheduleSlot = slotNumber;
    updateActiveSlot();

    const periodName = periods[slotNumber] ? periods[slotNumber].name : `Periodi ${slotNumber}`;
    showToast(`📅 ${periodName} ladattu`);
    // Päivitä periodivalitsin myös
    const select = document.getElementById('periodSelect');
    if (select) select.value = String(slotNumber);
    const selectedPeriod = periods[slotNumber];
    if (selectedPeriod) document.getElementById('periodDates').textContent = `${selectedPeriod.start} - ${selectedPeriod.end}`;
}

function savePeriodSchedule(slotNumber) {
    // Tallenna nykyiset subjects kyseiseen periodiin
    const settings = { subjects: subjects };
    localStorage.setItem(`periodSettings_${slotNumber}`, JSON.stringify(settings));

    // Päivitä slotin ulkoasu
    const slotElement = document.querySelector(`.schedule-slot[data-slot="${slotNumber}"]`);
    const periodName = periods[slotNumber] ? periods[slotNumber].name : `Periodi ${slotNumber}`;
    if (slotElement) {
        slotElement.innerHTML = `<span>${periodName}</span><i class="fas fa-check"></i>`;
        slotElement.title = `Valmiina: ${periodName} — Klikkaa ladataaksesi\nHiiren oikealla: Lisää vaihtoehtoja`;
        slotElement.classList.add('saved');
    }

    currentScheduleSlot = slotNumber;
    updateActiveSlot();
    showToast(`💾 Tallennettu ${periodName}`);
}

function deleteQuickSchedule(slotNumber) {
    // Poista periodin asetukset
    if (confirm(`Haluatko varmasti poistaa periodin ${slotNumber} asetukset?`)) {
        localStorage.removeItem(`periodSettings_${slotNumber}`);
        const slotElement = document.querySelector(`.schedule-slot[data-slot="${slotNumber}"]`);
        const periodName = periods[slotNumber] ? periods[slotNumber].name : `Periodi ${slotNumber}`;
        if (slotElement) {
            slotElement.innerHTML = `<span>${periodName}</span><i class="fas fa-calendar-alt"></i>`;
            slotElement.title = `Tyhjä: ${periodName} — Klikkaa tallentaaksesi\nHiiren oikealla: Lisää vaihtoehtoja`;
            slotElement.classList.remove('saved');
        }
        showToast(`🗑️ ${periodName} asetukset poistettu`);
    }
}

function updateActiveSlot() {
    document.querySelectorAll('.schedule-slot').forEach(slot => {
        slot.classList.remove('active');
    });
    const activeSlot = document.querySelector(`.schedule-slot[data-slot="${currentScheduleSlot}"]`);
    if (activeSlot) activeSlot.classList.add('active');
}

function showSlotContextMenu(event, slotNumber) {
    event.preventDefault();
    event.stopPropagation();
    
    // Poista vanha valikko
    const oldMenu = document.getElementById('slotContextMenu');
    if (oldMenu) oldMenu.remove();

    // Luo uusi valikko
    const menu = document.createElement('div');
    menu.id = 'slotContextMenu';
    menu.style.cssText = `
        position: fixed;
        left: ${event.clientX}px;
        top: ${event.clientY}px;
        background: white;
        color: black;
        border: 1px solid #ccc;
        padding: 8px 0;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 8px;
        min-width: 180px;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
    `;

    // Valikon sisältö
    menu.innerHTML = `
        <div class="context-item" onclick="loadPeriodSchedule(${slotNumber}); closeContextMenu();">
            <i class="fas fa-download" style="width:16px;"></i> Lataa
        </div>
        <div class="context-item" onclick="savePeriodSchedule(${slotNumber}); closeContextMenu();">
            <i class="fas fa-save" style="width:16px;"></i> Tallenna
        </div>
        <div class="context-item" onclick="renameQuickSchedule(${slotNumber}); closeContextMenu();">
            <i class="fas fa-edit" style="width:16px;"></i> Nimeä uudelleen
        </div>
        <div class="context-item" onclick="changeSlotColor(${slotNumber}); closeContextMenu();">
            <i class="fas fa-palette" style="width:16px;"></i> Vaihda väri
        </div>
        <div class="context-item" onclick="exportSingleSchedule(${slotNumber}); closeContextMenu();">
            <i class="fas fa-share" style="width:16px;"></i> Vie
        </div>
        <div class="context-item" onclick="showScheduleInfo(${slotNumber}); closeContextMenu();">
            <i class="fas fa-info" style="width:16px;"></i> Tiedot
        </div>
        <hr style="margin:5px 0; border:none; border-top:1px solid #eee;">
        <div class="context-item danger" onclick="deleteQuickSchedule(${slotNumber}); closeContextMenu();">
            <i class="fas fa-trash" style="width:16px;"></i> Poista
        </div>
    `;

    document.body.appendChild(menu);

    // Sulje klikkaamalla muualle
    setTimeout(() => {
        const closeMenuHandler = function(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenuHandler);
                document.removeEventListener('contextmenu', closeMenuHandler);
            }
        };
        
        document.addEventListener('click', closeMenuHandler);
        document.addEventListener('contextmenu', closeMenuHandler);
    }, 10);
}

function closeContextMenu() {
    const menu = document.getElementById('slotContextMenu');
    if (menu) {
        menu.remove();
    }
}

function duplicateSchedule(sourceSlot) {
    const targetSlot = prompt(`Mihin slottiin haluat kopioida periodin ${sourceSlot}?\n\nSyötä numero 1-5:`, String(sourceSlot % 5 + 1));
    
    if (targetSlot && targetSlot >= 1 && targetSlot <= 5) {
        const sourceData = localStorage.getItem(`periodSettings_${sourceSlot}`);
        if (sourceData) {
            localStorage.setItem(`periodSettings_${targetSlot}`, sourceData);
            
            // Päivitä slotin ulkoasu
            const slotElement = document.querySelector(`.schedule-slot[data-slot="${targetSlot}"]`);
            const periodName = periods[targetSlot] ? periods[targetSlot].name : `Periodi ${targetSlot}`;
            if (slotElement) {
                slotElement.innerHTML = `<span>${periodName}</span><i class="fas fa-check"></i>`;
                slotElement.title = `Valmiina: ${periodName} — Klikkaa ladataaksesi\nHiiren oikealla: Lisää vaihtoehtoja`;
                slotElement.classList.add('saved');
            }
            
            showToast(`📋 Periodi ${sourceSlot} kopioitu slottiin ${targetSlot}`);
        }
    }
}

function exportSingleSchedule(slotNumber) {
    const scheduleData = localStorage.getItem(`periodSettings_${slotNumber}`);
    if (!scheduleData) {
        showToast('❌ Tämä slotti on tyhjä');
        return;
    }

    try {
        const parsedData = JSON.parse(scheduleData);
        
        // Vie SAMASSA MUODOSSA kuin "Vie lukujärjestys" -toiminto
        // eli pelkkä subjects-objekti
        const exportData = parsedData.subjects || parsedData;
        
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Kopioi leikepöydälle
        navigator.clipboard.writeText(jsonString).then(() => {
            showToast(`📤 Periodi ${slotNumber} kopioitu leikepöydälle!`);
        }).catch(() => {
            // Fallback: näytä teksti valittuna
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = jsonString;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextarea);
            showToast(`📤 Periodi ${slotNumber} kopioitu!`);
        });
    } catch (error) {
        console.error('Virhe periodin viennissä:', error);
        showToast('❌ Virhe periodin viennissä');
    }
}

function showScheduleInfo(slotNumber) {
    const scheduleData = localStorage.getItem(`periodSettings_${slotNumber}`);
    if (!scheduleData) {
        showToast('❌ Tämä slotti on tyhjä');
        return;
    }

    try {
        const parsedData = JSON.parse(scheduleData);
        const subjects = parsedData.subjects || {};
        
        // Laske tilastoja
        const totalLessons = Object.keys(subjects).length;
        const filledLessons = Object.values(subjects).filter(subj => 
            subj.name && subj.name !== "(Ei asetettu)"
        ).length;
        
        const subjectsList = Object.values(subjects)
            .filter(subj => subj.name && subj.name !== "(Ei asetettu)")
            .map(subj => `• ${subj.name} (${subj.room || 'Ei salia'})`)
            .join('\n');

        const infoMessage = `Periodi ${slotNumber} - Tiedot:
        
Tallennettuja oppiaineita: ${filledLessons}/${totalLessons}
${filledLessons > 0 ? `\nOppiaineet:\n${subjectsList}` : '\nEi tallennettuja oppiaineita'}

Klikkaa "OK" ladataksesi tämä periodi.`;

        if (confirm(infoMessage)) {
            loadPeriodSchedule(slotNumber);
        }
    } catch (error) {
        showToast('❌ Virhe tietojen haussa');
    }
}

function deleteQuickSchedule(slotNumber) {
    if (confirm(`Haluatko varmasti poistaa periodin ${slotNumber} asetukset?`)) {
        localStorage.removeItem(`periodSettings_${slotNumber}`);
        const slotElement = document.querySelector(`.schedule-slot[data-slot="${slotNumber}"]`);
        const periodName = periods[slotNumber] ? periods[slotNumber].name : `Periodi ${slotNumber}`;
        if (slotElement) {
            slotElement.innerHTML = `<span>${periodName}</span><i class="fas fa-calendar-alt"></i>`;
            slotElement.title = `Tyhjä: ${periodName} — Klikkaa tallentaaksesi\nHiiren oikealla: Lisää vaihtoehtoja`;
            slotElement.classList.remove('saved');
        }
        showToast(`🗑️ ${periodName} asetukset poistettu`);
    }
}

function renameQuickSchedule(slotNumber) {
    const currentName = periods[slotNumber] ? periods[slotNumber].name : `Periodi ${slotNumber}`;
    const newName = prompt(`Anna uusi nimi periodille ${slotNumber}:`, currentName);
    
    if (newName && newName.trim() !== '') {
        // Tallennetaan nimi kevyesti paikallisesti
        const meta = JSON.parse(localStorage.getItem('periodMeta') || '{}');
        meta[slotNumber] = { name: newName.trim() };
        localStorage.setItem('periodMeta', JSON.stringify(meta));

        // Päivitä slotin näkymä
        const slotElement = document.querySelector(`.schedule-slot[data-slot="${slotNumber}"]`);
        if (slotElement) {
            slotElement.querySelector('span').textContent = newName.trim();
            
            // Päivitä tooltip
            const saved = localStorage.getItem(`periodSettings_${slotNumber}`);
            if (saved) {
                slotElement.title = `Valmiina: ${newName.trim()} — Klikkaa ladataaksesi\nHiiren oikealla: Lisää vaihtoehtoja`;
            } else {
                slotElement.title = `Tyhjä: ${newName.trim()} — Klikkaa tallentaaksesi nykyinen\nHiiren oikealla: Lisää vaihtoehtoja`;
            }
        }
        
        showToast(`✏️ Periodi nimetty uudelleen: ${newName.trim()}`);
    }
}

function changeSlotColor(slotNumber) {
    const colors = [
        '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
        '#2ec4b6', '#e71d36', '#ff9f1c', '#011627', '#8ac926'
    ];
    
    const colorNames = [
        'Sininen', 'Tumma sininen', 'Purppura', 'Pinkki', 'Vaalea sininen',
        'Turkoosi', 'Punainen', 'Oranssi', 'Musta', 'Vihreä'
    ];
    
    let colorOptions = '';
    colors.forEach((color, index) => {
        colorOptions += `<div class="color-option" style="background: ${color}" onclick="selectSlotColor(${slotNumber}, '${color}')" title="${colorNames[index]}"></div>`;
    });
    
    const colorPicker = document.createElement('div');
    colorPicker.className = 'color-picker-modal';
    colorPicker.innerHTML = `
        <div class="color-picker-content">
            <h3>Valitse väri periodille ${slotNumber}</h3>
            <div class="color-grid">
                ${colorOptions}
            </div>
            <button onclick="closeColorPicker()" class="btn cancel-btn">Peruuta</button>
        </div>
    `;
    
    document.body.appendChild(colorPicker);
    
    // Sulje klikatessa taustaa
    colorPicker.addEventListener('click', function(e) {
        if (e.target === this) {
            closeColorPicker();
        }
    });
}

function selectSlotColor(slotNumber, color) {
    // Tallenna väri
    const slotColors = JSON.parse(localStorage.getItem('slotColors')) || {};
    slotColors[slotNumber] = color;
    localStorage.setItem('slotColors', JSON.stringify(slotColors));
    
    // Päivitä slotin ulkoasu
    updateSlotAppearance(slotNumber);
    closeColorPicker();
    showToast('🎨 Slotin väri vaihdettu!');
}

function closeColorPicker() {
    const picker = document.querySelector('.color-picker-modal');
    if (picker) {
        picker.remove();
    }
}

function updateSlotAppearance(slotNumber) {
    const slotElement = document.querySelector(`.schedule-slot[data-slot="${slotNumber}"]`);
    if (!slotElement) return;
    
    const slotColors = JSON.parse(localStorage.getItem('slotColors')) || {};
    const color = slotColors[slotNumber];
    
    if (color) {
        slotElement.style.borderLeft = `4px solid ${color}`;
        slotElement.style.background = `${color}15`; // Läpinäkyvä tausta
    } else {
        slotElement.style.borderLeft = '';
        slotElement.style.background = '';
    }
}

// ========== TILASTOT JA INFO ==========
function updateStatistics() {
    const totalLessonsEl = document.getElementById('totalLessons');
    const sportsLessonsEl = document.getElementById('sportsLessons');
    const freeLessonsEl = document.getElementById('freeLessons');
    if (!totalLessonsEl || !sportsLessonsEl || !freeLessonsEl) return;
    
    const wilmaEvents = JSON.parse(localStorage.getItem('wilmaCalendarEvents'));
    
    if (Array.isArray(wilmaEvents) && wilmaEvents.length > 0) {
        const weekDates = getWeekDates(currentWeekOffset);
        const weekISOs = weekDates.map(d => formatDateISO(d));
        
        // Lasketaan tilastoihin vain varsinaiset oppitunnit (ei ruokailuja/pajoja)
        const weekLessons = wilmaEvents.filter(ev => weekISOs.includes(ev.dateStr) && !ev.isReservation);
        const totalLessons = weekLessons.length;
        const sportsLessons = weekLessons.filter(ev => ev.color === 'sports').length;
        const freeLessons = Math.max(0, 20 - totalLessons);

        totalLessonsEl.textContent = `${totalLessons} oppituntia`;
        sportsLessonsEl.textContent = `${sportsLessons} liikuntaa`;
        freeLessonsEl.textContent = `${freeLessons} vapaata`;
    } else {
        let totalLessons = 0;
        let sportsLessons = 0;
        let freeLessons = 0;
        
        for (let day = 1; day <= 5; day++) {
            schedule[day].forEach(item => {
                totalLessons++;
                const subject = subjects[item.row];
                if (subject.color === 'sports') sportsLessons++;
                if (subject.name === "(Ei asetettu)" || subject.color === 'freetime') freeLessons++;
            });
        }
        
        totalLessonsEl.textContent = `${totalLessons} oppituntia`;
        sportsLessonsEl.textContent = `${sportsLessons} liikuntaa`;
        freeLessonsEl.textContent = `${freeLessons} vapaata`;
    }
    
    updateNextLessonInfo();
}

function updateNextLessonInfo() {
    const nextLessonInfo = document.getElementById('nextLessonInfo');
    if (!nextLessonInfo) return;
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    if (currentDay === 0 || currentDay === 6) {
        nextLessonInfo.innerHTML = '<i class="fas fa-arrow-right"></i><span>Seuraava: Maanantaina</span>';
        return;
    }

    const wilmaEvents = JSON.parse(localStorage.getItem('wilmaCalendarEvents'));
    if (Array.isArray(wilmaEvents) && wilmaEvents.length > 0) {
        const todayISO = formatDateISO(now);
        const todaysLessons = wilmaEvents
            .filter(ev => ev.dateStr === todayISO && !ev.isReservation)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        const nextEv = todaysLessons.find(ev => {
            const [sh, sm] = ev.startTime.split(':').map(Number);
            return (sh * 60 + sm) > currentMins;
        });

        if (nextEv) {
            nextLessonInfo.innerHTML = `<i class="fas fa-arrow-right"></i><span>Seuraava: ${nextEv.startTime} ${nextEv.name} (${nextEv.room || '-'})</span>`;
        } else {
            nextLessonInfo.innerHTML = '<i class="fas fa-check"></i><span>Päivän tunnit ohi</span>';
        }
        return;
    }
    
    // Varajärjestelmä ilman Wilmaa
    let nextLesson = null;
    const todaySchedule = schedule[currentDay];
    for (const item of todaySchedule) {
        const [startHour, startMin] = times[item.hour - 1].split(" - ")[0].split(":").map(Number);
        if ((startHour * 60 + startMin) > currentMins) {
            nextLesson = item;
            break;
        }
    }
    
    if (nextLesson) {
        const subject = subjects[nextLesson.row];
        const time = times[nextLesson.hour - 1].split(" - ")[0];
        nextLessonInfo.innerHTML = `<i class="fas fa-arrow-right"></i><span>Seuraava: ${time} ${subject.name}</span>`;
    } else {
        nextLessonInfo.innerHTML = '<i class="fas fa-check"></i><span>Päivän tunnit ohi</span>';
    }
}

// Sulavampi fontinvaihto ilman ruudun välähdystä
function applyFontImmediately(fontFamily) {
    try {
        document.body.style.fontFamily = fontFamily;
        const selectors = [
            '.modal', '.modal-content', '#settingsModal', '.settings-content',
            '.settings-tab', '.setting-group', 'input', 'select', 'textarea',
            'button', '.btn', '.nav-item', '.day-card', '.lesson', '.tool-card',
            '.homework-item', '.exam-item', '.grade-item', '.note-item'
        ];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.fontFamily = fontFamily;
            });
        });
    } catch (error) {
        console.error('Virhe fontin soveltamisessa:', error);
    }
}

// ========== AINEIDEN VÄRIT ==========
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
    if (!container) return;
    
    container.innerHTML = `<div class="subject-color-grid" id="subjectColorGrid"></div>`;
    const grid = document.getElementById("subjectColorGrid");

    Object.entries(subjectColorDefinitions).forEach(([key, config]) => {
        const savedColor = localStorage.getItem(`color-${key}`) || config.default;
        document.documentElement.style.setProperty(`--color-${key}`, savedColor);
        
        const colorItem = document.createElement("div");
        colorItem.className = "subject-color-item";
        colorItem.innerHTML = `
            <div class="color-preview" style="background-color: ${savedColor}"></div>
            <div class="color-info">
                <label for="color-${key}">${config.name}</label>
                <input type="color" id="color-${key}" value="${savedColor}" class="color-input">
            </div>
        `;
        grid.appendChild(colorItem);

        const colorInput = colorItem.querySelector('.color-input');
        colorInput.addEventListener("input", (e) => {
            const newColor = e.target.value;
            document.documentElement.style.setProperty(`--color-${key}`, newColor);
            localStorage.setItem(`color-${key}`, newColor);
            colorItem.querySelector('.color-preview').style.backgroundColor = newColor;
            generateTimetable();
        });
    });
}

function resetSubjectColors() {
    if (confirm("Haluatko varmasti palauttaa kaikki värit oletusarvoihin?")) {
        Object.entries(subjectColorDefinitions).forEach(([key, config]) => {
            localStorage.removeItem(`color-${key}`);
            document.documentElement.style.setProperty(`--color-${key}`, config.default);
            const colorInput = document.getElementById(`color-${key}`);
            if (colorInput) colorInput.value = config.default;
        });
        generateTimetable();
        showToast("🎨 Värit palautettu oletusarvoihin!");
    }
}

// ========== LUKUJÄRJESTYKSEN MUOKKAUS ==========
function renderScheduleEditor() {
    const editScheduleRows = document.getElementById("editScheduleRows");
    if (!editScheduleRows) return;
    
    editScheduleRows.innerHTML = "";
    for (let i = 1; i <= 7; i++) {
        const s = subjects[i] || { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" };
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
        const sel = document.getElementById(`subj-color-${i}`);
        if (sel) sel.value = s.color || "default";
    }
}

function saveSchedule() {
    try {
        // Määritä mille periodille tallennetaan
        const editSelect = document.getElementById('editPeriodSelect');
        const targetPeriod = editSelect ? parseInt(editSelect.value) : currentScheduleSlot;
        
        const updatedSubjects = {};
        
        // Kerää kaikkien 7 rivin tiedot
        for (let i = 1; i <= 7; i++) {
            const selectEl = document.getElementById(`subj-color-${i}`);
            if (!selectEl) {
                console.error(`Elementtiä subj-color-${i} ei löytynyt`);
                continue;
            }
            
            const selectedName = selectEl.options[selectEl.selectedIndex].text;
            const colorVal = selectEl.value;

            updatedSubjects[i] = {
                name: colorVal === "default" ? "(Ei asetettu)" : selectedName,
                code: document.getElementById(`subj-code-${i}`)?.value || "",
                teacher: document.getElementById(`subj-teacher-${i}`)?.value || "",
                room: document.getElementById(`subj-room-${i}`)?.value || "",
                color: colorVal === "default" ? "default" : colorVal
            };
        }

        // Päivitä globaali subjects
        subjects = updatedSubjects;
        localStorage.setItem("customSubjects", JSON.stringify(subjects));

        // Tallenna periodille
        savePeriodSettings(targetPeriod);

        // Päivitä näkymä
        generateTimetable();
        updateStatistics();
        updateActiveSlot();

        showToast(`💾 Lukujärjestys tallennettu periodille ${targetPeriod}`);
        
    } catch (error) {
        console.error('Virhe tallennuksessa:', error);
        showToast('❌ Virhe lukujärjestyksen tallentamisessa');
    }
}

// ========== RUOKALISTA ==========
function saveMeals() {
    const meals = {
        mon: document.getElementById("meal-mon").value,
        tue: document.getElementById("meal-tue").value,
        wed: document.getElementById("meal-wed").value,
        thu: document.getElementById("meal-thu").value,
        fri: document.getElementById("meal-fri").value,
    };
    localStorage.setItem("meals", JSON.stringify(meals));
    updateMeals();
    showToast("🍽️ Ruokalista tallennettu!");
}

function updateMeals() {
    const savedMeals = JSON.parse(localStorage.getItem("meals"));
    if (!savedMeals) return;

    const dayKeys = ["mon", "tue", "wed", "thu", "fri"];
    const dayCards = document.querySelectorAll(".day-card");

    dayCards.forEach((card, index) => {
        const mealText = savedMeals[dayKeys[index]] || "Ei ruokalistaa";
        const mealEl = card.querySelector(".meal span");
        if (mealEl) mealEl.textContent = mealText;
    });

    // Päivitä asetuskentät
    if (document.getElementById("meal-mon")) {
        document.getElementById("meal-mon").value = savedMeals.mon || "";
        document.getElementById("meal-tue").value = savedMeals.tue || "";
        document.getElementById("meal-wed").value = savedMeals.wed || "";
        document.getElementById("meal-thu").value = savedMeals.thu || "";
        document.getElementById("meal-fri").value = savedMeals.fri || "";
    }
}

// ========== LUKUJÄRJESTYKSEN JAKAMINEN - PUUTTUVAT FUNKTIOT ==========

function exportSchedule() {
    try {
        // Hae nykyisen periodin asetukset
        const periodSelect = document.getElementById('periodSelect');
        const currentPeriod = periodSelect ? parseInt(periodSelect.value) : currentScheduleSlot;
        
        const scheduleData = localStorage.getItem(`periodSettings_${currentPeriod}`);
        if (!scheduleData) {
            showToast('❌ Ei tallennettua lukujärjestystä');
            return;
        }
        
        const parsedData = JSON.parse(scheduleData);
        const exportData = {
            period: currentPeriod,
            subjects: parsedData.subjects,
            exportedAt: new Date().toISOString(),
            version: '2.0'
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Aseta tekstikenttään
        const scheduleDataElement = document.getElementById('scheduleData');
        if (scheduleDataElement) {
            scheduleDataElement.value = jsonString;
        }
        
        // Kopioi leikepöydälle
        navigator.clipboard.writeText(jsonString).then(() => {
            showToast('📤 Lukujärjestys kopioitu leikepöydälle!');
        }).catch(() => {
            // Fallback
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = jsonString;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextarea);
            showToast('📤 Lukujärjestys kopioitu!');
        });
        
    } catch (error) {
        console.error('Virhe viennissä:', error);
        showToast('❌ Virhe lukujärjestyksen viennissä');
    }
}

// ========== VIIKKOKOHTAINEN WILMA-KALENTERI ==========

// =========================================================================
// SOVELLUKSEN PARANNUKSET (OSA 1/4): WILMA-TUONTI & KOKEET
// =========================================================================

function importSchedule() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.txt,.ics';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            
            if (file.name.endsWith('.ics') || content.includes('BEGIN:VCALENDAR')) {
                try {
                    const calendarEvents = parseFullWilmaICS(content);
                    localStorage.setItem('wilmaCalendarEvents', JSON.stringify(calendarEvents));
                    
                    detectAndSavePeriodsFromWilma(calendarEvents);
                    const addedExamsCount = syncWilmaExamsToTracker(calendarEvents);
                    
                    const scheduleDataElement = document.getElementById('scheduleData');
                    if (scheduleDataElement) {
                        scheduleDataElement.value = JSON.stringify({
                            type: "wilma_full_calendar",
                            eventCount: calendarEvents.length,
                            importedExams: addedExamsCount,
                            importedAt: new Date().toISOString()
                        }, null, 2);
                    }
                    
                    currentWeekOffset = 0;
                    generateTimetable();
                    updateStatistics();
                    updateToolsSection();
                    
                    const examMsg = addedExamsCount > 0 ? ` ja ${addedExamsCount} koetta siirretty koelistaan` : '';
                    showToast(`📅 Wilma tuotu (${calendarEvents.length} merkintää${examMsg})!`);
                } catch (err) {
                    console.error(err);
                    showToast('❌ Virhe Wilma-tiedoston lukemisessa: ' + err.message);
                }
            } else {
                try {
                    const importedData = JSON.parse(content);
                    const scheduleDataElement = document.getElementById('scheduleData');
                    if (scheduleDataElement) {
                        scheduleDataElement.value = JSON.stringify(importedData, null, 2);
                    }
                    showToast('📁 Tiedosto ladattu - käytä tuotua järjestystä');
                } catch (error) {
                    showToast('❌ Virheellinen tiedostomuoto');
                }
            }
        };
        reader.readAsText(file);
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

function parseFullWilmaICS(icsText) {
    const rawEvents = icsText.split('BEGIN:VEVENT');
    const expandedLessons = [];

    for (let i = 1; i < rawEvents.length; i++) {
        const block = rawEvents[i];
        const categoryMatch = block.match(/CATEGORIES:(.*)/);
        if (!categoryMatch) continue;

        const isEducation = categoryMatch[1].includes('Education');
        const isReservation = categoryMatch[1].includes('Reservation');
        if (!isEducation && !isReservation) continue;

        const dtStartMatch = block.match(/DTSTART(?:;TZID=[^:]+)?:(\d{8}T\d{6})/);
        const dtEndMatch = block.match(/DTEND(?:;TZID=[^:]+)?:(\d{8}T\d{6})/);
        const summaryMatch = block.match(/SUMMARY:(.*)/);
        const descMatch = block.match(/DESCRIPTION:(.*)/);
        const locMatch = block.match(/LOCATION:(.*)/);
        const rruleMatch = block.match(/RRULE:(.*)/);
        const exdateMatch = block.match(/EXDATE(?:;TZID=[^:]+)?:(.*)/);

        if (!dtStartMatch || !dtEndMatch || !summaryMatch) continue;

        const startDate = parseICSDate(dtStartMatch[1]);
        const endDate = parseICSDate(dtEndMatch[1]);
        const durationMins = Math.round((endDate - startDate) / 60000);

        const rawSummary = summaryMatch[1].trim();
        let courseCode = "";
        let fullName = rawSummary;

        if (isEducation) {
            const codeMatch = rawSummary.match(/^([^\s(]+)/);
            courseCode = codeMatch ? codeMatch[1] : rawSummary;
            fullName = getSubjectFullName(courseCode);
        } else {
            // Varaus, esim. "Ruokailuvuoro" tai "Matematiikkapaja (JPN/OY/SA) (B046)"
            courseCode = "Varaus";
            fullName = rawSummary.split('(')[0].trim();
        }

        let room = "";
        const parenMatches = [...rawSummary.matchAll(/\(([^)]+)\)/g)];
        if (parenMatches.length >= 2) {
            room = parenMatches[parenMatches.length - 1][1];
        } else if (parenMatches.length === 1 && isReservation) {
            room = parenMatches[0][1];
        } else if (locMatch) {
            room = locMatch[1].trim().split(' ')[0];
        }

        let teacher = parenMatches.length >= 1 && isEducation ? parenMatches[0][1] : "";
        if (descMatch) {
            const descLines = descMatch[1].split('\\n');
            if (descLines.length >= 2 && descLines[1].includes(' ')) {
                const teacherParts = descLines[1].trim().split(' ');
                teacher = teacherParts.slice(1).join(' ') || teacher;
            }
        }

        const startTimeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
        const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

        const lessonTemplate = {
            code: courseCode,
            name: fullName,
            teacher: teacher,
            room: room,
            color: isEducation ? detectSubjectColor(courseCode) : 'event',
            startTime: startTimeStr,
            endTime: endTimeStr,
            duration: durationMins,
            isReservation: isReservation
        };

        const exDates = [];
        if (exdateMatch) {
            exdateMatch[1].split(',').forEach(ex => {
                exDates.push(ex.trim().substring(0, 8));
            });
        }

        if (rruleMatch && rruleMatch[1].includes('FREQ=WEEKLY')) {
            const untilMatch = rruleMatch[1].match(/UNTIL=(\d{8}T\d{6})/);
            const untilDate = untilMatch ? parseICSDate(untilMatch[1]) : new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000);
            
            let current = new Date(startDate);
            while (current <= untilDate) {
                const dateKey = formatDateYYYYMMDD(current);
                if (!exDates.includes(dateKey)) {
                    expandedLessons.push({
                        ...lessonTemplate,
                        dateStr: formatDateISO(current),
                        dayOfWeek: current.getDay()
                    });
                }
                current.setDate(current.getDate() + 7);
            }
        } else {
            expandedLessons.push({
                ...lessonTemplate,
                dateStr: formatDateISO(startDate),
                dayOfWeek: startDate.getDay()
            });
        }
    }

    if (expandedLessons.length === 0) {
        throw new Error("Tiedostosta ei löytynyt tapahtumia.");
    }

    return expandedLessons;
}

// Siirtää Wilman pitkät kokeet automaattisesti Kokeiden seuranta -työkaluun
function syncWilmaExamsToTracker(events) {
    const longExams = events.filter(ev => !ev.isReservation && ev.duration >= 120);
    let addedCount = 0;

    longExams.forEach(ev => {
        const alreadyExists = examList.some(ex => ex.date === ev.dateStr && ex.subject.includes(ev.name));
        if (!alreadyExists) {
            examList.push({
                id: Date.now() + Math.floor(Math.random() * 10000),
                subject: ev.name,
                date: ev.dateStr,
                topic: `Kurssikoe (${ev.code}) • Sali: ${ev.room || 'Ei tietoa'}`,
                importance: 'important',
                time: ev.startTime,
                notes: ev.teacher ? `Opettaja: ${ev.teacher}` : '',
                createdAt: new Date().toISOString()
            });
            addedCount++;
        }
    });

    if (addedCount > 0) {
        localStorage.setItem('examList', JSON.stringify(examList));
        if (typeof updateExamStats === 'function') updateExamStats();
        if (typeof updateExamCounter === 'function') updateExamCounter();
    }

    return addedCount;
}

function detectAndSavePeriodsFromWilma(events) {
    if (!events || events.length === 0) return;

    const weeksMap = new Map();
    events.forEach(ev => {
        if (ev.dayOfWeek < 1 || ev.dayOfWeek > 5) return;
        const d = new Date(ev.dateStr + 'T00:00:00');
        const diffToMon = 1 - d.getDay();
        const mon = new Date(d);
        mon.setDate(d.getDate() + diffToMon);
        const monKey = formatDateISO(mon);

        if (!weeksMap.has(monKey)) {
            weeksMap.set(monKey, { monday: mon, courses: new Set(), hasLongExams: false });
        }
        const w = weeksMap.get(monKey);
        if (!ev.code.startsWith('RO.') && !ev.code.startsWith('OP')) {
            w.courses.add(ev.code);
        }
        if (ev.duration >= 120) {
            w.hasLongExams = true;
        }
    });

    const sortedWeeks = Array.from(weeksMap.values()).sort((a, b) => a.monday - b.monday);
    const detectedPeriods = [];
    let currentBlock = null;
    let periodCounter = 1;
    let examCounter = 1;

    sortedWeeks.forEach(w => {
        const fri = new Date(w.monday);
        fri.setDate(w.monday.getDate() + 4);

        if (w.hasLongExams) {
            if (currentBlock) {
                detectedPeriods.push(currentBlock);
                currentBlock = null;
            }
            detectedPeriods.push({
                id: `exam_${examCounter}`,
                name: `📝 Koeviikko ${examCounter}`,
                startISO: formatDateISO(w.monday),
                endISO: formatDateISO(fri),
                startLabel: `${w.monday.getDate()}.${w.monday.getMonth() + 1}.`,
                endLabel: `${fri.getDate()}.${fri.getMonth() + 1}.${fri.getFullYear()}`,
                isExamWeek: true
            });
            examCounter++;
        } else {
            let isSamePeriod = false;
            if (currentBlock && w.courses.size > 0) {
                let overlap = 0;
                w.courses.forEach(c => { if (currentBlock.courses.has(c)) overlap++; });
                if (overlap > 0) isSamePeriod = true;
            }

            if (!currentBlock || !isSamePeriod) {
                if (currentBlock) detectedPeriods.push(currentBlock);
                currentBlock = {
                    id: `period_${periodCounter}`,
                    name: `Jakso ${periodCounter}`,
                    startISO: formatDateISO(w.monday),
                    endISO: formatDateISO(fri),
                    startLabel: `${w.monday.getDate()}.${w.monday.getMonth() + 1}.`,
                    endLabel: `${fri.getDate()}.${fri.getMonth() + 1}.${fri.getFullYear()}`,
                    courses: new Set(w.courses),
                    isExamWeek: false
                };
                periodCounter++;
            } else {
                currentBlock.endISO = formatDateISO(fri);
                currentBlock.endLabel = `${fri.getDate()}.${fri.getMonth() + 1}.${fri.getFullYear()}`;
                w.courses.forEach(c => currentBlock.courses.add(c));
            }
        }
    });

    if (currentBlock) detectedPeriods.push(currentBlock);

    const serializablePeriods = detectedPeriods.map(p => ({
        id: p.id,
        name: p.name,
        startISO: p.startISO,
        endISO: p.endISO,
        startLabel: p.startLabel,
        endLabel: p.endLabel,
        isExamWeek: p.isExamWeek
    }));

    localStorage.setItem('wilmaDetectedPeriods', JSON.stringify(serializablePeriods));
    updatePeriodSelectorUI();
}

function updatePeriodSelectorUI() {
    const periodSelect = document.getElementById('periodSelect');
    const detectedPeriods = JSON.parse(localStorage.getItem('wilmaDetectedPeriods'));
    if (!periodSelect || !Array.isArray(detectedPeriods) || detectedPeriods.length === 0) return;

    const weekDates = getWeekDates(currentWeekOffset);
    const currentMonISO = formatDateISO(weekDates[0]);

    periodSelect.innerHTML = '';
    let activeId = detectedPeriods[0].id;

    detectedPeriods.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.startLabel}–${p.endLabel})`;
        periodSelect.appendChild(opt);

        if (currentMonISO >= p.startISO && currentMonISO <= p.endISO) {
            activeId = p.id;
        }
    });

    periodSelect.value = activeId;

    periodSelect.onchange = function() {
        const chosen = detectedPeriods.find(p => p.id === this.value);
        if (chosen) {
            const targetMon = new Date(chosen.startISO + 'T00:00:00');
            const baseMon = getWeekDates(0)[0];
            const diffWeeks = Math.round((targetMon - baseMon) / (7 * 24 * 60 * 60 * 1000));
            currentWeekOffset = diffWeeks;
            generateTimetable();
            updateStatistics();
        }
    };
}

function changeWeek(offsetDelta) {
    currentWeekOffset = offsetDelta === 0 ? 0 : currentWeekOffset + offsetDelta;
    generateTimetable();
    updateStatistics();
}

function getWeekDates(offset = 0) {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? 1 : (day === 6 ? 2 : 1 - day);
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + (offset * 7));
    monday.setHours(0, 0, 0, 0);

    const weekDates = [];
    for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        weekDates.push(d);
    }
    return weekDates;
}

function applyImportedSchedule() {
    try {
        const importedDataText = document.getElementById('scheduleData').value.trim();
        if (!importedDataText) {
            showToast('❌ Liitä ensin lukujärjestysdata');
            return;
        }
        
        const importedData = JSON.parse(importedDataText);
        let subjectsData = importedData.subjects ? importedData.subjects : importedData;
        
        if (!subjectsData || typeof subjectsData !== 'object') {
            showToast('❌ Virheellinen lukujärjestysdata');
            return;
        }
        
        const completeSubjects = {};
        for (let i = 1; i <= 7; i++) {
            if (subjectsData[i]) {
                completeSubjects[i] = {
                    name: subjectsData[i].name || "(Ei asetettu)",
                    code: subjectsData[i].code || "",
                    teacher: subjectsData[i].teacher || "",
                    room: subjectsData[i].room || "",
                    color: subjectsData[i].color || "default"
                };
            } else {
                completeSubjects[i] = { name: "(Ei asetettu)", code: "", teacher: "", room: "", color: "default" };
            }
        }
        
        subjects = completeSubjects;
        localStorage.setItem("customSubjects", JSON.stringify(subjects));
        
        const periodSelect = document.getElementById('periodSelect');
        const currentPeriod = periodSelect ? parseInt(periodSelect.value, 10) : currentScheduleSlot;
        
        const periodSettings = { 
            subjects: subjects,
            customSchedule: importedData.customSchedule || null
        };
        localStorage.setItem(`periodSettings_${currentPeriod}`, JSON.stringify(periodSettings));
        
        const slotElement = document.querySelector(`.schedule-slot[data-slot="${currentPeriod}"]`);
        const periodName = periods[currentPeriod] ? periods[currentPeriod].name : `Periodi ${currentPeriod}`;
        if (slotElement) {
            slotElement.innerHTML = `<span>${periodName}</span><i class="fas fa-check"></i>`;
            slotElement.classList.add('saved');
        }

        generateTimetable();
        updateStatistics();
        renderScheduleEditor();
        
        showToast('✅ Lukujärjestys ladattu onnistuneesti!');
        
        setTimeout(() => {
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) settingsModal.style.display = "none";
        }, 1500);
        
    } catch (error) {
        showToast('❌ Virhe lukujärjestyksen lataamisessa: ' + error.message);
    }
}

function savePeriodSettings(periodId) {
    const existing = JSON.parse(localStorage.getItem(`periodSettings_${periodId}`)) || {};
    const periodSettings = { 
        subjects: subjects,
        customSchedule: existing.customSchedule || null
    };
    localStorage.setItem(`periodSettings_${periodId}`, JSON.stringify(periodSettings));
}


// ========== YKSITTÄISET TAPAHTUMAT ==========
function initializeEventDates() {
    const today = new Date();
    const eventTime = document.getElementById('eventTime');
    const eventDay = document.getElementById('eventDay');
    
    // Aseta kellonaika nykyiseen aikaan + 1 tunti
    const nextHour = today.getHours() + 1;
    eventTime.value = `${nextHour.toString().padStart(2, '0')}:00`;
    
    // Aseta nykyinen viikonpäivä (1 = maanantai, 5 = perjantai)
    const currentDay = today.getDay();
    const schoolDay = currentDay >= 1 && currentDay <= 5 ? currentDay : 1;
    eventDay.value = schoolDay;
}

function addSingleEvent() {
    const eventDay = parseInt(document.getElementById('eventDay').value);
    const eventTime = document.getElementById('eventTime').value;
    const eventDuration = parseInt(document.getElementById('eventDuration').value) || 45;
    const eventName = document.getElementById('eventName').value.trim();
    const eventRoom = document.getElementById('eventRoom').value.trim();

    if (!eventName) {
        showToast('❌ Anna tapahtuman nimi');
        document.getElementById('eventName').focus();
        return;
    }

    if (!eventTime) {
        showToast('❌ Valitse kellonaika');
        document.getElementById('eventTime').focus();
        return;
    }

    // Tarkista ettei kesto ole liian pitkä
    if (eventDuration > 180) {
        showToast('❌ Kesto liian pitkä (max 180 min)');
        document.getElementById('eventDuration').focus();
        return;
    }

    // Tallenna tapahtuma localStorageen
    const events = JSON.parse(localStorage.getItem('singleEvents')) || [];
    const newEvent = {
        id: Date.now(),
        day: eventDay,
        time: eventTime,
        duration: eventDuration,
        name: eventName,
        room: eventRoom,
        type: 'single',
        color: 'event',
        added: new Date().toISOString()
    };

    events.push(newEvent);
    localStorage.setItem('singleEvents', JSON.stringify(events));

    // Päivitä lukujärjestys
    generateTimetable();
    
    // Tyhjennä kentät ja fokusoi nimeen
    document.getElementById('eventName').value = '';
    document.getElementById('eventRoom').value = '';
    document.getElementById('eventName').focus();
    
    showToast('✅ Tapahtuma lisätty lukujärjestykseen!');
}

function removeSingleEvent(eventId) {
    if (confirm('Haluatko varmasti poistaa tämän tapahtuman?')) {
        let events = JSON.parse(localStorage.getItem('singleEvents')) || [];
        events = events.filter(event => event.id !== eventId);
        localStorage.setItem('singleEvents', JSON.stringify(events));
        generateTimetable();
        showToast('🗑️ Tapahtuma poistettu');
    }
}

// Apufunktioita yksittäisille tapahtumille
function calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

function sortLessonsByTime(container) {
    const lessons = Array.from(container.querySelectorAll('.lesson'));
    
    lessons.sort((a, b) => {
        const timeA = a.dataset.time; // "08:10"
        const timeB = b.dataset.time; // "09:40"
        
        // Muunna "HH:MM" muotoon varmuuden vuoksi
        const normalizeTime = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(num => 
                num.padStart(2, '0')
            );
            return `${hours}:${minutes}`;
        };
        
        return normalizeTime(timeA).localeCompare(normalizeTime(timeB));
    });
    
    // Poista kaikki oppitunnit ja lisää ne uudessa järjestyksessä
    lessons.forEach(lesson => lesson.remove());
    lessons.forEach(lesson => container.appendChild(lesson));
}

// ========== APUFUNKTIOT ==========
function showToast(message) {
    const toast = document.getElementById("toast");
    if (toast) {
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2500);
    }
}

// ========== PELIT ==========
function openExternalGame(url) {
    window.open(url, "_blank");
}

function openInternalGame(game) {
    const rpsGame = document.getElementById("rpsGame");
    if (rpsGame) {
        rpsGame.style.display = game === "rps" ? "block" : "none";
    } else {
        console.error('KPS-peliä ei löytynyt');
    }
}

// Päivitä pelikorttien klikkikuuntelijat
function initializeGameCards() {
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', function() {
            const gameText = this.querySelector('p').textContent;
            
            switch(gameText) {
                case 'Kivi-paperi-sakset':
                    openInternalGame('rps');
                    break;
                case '2048':
                    openExternalGame('https://play2048.co/');
                    break;
                case 'Sanuli':
                    openExternalGame('https://sanuli.fi/');
                    break;
                case 'Snake':
                    openExternalGame('https://playsnake.org/');
                    break;
                case 'Tetris':
                    openExternalGame('https://tetris.com/play-tetris');
                    break;
                case 'Pong':
                    openExternalGame('https://www.ponggame.org/');
                    break;
            }
        });
    });
}

// Lisää tämä funktio opiskelutyökalujen korttien alustukseen
function initializeToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const toolType = this.className.includes('homework-card') ? 'homework' :
                           this.className.includes('exam-card') ? 'exam' :
                           this.className.includes('grade-card') ? 'grade' :
                           this.className.includes('notes-card') ? 'notes' : 'unknown';
            
             ('Työkalukorttia klikattu:', toolType);
            
            switch(toolType) {
                case 'homework':
                    showHomeworkManager();
                    break;
                case 'exam':
                    showExamTracker();
                    break;
                case 'grade':
                    showGradeTracker();
                    break;
                case 'notes':
                    showNotesManager();
                    break;
            }
        });
    });
}

let rpsInterval;
function startRPS(playerChoice) {
    const popup = document.getElementById("rpsPopup");
    const anim = document.getElementById("rpsAnimation");
    const resultBox = document.getElementById("rpsResult");

    const symbols = ["🪨", "📄", "✂️"];
    const names = ["kivi", "paperi", "sakset"];

    popup.style.display = "flex";
    resultBox.textContent = "Arvotaan...";
    let i = 0;

    clearInterval(rpsInterval);
    rpsInterval = setInterval(() => {
        anim.textContent = symbols[i];
        i = (i + 1) % symbols.length;
    }, 120);

    const computerChoice = names[Math.floor(Math.random() * 3)];

    setTimeout(() => {
        clearInterval(rpsInterval);
        anim.textContent = symbols[names.indexOf(computerChoice)];

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
        setTimeout(() => popup.style.display = "none", 1500);
    }, 2000);
}

function closeRpsPopup() {
    document.getElementById("rpsPopup").style.display = "none";
}

let isToggling = false;

function toggleToolsSection(event) {
    // Estä useat samanaikaiset kutsut
    if (isToggling) return;
    isToggling = true;
    
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const toolsSection = document.querySelector('.tools-section');
    const toolsContent = document.querySelector('.tools-content');
    const toggleIcon = document.querySelector('.tools-toggle-icon');
    
    if (!toolsSection || !toolsContent || !toggleIcon) {
        isToggling = false;
        return;
    }
    
    const isCollapsed = toolsSection.classList.contains('collapsed');
    
    if (isCollapsed) {
        // Avaa työkalut
        toolsSection.classList.remove('collapsed');
        toolsContent.style.display = 'block';
        toggleIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
    } else {
        // Sulje työkalut
        toolsSection.classList.add('collapsed');
        toolsContent.style.display = 'none';
        toggleIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
    }
    
    // Sallii uuden klikkauksen 300ms kuluttua
    setTimeout(() => {
        isToggling = false;
    }, 300);
}

function initializeToolsSection() {
    
    const toolsHeader = document.querySelector('.tools-header');
    if (!toolsHeader) {
        console.error('Tools-header elementtiä ei löytynyt');
        return;
    }
    
    // Poista kaikki olemassa olevat klikkikuuntelijat
    const newToolsHeader = toolsHeader.cloneNode(true);
    toolsHeader.parentNode.replaceChild(newToolsHeader, toolsHeader);
    
    // Lisää uusi kuuntelija
    newToolsHeader.addEventListener('click', function(e) {
        toggleToolsSection(e);
    }, { once: false });
    
}

// ========== KOEVIIKKO-OMINAISUUS ==========
let examWeek = JSON.parse(localStorage.getItem('examWeek')) || {
    active: false,
    startDate: '',
    endDate: '',
    exams: []
};

// Päivitetty koeviikon alustus
function initializeExamWeek() {
    const toggle = document.getElementById('examWeekToggle');
    const content = document.getElementById('examWeekContent');
    
    if (!toggle) return;
    
    // Aseta nykyinen tila
    toggle.checked = examWeek.active;
    content.style.display = examWeek.active ? 'block' : 'none';
    
    // Aseta päivämäärät jos saatavilla
    if (examWeek.startDate) {
        document.getElementById('examWeekStart').value = examWeek.startDate;
    }
    if (examWeek.endDate) {
        document.getElementById('examWeekEnd').value = examWeek.endDate;
    }
    
    updateExamWeekStatus();
    renderExamWeekInfo();
    
    // Toggle-kuuntelija
    toggle.addEventListener('change', function() {
        content.style.display = this.checked ? 'block' : 'none';
        if (!this.checked) {
            examWeek.active = false;
            localStorage.setItem('examWeek', JSON.stringify(examWeek));
            updateExamWeekStatus();
            renderExamWeekInfo();
        }
    });
}

function saveExamWeek() {
    const startDate = document.getElementById('examWeekStart').value;
    const endDate = document.getElementById('examWeekEnd').value;
    
    if (!startDate || !endDate) {
        showToast('❌ Aseta sekä alku- että päättymispäivä');
        return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
        showToast('❌ Päättymispäivän tulee olla alkupäivän jälkeen');
        return;
    }
    
    examWeek = {
        active: true,
        startDate: startDate,
        endDate: endDate,
        exams: examWeek.exams || []
    };
    
    localStorage.setItem('examWeek', JSON.stringify(examWeek));
    updateExamWeekStatus();
    renderExamWeekInfo();
    showToast('✅ Koeviikko tallennettu!');
}

function updateExamWeekStatus() {
    const statusSpan = document.getElementById('examWeekStatus');
    if (!statusSpan) return;
    
    if (examWeek.active && examWeek.startDate && examWeek.endDate) {
        const start = new Date(examWeek.startDate).toLocaleDateString('fi-FI');
        const end = new Date(examWeek.endDate).toLocaleDateString('fi-FI');
        statusSpan.textContent = `Aktiivinen: ${start} - ${end}`;
        statusSpan.style.color = 'var(--accent-color)';
    } else {
        statusSpan.textContent = 'Ei aktiivista koeviikkoa';
        statusSpan.style.color = '';
    }
}


function renderExamWeekInfo() {
    const infoDiv = document.getElementById('examWeekInfo');
    if (!infoDiv) return;
    
    if (!examWeek.active || !examWeek.startDate || !examWeek.endDate) {
        infoDiv.innerHTML = `
            <div class="empty-exam-week">
                <div class="empty-icon">📚</div>
                <h4>Ei aktiivista koeviikkoa</h4>
                <p>Aktivoi koeviikko ja aseta päivämäärät nähdäksesi tiedot</p>
            </div>
        `;
        return;
    }
    
    const now = new Date();
    const startDate = new Date(examWeek.startDate);
    const endDate = new Date(examWeek.endDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Laske kokeiden määrä koeviikolla
    const examsInWeek = examList.filter(exam => {
        const examDate = new Date(exam.date);
        return examDate >= startDate && examDate <= endDate;
    });
    
    const importantExams = examsInWeek.filter(exam => 
        exam.importance === 'important' || exam.importance === 'critical'
    );
    
    let statusText = '';
    let statusClass = '';
    
    if (today < startDate) {
        const daysUntil = Math.ceil((startDate - today) / (1000 * 3600 * 24));
        statusText = `Koeviikko alkaa ${daysUntil} päivän päästä`;
        statusClass = 'upcoming';
    } else if (today > endDate) {
        statusText = 'Koeviikko on päättynyt';
        statusClass = 'ended';
    } else {
        const daysLeft = Math.ceil((endDate - today) / (1000 * 3600 * 24));
        statusText = `Koeviikko käynnissä! ${daysLeft} päivää jäljellä`;
        statusClass = 'active';
    }
    
    const progress = getExamWeekProgress();
    
    infoDiv.innerHTML = `
        <div class="exam-week-card ${statusClass}">
            <div class="exam-week-card-content">
                <div class="exam-week-stats">
                    <div class="exam-stat">
                        <span class="stat-value">${examsInWeek.length}</span>
                        <span class="stat-label">Kokeet</span>
                    </div>
                    <div class="exam-stat">
                        <span class="stat-value">${importantExams.length}</span>
                        <span class="stat-label">Tärkeät</span>
                    </div>
                    <div class="exam-stat">
                        <span class="stat-value">${progress}%</span>
                        <span class="stat-label">Valmista</span>
                    </div>
                </div>
                
                <div class="exam-week-progress">
                    <div class="progress-label">
                        <span>Koeviikon edistyminen</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="exam-week-status">${statusText}</div>
                
                <div class="exam-week-actions">
                    <button onclick="showExamWeekDetails()" class="view-details-btn">
                        <i class="fas fa-list"></i> Näytä yksityiskohdat
                    </button>
                    <button onclick="addExamsToWeek()" class="add-exams-btn">
                        <i class="fas fa-plus"></i> Lisää kokeita
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getExamWeekProgress() {
    if (!examWeek.active || !examWeek.startDate || !examWeek.endDate) return 0;
    
    const now = new Date();
    const startDate = new Date(examWeek.startDate);
    const endDate = new Date(examWeek.endDate);
    
    if (now < startDate) return 0;
    if (now > endDate) return 100;
    
    const totalDuration = endDate - startDate;
    const elapsed = now - startDate;
    
    return Math.min(Math.round((elapsed / totalDuration) * 100), 100);
}

function showExamWeekDetails() {
    if (!examWeek.active) {
        showToast('❌ Ei aktiivista koeviikkoa');
        return;
    }
    
    const startDate = new Date(examWeek.startDate);
    const endDate = new Date(examWeek.endDate);
    
    // Suodata kokeet koeviikolle
    const examsInWeek = examList.filter(exam => {
        const examDate = new Date(exam.date);
        return examDate >= startDate && examDate <= endDate;
    });
    
    // Ryhmittele kokeet päivittäin
    const examsByDay = {};
    examsInWeek.forEach(exam => {
        const examDate = new Date(exam.date);
        const dayKey = examDate.toDateString();
        
        if (!examsByDay[dayKey]) {
            examsByDay[dayKey] = [];
        }
        
        examsByDay[dayKey].push(exam);
    });
    
    // Järjestä päivät
    const sortedDays = Object.keys(examsByDay).sort((a, b) => new Date(a) - new Date(b));
    
    // Luo modal sisältö
    const modalContent = `
        <div class="modal-header">
            <h2>📅 Koeviikon yksityiskohdat</h2>
            <button class="close-btn" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="exam-week-details-header">
                <p><strong>Aikaväli:</strong> ${startDate.toLocaleDateString('fi-FI')} - ${endDate.toLocaleDateString('fi-FI')}</p>
                <p><strong>Kokeita yhteensä:</strong> ${examsInWeek.length}</p>
            </div>
            
            <div class="exam-week-summary">
                <div class="exam-summary-card">
                    <span class="exam-summary-value">${examsInWeek.length}</span>
                    <span class="exam-summary-label">Kaikki kokeet</span>
                </div>
                <div class="exam-summary-card">
                    <span class="exam-summary-value">${examsInWeek.filter(e => e.importance === 'important' || e.importance === 'critical').length}</span>
                    <span class="exam-summary-label">Tärkeät kokeet</span>
                </div>
                <div class="exam-summary-card">
                    <span class="exam-summary-value">${getExamWeekProgress()}%</span>
                    <span class="exam-summary-label">Edistyminen</span>
                </div>
            </div>
            
            ${examsInWeek.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>Ei kokeita koeviikolla</h3>
                    <p>Klikkaa "Lisää kokeita" alapuolelta aloittaaksesi</p>
                </div>
            ` : `
                <div class="exam-week-timetable">
                    ${sortedDays.map(dayKey => {
                        const dayDate = new Date(dayKey);
                        const today = new Date();
                        const isToday = dayDate.toDateString() === today.toDateString();
                        const isPast = dayDate < today;
                        
                        const dayExams = examsByDay[dayKey].sort((a, b) => 
                            new Date(a.date) - new Date(b.date)
                        );
                        
                        const dayName = dayDate.toLocaleDateString('fi-FI', { 
                            weekday: 'long',
                            day: 'numeric',
                            month: 'numeric'
                        });
                        
                        return `
                            <div class="exam-week-day">
                                <div class="exam-day-header">
                                    <i class="fas fa-calendar-day"></i>
                                    <span>${dayName}</span>
                                    ${isToday ? '<span class="today-badge">Tänään</span>' : ''}
                                    <span style="margin-left: auto; font-size: 0.8rem; opacity: 0.7;">
                                        ${dayExams.length} koe${dayExams.length > 1 ? 'ta' : ''}
                                    </span>
                                </div>
                                <div class="exam-day-events">
                                    ${dayExams.map(exam => {
                                        const examDate = new Date(exam.date);
                                        const isPastExam = examDate < today;
                                        const isTodayExam = examDate.toDateString() === today.toDateString();
                                        
                                        return `
                                            <div class="exam-event-item ${isPastExam ? 'past' : ''} ${isTodayExam ? 'today' : ''}">
                                                <div class="exam-event-time">
                                                    ${exam.time ? exam.time : 'Klo?'}
                                                </div>
                                                <div class="exam-event-details">
                                                    <span class="exam-event-subject">${exam.subject}</span>
                                                    <span class="exam-event-topic">${exam.topic}</span>
                                                    ${exam.notes ? `
                                                        <span class="exam-event-notes" style="display: block; font-size: 0.8rem; opacity: 0.7; margin-top: 0.2rem;">
                                                            <i class="fas fa-sticky-note"></i> ${exam.notes}
                                                        </span>
                                                    ` : ''}
                                                    <span class="exam-event-importance importance-${exam.importance}">
                                                        ${exam.importance === 'normal' ? 'Normaali' : exam.importance === 'important' ? 'Tärkeä' : 'Erittäin tärkeä'}
                                                    </span>
                                                    <div class="exam-event-actions">
                                                        <button onclick="editExamFromWeek(${exam.id})" class="exam-event-action-btn edit-exam-btn">
                                                            <i class="fas fa-edit"></i> Muokkaa
                                                        </button>
                                                        <button onclick="deleteExamFromWeek(${exam.id})" class="exam-event-action-btn delete-exam-btn">
                                                            <i class="fas fa-trash"></i> Poista
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
            
            <div class="exam-week-actions-modal three-buttons">
                <button onclick="openAddExamToWeekModal()" class="add-exams-modal-btn">
                    <i class="fas fa-plus-circle"></i> Lisää koe
                </button>
                <button onclick="editExamWeek()" class="exam-week-edit-btn">
                    <i class="fas fa-edit"></i> Muokkaa koeviikkoa
                </button>
                <button onclick="clearExamWeek()" class="clear-exam-week-modal-btn">
                    <i class="fas fa-trash"></i> Poista koeviikko
                </button>
            </div>
        </div>
    `;
    
    // Näytä modal
    showCustomModal(modalContent);
}


// Avaa uuden kokeen lisäysmodaali
function openAddExamToWeekModal() {
    const modalContent = `
        <div class="modal-header">
            <h2>➕ Lisää uusi koe koeviikolle</h2>
            <button class="close-btn" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="add-exam-header">
                <i class="fas fa-calendar-plus" style="color: var(--accent-color); font-size: 1.5rem;"></i>
                <h3>Uusi koe</h3>
            </div>
            
            <div class="add-exam-info">
                <p><strong>Koeviikko:</strong> ${new Date(examWeek.startDate).toLocaleDateString('fi-FI')} - ${new Date(examWeek.endDate).toLocaleDateString('fi-FI')}</p>
                <p>Koe lisätään automaattisesti valitulle koeviikolle</p>
            </div>
            
            <div class="edit-exam-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="newExamSubject">Aine: *</label>
                        <input type="text" id="newExamSubject" class="form-control" placeholder="Matematiikka" list="subjectList" required>
                    </div>
                    <div class="form-group">
                        <label for="newExamDate">Päivämäärä: *</label>
                        <input type="date" id="newExamDate" class="form-control" value="${examWeek.startDate}" min="${examWeek.startDate}" max="${examWeek.endDate}">
                    </div>
                </div>
                
                <div class="form-group full-width">
                    <label for="newExamTopic">Aihe/alue: *</label>
                    <input type="text" id="newExamTopic" class="form-control" placeholder="Esimerkiksi: Differentiaalilaskenta, Toisen maailmansodan syyt..." required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="newExamImportance">Tärkeys:</label>
                        <select id="newExamImportance" class="form-control">
                            <option value="normal">Normaali</option>
                            <option value="important">Tärkeä</option>
                            <option value="critical">Erittäin tärkeä</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="newExamTime">Kellonaika (valinnainen):</label>
                        <input type="time" id="newExamTime" class="form-control">
                    </div>
                </div>
                
                <div class="form-group full-width">
                    <label for="newExamNotes">Muistiinpanot (valinnainen):</label>
                    <textarea id="newExamNotes" class="form-control" placeholder="Lisää tähän muistiinpanoja kokeesta..." rows="2"></textarea>
                </div>
                
                <div class="edit-exam-actions">
                    <button onclick="saveNewExamToWeek()" class="save-exam-btn">
                        <i class="fas fa-plus-circle"></i> Lisää koe koeviikolle
                    </button>
                    <button onclick="closeModal()" class="cancel-exam-btn">
                        <i class="fas fa-times"></i> Peruuta
                    </button>
                </div>
                
                <div class="quick-add-shortcuts">
                    <button onclick="fillExamForm('math')" class="quick-shortcut-btn quick-shortcut-secondary">
                        <i class="fas fa-calculator"></i> Matematiikka
                    </button>
                    <button onclick="fillExamForm('finnish')" class="quick-shortcut-btn quick-shortcut-secondary">
                        <i class="fas fa-book"></i> Äidinkieli
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showCustomModal(modalContent);
    
    // Fokusoi ensimmäiseen kenttään
    setTimeout(() => {
        document.getElementById('newExamSubject').focus();
    }, 300);
}

// Täytä lomake esivalinnoilla
function fillExamForm(type) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const subjectMap = {
        'math': {
            subject: 'Matematiikka',
            topic: 'Differentiaalilaskenta ja integraalilaskenta',
            importance: 'important'
        },
        'finnish': {
            subject: 'Äidinkieli',
            topic: 'Kirjoitelma ja kielioppi',
            importance: 'critical'
        }
    };
    
    const preset = subjectMap[type];
    if (preset) {
        document.getElementById('newExamSubject').value = preset.subject;
        document.getElementById('newExamTopic').value = preset.topic;
        document.getElementById('newExamImportance').value = preset.importance;
        document.getElementById('newExamDate').value = tomorrow.toISOString().split('T')[0];
        
        showToast(`✅ ${preset.subject}-lomake täytetty!`);
    }
}


function showCustomModal(content) {
    // Poista olemassa oleva custom modal jos on
    const existingModal = document.getElementById('customModal');
    if (existingModal) existingModal.remove();
    
    // Luo uusi modal
    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content exam-week-modal">
            ${content}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Sulje klikkaamalla taustaa
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('customModal');
    if (modal) modal.remove();
}

function addExamsToWeek() {
    // Avaa kokeiden hallinta
    closeModal();
    setTimeout(() => {
        showExamTracker();
    }, 300);
}

function clearExamWeek() {
    if (confirm('Haluatko varmasti poistaa koeviikon? Tämä ei poista kokeita, vain koeviikon asetukset.')) {
        examWeek = {
            active: false,
            startDate: '',
            endDate: '',
            exams: []
        };
        localStorage.setItem('examWeek', JSON.stringify(examWeek));
        updateExamWeekStatus();
        renderExamWeekInfo();
        closeModal();
        showToast('🗑️ Koeviikko poistettu');
    }
}

// Uusi funktio koeviikon muokkaamiseen
function editExamWeek() {
    const modalContent = `
        <div class="modal-header">
            <h2>✏️ Muokkaa koeviikkoa</h2>
            <button class="close-btn" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="edit-dates-form">
                <div class="edit-dates-row">
                    <div class="edit-date-group">
                        <label for="editExamWeekStart">Alkaa:</label>
                        <input type="date" id="editExamWeekStart" class="edit-date-input" value="${examWeek.startDate}">
                    </div>
                    <div class="edit-date-group">
                        <label for="editExamWeekEnd">Päättyy:</label>
                        <input type="date" id="editExamWeekEnd" class="edit-date-input" value="${examWeek.endDate}">
                    </div>
                </div>
                
                <div class="exam-week-info-preview">
                    <h4>Koeviikon tiedot:</h4>
                    <div class="preview-stats">
                        <div class="preview-stat">
                            <span class="preview-label">Kokeita:</span>
                            <span class="preview-value">${examList.filter(exam => {
                                const examDate = new Date(exam.date);
                                const startDate = new Date(examWeek.startDate);
                                const endDate = new Date(examWeek.endDate);
                                return examDate >= startDate && examDate <= endDate;
                            }).length}</span>
                        </div>
                        <div class="preview-stat">
                            <span class="preview-label">Kesto:</span>
                            <span class="preview-value" id="previewDuration">${calculateExamWeekDuration()} päivää</span>
                        </div>
                    </div>
                </div>
                
                <div class="edit-actions">
                    <button onclick="saveExamWeekEdit()" class="save-edit-btn">
                        <i class="fas fa-save"></i> Tallenna muutokset
                    </button>
                    <button onclick="closeModal()" class="cancel-edit-btn">
                        <i class="fas fa-times"></i> Peruuta
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showCustomModal(modalContent);
    
    // Päivitä esikatselu reaaliaikaisesti
    document.getElementById('editExamWeekStart').addEventListener('change', updatePreview);
    document.getElementById('editExamWeekEnd').addEventListener('change', updatePreview);
}

function calculateExamWeekDuration() {
    if (!examWeek.startDate || !examWeek.endDate) return 0;
    
    const start = new Date(examWeek.startDate);
    const end = new Date(examWeek.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 koska alku- ja loppupäivä mukaan
    
    return diffDays;
}

// Päivitä esikatselu
function updatePreview() {
    const startDate = document.getElementById('editExamWeekStart').value;
    const endDate = document.getElementById('editExamWeekEnd').value;
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        document.getElementById('previewDuration').textContent = `${diffDays} päivää`;
    }
}

function saveExamWeekEdit() {
    const startDate = document.getElementById('editExamWeekStart').value;
    const endDate = document.getElementById('editExamWeekEnd').value;
    
    if (!startDate || !endDate) {
        showToast('❌ Aseta sekä alku- että päättymispäivä');
        return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
        showToast('❌ Päättymispäivän tulee olla alkupäivän jälkeen');
        return;
    }
    
    examWeek.startDate = startDate;
    examWeek.endDate = endDate;
    
    localStorage.setItem('examWeek', JSON.stringify(examWeek));
    updateExamWeekStatus();
    renderExamWeekInfo();
    closeModal();
    showToast('✅ Koeviikon päivämäärät päivitetty!');
}

// Muokkaa kokeen tietoja
function editExamFromWeek(examId) {
    const exam = examList.find(e => e.id === examId);
    if (!exam) return;
    
    const modalContent = `
        <div class="modal-header">
            <h2>✏️ Muokkaa koetta</h2>
            <button class="close-btn" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="edit-exam-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editExamSubject">Aine:</label>
                        <input type="text" id="editExamSubject" class="form-control" value="${exam.subject}" list="subjectList">
                    </div>
                    <div class="form-group">
                        <label for="editExamDate">Päivämäärä:</label>
                        <input type="date" id="editExamDate" class="form-control" value="${exam.date}">
                    </div>
                </div>
                
                <div class="form-group full-width">
                    <label for="editExamTopic">Aihe/alue:</label>
                    <input type="text" id="editExamTopic" class="form-control" value="${exam.topic}">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editExamImportance">Tärkeys:</label>
                        <select id="editExamImportance" class="form-control">
                            <option value="normal" ${exam.importance === 'normal' ? 'selected' : ''}>Normaali</option>
                            <option value="important" ${exam.importance === 'important' ? 'selected' : ''}>Tärkeä</option>
                            <option value="critical" ${exam.importance === 'critical' ? 'selected' : ''}>Erittäin tärkeä</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editExamTime">Kellonaika (valinnainen):</label>
                        <input type="time" id="editExamTime" class="form-control" value="${exam.time || ''}">
                    </div>
                </div>
                
                <div class="edit-exam-actions">
                    <button onclick="saveExamEdit(${examId})" class="save-exam-btn">
                        <i class="fas fa-save"></i> Tallenna muutokset
                    </button>
                    <button onclick="closeModal()" class="cancel-exam-btn">
                        <i class="fas fa-times"></i> Peruuta
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showCustomModal(modalContent);
}

// Tallenna kokeen muutokset
function saveExamEdit(examId) {
    const subject = document.getElementById('editExamSubject').value.trim();
    const date = document.getElementById('editExamDate').value;
    const topic = document.getElementById('editExamTopic').value.trim();
    const importance = document.getElementById('editExamImportance').value;
    const time = document.getElementById('editExamTime').value;

    if (subject && date && topic) {
        examList = examList.map(exam => 
            exam.id === examId 
                ? { ...exam, subject, date, topic, importance, time }
                : exam
        );

        localStorage.setItem('examList', JSON.stringify(examList));
        updateExamStats();
        updateExamCounter();
        renderExamWeekInfo(); // Päivitä koeviikon näkymä
        closeModal();
        showToast("✅ Koe päivitetty!");
    } else {
        showToast("❌ Täytä pakolliset kentät");
    }
}

// Poista koe koeviikolta
function deleteExamFromWeek(examId) {
    if (confirm('Haluatko varmasti poistaa tämän kokeen?')) {
        examList = examList.filter(exam => exam.id !== examId);
        localStorage.setItem('examList', JSON.stringify(examList));
        updateExamStats();
        updateExamCounter();
        renderExamWeekInfo(); // Päivitä koeviikon näkymä
        showToast("🗑️ Koe poistettu");
    }
}

// Lisää uusi koe suoraan koeviikolle
function addExamsToWeek() {
    openAddExamToWeekModal();
}

// Tallenna uusi koe koeviikolle
function saveNewExamToWeek() {
    const subject = document.getElementById('newExamSubject').value.trim();
    const date = document.getElementById('newExamDate').value;
    const topic = document.getElementById('newExamTopic').value.trim();
    const importance = document.getElementById('newExamImportance').value;
    const time = document.getElementById('newExamTime').value;
    const notes = document.getElementById('newExamNotes').value.trim();

    if (!subject || !date || !topic) {
        showToast('❌ Täytä pakolliset kentät (merkitty *)');
        return;
    }

    // Tarkista että koe on koeviikon sisällä
    const examDate = new Date(date);
    const startDate = new Date(examWeek.startDate);
    const endDate = new Date(examWeek.endDate);
    
    if (examDate < startDate || examDate > endDate) {
        showToast('❌ Valitse päivämäärä koeviikon sisältä');
        return;
    }

    const exam = {
        id: Date.now(),
        subject,
        date,
        topic,
        importance,
        time: time || null,
        notes: notes || null,
        createdAt: new Date().toISOString()
    };
    
    examList.push(exam);
    localStorage.setItem('examList', JSON.stringify(examList));
    updateExamStats();
    updateExamCounter();
    renderExamWeekInfo();
    closeModal();
    showToast("🎉 Koe lisätty koeviikolle!");
}

function quickAddExamToWeek() {
    const subject = document.getElementById('quickExamSubject').value.trim();
    const date = document.getElementById('quickExamDate').value;
    const topic = document.getElementById('quickExamTopic').value.trim();

    if (subject && date && topic) {
        // Tarkista että koe on koeviikon sisällä
        const examDate = new Date(date);
        const startDate = new Date(examWeek.startDate);
        const endDate = new Date(examWeek.endDate);
        
        if (examDate < startDate || examDate > endDate) {
            showToast('❌ Koe ei ole koeviikon sisällä');
            return;
        }

        const exam = {
            id: Date.now(),
            subject,
            date,
            topic,
            importance: 'normal',
            createdAt: new Date().toISOString()
        };
        
        examList.push(exam);
        localStorage.setItem('examList', JSON.stringify(examList));
        updateExamStats();
        updateExamCounter();
        renderExamWeekInfo();
        showToast("📅 Koe lisätty koeviikolle!");
        
        // Tyhjennä kentät
        clearQuickAddForm();
    } else {
        showToast("❌ Täytä pakolliset kentät");
    }
}

// Tyhjennä pikalomake
function clearQuickAddForm() {
    document.getElementById('quickExamSubject').value = '';
    document.getElementById('quickExamTopic').value = '';
    document.getElementById('quickExamSubject').focus();
}

// ========== KOTITEHTÄVIEN HALLINTA ==========
let homeworkList = JSON.parse(localStorage.getItem('homeworkList')) || [];
let examList = JSON.parse(localStorage.getItem('examList')) || [];
let gradeList = JSON.parse(localStorage.getItem('gradeList')) || [];
let notesList = JSON.parse(localStorage.getItem('notesList')) || [];
let currentHomeworkFilter = 'all';

function showHomeworkManager() {
    document.getElementById('homeworkModal').style.display = 'flex';
    renderHomeworkList();
    updateHomeworkCounter();
}

function closeHomeworkManager() {
    document.getElementById('homeworkModal').style.display = 'none';
}

function addHomework() {
    const subject = document.getElementById('homeworkSubject').value.trim();
    const task = document.getElementById('homeworkTask').value.trim();
    const dueDate = document.getElementById('homeworkDueDate').value;
    const priority = document.getElementById('homeworkPriority').value;

    if (subject && task && dueDate) {
        const homework = {
            id: Date.now(),
            subject,
            task,
            dueDate,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        homeworkList.push(homework);
        localStorage.setItem('homeworkList', JSON.stringify(homeworkList));
        renderHomeworkList();
        updateHomeworkCounter();
        
        // Tyhjennä kentät
        document.getElementById('homeworkSubject').value = '';
        document.getElementById('homeworkTask').value = '';
        document.getElementById('homeworkDueDate').value = '';
        
        showToast("📝 Kotitehtävä lisätty!");
    } else {
        showToast("❌ Täytä kaikki kentät");
    }
}

function renderHomeworkList() {
    const container = document.getElementById('homeworkList');
    if (!container) return;

    let filteredHomework = homeworkList;
    
    if (currentHomeworkFilter === 'active') {
        filteredHomework = homeworkList.filter(hw => !hw.completed);
    } else if (currentHomeworkFilter === 'completed') {
        filteredHomework = homeworkList.filter(hw => hw.completed);
    } else if (currentHomeworkFilter === 'overdue') {
        filteredHomework = homeworkList.filter(hw => !hw.completed && isOverdue(hw.dueDate));
    }

    if (filteredHomework.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>Ei kotitehtäviä</h3>
                <p>${currentHomeworkFilter === 'all' ? 'Lisää ensimmäinen kotitehtäväsi yläpuolelta!' : 'Ei tehtäviä tässä kategoriassa'}</p>
            </div>
        `;
        return;
    }

    // Järjestä tehtävät: myöhässä olevat ensin, sitten tärkeysjärjestys
    filteredHomework.sort((a, b) => {
        if (isOverdue(a.dueDate) && !isOverdue(b.dueDate)) return -1;
        if (!isOverdue(a.dueDate) && isOverdue(b.dueDate)) return 1;
        
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    container.innerHTML = filteredHomework.map(hw => {
        const dueDate = new Date(hw.dueDate);
        const today = new Date();
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        let statusClass = '';
        if (hw.completed) {
            statusClass = 'completed';
        } else if (daysDiff < 0) {
            statusClass = 'overdue';
        } else if (daysDiff <= 2) {
            statusClass = 'due-soon';
        }

        const priorityText = {
            low: 'Matala',
            medium: 'Keskitaso',
            high: 'Korkea'
        }[hw.priority];

        return `
            <div class="homework-item ${statusClass}">
                <div class="homework-header">
                    <div>
                        <strong>${hw.subject}</strong>
                        <span class="priority-badge priority-${hw.priority}">${priorityText}</span>
                    </div>
                    <span class="due-date">${dueDate.toLocaleDateString('fi-FI')} (${daysDiff} pv)</span>
                </div>
                <div class="homework-task">${hw.task}</div>
                ${!hw.completed ? `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${getHomeworkProgress(hw)}%"></div>
                    </div>
                ` : ''}
                <div class="homework-actions">
                    <button onclick="toggleHomework(${hw.id})" class="${hw.completed ? 'completed' : ''}">
                        ${hw.completed ? '❌ Peru' : '✅ Tehty'}
                    </button>
                    <button onclick="editHomework(${hw.id})" class="edit-btn">✏️ Muokkaa</button>
                    <button onclick="deleteHomework(${hw.id})" class="delete-btn">🗑️ Poista</button>
                </div>
            </div>
        `;
    }).join('');
}

function getHomeworkProgress(homework) {
    const created = new Date(homework.createdAt);
    const due = new Date(homework.dueDate);
    const now = new Date();
    
    const totalTime = due.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();
    
    return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
}

function isOverdue(dueDate) {
    return new Date(dueDate) < new Date();
}

function filterHomework(filter) {
    currentHomeworkFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderHomeworkList();
}

function toggleHomework(id) {
    homeworkList = homeworkList.map(hw => 
        hw.id === id ? { ...hw, completed: !hw.completed } : hw
    );
    localStorage.setItem('homeworkList', JSON.stringify(homeworkList));
    renderHomeworkList();
    updateHomeworkCounter();
}

function editHomework(id) {
    const homework = homeworkList.find(hw => hw.id === id);
    if (homework) {
        document.getElementById('homeworkSubject').value = homework.subject;
        document.getElementById('homeworkTask').value = homework.task;
        document.getElementById('homeworkDueDate').value = homework.dueDate;
        document.getElementById('homeworkPriority').value = homework.priority;
        
        // POISTA: deleteHomework(id);
        window.editingHomeworkId = id;
        
        showToast("✏️ Muokkaa tehtävää ja paina 'Lisää tehtävä' tallentaaksesi");
    }
}

function deleteHomework(id) {
    if (confirm('Haluatko varmasti poistaa tämän tehtävän?')) {
        homeworkList = homeworkList.filter(hw => hw.id !== id);
        localStorage.setItem('homeworkList', JSON.stringify(homeworkList));
        renderHomeworkList();
        updateHomeworkCounter();
        showToast("🗑️ Tehtävä poistettu");
    }
}

function updateHomeworkCounter() {
    const totalHomework = homeworkList.length;
    const activeHomework = homeworkList.filter(hw => !hw.completed).length;
    const overdueHomework = homeworkList.filter(hw => !hw.completed && isOverdue(hw.dueDate)).length;
    
    document.getElementById('homeworkCounter').textContent = `${activeHomework} aktiivista`;
    document.getElementById('homeworkBadge').textContent = overdueHomework > 0 ? overdueHomework : '0';
    
    // Lisää punainen varoitus, jos on myöhässä olevia tehtäviä
    const badge = document.getElementById('homeworkBadge');
    if (overdueHomework > 0) {
        badge.style.background = '#f44336';
    } else {
        badge.style.background = 'var(--accent-color)';
    }
}

// ========== KOKEIDEN HALLINTA ==========
function showExamTracker() {
    document.getElementById('examModal').style.display = 'flex';
    renderExamList();
    updateExamStats();
}

function closeExamTracker() {
    document.getElementById('examModal').style.display = 'none';
}

function addExam() {
    const subject = document.getElementById('examSubject').value.trim();
    const date = document.getElementById('examDate').value;
    const topic = document.getElementById('examTopic').value.trim();
    const importance = document.getElementById('examImportance').value;

    if (subject && date && topic) {
        // Tarkista onko muokkaus vai uusi lisäys
        if (window.editingExamId) {
            // Päivitä olemassa oleva koe
            examList = examList.map(exam => 
                exam.id === window.editingExamId 
                    ? { ...exam, subject, date, topic, importance }
                    : exam
            );
            delete window.editingExamId;
            showToast("✅ Koe päivitetty!");
        } else {
            // Lisää uusi koe
            const exam = {
                id: Date.now(),
                subject,
                date,
                topic,
                importance,
                createdAt: new Date().toISOString()
            };
            examList.push(exam);
            showToast("📅 Koe lisätty!");
        }

        localStorage.setItem('examList', JSON.stringify(examList));
        renderExamList();
        updateExamStats();
        updateExamCounter();
        
        // Tyhjennä kentät
        document.getElementById('examSubject').value = '';
        document.getElementById('examDate').value = '';
        document.getElementById('examTopic').value = '';
        
        // Tarkista onko koe koeviikolla
        if (examWeek.active && examWeek.startDate && examWeek.endDate) {
            const examDate = new Date(date);
            const startDate = new Date(examWeek.startDate);
            const endDate = new Date(examWeek.endDate);
            
            if (examDate >= startDate && examDate <= endDate) {
                renderExamWeekInfo();
            }
        }
    } else {
        showToast("❌ Täytä kaikki kentät");
    }
}
function renderExamList() {
    const container = document.getElementById('examList');
    if (!container) return;

    // Järjestä kokeet päivämäärän mukaan
    const sortedExams = [...examList].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sortedExams.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>Ei kokeita</h3>
                <p>Lisää ensimmäinen kokeesi yläpuolelta!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = sortedExams.map(exam => {
        const examDate = new Date(exam.date);
        const today = new Date();
        const timeDiff = examDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        let statusClass = '';
        if (daysDiff <= 7) statusClass = 'soon';
        if (exam.importance === 'important') statusClass = 'important';
        if (exam.importance === 'critical') statusClass = 'critical';

        const importanceText = {
            normal: 'Normaali',
            important: 'Tärkeä',
            critical: 'Erittäin tärkeä'
        }[exam.importance];

        return `
            <div class="exam-item ${statusClass}">
                <div class="exam-header">
                    <div>
                        <strong>${exam.subject}</strong>
                        <span class="importance-badge importance-${exam.importance}">${importanceText}</span>
                    </div>
                    <span class="exam-date">${examDate.toLocaleDateString('fi-FI')} (${daysDiff} pv)</span>
                </div>
                <div class="exam-topic">${exam.topic}</div>
                <div class="exam-actions">
                    <button onclick="editExam(${exam.id})" class="edit-btn">✏️ Muokkaa</button>
                    <button onclick="deleteExam(${exam.id})" class="delete-btn">🗑️ Poista</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateExamStats() {
    const now = new Date();
    const upcomingExams = examList.filter(exam => new Date(exam.date) >= now).length;
    const importantExams = examList.filter(exam => exam.importance === 'important' || exam.importance === 'critical').length;
    
    // Etsi seuraava koetentse
    const futureExams = examList.filter(exam => new Date(exam.date) >= now);
    const nextExam = futureExams.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    const daysToNextExam = nextExam ? Math.ceil((new Date(nextExam.date) - now) / (1000 * 3600 * 24)) : '-';
    
    document.getElementById('upcomingExams').textContent = upcomingExams;
    document.getElementById('importantExams').textContent = importantExams;
    document.getElementById('daysToNextExam').textContent = daysToNextExam;
}

function editExam(id) {
    const exam = examList.find(e => e.id === id);
    if (exam) {
        document.getElementById('examSubject').value = exam.subject;
        document.getElementById('examDate').value = exam.date;
        document.getElementById('examTopic').value = exam.topic;
        document.getElementById('examImportance').value = exam.importance;
        
         window.editingExamId = id;
        showToast("✏️ Muokkaa koetta ja tallenna uudelleen");
    }
}

function deleteExam(id) {
    if (confirm('Haluatko varmasti poistaa tämän Kokeen?')) {
        examList = examList.filter(exam => exam.id !== id);
        localStorage.setItem('examList', JSON.stringify(examList));
        renderExamList();
        updateExamStats();
        updateExamCounter();
        showToast("🗑️ Koe poistettu");
    }
}

function updateExamCounter() {
    const upcomingExams = examList.filter(exam => new Date(exam.date) >= new Date()).length;
    const importantExams = examList.filter(exam => exam.importance === 'important' || exam.importance === 'critical').length;
    
    document.getElementById('examCounter').textContent = `${upcomingExams} tulossa`;
    document.getElementById('examBadge').textContent = importantExams > 0 ? importantExams : '0';
    
    // Lisää oranssi varoitus, jos on tärkeitä kokeita
    const badge = document.getElementById('examBadge');
    if (importantExams > 0) {
        badge.style.background = '#ff9800';
    } else {
        badge.style.background = 'var(--accent-color)';
    }
}

// ========== ARVOSANOJEN SEURANTA ==========
function showGradeTracker() {
    document.getElementById('gradeModal').style.display = 'flex';
    renderGradeList();
    updateGradeStats();
}

function closeGradeTracker() {
    document.getElementById('gradeModal').style.display = 'none';
}

function addGrade() {
    const subject = document.getElementById('gradeSubject').value.trim();
    const value = parseFloat(document.getElementById('gradeValue').value);
    const description = document.getElementById('gradeDescription').value.trim();

    if (subject && value >= 4 && value <= 10) {
        // Tarkista onko muokkaus vai uusi lisäys
        if (window.editingGradeId) {
            // Päivitä olemassa oleva arvosana
            gradeList = gradeList.map(grade => 
                grade.id === window.editingGradeId 
                    ? { ...grade, subject, value, description }
                    : grade
            );
            delete window.editingGradeId;
            showToast("✅ Arvosana päivitetty!");
        } else {
            // Lisää uusi arvosana
            const grade = {
                id: Date.now(),
                subject,
                value,
                description,
                date: new Date().toISOString()
            };
            gradeList.push(grade);
            showToast("📊 Arvosana lisätty!");
        }

        localStorage.setItem('gradeList', JSON.stringify(gradeList));
        renderGradeList();
        updateGradeStats();
        updateGradeCounter();
        
        // Tyhjennä kentät
        document.getElementById('gradeSubject').value = '';
        document.getElementById('gradeValue').value = '';
        document.getElementById('gradeDescription').value = '';
        
    } else {
        showToast("❌ Täytä aine ja arvosana (4-10)");
    }
}

function renderGradeList() {
    const container = document.getElementById('gradeList');
    if (!container) return;

    // Ryhmittele arvosanat aineittain
    const gradesBySubject = {};
    gradeList.forEach(grade => {
        if (!gradesBySubject[grade.subject]) {
            gradesBySubject[grade.subject] = [];
        }
        gradesBySubject[grade.subject].push(grade);
    });

    if (gradeList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎓</div>
                <h3>Ei arvosanoja</h3>
                <p>Lisää ensimmäinen arvosanasi yläpuolelta!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = Object.entries(gradesBySubject).map(([subject, grades]) => {
        const average = grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length;
        const gradeClass = getGradeClass(average);
        
        // Järjestä arvosanat uusimmat ensin
        const sortedGrades = [...grades].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return `
            <div class="grade-item ${gradeClass}">
                <div class="grade-header">
                    <strong>${subject}</strong>
                    <span class="grade-date">Keskiarvo: ${average.toFixed(2)}</span>
                </div>
                
                <div class="grade-list-container">
                    ${sortedGrades.map(grade => {
                        const date = new Date(grade.date).toLocaleDateString('fi-FI');
                        const individualGradeClass = getGradeClass(grade.value);
                        
                        return `
                            <div class="single-grade-item ${individualGradeClass}">
                                <div class="single-grade-header">
                                    <div class="single-grade-info">
                                        <span class="single-grade-value">${grade.value}</span>
                                        <span class="single-grade-date">${date}</span>
                                        ${grade.description ? `
                                            <span class="single-grade-description">${grade.description}</span>
                                        ` : ''}
                                    </div>
                                    <div class="single-grade-actions">
                                        <button onclick="editGrade(${grade.id})" class="edit-btn" title="Muokkaa">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="deleteSingleGrade(${grade.id})" class="delete-btn" title="Poista">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="grade-actions">
                    <button onclick="deleteSubjectGrades('${subject}')" class="delete-btn">🗑️ Poista koko aine</button>
                </div>
            </div>
        `;
    }).join('');
}

function getGradeClass(average) {
    if (average >= 9) return 'excellent';
    if (average >= 8) return 'good';
    if (average >= 7) return 'average';
    return 'poor';
}

function updateGradeStats() {
    if (gradeList.length === 0) {
        document.getElementById('averageGrade').textContent = '-';
        document.getElementById('totalGrades').textContent = '0';
        document.getElementById('bestSubject').textContent = '-';
        return;
    }

    const average = gradeList.reduce((sum, grade) => sum + grade.value, 0) / gradeList.length;
    
    // Etsi paras keskiarvo
    const subjectAverages = {};
    gradeList.forEach(grade => {
        if (!subjectAverages[grade.subject]) {
            subjectAverages[grade.subject] = { sum: 0, count: 0 };
        }
        subjectAverages[grade.subject].sum += grade.value;
        subjectAverages[grade.subject].count++;
    });

    let bestSubject = '-';
    let bestAverage = 0;
    
    Object.entries(subjectAverages).forEach(([subject, data]) => {
        const subjectAverage = data.sum / data.count;
        if (subjectAverage > bestAverage) {
            bestAverage = subjectAverage;
            bestSubject = subject;
        }
    });

    const averageGradeElement = document.getElementById('averageGrade');
    const totalGradesElement = document.getElementById('totalGrades');
    const bestSubjectElement = document.getElementById('bestSubject');
    
    if (averageGradeElement) averageGradeElement.textContent = average.toFixed(2);
    if (totalGradesElement) totalGradesElement.textContent = gradeList.length;
    
    // Lyhennä teksti tarvittaessa
    if (bestSubjectElement) {
        if (bestSubject.length > 10) {
            bestSubjectElement.textContent = bestSubject.substring(0, 8) + '...';
            bestSubjectElement.title = bestSubject; // Tooltip koko nimelle
        } else {
            bestSubjectElement.textContent = bestSubject;
            bestSubjectElement.title = '';
        }
        
        // Varmista että fontti päivittyy
        bestSubjectElement.style.fontFamily = document.body.style.fontFamily;
    }
}

function deleteSubjectGrades(subject) {
    if (confirm(`Haluatko varmasti poistaa kaikki arvosanat aineesta "${subject}"?`)) {
        gradeList = gradeList.filter(grade => grade.subject !== subject);
        localStorage.setItem('gradeList', JSON.stringify(gradeList));
        renderGradeList();
        updateGradeStats();
        updateGradeCounter();
        showToast(`🗑️ Arvosanat poistettu aineesta ${subject}`);
    }
}

function deleteSingleGrade(id) {
    if (confirm('Haluatko varmasti poistaa tämän arvosanan?')) {
        gradeList = gradeList.filter(grade => grade.id !== id);
        localStorage.setItem('gradeList', JSON.stringify(gradeList));
        renderGradeList();
        updateGradeStats();
        updateGradeCounter();
        showToast("🗑️ Arvosana poistettu");
    }
}

function updateGradeCounter() {
    document.getElementById('gradeCounter').textContent = `${gradeList.length} arvosanaa`;
}

// Lisää tämä funktio
function editGrade(id) {
    const grade = gradeList.find(g => g.id === id);
    if (grade) {
        document.getElementById('gradeSubject').value = grade.subject;
        document.getElementById('gradeValue').value = grade.value;
        document.getElementById('gradeDescription').value = grade.description || '';
        
        window.editingGradeId = id;
        
        showToast("✏️ Muokkaa arvosanaa ja paina 'Lisää arvosana' tallentaaksesi");
    }
}

// Lisää myös tämä funktio (jos sitä ei ole)
function deleteGrade(id) {
    if (confirm('Haluatko varmasti poistaa tämän arvosanan?')) {
        gradeList = gradeList.filter(grade => grade.id !== id);
        localStorage.setItem('gradeList', JSON.stringify(gradeList));
        renderGradeList();
        updateGradeStats();
        updateGradeCounter();
        showToast("🗑️ Arvosana poistettu");
    }
}

// ========== MUISTIINPANOJEN HALLINTA ==========
function showNotesManager() {
    document.getElementById('notesModal').style.display = 'flex';
    renderNotesList();
}

function closeNotesManager() {
    document.getElementById('notesModal').style.display = 'none';
}

// Päivitä addNote-funktio
function addNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const category = document.getElementById('noteCategory').value;

    if (title && content) {
        // Tarkista onko muokkaus vai uusi lisäys
        if (window.editingNoteId) {
            // Päivitä olemassa oleva muistiinpano
            notesList = notesList.map(note => 
                note.id === window.editingNoteId 
                    ? { ...note, title, content, category }
                    : note
            );
            delete window.editingNoteId;
            showToast("✅ Muistiinpano päivitetty!");
        } else {
            // Lisää uusi muistiinpano
            const note = {
                id: Date.now(),
                title,
                content,
                category,
                createdAt: new Date().toISOString()
            };
            notesList.push(note);
            showToast("📓 Muistiinpano lisätty!");
        }

        localStorage.setItem('notesList', JSON.stringify(notesList));
        renderNotesList();
        updateNotesCounter();
        
        // Tyhjennä kentät
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        
    } else {
        showToast("❌ Täytä otsikko ja sisältö");
    }
}

function renderNotesList() {
    const container = document.getElementById('notesList');
    if (!container) return;

    if (notesList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>Ei muistiinpanoja</h3>
                <p>Lisää ensimmäinen muistiinpanosi yläpuolelta!</p>
            </div>
        `;
        return;
    }

    // Järjestä uusimmat ensin
    const sortedNotes = [...notesList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = sortedNotes.map(note => {
        const categoryText = {
            general: 'Yleinen',
            homework: 'Kotitehtävät',
            exam: 'Kokeet',
            reminder: 'Muistutus'
        }[note.category];

        return `
            <div class="note-item ${note.category === 'reminder' ? 'important' : ''}">
                <div class="note-header">
                    <strong>${note.title}</strong>
                    <span class="note-date">${categoryText}</span>
                </div>
                <div class="note-content">${note.content}</div>
                <div class="note-actions">
                    <button onclick="editNote(${note.id})" class="edit-btn">✏️ Muokkaa</button>
                    <button onclick="deleteNote(${note.id})" class="delete-btn">🗑️ Poista</button>
                </div>
            </div>
        `;
    }).join('');
}

function editNote(id) {
    const note = notesList.find(n => n.id === id);
    if (note) {
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').value = note.content;
        document.getElementById('noteCategory').value = note.category;
        
        window.editingNoteId = id;
        
        showToast("✏️ Muokkaa muistiinpanoa ja paina 'Lisää muistiinpano' tallentaaksesi");
    }
}

function deleteNote(id) {
    if (confirm('Haluatko varmasti poistaa tämän muistiinpanon?')) {
        notesList = notesList.filter(note => note.id !== id);
        localStorage.setItem('notesList', JSON.stringify(notesList));
        renderNotesList();
        updateNotesCounter();
        showToast("🗑️ Muistiinpano poistettu");
    }
}

function updateNotesCounter() {
    document.getElementById('notesCounter').textContent = `${notesList.length} muistiinpanoa`;
}

// ========== ALUSTUS ==========
function initializeStudyTools() {
    // TARKISTA ETTÄ ELEMENTIT OVAT OLEMASSA ENNEN KUIN YRITÄT PÄIVITTÄÄ NIITÄ
    const homeworkCounter = document.getElementById('homeworkCounter');
    const examCounter = document.getElementById('examCounter');
    const gradeCounter = document.getElementById('gradeCounter');
    const notesCounter = document.getElementById('notesCounter');
    
    if (homeworkCounter) updateHomeworkCounter();
    if (examCounter) updateExamCounter();
    if (gradeCounter) updateGradeCounter();
    if (notesCounter) updateNotesCounter();
}

// Päivitä tools-sectionin tilastot
function updateToolsSection() {
    updateHomeworkCard();
    updateExamCard();
    updateGradeCard();
    updateNotesCard();
    updateTotalStats();
}

function updateHomeworkCard() {
    const activeHomework = homeworkList.filter(hw => !hw.completed).length;
    const overdueHomework = homeworkList.filter(hw => !hw.completed && isOverdue(hw.dueDate)).length;
    const dueSoonHomework = homeworkList.filter(hw => !hw.completed && !isOverdue(hw.dueDate) && getDaysUntilDue(hw.dueDate) <= 2).length;
    
    // Laske edistyminen
    const completedHomework = homeworkList.filter(hw => hw.completed).length;
    const totalHomework = homeworkList.length;
    const progress = totalHomework > 0 ? Math.round((completedHomework / totalHomework) * 100) : 0;
    
    // TARKISTA ETTÄ ELEMENTIT OVAT OLEMASSA ENNEN KUIN YRITÄT PÄIVITTÄÄ NIITÄ
    const homeworkCounter = document.getElementById('homeworkCounter');
    const homeworkBadgeCount = document.getElementById('homeworkBadgeCount');
    const homeworkProgress = document.getElementById('homeworkProgress');
    const homeworkProgressText = document.getElementById('homeworkProgressText');
    const homeworkDueSoon = document.getElementById('homeworkDueSoon');
    const homeworkBadge = document.getElementById('homeworkBadge');
    
    if (homeworkCounter) homeworkCounter.textContent = `${activeHomework} aktiivista tehtävää`;
    if (homeworkBadgeCount) homeworkBadgeCount.textContent = overdueHomework;
    if (homeworkProgress) homeworkProgress.style.width = `${progress}%`;
    if (homeworkProgressText) homeworkProgressText.textContent = `${progress}% valmiina`;
    if (homeworkDueSoon) homeworkDueSoon.textContent = `${dueSoonHomework} määräaikana`;
    
    // Päivitä badge väri
    if (homeworkBadge) {
        if (overdueHomework > 0) {
            homeworkBadge.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
        } else if (dueSoonHomework > 0) {
            homeworkBadge.style.background = 'linear-gradient(135deg, #ffa726, #ff9800)';
        } else {
            homeworkBadge.style.background = 'linear-gradient(135deg, #66bb6a, #4caf50)';
        }
    }
}

function updateExamCard() {
    const now = new Date();
    const upcomingExams = examList.filter(exam => new Date(exam.date) >= now);
    const importantExams = examList.filter(exam => exam.importance === 'important' || exam.importance === 'critical');
    
    // Etsi seuraava koetentse
    const nextExam = upcomingExams.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    const daysToNextExam = nextExam ? Math.ceil((new Date(nextExam.date) - now) / (1000 * 3600 * 24)) : '-';
    
    // TARKISTA ELEMENTTIEN OLEMASSAOLO
    const examCounter = document.getElementById('examCounter');
    const examBadgeCount = document.getElementById('examBadgeCount');
    const nextExamDays = document.getElementById('nextExamDays');
    const importantExamsCount = document.getElementById('importantExamsCount');
    const upcomingExamsCount = document.getElementById('upcomingExamsCount');
    const examBadge = document.getElementById('examBadge');
    
    if (examCounter) examCounter.textContent = `${upcomingExams.length} tulossa`;
    if (examBadgeCount) examBadgeCount.textContent = importantExams.length;
    if (nextExamDays) nextExamDays.textContent = daysToNextExam;
    if (importantExamsCount) importantExamsCount.textContent = importantExams.length;
    if (upcomingExamsCount) upcomingExamsCount.textContent = `${upcomingExams.length} Kokeet`;
    
    // Päivitä badge väri
    if (examBadge) {
        if (importantExams.length > 0) {
            examBadge.style.background = 'linear-gradient(135deg, #f5576c, #e91e63)';
        } else {
            examBadge.style.background = 'linear-gradient(135deg, #4ecdc4, #00acc1)';
        }
    }
}

function updateGradeCard() {
    if (gradeList.length === 0) {
        document.getElementById('gradeAverage').textContent = '-.-';
        document.getElementById('gradeCounter').textContent = '0 arvosanaa tallennettuna';
        document.getElementById('totalGrades').textContent = '0';
        document.getElementById('bestGrade').textContent = '-';
        document.getElementById('gradeSubjects').textContent = '0 ainetta';
        return;
    }
    
    const average = gradeList.reduce((sum, grade) => sum + grade.value, 0) / gradeList.length;
    
    // Etsi paras arvosana
    const bestGrade = Math.max(...gradeList.map(grade => grade.value));
    
    // Laske aineiden määrä
    const subjects = new Set(gradeList.map(grade => grade.subject));
    
    document.getElementById('gradeAverage').textContent = average.toFixed(1);
    document.getElementById('gradeCounter').textContent = `${gradeList.length} arvosanaa tallennettuna`;
    document.getElementById('totalGrades').textContent = gradeList.length;
    document.getElementById('bestGrade').textContent = bestGrade;
    document.getElementById('gradeSubjects').textContent = `${subjects.size} ainetta`;
}

function updateNotesCard() {
    const homeworkNotes = notesList.filter(note => note.category === 'homework').length;
    const examNotes = notesList.filter(note => note.category === 'exam').length;
    const reminderNotes = notesList.filter(note => note.category === 'reminder').length;
    
    // Etsi uusin muistiinpano
    const recentNote = notesList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const recentText = recentNote ? 
        `Viimeisin: ${recentNote.title.substring(0, 10)}...` : 
        'Ei uusia';
    
    document.getElementById('notesCounter').textContent = `${notesList.length} muistiinpanoa`;
    document.getElementById('notesCount').textContent = notesList.length;
    document.getElementById('notesHomework').textContent = homeworkNotes;
    document.getElementById('notesExam').textContent = examNotes;
    document.getElementById('notesReminder').textContent = reminderNotes;
    document.getElementById('recentNotes').textContent = recentText;
}

function updateTotalStats() {
    const activeHomework = homeworkList.filter(hw => !hw.completed).length;
    const upcomingExams = examList.filter(exam => new Date(exam.date) >= new Date()).length;
    const totalActive = activeHomework + upcomingExams;
    
    document.getElementById('totalTasks').textContent = totalActive;
}

// Apufunktiot
function getDaysUntilDue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

// Pikalisäysfunktiot
function addQuickHomework() {
    // Avaa kotitehtävien hallinta ja fokusoi syötekenttään
    showHomeworkManager();
    setTimeout(() => {
        document.getElementById('homeworkSubject').focus();
    }, 300);
}

function addQuickExam() {
    showExamTracker();
    setTimeout(() => {
        document.getElementById('examSubject').focus();
    }, 300);
}

function addQuickNote() {
    showNotesManager();
    setTimeout(() => {
        document.getElementById('noteTitle').focus();
    }, 300);
}

// Alusta tools-section sivun latautuessa
document.addEventListener('DOMContentLoaded', function() {
    // ODOTA ETTÄ KAIKKI ELEMENTIT ON LADATTU
    setTimeout(() => {
        const totalTasks = document.getElementById('totalTasks');
        if (totalTasks) {
            updateToolsSection();
        }
    }, 100);
    
    // Päivitä tools-section minuutin välein
    setInterval(updateToolsSection, 60000);
});

// 🧭 Asetukset-välilehdet
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.settings-tab');
  const contents = document.querySelectorAll('.settings-tab-content');
  const modal = document.getElementById('settingsModal');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Sulje Escillä
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========== USER AUTHENTICATION SYSTEM ==========
let currentUser = null;
let authToken = null;
const API_BASE_URL = 'https://your-backend-api.com'; // Replace with your actual backend URL

// Mock backend for demonstration (replace with real API calls)
const mockBackend = {
    users: JSON.parse(localStorage.getItem('mockUsers')) || [],
    userData: JSON.parse(localStorage.getItem('mockUserData')) || {}
};

// Initialize authentication system
function initializeAuth() {
    checkExistingSession();
    setupAuthEventListeners();
    updateAuthUI();
}

// Check if user is already logged in
function checkExistingSession() {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        authToken = savedToken;
        loadUserData();
    } else {
        // Show auth modal on first visit if not logged in
        setTimeout(() => {
            if (!currentUser) {
                showAuthModal();
            }
        }, 2000);
    }
}

// Setup authentication event listeners
function setupAuthEventListeners() {
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchAuthTab(tabName);
        });
    });

    // Profile button
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser) {
                showProfileModal();
            } else {
                showAuthModal();
            }
        });
    }

    // Enter key in auth forms
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const authModal = document.getElementById('authModal');
            if (authModal.style.display === 'flex') {
                if (document.getElementById('loginForm').classList.contains('active')) {
                    login();
                } else if (document.getElementById('registerForm').classList.contains('active')) {
                    register();
                }
            }
        }
    });
}

// Switch between login/register tabs
function switchAuthTab(tabName) {
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    document.querySelector(`.auth-tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Form`).classList.add('active');
}

// Show auth modal
function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('loginEmail').focus();
}

// Close auth modal
function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Show login form
function showLogin() {
    switchAuthTab('login');
}

// Show forgot password form
function showForgotPassword() {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById('forgotPasswordForm').classList.add('active');
}

// Show profile modal
function showProfileModal() {
    updateProfileInfo();
    document.getElementById('profileModal').style.display = 'flex';
}

// Close profile modal
function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

// Register new user
async function register() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (!name || !email || !password) {
        showToast('❌ Täytä kaikki kentät');
        return;
    }

    if (password.length < 6) {
        showToast('❌ Salasanan tulee olla vähintään 6 merkkiä');
        return;
    }

    if (password !== confirmPassword) {
        showToast('❌ Salasanat eivät täsmää');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('❌ Syötä kelvollinen sähköpostiosoite');
        return;
    }

    showSyncStatus('Rekisteröidään...', 'syncing');

    try {
        // Check if user already exists
        const existingUser = mockBackend.users.find(user => user.email === email);
        if (existingUser) {
            throw new Error('Käyttäjä on jo olemassa');
        }

        // Create new user
        const newUser = {
            id: generateId(),
            name,
            email,
            password: await hashPassword(password), // In real app, hash properly
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        mockBackend.users.push(newUser);
        localStorage.setItem('mockUsers', JSON.stringify(mockBackend.users));

        // Create user data storage
        mockBackend.userData[newUser.id] = {
            settings: {},
            periods: {},
            homework: [],
            exams: [],
            grades: [],
            notes: []
        };
        localStorage.setItem('mockUserData', JSON.stringify(mockBackend.userData));

        // Auto login after registration
        await performLogin(email, password);

    } catch (error) {
        showSyncStatus('Rekisteröinti epäonnistui', 'error');
        showToast(`❌ ${error.message}`);
    }
}

// Login user
async function login() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('❌ Täytä sähköposti ja salasana');
        return;
    }

    showSyncStatus('Kirjaudutaan sisään...', 'syncing');

    try {
        await performLogin(email, password);
    } catch (error) {
        showSyncStatus('Kirjautuminen epäonnistui', 'error');
        showToast(`❌ ${error.message}`);
    }
}

// Perform login
async function performLogin(email, password) {
    const user = mockBackend.users.find(u => u.email === email);
    
    if (!user) {
        throw new Error('Käyttäjää ei löytynyt');
    }

    // In real app, verify hashed password
    if (user.password !== await hashPassword(password)) {
        throw new Error('Väärä salasana');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    localStorage.setItem('mockUsers', JSON.stringify(mockBackend.users));

    // Set current user
    currentUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };
    
    authToken = generateToken();
    
    // Save session
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('authToken', authToken);

    // Load user data
    await loadUserData();

    // Update UI
    updateAuthUI();
    closeAuthModal();
    
    showSyncStatus('Kirjauduttu sisään!', 'success');
    showToast(`👋 Tervetuloa ${user.name}!`);
}

// Logout user
function logout() {
    if (confirm('Haluatko varmasti kirjautua ulos?')) {
        // Sync before logout
        syncData().finally(() => {
            currentUser = null;
            authToken = null;
            
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            
            updateAuthUI();
            closeProfileModal();
            
            showToast('👋 Olet kirjautunut ulos');
            
            // Show auth modal after logout
            setTimeout(showAuthModal, 1000);
        });
    }
}

// Reset password
function resetPassword() {
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!email) {
        showToast('❌ Syötä sähköpostiosoite');
        return;
    }

    showSyncStatus('Lähetetään reset-linkkiä...', 'syncing');
    
    // Simulate API call
    setTimeout(() => {
        showSyncStatus('Reset-linkki lähetetty!', 'success');
        showToast('📧 Tarkista sähköpostisi reset-linkkiä varten');
        showLogin();
    }, 2000);
}

// Load user data from cloud
async function loadUserData() {
    if (!currentUser) return;

    showSyncStatus('Ladataan käyttäjätietoja...', 'syncing');

    try {
        const userData = mockBackend.userData[currentUser.id];
        
        if (userData) {
            // Load settings
            if (userData.settings) {
                Object.keys(userData.settings).forEach(key => {
                    localStorage.setItem(key, userData.settings[key]);
                });
            }

            // Load periods
            if (userData.periods) {
                Object.keys(userData.periods).forEach(periodId => {
                    localStorage.setItem(`periodSettings_${periodId}`, JSON.stringify(userData.periods[periodId]));
                });
            }

            // Load other data
            if (userData.homework) {
                homeworkList = userData.homework;
                localStorage.setItem('homeworkList', JSON.stringify(homeworkList));
            }

            if (userData.exams) {
                examList = userData.exams;
                localStorage.setItem('examList', JSON.stringify(examList));
            }

            if (userData.grades) {
                gradeList = userData.grades;
                localStorage.setItem('gradeList', JSON.stringify(gradeList));
            }

            if (userData.notes) {
                notesList = userData.notes;
                localStorage.setItem('notesList', JSON.stringify(notesList));
            }

            // Reload the app with new data
            initializeApp();
            
            showSyncStatus('Tiedot ladattu!', 'success');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showSyncStatus('Virhe tiedoissa', 'error');
    }
}

// Sync data to cloud
async function syncData() {
    if (!currentUser) {
        showToast('❌ Kirjaudu sisään synkronoidaksesi');
        return;
    }

    showSyncStatus('Synkronoidaan...', 'syncing');

    try {
        // Collect all local data
        const userData = {
            settings: getAllSettings(),
            periods: getAllPeriods(),
            homework: homeworkList,
            exams: examList,
            grades: gradeList,
            notes: notesList,
            lastSync: new Date().toISOString()
        };

        // Save to cloud (mock backend)
        mockBackend.userData[currentUser.id] = userData;
        localStorage.setItem('mockUserData', JSON.stringify(mockBackend.userData));

        // Update last sync time
        if (mockBackend.users) {
            const userIndex = mockBackend.users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                mockBackend.users[userIndex].lastSync = new Date().toISOString();
                localStorage.setItem('mockUsers', JSON.stringify(mockBackend.users));
            }
        }

        showSyncStatus('Synkronoitu!', 'success');
        showToast('✅ Tiedot synkronoitu pilveen');
        
        // Update profile info
        updateProfileInfo();

    } catch (error) {
        console.error('Sync error:', error);
        showSyncStatus('Synkronointi epäonnistui', 'error');
        showToast('❌ Synkronointi epäonnistui');
    }
}

// Get all settings from localStorage
function getAllSettings() {
    const settings = {};
    const settingKeys = [
        'theme', 'font', 'fontSize', 'customSubjects', 'meals', 
        'singleEvents', 'slotColors', 'examWeek'
    ];
    
    settingKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            settings[key] = value;
        }
    });
    
    return settings;
}

// Get all periods from localStorage
function getAllPeriods() {
    const periods = {};
    for (let i = 1; i <= 5; i++) {
        const periodData = localStorage.getItem(`periodSettings_${i}`);
        if (periodData) {
            periods[i] = JSON.parse(periodData);
        }
    }
    return periods;
}

// Update authentication UI
function updateAuthUI() {
    const profileBtn = document.getElementById('profileBtn');
    const userBadge = document.querySelector('.user-badge');
    
    if (currentUser) {
        // User is logged in
        if (profileBtn) {
            profileBtn.innerHTML = '<i class="fas fa-user" aria-hidden="true"></i><span>Profiili</span>';
        }
        
        if (userBadge) {
            userBadge.textContent = `👤 ${currentUser.name}`;
            userBadge.classList.add('visible');
            userBadge.onclick = showProfileModal;
        }
        
        // Setup auto-sync
        setupAutoSync();
        
    } else {
        // User is not logged in
        if (profileBtn) {
            profileBtn.innerHTML = '<i class="fas fa-sign-in-alt" aria-hidden="true"></i><span>Kirjaudu</span>';
        }
        
        if (userBadge) {
            userBadge.classList.remove('visible');
        }
    }
}

// Update profile information
function updateProfileInfo() {
    if (!currentUser) return;

    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    
    // Calculate stats
    const periodCount = Object.keys(getAllPeriods()).length;
    const lastSync = getLastSyncTime();
    
    document.getElementById('profilePeriods').textContent = periodCount;
    document.getElementById('profileLastSync').textContent = lastSync;
    
    // Update avatar with first letter
    const firstLetter = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('profileAvatar').textContent = firstLetter;
}

// Get last sync time
function getLastSyncTime() {
    if (!currentUser || !mockBackend.users) return '-';
    
    const user = mockBackend.users.find(u => u.id === currentUser.id);
    if (!user || !user.lastSync) return '-';
    
    const lastSync = new Date(user.lastSync);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSync) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Juuri nyt';
    if (diffMinutes < 60) return `${diffMinutes} min sitten`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} h sitten`;
    
    return lastSync.toLocaleDateString('fi-FI');
}

// Setup auto-sync
function setupAutoSync() {
    const autoSync = localStorage.getItem('autoSync') !== 'false';
    
    if (autoSync && currentUser) {
        // Sync every 5 minutes
        setInterval(() => {
            if (navigator.onLine) {
                syncData();
            }
        }, 5 * 60 * 1000);
        
        // Sync when coming online
        window.addEventListener('online', () => {
            syncData();
        });
    }
}

// Export user data
function exportUserData() {
    const userData = {
        user: currentUser,
        settings: getAllSettings(),
        periods: getAllPeriods(),
        homework: homeworkList,
        exams: examList,
        grades: gradeList,
        notes: notesList,
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `rauman-lukio-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showToast('📤 Tiedot vietu onnistuneesti');
}

// Show sync status
function showSyncStatus(message, type) {
    let statusEl = document.querySelector('.sync-status');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.className = 'sync-status';
        document.body.appendChild(statusEl);
    }
    
    statusEl.textContent = message;
    statusEl.className = `sync-status ${type}`;
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateToken() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

async function hashPassword(password) {
    // In real app, use proper hashing like bcrypt
    // This is just a simple demo version
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Modify existing functions to auto-sync when user is logged in
function wrapWithSync(originalFunction) {
    return function(...args) {
        const result = originalFunction.apply(this, args);
        
        // Auto-sync after data changes if user is logged in
        if (currentUser && localStorage.getItem('autoSync') !== 'false') {
            setTimeout(syncData, 1000);
        }
        
        return result;
    };
}

// Wrap data-modifying functions with auto-sync
const syncWrappedFunctions = [
    'savePeriodSettings',
    'saveMeals',
    'saveSchedule',
    'addHomework',
    'toggleHomework',
    'deleteHomework',
    'addExam',
    'deleteExam',
    'addGrade',
    'deleteGrade',
    'addNote',
    'deleteNote',
    'saveExamWeek'
];

syncWrappedFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
        window[funcName] = wrapWithSync(window[funcName]);
    }
});

// Initialize auth system when app loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});
