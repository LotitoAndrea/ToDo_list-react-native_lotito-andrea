// 📚 SPIEGAZIONE: Questo è un custom hook che gestisce il salvataggio
// automatico dei task in AsyncStorage (il database locale del telefono)

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✨ GENERIC TYPE <T>: Questo hook funziona con qualsiasi tipo di dato!
// T è un "placeholder" che verrà sostituito dal tipo che passiamo
// Es. useAsyncStorage<Task[]>(...) → T diventa Task[]

export function useAsyncStorage<T>(key: string, initialValue: T) {
  // 📦 STATE: Memorizza i dati e lo stato di caricamento
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 EFFECT 1: Carica i dati quando l'app si apre (mount)
  // [] significa "esegui solo una volta all'inizio"
  useEffect(() => {
    loadStoredValue();
  }, []);

  // 🔄 EFFECT 2: Salva automaticamente quando i dati cambiano
  // [storedValue] significa "esegui ogni volta che storedValue cambia"
  useEffect(() => {
    saveValue(storedValue);
  }, [storedValue]);

  // 📖 FUNZIONE: Carica i dati da AsyncStorage
  const loadStoredValue = async () => {
    try {
      setIsLoading(true);
      
      // 1. Leggi i dati salvati con la chiave (es. "tasks")
      const item = await AsyncStorage.getItem(key);
      
      // 2. Se esistono dati salvati, convertili da JSON a oggetti JavaScript
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
      // 3. Se non ci sono dati, usa il valore iniziale (già impostato)
      
    } catch (error) {
      // Se c'è un errore, stampa nel log e usa il valore iniziale
      console.error('Errore durante il caricamento:', error);
    } finally {
      // "finally" si esegue sempre, anche se c'è un errore
      setIsLoading(false);
    }
  };

  // 💾 FUNZIONE: Salva i dati in AsyncStorage
  const saveValue = async (value: T) => {
    try {
      // 1. Converti l'oggetto JavaScript in una stringa JSON
      const jsonValue = JSON.stringify(value);
      
      // 2. Salva la stringa con la chiave (es. "tasks")
      await AsyncStorage.setItem(key, jsonValue);
      
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    }
  };

  // 🎁 RETURN: Restituisce i dati e la funzione per aggiornarli
  // Funziona esattamente come useState, ma con persistenza automatica!
  return [storedValue, setStoredValue, isLoading] as const;
}

// 📚 COME SI USA:
// const [tasks, setTasks, isLoading] = useAsyncStorage<Task[]>('tasks', []);
// 
// - tasks: array dei task (salvato automaticamente)
// - setTasks: funzione per aggiornare i task
// - isLoading: true mentre carica, false quando è pronto
