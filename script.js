(function () {

    /* =========================================================
       PROGRESS POND V24
       Expanded Health + Mood Analytics System
    ========================================================== */

    // =========================================================
    // 1. DATA MODEL
    // =========================================================

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

    // =========================================================
    // 2. SCORE MAPS
    // =========================================================

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

    // =========================================================
    // 3. MOTIVATION QUOTES
    // =========================================================

    var frogQuotes = [
        "🐸 💖 Ribbit! You're doing amazing! 💞 🐸",
        "✨ 🐸 Take a deep breath, little froggy! 💗 ✨",
        "🌸 🐸 Every hop counts! I'm proud of you! 💖 🌸",
        "💕 🐸 Stay hydrated and stay happy! 🐸 💕",
        "🐸 💗 You are the best frog in the pond! ✨ 🐸",
        "🐸 ✨ Leap into happiness! ✨ 🐸",
        "🐸 Don't worry, be hoppy! 🐸",
        "🐸 💖 Feeling totally un-frog-gettable today! 💖 🐸",
        "🌿 🐸 Just a little frog in a big, beautiful pond. 🐸 🌿",
        "🐸 💧 Enjoying the simple things! 🐸 💧",
        "🐸 😎 Toad-ally awesome! 😎 🐸",
        "🐸 🌈 Keep calm and leap on! 🌈 🐸",
        "🌊 🐸 Every day is a good day to make a splash! 🐸 🌊"
    ];

    // =========================================================
    // 4. INITIALIZATION
    // =========================================================

    window.onload = function () {

        var saved = localStorage.getItem('ProgressPond_V24');

        if (saved) {
            try {
                var parsed = JSON.parse(saved);

                for (var key in parsed) {
                    pondData[key] = parsed[key];
                }

            } catch (e) {
                console.error("Load error", e);
            }
        }

        document.getElementById('motivationText').textContent =
            frogQuotes[Math.floor(Math.random() * frogQuotes.length)];

        resetTimePicker();

        setupButtons();

        renderAll();
    };

    // =========================================================
    // 5. BUTTON SETUP
    // =========================================================

    function setupButtons() {

        function setClick(id, fn) {
            var el = document.getElementById(id);

            if (el) el.onclick = fn;
        }

        setClick('addDailyBtn', addHop);
        setClick('addSugarBtn', addSugar);
        setClick('addCarbBtn', addCarb);
        setClick('addInsulinBtn', addInsulin);

        setClick('clearWaterBtn', function () {
            pondData.waterCount = 0;
            pondData.waterLog = [];
            saveAndRefresh();
        });

        setClick('resetPondBtn', resetToday);
        setClick('clearHistoryBtn', clearEverything);

        // Mood Buttons

        document.querySelectorAll('.mood-btn').forEach(btn => {

            btn.onclick = function () {

                addLog('moodLog', {
                    type: 'mood',
                    val: this.getAttribute('data-mood'),
                    icon: moodEmojis[this.getAttribute('data-mood')],
                    fullDate: currentFullDate(
                        document.getElementById('manualTimeInput').value
                    )
                });
            };
        });

        // Water Buttons

        document.querySelectorAll('.drop-btn').forEach((btn, index) => {

            btn.onclick = function () {

                const isActive = btn.classList.contains('active');

                if (isActive) {

                    btn.classList.remove('active');

                    pondData.waterCount =
                        Math.max(0, pondData.waterCount - 1);

                } else {

                    btn.classList.add('active');

                    pondData.waterCount = index + 1;

                    addLog('waterLog', {
                        type: 'water',
                        val: pondData.waterCount,
                        icon: "💧",
                        fullDate: currentFullDate(null)
                    });
                }

                saveAndRefresh();
            };
        });
    }

    // =========================================================
    // 6. UNIVERSAL LOGGING
    // =========================================================

    function addLog(logArray, payload) {

        pondData[logArray].push({
            id: Date.now(),
            ...payload
        });

        saveAndRefresh();
    }

    // =========================================================
    // 7. TIME
    // =========================================================

    function resetTimePicker() {

        var now = new Date();

        document.getElementById('manualTimeInput').value =
            now.getHours().toString().padStart(2, '0') +
            ":" +
            now.getMinutes().toString().padStart(2, '0');
    }

    function currentFullDate(manualTime) {

        var now = new Date();

        var timeStr =
            manualTime ||
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

    // =========================================================
    // 8. DAILY TASKS
    // =========================================================

    function addHop() {

        var input = document.getElementById('dailyInput');

        if (!input.value.trim()) return;

        pondData.daily.push({
            id: Date.now(),
            text: input.value,
            priority: document.getElementById('priorityInput').value
        });

        input.value = "";

        saveAndRefresh();
    }

    window.toggleHop = function (id) {

        var idx =
            pondData.daily.findIndex(g => g.id === id);

        if (idx > -1) {

            var item = pondData.daily.splice(idx, 1)[0];

            pondData.history.push({
                id: Date.now(),
                text: "[" + item.priority + "] " + item.text,
                fullDate: currentFullDate(null)
            });

            saveAndRefresh();
        }
    };

    window.deleteHop = function (id) {

        pondData.daily =
            pondData.daily.filter(g => g.id !== id);

        saveAndRefresh();
    };

    // =========================================================
    // 9. HEALTH TRACKING
    // =========================================================

    function addSugar() {

        var input =
            document.getElementById('sugarInput');

        var val = parseInt(input.value);

        if (!val) return;

        var color =
            (val < 70 || val > 250)
                ? "#ff4d4d"
                : (val > 180
                    ? "#ffa500"
                    : "#2d5a27");

        addLog('sugarLog', {
            type: 'sugar',
            val: val,
            color: color,
            fullDate: currentFullDate(
                document.getElementById('manualTimeInput').value
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
            fullDate: currentFullDate(
                document.getElementById('manualTimeInput').value
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
            fullDate: currentFullDate(
                document.getElementById('manualTimeInput').value
            )
        });

        input.value = "";
    }

    // =========================================================
    // 10. ADVANCED LOGGING
    // =========================================================

    window.addStress = function (level) {

        addLog('stressLog', {
            type: 'stress',
            val: level,
            score: stressScores[level],
            fullDate: currentFullDate(null)
        });
    };

    window.addEnergy = function (level) {

        addLog('energyLog', {
            type: 'energy',
            val: level,
            score: energyScores[level],
            fullDate: currentFullDate(null)
        });
    };

    window.addSymptom = function (symptom) {

        addLog('symptomLog', {
            type: 'symptom',
            symptom: symptom,
            fullDate: currentFullDate(null)
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
            fullDate: currentFullDate(null)
        });
    };

    // =========================================================
    // 11. ANALYTICS
    // =========================================================

    function calculateGlucoseRate() {

        let rates = [];

        for (let i = 1; i < pondData.sugarLog.length; i++) {

            let prev = pondData.sugarLog[i - 1];
            let curr = pondData.sugarLog[i];

            let diff = curr.val - prev.val;

            rates.push({
                time: curr.fullDate,
                rate: diff
            });
        }

        return rates;
    }

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
            sugars.reduce((a, b) => a + b, 0) /
            sugars.length;

        let max = Math.max(...sugars);
        let min = Math.min(...sugars);

        return {
            avg: Math.round(avg),
            max,
            min,
            stability: calculateStabilityScore()
        };
    }

    // =========================================================
    // 12. STORAGE
    // =========================================================

    function saveAndRefresh() {

        localStorage.setItem(
            'ProgressPond_V24',
            JSON.stringify(pondData)
        );

        renderAll();
    }

    function resetToday() {

        if (!confirm("Reset today?")) return;

        pondData.daily = [];
        pondData.waterCount = 0;

        resetTimePicker();

        saveAndRefresh();
    }

    function clearEverything() {

        if (!confirm("Delete ALL data?")) return;

        localStorage.removeItem('ProgressPond_V24');

        location.reload();
    }

    // =========================================================
    // 13. DELETE ITEMS
    // =========================================================

    window.deleteLogItem = function (type, id) {

        if (!confirm("Delete this log entry?"))
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

    // =========================================================
    // 14. MAIN RENDER
    // =========================================================

    function renderAll() {

        // =============================
        // BASIC UI
        // =============================

        document.getElementById('currentDate').textContent =
            new Date().toLocaleDateString(
                'en-US',
                {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                }
            );

        document.querySelectorAll('.drop-btn')
            .forEach((btn, i) => {

                if (i < pondData.waterCount)
                    btn.classList.add('active');
                else
                    btn.classList.remove('active');
            });

        var waterText =
            document.getElementById('waterCountText');

        if (waterText)
            waterText.textContent =
                pondData.waterCount + " / 8";

        // =============================
        // DAILY TASKS
        // =============================

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
                >×</button>

            </li>`;
        }

        document.getElementById('dailyList').innerHTML =
            listHtml || "No active hops...";

        // =============================
        // PROGRESS BAR
        // =============================

        var total =
            pondData.daily.length +
            pondData.history.length;

        var percent =
            total
                ? Math.round(
                    (pondData.history.length / total) * 100
                )
                : 0;

        document.getElementById('dailyProgress')
            .style.width = percent + '%';

        document.getElementById('dailyProgressText')
            .textContent = percent + '%';

        // =============================
        // ANALYTICS PANEL
        // =============================

        let stats = calculateDailyStats();

        let analyticsPanel =
            document.getElementById('analyticsPanel');

        if (stats && analyticsPanel) {

            analyticsPanel.innerHTML = `
                <div>📊 Avg Glucose: ${stats.avg}</div>
                <div>⬆️ High: ${stats.max}</div>
                <div>⬇️ Low: ${stats.min}</div>
                <div>🌊 Stability: ${stats.stability}%</div>
            `;
        }

        // =====================================================
        // CHART
        // =====================================================

        var canvas =
            document.getElementById('healthChart');

        if (canvas && typeof Chart !== 'undefined') {

            var ctx = canvas.getContext('2d');

            var getTime = function (fd) {

                return fd
                    ? fd.split('@')[1].trim()
                    : "00:00";
            };

            var allEntries = [

                ...pondData.sugarLog,
                ...pondData.moodLog,
                ...pondData.carbLog,
                ...pondData.waterLog,
                ...pondData.insulinLog,
                ...pondData.stressLog,
                ...pondData.energyLog

            ].sort((a, b) => a.id - b.id);

            var labels =
                [...new Set(
                    allEntries.map(
                        e => getTime(e.fullDate)
                    )
                )];

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

                    backgroundColor: '#ef4444',

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

                    backgroundColor: '#f59e0b',

                    tension: 0.4,

                    yAxisID: 'yMood'
                });
            }

            // =========================
            // WATER
            // =========================

            if (pondData.waterLog.length > 0) {

                datasets.push({

                    label: 'Water',

                    data:
                        pondData.waterLog.map(w => ({
                            x: getTime(w.fullDate),
                            y: w.val
                        })),

                    backgroundColor: '#00d4ff',

                    showLine: false,

                    pointStyle: 'triangle',

                    pointRadius: 8,

                    yAxisID: 'y'
                });
            }

            // =========================
            // CARBS
            // =========================

            if (pondData.carbLog.length > 0) {

                datasets.push({

                    label: 'Carbs',

                    data:
                        pondData.carbLog.map(c => ({
                            x: getTime(c.fullDate),
                            y: c.val
                        })),

                    backgroundColor: '#10b981',

                    showLine: false,

                    pointStyle: 'rect',

                    pointRadius: 8,

                    yAxisID: 'y'
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

                    showLine: false,

                    pointStyle: 'star',

                    pointRadius: 10,

                    yAxisID: 'y'
                });
            }

            // =========================
            // STRESS
            // =========================

            if (pondData.stressLog.length > 0) {

                datasets.push({

                    label: 'Stress',

                    data:
                        pondData.stressLog.map(s => ({
                            x: getTime(s.fullDate),
                            y: s.score
                        })),

                    borderColor: '#ff00aa',

                    tension: 0.3,

                    yAxisID: 'yMood'
                });
            }

            // =========================
            // ENERGY
            // =========================

            if (pondData.energyLog.length > 0) {

                datasets.push({

                    label: 'Energy',

                    data:
                        pondData.energyLog.map(e => ({
                            x: getTime(e.fullDate),
                            y: e.score
                        })),

                    borderColor: '#00ff99',

                    tension: 0.3,

                    yAxisID: 'yMood'
                });
            }

            // =========================
            // DESTROY OLD CHART
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

                    interaction: {
                        mode: 'nearest',
                        intersect: false
                    },

                    scales: {

                        x: {
                            type: 'category',
                            labels: labels
                        },

                        y: {

                            position: 'left',

                            min: 0,

                            max: 350,

                            title: {
                                display: true,
                                text: 'Levels'
                            }
                        },

                        yMood: {

                            position: 'right',

                            min: 1,

                            max: 10,

                            title: {
                                display: true,
                                text: 'Mood'
                            },

                            grid: {
                                drawOnChartArea: false
                            }
                        }
                    },

                    plugins: {

                        legend: {

                            display: true,

                            labels: {
                                boxWidth: 10,
                                font: {
                                    size: 10
                                }
                            }
                        },

                        tooltip: {
                            enabled: true
                        }
                    }
                }
            });
        }
    }

})();
