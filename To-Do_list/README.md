# 📋 KanbanApp — Gestione progetti in stile Trello

Un'applicazione mobile e web per la gestione di progetti e task, ispirata a Trello/Atlassian. Sviluppata con **React Native** ed **Expo**, funziona nativamente su iOS, Android e browser web senza alcuna modifica al codice.

---

## ✨ Funzionalità principali

### 🗂️ Multi-Board
- Crea quante board vuoi, ognuna con il proprio nome, emoji e colore personalizzato
- Ogni nuova board viene creata con le colonne predefinite **To Do**, **In Progress** e **Done**
- Elimina le board che non ti servono più (almeno una board deve rimanere)

### 📌 Gestione Card
- Crea card all'interno di qualsiasi colonna, con titolo e priorità (Bassa / Media / Alta)
- Apri una card per modificarne i dettagli:
  - **Titolo** e **Descrizione** con salvataggio automatico
  - **Priorità** con indicatori visivi colorati
  - **Scadenza** con selettore data nativo
  - **Etichette** colorate personalizzabili
  - **Immagine allegata** dalla galleria del dispositivo
  - **Checklist** con barra di avanzamento
  - **Membri assegnati** direttamente dalla scheda

### 🔀 Sposta card
- **Drag & Drop**: su mobile, trascina le card per riordinarle all'interno della colonna
- **Sposta in un'altra colonna**: tieni premuto la card e seleziona la colonna di destinazione dalla stessa board
- **Sposta in un'altra board**: dalla stessa schermata, trasferisci la card su una board completamente diversa

### 👥 Gestione Membri
- Aggiungi membri con nome, ruolo (**Owner / Admin / Membro / Viewer**) e avatar colorato
- Assegna ogni membro alle board e alle card di sua competenza
- Modifica o elimina i membri in qualsiasi momento

### 💾 Dati persistenti
- Tutti i dati vengono salvati localmente sul dispositivo tramite **AsyncStorage**
- I dati persistono tra una sessione e l'altra senza bisogno di un account o di una connessione internet

---

## 🚀 Come avviare l'applicazione

### Requisiti
- [Node.js](https://nodejs.org/) versione 18 o superiore
- [npm](https://www.npmjs.com/) (incluso con Node.js)
- Per iOS: Mac con Xcode installato, oppure un dispositivo fisico con l'app **Expo Go**
- Per Android: Android Studio con un emulatore configurato, oppure un dispositivo fisico con **Expo Go**

### Installazione

```bash
# 1. Entra nella cartella del progetto
cd To-Do_list

# 2. Installa le dipendenze
npm install

# 3. Avvia il server di sviluppo
npx expo start
```

### Apertura dell'app

Dopo aver avviato il server, nel terminale apparirà un QR code e le seguenti opzioni:

| Piattaforma | Come aprire |
|---|---|
| **Browser web** | Premi `W` nel terminale oppure vai su `http://localhost:8081` |
| **iOS (fisico)** | Scansiona il QR code con la fotocamera del telefono (richiede **Expo Go**) |
| **Android (fisico)** | Scansiona il QR code dall'app **Expo Go** |
| **Simulatore iOS** | Premi `I` nel terminale (richiede Xcode su Mac) |
| **Emulatore Android** | Premi `A` nel terminale (richiede Android Studio) |

> **Expo Go** è disponibile gratuitamente su [App Store](https://apps.apple.com/app/expo-go/id982107779) e [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).

---

## 🛠️ Tecnologie utilizzate

| Tecnologia | Utilizzo |
|---|---|
| **React Native 0.81** | Framework per app mobile cross-platform |
| **Expo ~54** | Toolchain e librerie native |
| **Expo Router ~6** | Navigazione file-based con tab bar e stack |
| **TypeScript** | Tipizzazione statica in tutto il progetto |
| **AsyncStorage** | Persistenza dati locale |
| **react-native-draggable-flatlist** | Drag & drop delle card su mobile |
| **expo-image-picker** | Allegare immagini dalla galleria |
| **@react-native-community/datetimepicker** | Selettore data nativo per iOS e Android |
| **React Context API** | Stato globale condiviso tra tutte le schermate |

---

## 📁 Struttura del progetto

```
app/
  (tabs)/
    boards/
      index.tsx        ← Lista di tutte le board
      [boardId].tsx    ← Board Kanban singola
    members/
      index.tsx        ← Gestione membri
  card/
    [id].tsx           ← Dettaglio e modifica card
components/
  Column.tsx           ← Colonna con drag & drop
  KanbanCard.tsx       ← Card compatta sulla board
  CardDetail/          ← Sezioni del dettaglio card
context/
  BoardContext.tsx     ← Stato globale dell'app
types/
  Task.ts              ← Definizioni TypeScript
constants/
  priorities.ts        ← Colori, ruoli, configurazioni
```

---

## 👨‍💻 Sviluppato da

**Andrea Lotito** — Progetto universitario ispirato all'ecosistema Atlassian (Trello).
