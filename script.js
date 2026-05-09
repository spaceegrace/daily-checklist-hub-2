/* =========================================================
   PROGRESS POND V25
   Expanded Health + Mood Analytics System
========================================================== */

(function () {

    // =====================================================
    // DATA MODEL
    // =====================================================

    var pondData = {

        daily: [],
        history: [],

        moodLog: [],
        sugarLog: [],
        carbLog: [],
        waterLog: [],

        insulinLog: [],
        sleepLog: [],
        stressLog: [],
        energyLog: [],
        symptomLog: [],
        exerciseLog: [],

        analytics: [],

        waterCount: 0,

        streak: 0,
        lastStreakDate: null
    };

    var pondChart = null;

    // =====================================================
    // SCORE MAPS
    // =====================================================

    var moodScores = {
        "Manic": 10,
        "Happy": 9,
        "Focused": 8,
        "Calm": 7,
        "Tired": 6,
        "Confused": 5,
        "Grumpy": 4,
        "Angry": 3,
        "Sad": 2,
        "Crying": 1
    };

    var energyScores = {
        "Exhausted": 1,
        "Low": 3,
        "Okay": 5,
        "Good": 7,
        "Energetic": 10
    };

    var stressScores = {
        "Calm": 1,
        "Mild": 3,
        "Moderate": 5,
        "High": 7,
        "Extreme": 10
    };

    var moodEmojis = {
        Happy: "😊",
        Calm: "😌",
        Focused: "🧐",
        Tired: "😴",
        Grumpy: "😠",
        Confused: "😕",
        Angry: "😡",
        Sad: "😢",
        Crying: "😭",
        Manic: "🤪"
    };

    // =====================================================
    // QUOTES
    // =====================================================

    var frogQuotes = [

        "🐸 💖 Ribbit! You're doing amazing! 💞 🐸",
        "✨ 🐸 Take a deep breath, little froggy! 💗 ✨",
        "🌸 🐸 Every hop counts! I'm proud of you! 💖 🌸",
        "💕 🐸 Stay hydrated and stay happy! 🐸 💕",
        "🐸 💗 You are the best frog in the pond! ✨ 🐸",
        "🐸 ✨ Leap into happiness! ✨ 🐸",
        "🐸 Don't worry, be hoppy! 🐸",
        "🐸 🌈 Keep calm and leap on! 🌈 🐸"

    ];

    // =====================================================
    // INIT
    // =====================================================

    window.onload = function () {

        loadStorage();

        document.getElementById('motivationText').textContent =
            frogQuotes[Math.floor(Math.random() * frogQuotes.length)];

        resetTimePicker();

        setupButtons();

        renderAll();
    };

    // =====================================================
    // STORAGE
    // =====================================================

    function loadStorage() {

        var saved =
            localStorage.getItem('ProgressPond_V25');

        if (!saved) return;

        try {

            var parsed = JSON.parse(saved);

            for (var key in parsed) {
                pondData[key] = parsed[key];
            }

        } catch (e) {

            console.error("Load Error:", e);
        }
    }

    function saveAndRefresh() {

        localStorage.setItem(
            'ProgressPond_V25',
            JSON.stringify(pondData)
        );

        renderAll();
    }

    // =====================================================
    // BUTTON SETUP
    // =====================================================

    function setupButtons() {

        function setClick(id, fn) {

            var el = document.getElementById(id);

            if (el) el.onclick = fn;
        }

        // =========================
        // BASIC BUTTONS
        // =========================

        setClick('addDailyBtn', addHop);

        setClick('addSugarBtn', addSugar);

        setClick('addCarbBtn', addCarb);

        setClick('addInsulinBtn', addInsulin);

        setClick('resetPondBtn', resetToday);

        setClick('clearHistoryBtn', clearEverything);

        setClick('clearWaterBtn', clearWater);

        setClick('historyToggle', function () {

            document
                .getElementById('historyFooter')
                .classList.toggle('collapsed');
        });

        // =========================
        // BANNER
        // =========================

        setClick('bannerClose', function () {

            document.getElementById(
                'motivationBar'
            ).style.display = 'none';
        });

        // =========================
        // MOOD BUTTONS
        // =========================

        document
            .querySelectorAll('.mood-btn')
            .forEach(btn => {

                btn.onclick = function () {

                    addLog('moodLog', {

                        type: 'mood',

                        val:
                            this.getAttribute('data-mood'),

                        icon:
                            moodEmojis[
                            this.getAttribute('data-mood')
                            ],

                        fullDate:
                            currentFullDate(
                                getSelectedTime()
                            )
                    });
                };
            });

        // =========================
        // WATER BUTTONS
        // =========================

        document
            .querySelectorAll('.drop-btn')
            .forEach((btn, index) => {

                btn.onclick = function () {

                    const active =
                        btn.classList.contains('active');

                    if (active) {

                        btn.classList.remove('active');

                        pondData.waterCount =
                            Math.max(
                                0,
                                pondData.waterCount - 1
                            );

                    } else {

                        btn.classList.add('active');

                        pondData.waterCount =
                            index + 1;

                        addLog('waterLog', {

                            type: 'water',

                            val: pondData.waterCount,

                            icon: "💧",

                            fullDate:
                                currentFullDate(
                                    getSelectedTime()
                                )
                        });
                    }

                    saveAndRefresh();
                };
            });
    }

    // =====================================================
    // TIME HELPERS
    // =====================================================

    function getSelectedTime() {

        var timeInput =
            document.getElementById('manualTimeInput');

        return timeInput
            ? timeInput.value
            : null;
    }

    function resetTimePicker() {

        var now = new Date();

        document.getElementById(
            'manualTimeInput'
        ).value =

            now.getHours()
                .toString()
                .padStart(2, '0')

            + ":"

            + now.getMinutes()
                .toString()
                .padStart(2, '0');
    }

    function currentFullDate(manualTime) {

        var now = new Date();

        var timeStr = manualTime ||

            now.toLocaleTimeString('en-GB', {

                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

        return now.toLocaleDateString([], {

            month: 'short',
            day: 'numeric'

        }) + " @ " + timeStr;
    }

    // =====================================================
    // UNIVERSAL LOGGING
    // =====================================================

    function addLog(logArray, payload) {

        pondData[logArray].push({

            id: Date.now(),

            ...payload
        });

        saveAndRefresh();
    }

    // =====================================================
    // TASKS
    // =====================================================

    function addHop() {

        var input =
            document.getElementById('dailyInput');

        if (!input.value.trim()) return;

        pondData.daily.push({

            id: Date.now(),

            text: input.value,

            priority:
                document.getElementById(
                    'priorityInput'
                ).value
        });

        input.value = "";

        saveAndRefresh();
    }

    window.toggleHop = function (id) {

        var idx =
            pondData.daily.findIndex(
                g => g.id === id
            );

        if (idx > -1) {

            var item =
                pondData.daily.splice(idx, 1)[0];

            pondData.history.push({

                id: Date.now(),

                text:
                    "[" +
                    item.priority +
                    "] " +
                    item.text,

                fullDate:
                    currentFullDate()
            });

            saveAndRefresh();
        }
    };

    window.deleteHop = function (id) {

        pondData.daily =
            pondData.daily.filter(
                g => g.id !== id
            );

        saveAndRefresh();
    };

    // =====================================================
    // HEALTH
    // =====================================================

    function addSugar() {

        var input =
            document.getElementById('sugarInput');

        var val = parseInt(input.value);

        if (!val) return;

        addLog('sugarLog', {

            type: 'sugar',

            val: val,

            color:
                (val < 70 || val > 250)
                    ? "#ff4d4d"
                    : (val > 180)
                        ? "#ffa500"
                        : "#2d5a27",

            fullDate:
                currentFullDate(
                    getSelectedTime()
                )
        });

        input.value = "";
    }

    function addCarb() {

        var input =
            document.getElementById('carbInput');

        var val = parseInt(input.value);

        if (!val) return;

        addLog('carbLog', {

            type: 'carb',

            val: val,

            fullDate:
                currentFullDate(
                    getSelectedTime()
                )
        });

        input.value = "";
    }

    function addInsulin() {

        var input =
            document.getElementById('insulinInput');

        if (!input) return;

        var val = parseFloat(input.value);

        if (!val) return;

        addLog('insulinLog', {

            type: 'insulin',

            val: val,

            fullDate:
                currentFullDate(
                    getSelectedTime()
                )
        });

        input.value = "";
    }

    // =====================================================
    // EXTRA TRACKING
    // =====================================================

    window.addStress = function (level) {

        addLog('stressLog', {

            type: 'stress',

            val: level,

            score: stressScores[level],

            fullDate:
                currentFullDate(
                    getSelectedTime()
                )
        });
    };

    window.addEnergy = function (level) {

        addLog('energyLog', {

            type: 'energy',

            val: level,

            score: energyScores[level],

            fullDate:
                currentFullDate(
                    getSelectedTime()
                )
        });
    };

    window.addSymptom = function (symptom) {

        addLog('symptomLog', {

            type: 'symptom',

            symptom: symptom,

            fullDate:
                currentFullDate(
                    getSelectedTime()
                )
        });
    };

    window.addExercise = function (
        type,
        duration,
        intensity
    ) {

        addLog('exerciseLog', {

            type: 'exercise',

            exerciseType: type,

            duration: duration,

            intensity: intensity,

            fullDate:
                currentFullDate(
                    getSelectedTime()
                )
        });
    };

    // =====================================================
    // RESETS
    // =====================================================

    function clearWater() {

        pondData.waterCount = 0;

        pondData.waterLog = [];

        saveAndRefresh();
    }

    function resetToday() {

        if (!confirm("Reset today?"))
            return;

        pondData.daily = [];

        pondData.waterCount = 0;

        pondData.waterLog = [];

        resetTimePicker();

        saveAndRefresh();
    }

    function clearEverything() {

        if (!confirm("Delete ALL data?"))
            return;

        localStorage.removeItem(
            'ProgressPond_V25'
        );

        location.reload();
    }

    // =====================================================
    // DELETE LOGS
    // =====================================================

    window.deleteLogItem = function (
        type,
        id
    ) {

        if (!confirm("Delete entry?"))
            return;

        var map = {

            mood: 'moodLog',
            sugar: 'sugarLog',
            carb: 'carbLog',
            insulin: 'insulinLog',
            water: 'waterLog',
            stress: 'stressLog',
            energy: 'energyLog',
            symptom: 'symptomLog',
            exercise: 'exerciseLog',
            hop: 'history'
        };

        if (map[type]) {

            pondData[map[type]] =
                pondData[map[type]]
                    .filter(i => i.id !== id);
        }

        saveAndRefresh();
    };

    // =====================================================
    // ANALYTICS
    // =====================================================

    function calculateStabilityScore() {

        if (pondData.sugarLog.length < 2)
            return 100;

        let totalVariation = 0;

        for (let i = 1; i < pondData.sugarLog.length; i++) {

            totalVariation += Math.abs(

                pondData.sugarLog[i].val -

                pondData.sugarLog[i - 1].val
            );
        }

        let avgVariation =
            totalVariation /
            (pondData.sugarLog.length - 1);

        return Math.max(
            0,
            Math.round(100 - avgVariation)
        );
    }

    function calculateDailyStats() {

        let sugars =
            pondData.sugarLog.map(s => s.val);

        if (!sugars.length) return null;

        let avg =
            sugars.reduce((a, b) => a + b, 0)
            / sugars.length;

        return {

            avg: Math.round(avg),

            max: Math.max(...sugars),

            min: Math.min(...sugars),

            stability:
                calculateStabilityScore()
        };
    }

    // =====================================================
    // RENDER
    // =====================================================

    function renderAll() {

        renderBasicUI();

        renderTasks();

        renderAnalytics();

        renderHistory();

        renderChart();
    }

    // =====================================================
    // BASIC UI
    // =====================================================

    function renderBasicUI() {

        document.getElementById(
            'currentDate'
        ).textContent =

            new Date().toLocaleDateString(
                'en-US',
                {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                }
            );

        document
            .querySelectorAll('.drop-btn')
            .forEach((btn, i) => {

                if (i < pondData.waterCount)
                    btn.classList.add('active');

                else
                    btn.classList.remove('active');
            });

        var waterText =
            document.getElementById(
                'waterCountText'
            );

        if (waterText) {

            waterText.textContent =
                pondData.waterCount + " / 8";
        }
    }

    // =====================================================
    // TASKS
    // =====================================================

    function renderTasks() {

        var listHtml = "";

        for (var i = 0; i < pondData.daily.length; i++) {

            var g = pondData.daily[i];

            listHtml += `

            <li style="
                display:flex;
                align-items:center;
                gap:10px;
                margin-bottom:10px;
                background:white;
                padding:8px;
                border-radius:10px;
            ">

                <input
                    type="checkbox"
                    onchange="toggleHop(${g.id})"
                >

                <span style="flex:1">
                    ${g.text}
                    <small>(${g.priority})</small>
                </span>

                <button
                    onclick="deleteHop(${g.id})"
                    style="
                        background:none;
                        border:none;
                        color:red;
                        cursor:pointer;
                    "
                >
                    ×
                </button>

            </li>
            `;
        }

        document.getElementById(
            'dailyList'
        ).innerHTML =

            listHtml ||
            "No active hops...";

        var total =
            pondData.daily.length +
            pondData.history.length;

        var percent =
            total
                ? Math.round(
                    (pondData.history.length / total)
                    * 100
                )
                : 0;

        document.getElementById(
            'dailyProgress'
        ).style.width = percent + '%';

        document.getElementById(
            'dailyProgressText'
        ).textContent = percent + '%';
    }

    // =====================================================
    // ANALYTICS
    // =====================================================

    function renderAnalytics() {

        let stats = calculateDailyStats();

        let panel =
            document.getElementById(
                'analyticsPanel'
            );

        if (!panel || !stats) return;

        panel.innerHTML = `

            <div>📊 Avg: ${stats.avg}</div>

            <div>⬆️ High: ${stats.max}</div>

            <div>⬇️ Low: ${stats.min}</div>

            <div>🌊 Stability: ${stats.stability}%</div>
        `;
    }

    // =====================================================
    // HISTORY BAR
    // =====================================================

    function renderHistory() {

        // =========================
        // HOPS HISTORY
        // =========================

        var hopHistory =
            document.getElementById(
                'dailyHistoryList'
            );

        if (hopHistory) {

            hopHistory.innerHTML =

                pondData.history
                    .slice()
                    .reverse()
                    .slice(0, 20)

                    .map(h => `

                    <div class="history-item">

                        <div>

                            🌿 ${h.text}

                            <small>
                                ${h.fullDate}
                            </small>

                        </div>

                        <button
                            onclick="deleteLogItem('hop', ${h.id})"
                        >
                            ×
                        </button>

                    </div>

                `).join('');
        }

        // =========================
        // TRACKER HISTORY
        // =========================

        var combined = [

            ...pondData.moodLog.map(m => ({
                ...m,
                display:
                    `${m.icon} ${m.val}`,
                logType: 'mood'
            })),

            ...pondData.sugarLog.map(s => ({
                ...s,
                display:
                    `🩸 ${s.val} mg/dL`,
                logType: 'sugar'
            })),

            ...pondData.carbLog.map(c => ({
                ...c,
                display:
                    `🥣 ${c.val}g carbs`,
                logType: 'carb'
            })),

            ...pondData.insulinLog.map(i => ({
                ...i,
                display:
                    `💉 ${i.val} units`,
                logType: 'insulin'
            })),

            ...pondData.waterLog.map(w => ({
                ...w,
                display:
                    `💧 Water #${w.val}`,
                logType: 'water'
            })),

            ...pondData.stressLog.map(s => ({
                ...s,
                display:
                    `🧠 Stress: ${s.val}`,
                logType: 'stress'
            })),

            ...pondData.energyLog.map(e => ({
                ...e,
                display:
                    `⚡ Energy: ${e.val}`,
                logType: 'energy'
            })),

            ...pondData.symptomLog.map(sym => ({
                ...sym,
                display:
                    `🩺 ${sym.symptom}`,
                logType: 'symptom'
            })),

            ...pondData.exerciseLog.map(ex => ({
                ...ex,
                display:
                    `🏃 ${ex.exerciseType} (${ex.duration}m)`,
                logType: 'exercise'
            }))

        ].sort((a, b) => b.id - a.id);

        var tracker =
            document.getElementById(
                'moodHistoryList'
            );

        if (tracker) {

            tracker.innerHTML =

                combined
                    .slice(0, 40)

                    .map(item => `

                    <div class="history-item">

                        <div>

                            ${item.display}

                            <small>
                                ${item.fullDate}
                            </small>

                        </div>

                        <button
                            onclick="deleteLogItem('${item.logType}', ${item.id})"
                        >
                            ×
                        </button>

                    </div>

                `).join('');
        }
    }

    // =====================================================
    // CHART
    // =====================================================

    function renderChart() {

        var canvas =
            document.getElementById(
                'healthChart'
            );

        if (!canvas || typeof Chart === 'undefined')
            return;

        var ctx = canvas.getContext('2d');

        var getTime = fd =>

            fd
                ? fd.split('@')[1].trim()
                : "00:00";

        var allEntries = [

            ...pondData.sugarLog,
            ...pondData.moodLog,
            ...pondData.carbLog,
            ...pondData.waterLog,
            ...pondData.insulinLog,
            ...pondData.stressLog,
            ...pondData.energyLog

        ].sort((a, b) => a.id - b.id);

        var labels = [

            ...new Set(
                allEntries.map(
                    e => getTime(e.fullDate)
                )
            )
        ];

        var datasets = [];

        // =========================
        // GLUCOSE
        // =========================

        if (pondData.sugarLog.length > 0) {

            datasets.push({

                label: 'Glucose',

                data:
                    pondData.sugarLog.map(s => ({
                        x: getTime(s.fullDate),
                        y: s.val
                    })),

                borderColor: '#ef4444',

                tension: 0.3,

                yAxisID: 'y'
            });
        }

        // =========================
        // MOOD
        // =========================

        if (pondData.moodLog.length > 0) {

            datasets.push({

                label: 'Mood',

                data:
                    pondData.moodLog.map(m => ({
                        x: getTime(m.fullDate),
                        y: moodScores[m.val] || 5
                    })),

                borderColor: '#f59e0b',

                tension: 0.3,

                yAxisID: 'yMood'
            });
        }

        // =========================
        // INSULIN
        // =========================

        if (pondData.insulinLog.length > 0) {

            datasets.push({

                label: 'Insulin',

                data:
                    pondData.insulinLog.map(i => ({
                        x: getTime(i.fullDate),
                        y: i.val
                    })),

                backgroundColor: '#8b5cf6',

                pointStyle: 'star',

                showLine: false,

                pointRadius: 10,

                yAxisID: 'y'
            });
        }

        // =========================
        // DESTROY OLD
        // =========================

        if (pondChart)
            pondChart.destroy();

        // =========================
        // CREATE CHART
        // =========================

        pondChart = new Chart(ctx, {

            type: 'line',

            data: {
                datasets: datasets
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    x: {
                        type: 'category',
                        labels: labels
                    },

                    y: {

                        position: 'left',

                        min: 0,

                        max: 350
                    },

                    yMood: {

                        position: 'right',

                        min: 1,

                        max: 10,

                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

})();
