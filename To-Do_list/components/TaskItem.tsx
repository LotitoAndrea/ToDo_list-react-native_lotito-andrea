// 📚 SPIEGAZIONE: Questo componente rappresenta un singolo task nella lista
// Mostra il task e permette di completarlo o eliminarlo

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types/Task';
import { PRIORITY_CONFIG } from '../constants/priorities';

// 🎯 PROPS: Dati che riceviamo dal componente padre
interface TaskItemProps {
  task: Task;  // Il task da visualizzare
  onToggle: (id: string) => void;  // Funzione per completare/scompletare
  onDelete: (id: string) => void;  // Funzione per eliminare
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  // 🎨 Ottieni la configurazione della priorità (colore, icona, ecc.)
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <View style={styles.container}>
      {/* ✅ CHECKBOX: Tocca per completare/scompletare */}
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
        onPress={() => onToggle(task.id)}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* 📝 CONTENUTO DEL TASK */}
      <View style={styles.content}>
        {/* Testo del task */}
        <Text
          style={[
            styles.text,
            task.completed && styles.textCompleted,  // Barrato se completato
          ]}
        >
          {task.text}
        </Text>

        {/* 🎨 BADGE PRIORITÀ */}
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: priorityConfig.backgroundColor },
          ]}
        >
          <Text style={styles.priorityEmoji}>{priorityConfig.icon}</Text>
          <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
            {priorityConfig.label}
          </Text>
        </View>
      </View>

      {/* 🗑️ BOTTONE ELIMINA */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}

// 🎨 STILI
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',  // Elementi orizzontali (checkbox, testo, delete)
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,  // Ombra su Android
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,  // Cerchio
    borderWidth: 2,
    borderColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#2196F3',  // Blu quando completato
    borderColor: '#2196F3',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,  // Prende tutto lo spazio disponibile
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  textCompleted: {
    textDecorationLine: 'line-through',  // Barrato
    color: '#999',  // Grigio
    opacity: 0.6,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',  // Non occupa tutta la larghezza
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  priorityEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
});

// 📚 COME SI USA:
// <TaskItem 
//   task={task}
//   onToggle={(id) => { /* Segna come completato */ }}
//   onDelete={(id) => { /* Elimina il task */ }}
// />
