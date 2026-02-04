// 📚 SPIEGAZIONE: Questo componente mostra i 3 bottoni per filtrare i task
// L'utente può scegliere di vedere: Tutti / Da Fare / Completati

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FilterType } from '../types/Task';

// 🎯 PROPS
interface FilterBarProps {
  currentFilter: FilterType;  // Filtro attualmente selezionato
  onFilterChange: (filter: FilterType) => void;  // Funzione per cambiare filtro
  taskCounts: {
    all: number;
    active: number;
    completed: number;
  };  // Numero di task per ogni categoria
}

export default function FilterBar({ currentFilter, onFilterChange, taskCounts }: FilterBarProps) {
  // 📋 CONFIGURAZIONE: Definisce i 3 filtri disponibili
  const filters: Array<{ type: FilterType; label: string; emoji: string }> = [
    { type: 'all', label: 'Tutti', emoji: '📋' },
    { type: 'active', label: 'Da Fare', emoji: '⏳' },
    { type: 'completed', label: 'Completati', emoji: '✅' },
  ];

  return (
    <View style={styles.container}>
      {/* Ciclo attraverso i 3 filtri */}
      {filters.map((filter) => {
        const isSelected = currentFilter === filter.type;
        const count = taskCounts[filter.type];  // Quanti task ci sono per questo filtro

        return (
          <TouchableOpacity
            key={filter.type}
            style={[
              styles.filterButton,
              isSelected && styles.filterButtonSelected,  // Stile diverso se selezionato
            ]}
            onPress={() => onFilterChange(filter.type)}
          >
            {/* Emoji e label */}
            <Text style={styles.filterEmoji}>{filter.emoji}</Text>
            <Text
              style={[
                styles.filterLabel,
                isSelected && styles.filterLabelSelected,
              ]}
            >
              {filter.label}
            </Text>
            
            {/* Badge con il numero di task */}
            <View
              style={[
                styles.countBadge,
                isSelected && styles.countBadgeSelected,
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  isSelected && styles.countTextSelected,
                ]}
              >
                {count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// 🎨 STILI
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',  // Bottoni in orizzontale
    justifyContent: 'space-between',  // Spazio uguale tra i bottoni
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,  // Ogni bottone occupa 1/3 dello spazio
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  filterButtonSelected: {
    backgroundColor: '#2196F3',  // Blu quando selezionato
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginRight: 6,
  },
  filterLabelSelected: {
    color: '#fff',  // Bianco quando selezionato
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeSelected: {
    backgroundColor: '#fff',  // Bianco quando selezionato
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  countTextSelected: {
    color: '#2196F3',  // Blu quando selezionato
  },
});

// 📚 COME SI USA:
// <FilterBar 
//   currentFilter={filter}
//   onFilterChange={(newFilter) => setFilter(newFilter)}
//   taskCounts={{ all: 10, active: 5, completed: 5 }}
// />
