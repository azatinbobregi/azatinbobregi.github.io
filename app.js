// GitHub API Konfigürasyonu
const config = {
    token: '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', // BU TOKEN'İ DİKKATLİ KULLANIN
    repo: 'notlarim', // Kullanmak istediğiniz repo adı
    username: 'kullaniciadiniz' // GitHub kullanıcı adınız
};

// DOM Elementleri
const noteForm = document.getElementById('noteForm');
const noteInput = document.getElementById('noteInput');
const notesContainer = document.getElementById('notesContainer');
const refreshButton = document.getElementById('refreshButton');

// Uygulama Başlat
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    
    // 30 saniyede bir otomatik yenileme
    setInterval(loadNotes, 30000);
});

// Not Ekleme Formu
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const noteText = noteInput.value.trim();
    if (noteText) {
        try {
            await addNote(noteText);
            noteInput.value = '';
            loadNotes();
        } catch (error) {
            alert('Not eklenirken hata: ' + error.message);
            console.error(error);
        }
    }
});

// Yenile Butonu
refreshButton.addEventListener('click', loadNotes);

// Not Ekleme Fonksiyonu
async function addNote(text) {
    const timestamp = new Date().toISOString();
    const filename = `notes/note_${Date.now()}.json`;
    
    const response = await fetch(`https://api.github.com/repos/${config.username}/${config.repo}/contents/${filename}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${config.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Yeni not eklendi',
            content: btoa(unescape(encodeURIComponent(JSON.stringify({
                text: text,
                timestamp: timestamp
            }))))
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Not kaydedilemedi');
    }
}

// Notları Yükleme Fonksiyonu
async function loadNotes() {
    try {
        notesContainer.innerHTML = '<p class="text-muted">Notlar yükleniyor...</p>';
        
        const response = await fetch(`https://api.github.com/repos/${config.username}/${config.repo}/contents/notes`, {
            headers: {
                'Authorization': `token ${config.token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                await createNotesFolder();
                notesContainer.innerHTML = '<p class="text-muted">Henüz not eklenmedi</p>';
                return;
            }
            throw new Error('Notlar yüklenemedi');
        }
        
        const files = await response.json();
        
        if (!Array.isArray(files) || files.length === 0) {
            notesContainer.innerHTML = '<p class="text-muted">Henüz not eklenmedi</p>';
            return;
        }
        
        const notes = await Promise.all(files.map(async file => {
            const fileResponse = await fetch(file.download_url);
            const content = await fileResponse.json();
            return {
                id: file.name,
                text: content.text,
                timestamp: content.timestamp,
                sha: file.sha
            };
        }));
        
        notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        renderNotes(notes);
        
    } catch (error) {
        console.error('Hata:', error);
        notesContainer.innerHTML = `
            <div class="alert alert-danger">
                <strong>Hata!</strong> ${error.message}
                <button onclick="location.reload()" class="btn btn-sm btn-warning mt-2">Tekrar Dene</button>
            </div>
        `;
    }
}

// Notları Görüntüleme Fonksiyonu
function renderNotes(notes) {
    notesContainer.innerHTML = '';
    
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        
        const noteDate = new Date(note.timestamp);
        const formattedDate = noteDate.toLocaleString('tr-TR');
        
        noteElement.innerHTML = `
            <div>
                <span class="note-date">${formattedDate}</span>
                <span class="delete-btn" data-sha="${note.sha}">Sil</span>
            </div>
            <p>${note.text}</p>
        `;
        
        notesContainer.appendChild(noteElement);
    });
    
    // Silme Butonları
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('Bu notu silmek istediğinize emin misiniz?')) {
                const sha = e.target.getAttribute('data-sha');
                try {
                    await deleteNote(sha);
                    loadNotes();
                } catch (error) {
                    alert('Not silinirken hata: ' + error.message);
                }
            }
        });
    });
}

// Not Silme Fonksiyonu
async function deleteNote(sha) {
    const filename = `notes/note_${sha}.json`;
    const response = await fetch(`https://api.github.com/repos/${config.username}/${config.repo}/contents/${filename}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `token ${config.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Not silindi',
            sha: sha
        })
    });
    
    if (!response.ok) throw new Error('Not silinemedi');
}

// Notes Klasörü Oluşturma
async function createNotesFolder() {
    const response = await fetch(`https://api.github.com/repos/${config.username}/${config.repo}/contents/notes/README.md`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${config.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Notlar klasörü oluşturuldu',
            content: btoa(unescape(encodeURIComponent('# Notlarım\n\nBu klasör otomatik oluşturuldu')))
        })
    });
    
    if (!response.ok) throw new Error('Klasör oluşturulamadı');
}
