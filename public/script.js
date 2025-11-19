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

// ========== Quick Log ==========
const quickNote = document.getElementById('quickNote');
const saveQuickBtn = document.getElementById('saveQuickBtn');

saveQuickBtn.addEventListener('click', () => {
  const text = quickNote.value.trim();
  if (!text) {
    alert('Please write something first!');
    return;
  }
  
  const logs = loadData(STORAGE_KEYS.quickLogs);
  logs.unshift({
    id: generateId(),
    text: text,
    date: new Date().toISOString()
  });
  saveData(STORAGE_KEYS.quickLogs, logs);
  quickNote.value = '';
  updateStreak();
  renderMemories();
  alert('Quick log saved!');
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
      <div class="caption">${photo.caption}</div>
    `;
    gallery.appendChild(card);
  });
  
  if (photos.length === 0) {
    gallery.innerHTML = '<div class="small muted">No photos yet</div>';
  }
}

// ========== Daily Schedule ==========
const schedTitle = document.getElementById('schedTitle');
const schedTime = document.getElementById('schedTime');
const schedPriority = document.getElementById('schedPriority');
const addSchedBtn = document.getElementById('addSchedBtn');
const scheduleList = document.getElementById('scheduleList');

addSchedBtn.addEventListener('click', () => {
  const title = schedTitle.value.trim();
  const time = schedTime.value;
  
  if (!title) {
    alert('Please enter an event title!');
    return;
  }
  
  const schedule = loadData(STORAGE_KEYS.schedule);
  schedule.push({
    id: generateId(),
    title: title,
    time: time || 'No time set',
    priority: schedPriority.value,
    date: new Date().toISOString()
  });
  
  // Sort by time
  schedule.sort((a, b) => {
    if (a.time === 'No time set') return 1;
    if (b.time === 'No time set') return -1;
    return a.time.localeCompare(b.time);
  });
  
  saveData(STORAGE_KEYS.schedule, schedule);
  schedTitle.value = '';
  schedTime.value = '';
  renderSchedule();
});

function renderSchedule() {
  const schedule = loadData(STORAGE_KEYS.schedule);
  scheduleList.innerHTML = '';
  
  // Filter for today's events
  const today = new Date().toDateString();
  const todayEvents = schedule.filter(event => 
    new Date(event.date).toDateString() === today
  );
  
  todayEvents.forEach(event => {
    const li = document.createElement('li');
    li.className = 'item';
    
    const priorityBadge = event.priority === 'high' ? '🔴' : 
                         event.priority === 'low' ? '🟢' : '🟡';
    
    li.innerHTML = `
      <div class="left">
        <strong>${priorityBadge} ${event.title}</strong>
        <div class="time">${event.time}</div>
      </div>
      <div class="right">
        <button class="ghost" onclick="deleteScheduleItem('${event.id}')">✕</button>
      </div>
    `;
    scheduleList.appendChild(li);
  });
  
  if (todayEvents.length === 0) {
    scheduleList.innerHTML = '<li class="small muted">No events scheduled for today</li>';
  }
}

function deleteScheduleItem(id) {
  let schedule = loadData(STORAGE_KEYS.schedule);
  schedule = schedule.filter(item => item.id !== id);
  saveData(STORAGE_KEYS.schedule, schedule);
  renderSchedule();
}

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

// ========== Mood Tracker ==========
const moodSlider = document.getElementById('moodSlider');
const moodEmoji = document.getElementById('moodEmoji');
const saveMoodBtn = document.getElementById('saveMoodBtn');
const moodList = document.getElementById('moodList');

const moodEmojis = ['😢', '😕', '🙂', '😊', '😄'];

moodSlider.addEventListener('input', () => {
  moodEmoji.textContent = moodEmojis[moodSlider.value - 1];
});

saveMoodBtn.addEventListener('click', () => {
  const moods = loadData(STORAGE_KEYS.moods);
  moods.unshift({
    id: generateId(),
    value: parseInt(moodSlider.value),
    emoji: moodEmojis[moodSlider.value - 1],
    date: new Date().toISOString()
  });
  saveData(STORAGE_KEYS.moods, moods);
  updateStreak();
  renderMoods();
  alert('Mood saved!');
});

function renderMoods() {
  const moods = loadData(STORAGE_KEYS.moods);
  moodList.innerHTML = '';
  
  moods.slice(0, 5).forEach(mood => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <div class="left">
        <span>${mood.emoji} Level ${mood.value}</span>
        <div class="time">${formatDate(mood.date)}</div>
      </div>
    `;
    moodList.appendChild(li);
  });
  
  if (moods.length === 0) {
    moodList.innerHTML = '<li class="small muted">No moods recorded</li>';
  }
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
  const quickLogs = loadData(STORAGE_KEYS.quickLogs);
  const photos = loadData(STORAGE_KEYS.photos);
  const moods = loadData(STORAGE_KEYS.moods);
  
  memories.innerHTML = '';
  
  // Combine all memories
  const allMemories = [
    ...quickLogs.map(log => ({
      type: 'log',
      text: log.text,
      date: log.date
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
    
    const icon = mem.type === 'log' ? '📝' : 
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
  renderMemories();
});