```javascript
/* =========================================================
   PROGRESS POND V25
   Expanded Health + Mood Analytics System
========================================================== */

(function () {

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

    var moodScores = {
        Manic: 10,
        Happy: 9,
        Focused: 8,
        Calm: 7,
        Tired: 6,
        Confused: 5,
        Grumpy: 4,
        Angry: 3,
        Sad: 2,
        Crying: 1
    };

    var energyScores = {
        Exhausted: 1,
        Low: 3,
        Okay: 5,
        Good: 7,
        Energetic: 10
    };

    var stressScores = {
        Calm: 1,
        Mild: 3,
        Moderate: 5,
        High: 7,
        Extreme: 10
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

    window.onload = function () {
        loadStorage();

        var motivationText = document.getElementById("motivationText");
        if (motivationText) {
            motivationText.textContent =
                frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
        }

        resetTimePicker();
        setupButtons();
        renderAll();
    };

    function loadStorage() {
        var saved = localStorage.getItem("ProgressPond_V25");
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
        localStorage.setItem("ProgressPond_V25", JSON.stringify(pondData));
        renderAll();
    }

    function setupButtons() {
        function setClick(id, fn) {
            var el = document.getElementById(id);
            if (el) el.onclick = fn;
        }

        setClick("addDailyBtn", addHop);
        setClick("addSugarBtn", addSugar);
        setClick("addCarbBtn", addCarb);
        setClick("addInsulinBtn", addInsulin);

        setClick("resetPondBtn", resetToday);
        setClick("clearHistoryBtn", clearEverything);
        setClick("clearWaterBtn", clearWater);

        setClick("resetTimeBtn", resetTimePicker);
        setClick("exportExcelBtn", exportGoalsToExcel);

        setClick("historyToggle", function () {
            var footer = document.getElementById("historyFooter");
            if (footer) footer.classList.toggle("collapsed");
        });

        setClick("bannerClose", function () {
            var bar = document.getElementById("motivationBar");
            if (bar) bar.style.display = "none";
        });

        document.querySelectorAll(".mood-btn").forEach(function (btn) {
            btn.onclick = function () {
                var mood = this.getAttribute("data-mood");

                addLog("moodLog", {
                    type: "mood",
                    val: mood,
                    icon: moodEmojis[mood],
                    fullDate: currentFullDate(getSelectedTime())
                });
            };
        });

        document.querySelectorAll(".drop-btn").forEach(function (btn, index) {
            btn.onclick = function () {
                var active = btn.classList.contains("active");

                if (active) {
                    btn.classList.remove("active");
                    pondData.waterCount = Math.max(0, pondData.waterCount - 1);
                    saveAndRefresh();
                } else {
                    btn.classList.add("active");
                    pondData.waterCount = index + 1;

                    addLog("waterLog", {
                        type: "water",
                        val: pondData.waterCount,
                        icon: "💧",
                        fullDate: currentFullDate(getSelectedTime())
                    });
                }
            };
        });
    }

    function getSelectedTime() {
        var timeInput = document.getElementById("manualTimeInput");
        return timeInput ? timeInput.value : null;
    }

    function resetTimePicker() {
        var timeInput = document.getElementById("manualTimeInput");
        if (!timeInput) return;

        var now = new Date();

        timeInput.value =
            now.getHours().toString().padStart(2, "0") +
            ":" +
            now.getMinutes().toString().padStart(2, "0");
    }

    function currentFullDate(manualTime) {
        var now = new Date();

        var timeStr =
            manualTime ||
            now.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });

        return (
            now.toLocaleDateString([], {
                month: "short",
                day: "numeric"
            }) +
            " @ " +
            timeStr
        );
    }

    function getTime(fd) {
        return fd ? fd.split("@")[1].trim() : "00:00";
    }

    function timeToMinutes(fd) {
        var time = getTime(fd);
        var parts = time.split(":");

        var hours = parseInt(parts[0], 10) || 0;
        var minutes = parseInt(parts[1], 10) || 0;

        return hours * 60 + minutes;
    }

    function sortByLoggedTime(arr) {
        return arr.slice().sort(function (a, b) {
            return timeToMinutes(a.fullDate) - timeToMinutes(b.fullDate);
        });
    }

    function addLog(logArray, payload) {
        pondData[logArray].push({
            id: Date.now(),
            ...payload
        });

        saveAndRefresh();
    }

    function addHop() {
        var input = document.getElementById("dailyInput");
        var priority = document.getElementById("priorityInput");

        if (!input || !input.value.trim()) return;

        pondData.daily.push({
            id: Date.now(),
            text: input.value,
            priority: priority ? priority.value : "Medium"
        });

        input.value = "";
        saveAndRefresh();
    }

    window.toggleHop = function (id) {
        var idx = pondData.daily.findIndex(function (g) {
            return g.id === id;
        });

        if (idx > -1) {
            var item = pondData.daily.splice(idx, 1)[0];

            pondData.history.push({
                id: Date.now(),
                text: "[" + item.priority + "] " + item.text,
                fullDate: currentFullDate(getSelectedTime())
            });

            saveAndRefresh();
        }
    };

    window.deleteHop = function (id) {
        pondData.daily = pondData.daily.filter(function (g) {
            return g.id !== id;
        });

        saveAndRefresh();
    };

    function addSugar() {
        var input = document.getElementById("sugarInput");
        if (!input) return;

        var val = parseInt(input.value, 10);
        if (!val) return;

        addLog("sugarLog", {
            type: "sugar",
            val: val,
            color:
                val < 70 || val > 250
                    ? "#ff4d4d"
                    : val > 180
                    ? "#ffa500"
                    : "#2d5a27",
            fullDate: currentFullDate(getSelectedTime())
        });

        input.value = "";
    }

    function addCarb() {
        var input = document.getElementById("carbInput");
        if (!input) return;

        var val = parseInt(input.value, 10);
        if (!val) return;

        addLog("carbLog", {
            type: "carb",
            val: val,
            fullDate: currentFullDate(getSelectedTime())
        });

        input.value = "";
    }

    function addInsulin() {
        var input = document.getElementById("insulinInput");
        if (!input) return;

        var val = parseFloat(input.value);
        if (!val) return;

        addLog("insulinLog", {
            type: "insulin",
            val: val,
            fullDate: currentFullDate(getSelectedTime())
        });

        input.value = "";
    }

    window.addStress = function (level) {
        addLog("stressLog", {
            type: "stress",
            val: level,
            score: stressScores[level],
            fullDate: currentFullDate(getSelectedTime())
        });
    };

    window.addEnergy = function (level) {
        addLog("energyLog", {
            type: "energy",
            val: level,
            score: energyScores[level],
            fullDate: currentFullDate(getSelectedTime())
        });
    };

    window.addSymptom = function (symptom) {
        addLog("symptomLog", {
            type: "symptom",
            symptom: symptom,
            fullDate: currentFullDate(getSelectedTime())
        });
    };

    window.addExercise = function (type, duration, intensity) {
        addLog("exerciseLog", {
            type: "exercise",
            exerciseType: type,
            duration: duration,
            intensity: intensity,
            fullDate: currentFullDate(getSelectedTime())
        });
    };

    window.addExerciseFromInput = function (type, intensity) {
        var input = document.getElementById("exerciseMinutesInput");
        var minutes = input ? parseInt(input.value, 10) : 0;

        if (!minutes || minutes < 1) {
            alert("Please enter exercise minutes first.");
            return;
        }

        window.addExercise(type, minutes, intensity);
        input.value = "";
    };

    function clearWater() {
        pondData.waterCount = 0;
        pondData.waterLog = [];
        saveAndRefresh();
    }

    function resetToday() {
        if (!confirm("Clear today? This keeps your completed goal history.")) return;

        pondData.daily = [];

        pondData.moodLog = [];
        pondData.sugarLog = [];
        pondData.carbLog = [];
        pondData.waterLog = [];
        pondData.insulinLog = [];
        pondData.sleepLog = [];
        pondData.stressLog = [];
        pondData.energyLog = [];
        pondData.symptomLog = [];
        pondData.exerciseLog = [];

        pondData.waterCount = 0;

        resetTimePicker();
        saveAndRefresh();
    }

    function clearEverything() {
        if (!confirm("Reset ALL data? This deletes goals, history, and tracker logs.")) return;

        localStorage.removeItem("ProgressPond_V25");
        location.reload();
    }

    window.deleteLogItem = function (type, id) {
        if (!confirm("Delete entry?")) return;

        var map = {
            mood: "moodLog",
            sugar: "sugarLog",
            carb: "carbLog",
            insulin: "insulinLog",
            water: "waterLog",
            stress: "stressLog",
            energy: "energyLog",
            symptom: "symptomLog",
            exercise: "exerciseLog",
            hop: "history"
        };

        if (map[type]) {
            pondData[map[type]] = pondData[map[type]].filter(function (i) {
                return i.id !== id;
            });
        }

        saveAndRefresh();
    };

    function calculateStabilityScore() {
        var sortedSugar = sortByLoggedTime(pondData.sugarLog);

        if (sortedSugar.length < 2) return 100;

        var totalVariation = 0;

        for (var i = 1; i < sortedSugar.length; i++) {
            totalVariation += Math.abs(sortedSugar[i].val - sortedSugar[i - 1].val);
        }

        var avgVariation = totalVariation / (sortedSugar.length - 1);

        return Math.max(0, Math.round(100 - avgVariation));
    }

    function calculateDailyStats() {
        var sugars = pondData.sugarLog.map(function (s) {
            return s.val;
        });

        if (!sugars.length) return null;

        var avg =
            sugars.reduce(function (a, b) {
                return a + b;
            }, 0) / sugars.length;

        return {
            avg: Math.round(avg),
            max: Math.max(...sugars),
            min: Math.min(...sugars),
            stability: calculateStabilityScore()
        };
    }

    async function exportGoalsToExcel() {
        if (typeof ExcelJS === "undefined" || typeof saveAs === "undefined") {
            alert("Excel export libraries are not loaded.");
            return;
        }

        var workbook = new ExcelJS.Workbook();
        var worksheet = workbook.addWorksheet("Goal History");

        worksheet.columns = [
            { header: "Completed Goal", key: "goal", width: 50 },
            { header: "Completed Time", key: "time", width: 28 }
        ];

        worksheet.mergeCells("A1:B1");
        worksheet.getCell("A1").value = "Progress Pond Goal Report";
        worksheet.getCell("A1").font = { bold: true, size: 18 };
        worksheet.getCell("A1").alignment = { horizontal: "center" };

        var currentRow = 3;

        var canvas = document.getElementById("healthChart");

        if (canvas) {
            var imageId = workbook.addImage({
                base64: canvas.toDataURL("image/png"),
                extension: "png"
            });

            worksheet.addImage(imageId, {
                tl: { col: 0, row: currentRow },
                ext: { width: 760, height: 360 }
            });

            currentRow += 22;
        }

        worksheet.getCell("A" + currentRow).value = "Completed Goals";
        worksheet.getCell("A" + currentRow).font = { bold: true, size: 14 };

        currentRow++;

        worksheet.getCell("A" + currentRow).value = "Goal";
        worksheet.getCell("B" + currentRow).value = "Completed Time";
        worksheet.getRow(currentRow).font = { bold: true };

        currentRow++;

        if (pondData.history.length === 0) {
            worksheet.getCell("A" + currentRow).value = "No completed goals yet.";
        } else {
            pondData.history
                .slice()
                .reverse()
                .forEach(function (goal) {
                    worksheet.getCell("A" + currentRow).value = goal.text;
                    worksheet.getCell("B" + currentRow).value = goal.fullDate;
                    currentRow++;
                });
        }

        worksheet.eachRow(function (row) {
            row.eachCell(function (cell) {
                cell.alignment = {
                    vertical: "middle",
                    wrapText: true
                };
            });
        });

        var buffer = await workbook.xlsx.writeBuffer();

        saveAs(
            new Blob([buffer]),
            "Progress_Pond_Goals_" + new Date().toISOString().slice(0, 10) + ".xlsx"
        );
    }

    function renderAll() {
        renderBasicUI();
        renderTasks();
        renderAnalytics();
        renderHistory();
        renderChart();
    }

    function renderBasicUI() {
        var currentDate = document.getElementById("currentDate");

        if (currentDate) {
            currentDate.textContent = new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric"
            });
        }

        document.querySelectorAll(".drop-btn").forEach(function (btn, i) {
            if (i < pondData.waterCount) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        var waterText = document.getElementById("waterCountText");

        if (waterText) {
            waterText.textContent = pondData.waterCount + " / 8";
        }
    }

    function renderTasks() {
        var dailyList = document.getElementById("dailyList");
        if (!dailyList) return;

        var listHtml = "";

        for (var i = 0; i < pondData.daily.length; i++) {
            var g = pondData.daily[i];

            listHtml += `
                <li class="hop-item">
                    <input type="checkbox" onchange="toggleHop(${g.id})">

                    <span style="flex:1">
                        ${g.text}
                        <small>(${g.priority})</small>
                    </span>

                    <button onclick="deleteHop(${g.id})">×</button>
                </li>
            `;
        }

        dailyList.innerHTML = listHtml || "No active hops...";

        var total = pondData.daily.length + pondData.history.length;
        var percent = total ? Math.round((pondData.history.length / total) * 100) : 0;

        var progress = document.getElementById("dailyProgress");
        var progressText = document.getElementById("dailyProgressText");

        if (progress) progress.style.width = percent + "%";
        if (progressText) progressText.textContent = percent + "%";
    }

    function renderAnalytics() {
        var stats = calculateDailyStats();
        var panel = document.getElementById("analyticsPanel");

        if (!panel) return;

        if (!stats) {
            panel.innerHTML = `
                <div>📊 Avg: --</div>
                <div>⬆️ High: --</div>
                <div>⬇️ Low: --</div>
                <div>🌊 Stability: --</div>
            `;
            return;
        }

        panel.innerHTML = `
            <div>📊 Avg: ${stats.avg}</div>
            <div>⬆️ High: ${stats.max}</div>
            <div>⬇️ Low: ${stats.min}</div>
            <div>🌊 Stability: ${stats.stability}%</div>
        `;
    }

    function renderHistory() {
        var hopHistory = document.getElementById("dailyHistoryList");

        if (hopHistory) {
            hopHistory.innerHTML =
                pondData.history
                    .slice()
                    .reverse()
                    .slice(0, 40)
                    .map(function (h) {
                        return `
                            <div class="history-item">
                                <div>
                                    🌿 ${h.text}
                                    <small>${h.fullDate}</small>
                                </div>

                                <button onclick="deleteLogItem('hop', ${h.id})">
                                    ×
                                </button>
                            </div>
                        `;
                    })
                    .join("") || "No completed goals yet.";
        }

        var combined = [
            ...pondData.moodLog.map(function (m) {
                return { ...m, display: `${m.icon} ${m.val}`, logType: "mood" };
            }),

            ...pondData.sugarLog.map(function (s) {
                return { ...s, display: `🩸 ${s.val} mg/dL`, logType: "sugar" };
            }),

            ...pondData.carbLog.map(function (c) {
                return { ...c, display: `🥣 ${c.val}g carbs`, logType: "carb" };
            }),

            ...pondData.insulinLog.map(function (i) {
                return { ...i, display: `💉 ${i.val} units`, logType: "insulin" };
            }),

            ...pondData.waterLog.map(function (w) {
                return { ...w, display: `💧 Water #${w.val}`, logType: "water" };
            }),

            ...pondData.stressLog.map(function (s) {
                return { ...s, display: `🧠 Stress: ${s.val}`, logType: "stress" };
            }),

            ...pondData.energyLog.map(function (e) {
                return { ...e, display: `⚡ Energy: ${e.val}`, logType: "energy" };
            }),

            ...pondData.symptomLog.map(function (sym) {
                return { ...sym, display: `🩺 ${sym.symptom}`, logType: "symptom" };
            }),

            ...pondData.exerciseLog.map(function (ex) {
                return {
                    ...ex,
                    display: `🏃 ${ex.exerciseType} (${ex.duration} min, ${ex.intensity})`,
                    logType: "exercise"
                };
            })
        ].sort(function (a, b) {
            return b.id - a.id;
        });

        var tracker = document.getElementById("moodHistoryList");

        if (tracker) {
            tracker.innerHTML =
                combined
                    .slice(0, 50)
                    .map(function (item) {
                        return `
                            <div class="history-item">
                                <div>
                                    ${item.display}
                                    <small>${item.fullDate}</small>
                                </div>

                                <button onclick="deleteLogItem('${item.logType}', ${item.id})">
                                    ×
                                </button>
                            </div>
                        `;
                    })
                    .join("") || "No tracker history yet.";
        }
    }

    function renderChart() {
        var canvas = document.getElementById("healthChart");

        if (!canvas || typeof Chart === "undefined") return;

        var ctx = canvas.getContext("2d");

        var sortedSugar = sortByLoggedTime(pondData.sugarLog);
        var sortedMood = sortByLoggedTime(pondData.moodLog);
        var sortedCarbs = sortByLoggedTime(pondData.carbLog);
        var sortedWater = sortByLoggedTime(pondData.waterLog);
        var sortedInsulin = sortByLoggedTime(pondData.insulinLog);
        var sortedStress = sortByLoggedTime(pondData.stressLog);
        var sortedEnergy = sortByLoggedTime(pondData.energyLog);

        var allEntries = [
            ...sortedSugar,
            ...sortedMood,
            ...sortedCarbs,
            ...sortedWater,
            ...sortedInsulin,
            ...sortedStress,
            ...sortedEnergy
        ].sort(function (a, b) {
            return timeToMinutes(a.fullDate) - timeToMinutes(b.fullDate);
        });

        var labels = [
            ...new Set(
                allEntries.map(function (e) {
                    return getTime(e.fullDate);
                })
            )
        ];

        var datasets = [];

        if (sortedSugar.length > 0) {
            datasets.push({
                label: "Glucose",
                data: sortedSugar.map(function (s) {
                    return { x: getTime(s.fullDate), y: s.val };
                }),
                borderColor: "#ef4444",
                backgroundColor: "#ef4444",
                tension: 0.3,
                yAxisID: "y"
            });
        }

        if (sortedMood.length > 0) {
            datasets.push({
                label: "Mood",
                data: sortedMood.map(function (m) {
                    return { x: getTime(m.fullDate), y: moodScores[m.val] || 5 };
                }),
                borderColor: "#f59e0b",
                backgroundColor: "#f59e0b",
                tension: 0.3,
                yAxisID: "yMood"
            });
        }

        if (sortedCarbs.length > 0) {
            datasets.push({
                label: "Carbs",
                data: sortedCarbs.map(function (c) {
                    return { x: getTime(c.fullDate), y: c.val };
                }),
                backgroundColor: "#10b981",
                pointStyle: "rect",
                showLine: false,
                pointRadius: 8,
                yAxisID: "y"
            });
        }

        if (sortedWater.length > 0) {
            datasets.push({
                label: "Water",
                data: sortedWater.map(function (w) {
                    return { x: getTime(w.fullDate), y: w.val };
                }),
                backgroundColor: "#00d4ff",
                pointStyle: "triangle",
                showLine: false,
                pointRadius: 8,
                yAxisID: "y"
            });
        }

        if (sortedInsulin.length > 0) {
            datasets.push({
                label: "Insulin",
                data: sortedInsulin.map(function (i) {
                    return { x: getTime(i.fullDate), y: i.val };
                }),
                backgroundColor: "#8b5cf6",
                pointStyle: "star",
                showLine: false,
                pointRadius: 10,
                yAxisID: "y"
            });
        }

        if (sortedStress.length > 0) {
            datasets.push({
                label: "Stress",
                data: sortedStress.map(function (s) {
                    return { x: getTime(s.fullDate), y: s.score };
                }),
                borderColor: "#ff00aa",
                backgroundColor: "#ff00aa",
                tension: 0.3,
                yAxisID: "yMood"
            });
        }

        if (sortedEnergy.length > 0) {
            datasets.push({
                label: "Energy",
                data: sortedEnergy.map(function (e) {
                    return { x: getTime(e.fullDate), y: e.score };
                }),
                borderColor: "#00aa77",
                backgroundColor: "#00aa77",
                tension: 0.3,
                yAxisID: "yMood"
            });
        }

        if (pondChart) pondChart.destroy();

        pondChart = new Chart(ctx, {
            type: "line",
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,

                interaction: {
                    mode: "nearest",
                    intersect: false
                },

                scales: {
                    x: {
                        type: "category",
                        labels: labels
                    },

                    y: {
                        position: "left",
                        min: 0,
                        max: 350,
                        title: {
                            display: true,
                            text: "Stats"
                        }
                    },

                    yMood: {
                        position: "right",
                        min: 1,
                        max: 10,
                        title: {
                            display: true,
                            text: "Mood / Stress / Energy"
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

})();
```
