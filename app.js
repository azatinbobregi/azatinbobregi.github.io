// Firebase konfigürasyonu
const firebaseConfig = {
    apiKey: "AIzaSyDJCM2irwlzaublp9RQ0YiWOZBXj16LnXA",
    authDomain: "githubionot.firebaseapp.com",
    projectId: "githubionot",
    storageBucket: "githubionot.firebasestorage.app",
    messagingSenderId: "858312423900",
    appId: "1:858312423900:web:13be8e6e00ada9506ff719",
    measurementId: "G-K8VP1EJSSV"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM elementleri
const noteForm = document.getElementById('noteForm');
const noteInput = document.getElementById('noteInput');
const notesContainer = document.getElementById('notesContainer');

// Form gönderildiğinde
noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const noteText = noteInput.value.trim();
    if (noteText) {
        // Firebase'e not ekle
        const newNoteRef = database.ref('notes').push();
        newNoteRef.set({
            text: noteText,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        noteInput.value = '';
    }
});

// Notları dinle ve göster
database.ref('notes').orderByChild('timestamp').on('value', (snapshot) => {
    notesContainer.innerHTML = '';
    
    const notes = [];
    snapshot.forEach((childSnapshot) => {
        notes.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
        });
    });
    
    // Notları ters sırada göster (en yeni üstte)
    notes.reverse().forEach((note) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        
        const noteDate = new Date(note.timestamp);
        const formattedDate = noteDate.toLocaleString('tr-TR');
        
        noteElement.innerHTML = `
            <div>
                <span class="note-date">${formattedDate}</span>
                <span class="delete-btn" data-id="${note.id}">Sil</span>
            </div>
            <p>${note.text}</p>
        `;
        
        notesContainer.appendChild(noteElement);
    });
    
    // Silme butonlarına event listener ekle
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const noteId = e.target.getAttribute('data-id');
            database.ref('notes').child(noteId).remove();
        });
    });
});
