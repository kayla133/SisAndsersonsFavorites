// ========== DaySpark Main Script ==========

// ========== Data Storage Keys ==========
const STORAGE_KEYS = {
  quickLogs: 'dayspark_quickLogs',
  photos: 'dayspark_photos',
  schedule: 'dayspark_schedule',
  tasks: 'dayspark_tasks',
  moods: 'dayspark_moods',
  streak: 'dayspark_streak',
  settings: 'dayspark_settings'
};

// ========== Utility Functions ==========
function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ========== Notes / Thoughts ==========
const noteInput = document.getElementById("quickNote");
const addNoteBtn = document.getElementById("addNoteBtn");
const clearNotesBtn = document.getElementById("clearNotesBtn");
const notesContainer = document.getElementById("notesContainer");

// Load saved notes on startup
let notes = JSON.parse(localStorage.getItem("notes") || "[]");

// Add a new note
addNoteBtn.addEventListener("click", () => {
  const text = noteInput.value.trim();
  if (!text) return alert("Please write something first.");

  const newNote = {
    id: Date.now(),
    text,
    timestamp: new Date().toLocaleString()
  };

  notes.unshift(newNote); // newest first
  saveNotes();
  renderNotes();
  noteInput.value = "";
  updateStreak();
  renderMemories();
});

// Save notes to localStorage
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Render notes as sticky cards
function renderNotes() {
  if (!notesContainer) return;
  notesContainer.innerHTML = "";

  notes.forEach(note => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.style.cssText = `
      background: #fff8c6;
      border: 1px solid #f0e6a8;
      padding: 10px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
      margin-bottom: 8px;
    `;

    card.innerHTML = `
      <div style="font-size:0.95rem;">${note.text}</div>
      <div style="font-size:0.8rem; color:#777; margin-top:6px;">
        ${note.timestamp}
      </div>
    `;

    notesContainer.appendChild(card);
  });
}

// Clear all notes
clearNotesBtn.addEventListener("click", () => {
  if (!confirm("Delete all notes?")) return;
  notes = [];
  saveNotes();
  renderNotes();
});

// ========== Photo Journal ==========
const photoInput = document.getElementById('photoInput');
const photoCaption = document.getElementById('photoCaption');
const addPhotoBtn = document.getElementById('addPhotoBtn');
const addPhotoTodayBtn = document.getElementById('addPhotoTodayBtn');
const gallery = document.getElementById('gallery');

function addPhoto(markToday = false) {
  const file = photoInput.files[0];
  if (!file) {
    alert('Please select a photo first!');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const photos = loadData(STORAGE_KEYS.photos);
    photos.unshift({
      id: generateId(),
      src: e.target.result,
      caption: photoCaption.value.trim() || 'No caption',
      date: new Date().toISOString()
    });
    saveData(STORAGE_KEYS.photos, photos);
    
    photoInput.value = '';
    photoCaption.value = '';
    renderGallery();
    
    if (markToday) {
      updateStreak();
    }
    alert('Photo added!');
  };
  reader.readAsDataURL(file);
}

addPhotoBtn.addEventListener('click', () => addPhoto(false));
addPhotoTodayBtn.addEventListener('click', () => addPhoto(true));

function renderGallery() {
  const photos = loadData(STORAGE_KEYS.photos);
  gallery.innerHTML = '';
  
  photos.slice(0, 6).forEach(photo => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.innerHTML = `
      <img src="${photo.src}" alt="${photo.caption}">
      <div class="caption">
        <span>${photo.caption}</span>
        <button class="photo-delete-btn" onclick="deletePhoto('${photo.id}')" title="Delete photo">✕</button>
      </div>
    `;
    gallery.appendChild(card);
  });
  
  if (photos.length === 0) {
    gallery.innerHTML = '<div class="small muted">No photos yet</div>';
  }
}

function deletePhoto(id) {
  if (confirm('Delete this photo?')) {
    let photos = loadData(STORAGE_KEYS.photos);
    photos = photos.filter(photo => photo.id !== id);
    saveData(STORAGE_KEYS.photos, photos);
    renderGallery();
    renderMemories();
  }
}

