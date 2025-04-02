// Veritabanı fonksiyonları
const db = {
    save: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`Veri kaydedildi: ${key}`);
    },
    load: (key) => {
        const data = JSON.parse(localStorage.getItem(key)) || [];
        console.log(`Veri yüklendi: ${key}`, data);
        return data;
    }
};

// Tema yönetimi
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeButtons(savedTheme);
}

function toggleTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeButtons(theme);
}

function updateThemeButtons(theme) {
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

// Mesaj işlemleri
function addNote(text) {
    const notes = db.load('notes');
    const newNote = {
        id: Date.now(),
        text: text,
        timestamp: new Date().toISOString(),
        author: "Sen" // Bu kısmı isterseniz genişletebilirsiniz
    };
    notes.unshift(newNote);
    db.save('notes', notes);
    renderNotes(notes);
}

function deleteNote(id) {
    const notes = db.load('notes').filter(note => note.id !== id);
    db.save('notes', notes);
    renderNotes(notes);
}

function renderNotes(notes) {
    const container = document.getElementById('notesContainer');
    
    if (notes.length === 0) {
        container.innerHTML = '<p class="text-muted">Henüz mesaj yok, ilk mesajı sen yaz!</p>';
        return;
    }

    container.innerHTML = '';
    notes.forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = 'note-item';
        noteEl.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <small class="note-author">${note.author}</small>
                <small class="note-date">${new Date(note.timestamp).toLocaleString('tr-TR')}</small>
            </div>
            <div class="note-content mt-2">${marked.parse(note.text)}</div>
            <div class="text-end mt-2">
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${note.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(noteEl);
    });

    // Silme butonlarına event ekleme
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Bu mesajı silmek istediğine emin misin?')) {
                deleteNote(parseInt(this.dataset.id));
            }
        });
    });
}

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', () => {
    // Tema yükle
    initTheme();
    
    // Tema seçici eventleri
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', function() {
            toggleTheme(this.dataset.theme);
        });
    });
    
    // Form submit
    document.getElementById('noteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('noteInput').value.trim();
        if (text) {
            addNote(text);
            document.getElementById('noteInput').value = '';
        }
    });
    
    // Yenile butonu
    document.getElementById('refreshButton').addEventListener('click', () => {
        renderNotes(db.load('notes'));
    });
    
    // İlk yükleme
    renderNotes(db.load('notes'));
});

// Global fonksiyon
window.toggleTheme = toggleTheme;
