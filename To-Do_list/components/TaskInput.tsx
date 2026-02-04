// 📚 SPIEGAZIONE: Questo componente gestisce l'input per creare nuovi task
// Ha un campo di testo, bottoni per la priorità, e un bottone "Aggiungi"

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Priority } from '../types/Task';
import { PRIORITY_CONFIG } from '../constants/priorities';

// 🎯 PROPS: Dati che il componente riceve dall'esterno
interface TaskInputProps {
  onAddTask: (text: string, priority: Priority) => void;
  // Questa è una funzione che il componente padre ci passa
  // La chiameremo quando l'utente preme "Aggiungi"
}

export default function TaskInput({ onAddTask }: TaskInputProps) {
  // 📦 STATE LOCALE: Questi dati esistono solo dentro questo componente
  const [text, setText] = useState('');  // Testo scritto dall'utente
  const [selectedPriority, setSelectedPriority] = useState<Priority>(Priority.MEDIUM);

  // 🎬 HANDLER: Funzione chiamata quando premi "Aggiungi"
  const handleAdd = () => {
    // 1. Controllo: il testo non deve essere vuoto
    if (text.trim().length === 0) {
      return; // Esci dalla funzione senza fare nulla
    }

    // 2. Chiama la funzione che ci ha passato il componente padre
    onAddTask(text.trim(), selectedPriority);

    // 3. Resetta l'input (pulisce il campo di testo)
    setText('');
    setSelectedPriority(Priority.MEDIUM); // Torna a priorità media
  };

  return (
    <View style={styles.container}>
      {/* 📝 CAMPO DI TESTO */}
      <TextInput
        style={styles.input}
        placeholder="Cosa devi fare oggi?"
        placeholderTextColor="#353535"
        value={text}
        onChangeText={setText}  // Aggiorna lo state ogni volta che scrivi
        onSubmitEditing={handleAdd}  // Premi "Invio" sulla tastiera → Aggiungi
        returnKeyType="done"  // Mostra "Fine" invece di "Invio" sulla tastiera iOS
      />

      {/* 🎨 SELETTORE PRIORITÀ */}
      <View style={styles.priorityContainer}>
        <Text style={styles.priorityLabel}>Priorità:</Text>
        
        {/* Ciclo attraverso tutte le priorità (LOW, MEDIUM, HIGH) */}
        {Object.values(Priority).map((priority) => {
          const config = PRIORITY_CONFIG[priority];
          const isSelected = priority === selectedPriority;

          return (
            <TouchableOpacity
              key={priority}
              style={[
                styles.priorityButton,
                { backgroundColor: config.backgroundColor },
                isSelected && styles.priorityButtonSelected,
              ]}
              onPress={() => setSelectedPriority(priority)}
            >
              <Text style={styles.priorityEmoji}>{config.icon}</Text>
              <Text
                style={[
                  styles.priorityText,
                  { color: config.color },
                  isSelected && styles.priorityTextSelected,
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ➕ BOTTONE AGGIUNGI */}
      <TouchableOpacity
        style={[styles.addButton, text.trim().length === 0 && styles.addButtonDisabled]}
        onPress={handleAdd}
        disabled={text.trim().length === 0}  // Disabilitato se il testo è vuoto
      >
        <Text style={styles.addButtonText}>➕ Aggiungi Task</Text>
      </TouchableOpacity>
    </View>
  );
}

// 🎨 STILI: Come CSS, ma per React Native
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,  // Ombra su Android
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f3f3f3',
    marginBottom: 12,
    
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityButtonSelected: {
    borderColor: '#333',  // Bordo nero quando selezionato
  },
  priorityEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '500',
  },
  priorityTextSelected: {
    fontWeight: '700',  // Bold quando selezionato
  },
  addButton: {
    backgroundColor: '#2196F3',  // Blu
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#BDBDBD',  // Grigio quando disabilitato
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

// 📚 COME SI USA:
// <TaskInput onAddTask={(text, priority) => {
//   // Crea un nuovo task e aggiungilo all'array
// }} />
