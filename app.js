// Firebase modüler SDK importları
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, orderByChild, serverTimestamp, remove } 
  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Firebase konfigürasyonu
const firebaseConfig = {
  apiKey: "AIzaSyDJCM2irwlzaublp9RQ0YiWOZBXj16LnXA",
  authDomain: "githubionot.firebaseapp.com",
  databaseURL: "https://githubionot-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "githubionot",
  storageBucket: "githubionot.firebasestorage.app",
  messagingSenderId: "858312423900",
  appId: "1:858312423900:web:7bfc11047e85bf636ff719",
  measurementId: "G-W4475EYY7S"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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
    const newNoteRef = push(ref(database, 'notes'));
    set(newNoteRef, {
      text: noteText,
      timestamp: serverTimestamp()
    });
    
    noteInput.value = '';
  }
});

// Notları dinle ve göster
const notesRef = ref(database, 'notes');
onValue(notesRef, (snapshot) => {
  notesContainer.innerHTML = '';
  
  const notes = [];
  snapshot.forEach((childSnapshot) => {
    notes.push({
      id: childSnapshot.key,
      ...childSnapshot.val()
    });
  });
  
  // Notları ters sırada göster (en yeni üstte)
  notes.sort((a, b) => b.timestamp - a.timestamp).forEach((note) => {
    const noteElement = document.createElement('div');
    noteElement.className = 'note-item';
    
    let formattedDate = "Yükleniyor...";
    if (note.timestamp) {
      const noteDate = new Date(note.timestamp);
      formattedDate = noteDate.toLocaleString('tr-TR');
    }
    
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
      remove(ref(database, `notes/${noteId}`));
    });
  });
});
