# 📋 KanbanApp — Gestione progetti in stile Trello

App mobile e web per organizzare progetti e task in stile Trello. Sviluppata con **React Native** ed **Expo**, funziona su iOS, Android e web con lo stesso codice.

---

## ✨ Cosa puoi fare

### 🗂️ Multi-Board
- Crea tutte le board che vuoi con nome, emoji e colore personalizzato
- Ogni board nasce con colonne predefinite: **To Do**, **In Progress**, **Done**
- Elimina le board non piu utili (almeno una deve restare)

### 📌 Gestione Card
- Crea card in qualsiasi colonna con titolo e priorita
- Apri una card e modifica:
  - **Titolo** e **Descrizione** con salvataggio automatico
  - **Priorita** con indicatori visivi
  - **Scadenza** con selettore data
  - **Etichette** colorate
  - **Immagine** dalla galleria
  - **Checklist** con avanzamento
  - **Membri** assegnati dalla scheda

### 🔀 Sposta card
- **Drag & Drop**: su mobile puoi riordinare le card nella colonna
- **Sposta colonna**: tieni premuto e scegli la colonna di destinazione
- **Sposta board**: trasferisci la card su un'altra board

### 👥 Gestione Membri
- Aggiungi membri con nome, ruolo (**Owner / Admin / Membro / Viewer**) e avatar colorato
- Assegna i membri a board e card
- Modifica o elimina i membri quando vuoi

### 💾 Dati persistenti
- Tutti i dati sono salvati in locale con **AsyncStorage**
- Nessun account richiesto, i dati restano tra le sessioni

---

## 🧭 Flusso rapido di utilizzo
1. Crea una board dalla tab **Board**.
2. Entra nella board e aggiungi card nelle colonne.
3. Apri una card per definire dettagli, scadenza, checklist e immagini.
4. Vai in **Membri** per creare persone e assegnarle a board o card.
5. Trascina o sposta le card tra colonne o board quando serve.

---

## 🚀 Come avviare l'app

### Requisiti
- [Node.js](https://nodejs.org/) versione 18 o superiore
- [npm](https://www.npmjs.com/) (incluso con Node.js)
- Per iOS: Mac con Xcode installato, oppure un dispositivo fisico con l'app **Expo Go**
- Per Android: Android Studio con un emulatore configurato, oppure un dispositivo fisico con **Expo Go**

### Installazione

```bash
# 1) Entra nella cartella del progetto
cd To-Do_list

# 2) Installa le dipendenze
npm install

# 3) Avvia il server di sviluppo
npx expo start
```

### Apertura dell'app

Dopo aver avviato il server, nel terminale apparirà un QR code e le seguenti opzioni:

| Piattaforma | Come aprire |
|---|---|
| **Browser web** | Premi `W` nel terminale oppure vai su `http://localhost:8081` |
| **iOS (fisico)** | Scansiona il QR code con la fotocamera (serve **Expo Go**) |
| **Android (fisico)** | Scansiona il QR code da **Expo Go** |
| **Simulatore iOS** | Premi `I` nel terminale (serve Xcode su Mac) |
| **Emulatore Android** | Premi `A` nel terminale (serve Android Studio) |

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
