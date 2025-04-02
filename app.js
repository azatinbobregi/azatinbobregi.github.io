// Kullanıcının sistem temasını algıla
   if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
     document.documentElement.setAttribute('data-theme', 'dark');
   }
// Tema kontrolü için localStorage kullanımı
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Tema butonunu güncelle
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    themeBtn.title = theme === 'dark' ? 'Light moda geç' : 'Dark moda geç';
  }
}

// Uygulama başlangıcında tema yükleme
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  // Tema değiştirme butonunu ekleyelim
  const themeSwitcher = document.createElement('div');
  themeSwitcher.className = 'theme-switcher';
  themeSwitcher.innerHTML = `
    <button id="themeToggle" class="theme-btn" onclick="toggleTheme()">🌙</button>
  `;
  document.body.appendChild(themeSwitcher);
  
  // Diğer uygulama kodları...
});

// Global fonksiyon olarak tanımlayalım
window.toggleTheme = toggleTheme;

// Basit veritabanı fonksiyonları
const db = {
    save: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`kaydedildi: ${key}`);
    },
    load: (key) => {
        const data = JSON.parse(localStorage.getItem(key)) || [];
        console.log(`yüklendi: ${key}`, data);
        return data;
    }
};

// Uygulama başlat
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    
    // Form submit eventi
    document.getElementById('noteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('noteInput').value.trim();
        if (text) {
            addNote(text);
            document.getElementById('noteInput').value = '';
        }
    });
});

// Not ekleme
function addNote(text) {
    const notes = db.load('notes');
    notes.unshift({
        id: Date.now(),
        text: text,
        timestamp: new Date().toISOString()
    });
    db.save('notes', notes);
    renderNotes(notes);
}

// Notları yükleme
function loadNotes() {
    const notes = db.load('notes');
    renderNotes(notes);
}

// Notları gösterme
function renderNotes(notes) {
    const container = document.getElementById('notesContainer');
    container.innerHTML = notes.length ? '' : '<p class="text-muted">Henüz not eklenmedi</p>';
    
    notes.forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = 'note-item';
        noteEl.innerHTML = `
            <div>
                <small class="note-date">${new Date(note.timestamp).toLocaleString('tr-TR')}</small>
                <button class="btn btn-sm btn-danger float-end delete-btn" data-id="${note.id}">Sil</button>
            </div>
            <div class="note-content">${marked.parse(note.text)}</div>
        `;
        container.appendChild(noteEl);
    });

    // Silme butonları
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteNote(id);
        });
    });
}

// Not silme
function deleteNote(id) {
    Swal.fire({
        title: 'Emin misin?',
        text: "geri gelmez",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Evet, sil!'
    }).then((result) => {
        if (result.isConfirmed) {
            const notes = db.load('notes').filter(note => note.id !== id);
            db.save('notes', notes);
            renderNotes(notes);
            Swal.fire('Silindi!', 'Notunuz başarıyla silindi.', 'success');
        }
    });
}