// ========== Daily Schedule ==========
// Format time to 12-hour (AM/PM)
function formatTimeTo12Hour(time) {
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

const schedTitle = document.getElementById("schedTitle");
const schedTime = document.getElementById("schedTime");
const schedPriority = document.getElementById("schedPriority");
const addSchedBtn = document.getElementById("addSchedBtn");
const scheduleList = document.getElementById("scheduleList");

// Load existing schedule from localStorage
let schedule = JSON.parse(localStorage.getItem("schedule")) || [];

// Render items on page
function renderSchedule() {
  scheduleList.innerHTML = "";
  schedule.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <div class="left">
        <strong>${item.title}</strong>
        <span class="time">${formatTimeTo12Hour(item.time)}</span>
        <span class="badge">${item.priority}</span>
      </div>
      <div class="right">
        <button onclick="deleteSchedule(${index})" class="ghost">❌</button>
      </div>
    `;
    scheduleList.appendChild(li);
  });
  
  if (schedule.length === 0) {
    scheduleList.innerHTML = '<li class="small muted">No events scheduled</li>';
  }
}

// Delete schedule item
window.deleteSchedule = (index) => {
  schedule.splice(index, 1);
  localStorage.setItem("schedule", JSON.stringify(schedule));
  renderSchedule();
};

// Add schedule item
addSchedBtn.addEventListener("click", () => {
  if (!schedTitle.value || !schedTime.value) {
    return alert("Please enter a title and time for the event.");
  }
  
  const newEvent = {
    title: schedTitle.value,
    time: schedTime.value,
    priority: schedPriority.value
  };
  
  schedule.push(newEvent);
  localStorage.setItem("schedule", JSON.stringify(schedule));
  schedTitle.value = "";
  schedTime.value = "";
  schedPriority.value = "normal";
  renderSchedule();
});

// ========== To-Do List ==========
const taskText = document.getElementById('taskText');
const taskPriority = document.getElementById('taskPriority');
const addTaskBtn = document.getElementById('addTaskBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const taskList = document.getElementById('taskList');

addTaskBtn.addEventListener('click', () => {
  const text = taskText.value.trim();
  if (!text) {
    alert('Please enter a task!');
    return;
  }
  
  const tasks = loadData(STORAGE_KEYS.tasks);
  tasks.push({
    id: generateId(),
    text: text,
    priority: taskPriority.value,
    done: false,
    date: new Date().toISOString()
  });
  saveData(STORAGE_KEYS.tasks, tasks);
  taskText.value = '';
  renderTasks();
});

clearCompletedBtn.addEventListener('click', () => {
  let tasks = loadData(STORAGE_KEYS.tasks);
  tasks = tasks.filter(task => !task.done);
  saveData(STORAGE_KEYS.tasks, tasks);
  renderTasks();
});

function renderTasks() {
  const tasks = loadData(STORAGE_KEYS.tasks);
  taskList.innerHTML = '';
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tasks.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'item';
    
    const priorityBadge = task.priority === 'high' ? '🔴' : 
                         task.priority === 'low' ? '🟢' : '🟡';
    
    li.innerHTML = `
      <div class="left">
        <span class="${task.done ? 'task-done' : ''}">${priorityBadge} ${task.text}</span>
      </div>
      <div class="right">
        <button class="ghost" onclick="toggleTask('${task.id}')">${task.done ? '↩' : '✓'}</button>
        <button class="ghost" onclick="deleteTask('${task.id}')">✕</button>
      </div>
    `;
    taskList.appendChild(li);
  });
  
  if (tasks.length === 0) {
    taskList.innerHTML = '<li class="small muted">No tasks yet</li>';
  }
}

function toggleTask(id) {
  const tasks = loadData(STORAGE_KEYS.tasks);
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveData(STORAGE_KEYS.tasks, tasks);
    renderTasks();
  }
}

function deleteTask(id) {
  let tasks = loadData(STORAGE_KEYS.tasks);
  tasks = tasks.filter(task => task.id !== id);
  saveData(STORAGE_KEYS.tasks, tasks);
  renderTasks();
}

// ========== Mood Tracker (with delete options) ==========
const moodSlider = document.getElementById("moodSlider");
const moodEmoji = document.getElementById("moodEmoji");
const saveMoodBtn = document.getElementById("saveMoodBtn");
const moodList = document.getElementById("moodList");
const clearMoodsBtn = document.getElementById("clearMoodsBtn");

// Emoji map
const moodFaces = {
  1: "😢",
  2: "☹️",
  3: "😐",
  4: "🙂",
  5: "😁"
};

// Word descriptions
const moodWords = {
  1: "Very Bad",
  2: "Bad",
  3: "Neutral",
  4: "Good",
  5: "Great"
};

// Load saved moods
let moods = JSON.parse(localStorage.getItem("moods") || "[]");

// Slider emoji updater
moodSlider.addEventListener("input", () => {
  const val = Number(moodSlider.value);
  moodEmoji.textContent = moodFaces[val];
});

// Save a mood entry
saveMoodBtn.addEventListener("click", () => {
  let value = Number(moodSlider.value);
  if (value < 1 || value > 5) value = 3;

  const newMood = {
    id: Date.now(),
    mood: value,
    emoji: moodFaces[value],
    word: moodWords[value],
    timestamp: new Date().toLocaleString()
  };

  moods.unshift(newMood);
  saveMoods();
  renderMoods();
  updateStreak();
});

// Save moods to localStorage
function saveMoods() {
  localStorage.setItem("moods", JSON.stringify(moods));
}

// Render list (with delete buttons)
function renderMoods() {
  moodList.innerHTML = "";

  moods.forEach(entry => {
    const li = document.createElement("li");
    li.className = "item";

    li.innerHTML = `
      <div class="left" style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:1.3rem">${entry.emoji}</span>
        <strong>${entry.word}</strong>
      </div>
      <div class="right" style="display:flex; gap:8px; align-items:center;">
        <span class="time">${entry.timestamp}</span>
        <button class="deleteMoodBtn" data-id="${entry.id}" style="background:#ff6b6b; padding:4px 8px;">X</button>
      </div>
    `;

    moodList.appendChild(li);
  });

  if (moods.length === 0) {
    moodList.innerHTML = '<li class="small muted">No moods recorded</li>';
  }

  bindMoodDeleteButtons();
}

// Attach delete handlers
function bindMoodDeleteButtons() {
  document.querySelectorAll(".deleteMoodBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      moods = moods.filter(m => m.id !== id);
      saveMoods();
      renderMoods();
    });
  });
}

// Clear ALL mood entries
if (clearMoodsBtn) {
  clearMoodsBtn.addEventListener("click", () => {
    if (!confirm("Delete ALL saved moods?")) return;

    moods = [];
    saveMoods();
    renderMoods();
  });
}

// ========== Streak Counter ==========
const streakCount = document.getElementById('streakCount');

function updateStreak() {
  const streakData = JSON.parse(localStorage.getItem(STORAGE_KEYS.streak)) || {
    count: 0,
    lastDate: null
  };
  
  const today = new Date().toDateString();
  const lastDate = streakData.lastDate ? new Date(streakData.lastDate).toDateString() : null;
  
  if (lastDate === today) {
    // Already logged today
    streakCount.textContent = streakData.count;
    return;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (lastDate === yesterday.toDateString()) {
    // Consecutive day
    streakData.count += 1;
  } else if (lastDate !== today) {
    // Streak broken or first time
    streakData.count = 1;
  }
  
  streakData.lastDate = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.streak, JSON.stringify(streakData));
  streakCount.textContent = streakData.count;
}

function loadStreak() {
  const streakData = JSON.parse(localStorage.getItem(STORAGE_KEYS.streak)) || {
    count: 0,
    lastDate: null
  };
  streakCount.textContent = streakData.count;
}

// ========== Memories ==========
const memories = document.getElementById('memories');
const regenMemoriesBtn = document.getElementById('regenMemoriesBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

function renderMemories() {
  const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  const photos = loadData(STORAGE_KEYS.photos);
  const moods = loadData(STORAGE_KEYS.moods);
  
  memories.innerHTML = '';
  
  // Combine all memories
  const allMemories = [
    ...savedNotes.map(note => ({
      type: 'note',
      text: note.text,
      date: new Date(note.id).toISOString()
    })),
    ...photos.map(photo => ({
      type: 'photo',
      text: photo.caption,
      date: photo.date
    })),
    ...moods.map(mood => ({
      type: 'mood',
      text: `Felt ${mood.emoji}`,
      date: mood.date
    }))
  ];
  
  // Sort by date (newest first)
  allMemories.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Display recent memories
  allMemories.slice(0, 6).forEach(mem => {
    const card = document.createElement('div');
    card.className = 'mem-card';
    
    const icon = mem.type === 'note' ? '📝' : 
                 mem.type === 'photo' ? '📷' : '😊';
    
    card.innerHTML = `
      <div><strong>${icon} ${mem.type.charAt(0).toUpperCase() + mem.type.slice(1)}</strong></div>
      <div class="small">${mem.text}</div>
      <div class="time">${formatDate(mem.date)}</div>
    `;
    memories.appendChild(card);
  });
  
  if (allMemories.length === 0) {
    memories.innerHTML = '<div class="small muted">No memories yet. Start journaling!</div>';
  }
}

regenMemoriesBtn.addEventListener('click', renderMemories);

clearAllBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    location.reload();
  }
});

// ========== Settings ==========
const openSettingsBtn = document.getElementById('openSettingsBtn');
const settingsCard = document.getElementById('settingsCard');
const primaryColor = document.getElementById('primaryColor');
const accentColor = document.getElementById('accentColor');
const bgColor = document.getElementById('bgColor');
const cardColor = document.getElementById('cardColor');
const fontSelect = document.getElementById('fontSelect');
const fontSizeSelect = document.getElementById('fontSizeSelect');

openSettingsBtn.addEventListener('click', () => {
  settingsCard.style.display = settingsCard.style.display === 'none' ? 'block' : 'none';
});

function applySettings() {
  document.documentElement.style.setProperty('--primary-color', primaryColor.value);
  document.documentElement.style.setProperty('--accent-color', accentColor.value);
  document.documentElement.style.setProperty('--bg-color', bgColor.value);
  document.documentElement.style.setProperty('--card-color', cardColor.value);
  document.documentElement.style.setProperty('--font-family', fontSelect.value);
  document.documentElement.style.setProperty('--base-font-size', fontSizeSelect.value);
  
  // Save settings
  const settings = {
    primaryColor: primaryColor.value,
    accentColor: accentColor.value,
    bgColor: bgColor.value,
    cardColor: cardColor.value,
    fontFamily: fontSelect.value,
    fontSize: fontSizeSelect.value
  };
  saveData(STORAGE_KEYS.settings, settings);
}

function loadSettings() {
  const settings = localStorage.getItem(STORAGE_KEYS.settings);
  if (settings) {
    const s = JSON.parse(settings);
    primaryColor.value = s.primaryColor || '#5b8def';
    accentColor.value = s.accentColor || '#ffcc00';
    bgColor.value = s.bgColor || '#f7f9fc';
    cardColor.value = s.cardColor || '#ffffff';
    fontSelect.value = s.fontFamily || '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
    fontSizeSelect.value = s.fontSize || '16px';
    applySettings();
  }
}

// Add event listeners to all settings inputs
[primaryColor, accentColor, bgColor, cardColor, fontSelect, fontSizeSelect].forEach(input => {
  input.addEventListener('change', applySettings);
});

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadStreak();
  renderGallery();
  renderSchedule();
  renderTasks();
  renderMoods();
  renderNotes();
  renderMemories();
  initKeyboardShortcuts();
});

// ========== Keyboard Shortcuts ==========
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save quick log
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (document.activeElement === quickNote && quickNote.value.trim()) {
        saveQuickBtn.click();
      }
    }
    
    // Ctrl/Cmd + Enter to add task (when focused on task input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (document.activeElement === taskText && taskText.value.trim()) {
        addTaskBtn.click();
      }
    }
    
    // Escape to close settings
    if (e.key === 'Escape') {
      settingsCard.style.display = 'none';
    }
  });
}

// ========== Export Data ==========
function exportData() {
  const data = {
    quickLogs: loadData(STORAGE_KEYS.quickLogs),
    photos: loadData(STORAGE_KEYS.photos),
    schedule: loadData(STORAGE_KEYS.schedule),
    tasks: loadData(STORAGE_KEYS.tasks),
    moods: loadData(STORAGE_KEYS.moods),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dayspark-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ========== Task Search/Filter ==========
function filterTasks(searchTerm) {
  const tasks = loadData(STORAGE_KEYS.tasks);
  const filtered = tasks.filter(task => 
    task.text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  renderFilteredTasks(filtered);
}

function renderFilteredTasks(tasks) {
  taskList.innerHTML = '';
  
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tasks.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'item';
    
    const priorityBadge = task.priority === 'high' ? '🔴' : 
                         task.priority === 'low' ? '🟢' : '🟡';
    
    li.innerHTML = `
      <div class="left">
        <span class="${task.done ? 'task-done' : ''}">${priorityBadge} ${task.text}</span>
      </div>
      <div class="right">
        <button class="ghost" onclick="toggleTask('${task.id}')">${task.done ? '↩' : '✓'}</button>
        <button class="ghost" onclick="deleteTask('${task.id}')">✕</button>
      </div>
    `;
    taskList.appendChild(li);
  });
  
  if (tasks.length === 0) {
    taskList.innerHTML = '<li class="small muted">No tasks found</li>';
  }
}

// ========== Statistics ==========
function getStats() {
  const tasks = loadData(STORAGE_KEYS.tasks);
  const moods = loadData(STORAGE_KEYS.moods);
  const photos = loadData(STORAGE_KEYS.photos);
  const logs = loadData(STORAGE_KEYS.quickLogs);
  
  const completedTasks = tasks.filter(t => t.done).length;
  const avgMood = moods.length > 0 
    ? (moods.reduce((sum, m) => sum + m.value, 0) / moods.length).toFixed(1)
    : 0;
  
  return {
    totalTasks: tasks.length,
    completedTasks: completedTasks,
    completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
    totalPhotos: photos.length,
    totalLogs: logs.length,
    avgMood: avgMood,
    totalEntries: photos.length + logs.length + moods.length
  };
}