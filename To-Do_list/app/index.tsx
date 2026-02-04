// 📚 SPIEGAZIONE: Questo è il componente principale dell'app To-Do List
// Qui gestiamo tutto: task, filtri, aggiunta, eliminazione, completamento

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';  // ✅ Import corretto!
import { Task, Priority, FilterType } from '../types/Task';
import { useAsyncStorage } from '../hooks/useAsyncStorage';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import FilterBar from '../components/FilterBar';

export default function Index() {
  // 📦 STATE: Gestisce i dati dell'app
  
  // 1. Tasks con persistenza automatica (salvati in AsyncStorage)
  const [tasks, setTasks, isLoading] = useAsyncStorage<Task[]>('tasks', []);
  
  // 2. Filtro corrente (quale tipo di task mostrare)
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');

  // ➕ FUNZIONE: Aggiungi un nuovo task
  const handleAddTask = (text: string, priority: Priority) => {
    // Crea un nuovo task con un ID univoco basato sul timestamp
    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      priority,
      completed: false,
      createdAt: Date.now(),
    };

    // Aggiungi il nuovo task all'inizio dell'array
    // Lo spread operator [...] crea una nuova array con il nuovo task + quelli esistenti
    setTasks([newTask, ...tasks]);
  };

  // ✅ FUNZIONE: Completa/scompleta un task
  const handleToggleTask = (id: string) => {
    // .map() crea un nuovo array, modificando solo il task con l'id giusto
    setTasks(
      tasks.map((task) =>
        task.id === id 
          ? { ...task, completed: !task.completed }  // Inverti lo stato completed
          : task  // Lascia invariato
      )
    );
  };

  // 🗑️ FUNZIONE: Elimina un task
  const handleDeleteTask = (id: string) => {
    // .filter() crea un nuovo array senza il task da eliminare
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // 🔍 FILTRAGGIO: Calcola i task da mostrare in base al filtro
  // useMemo memorizza il risultato e lo ricalcola solo quando tasks o currentFilter cambiano
  const filteredTasks = useMemo(() => {
    switch (currentFilter) {
      case 'active':
        return tasks.filter((task) => !task.completed);
      case 'completed':
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
    }
  }, [tasks, currentFilter]);

  // 📊 CONTEGGI: Calcola quanti task ci sono per ogni filtro
  const taskCounts = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((task) => !task.completed).length,
      completed: tasks.filter((task) => task.completed).length,
    }),
    [tasks]
  );

  // ⏳ LOADING: Mostra uno spinner mentre carica i dati
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Caricamento task...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {/* 📋 HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>📝 Le Mie Attività</Text>
        <Text style={styles.subtitle}>
          {taskCounts.active} {taskCounts.active === 1 ? 'task da fare' : 'task da fare'}
        </Text>
      </View>

      {/* 📥 INPUT per aggiungere nuovi task */}
      <View style={styles.inputContainer}>
        <TaskInput onAddTask={handleAddTask} />
      </View>

      {/* 🔍 FILTRI */}
      <FilterBar
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        taskCounts={taskCounts}
      />

      {/* 📜 LISTA DEI TASK */}
      {filteredTasks.length === 0 ? (
        // Messaggio quando non ci sono task
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>
            {currentFilter === 'completed' ? '🎉' : '✨'}
          </Text>
          <Text style={styles.emptyText}>
            {currentFilter === 'completed'
              ? 'Nessun task completato ancora'
              : 'Nessun task da fare! Aggiungine uno sopra'}
          </Text>
        </View>
      ) : (
        // FlatList: componente ottimizzato per liste
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}  // Chiave univoca per ogni elemento
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}  // Nascondi scrollbar
        />
      )}
    </SafeAreaView>
  );
}

// 🎨 STILI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
});
