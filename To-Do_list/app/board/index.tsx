// Schermata principale — Board Kanban a colonne scorrevoli orizzontalmente

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBoard } from '../../hooks/useBoard';
import Column from '../../components/Column';
import { Priority } from '../../types/Task';

const COLUMN_WIDTH = Dimensions.get('window').width * 0.78;

export default function BoardScreen() {
  const router = useRouter();
  const {
    columns,
    cards,
    isLoading,
    addCard,
    moveCard,
    cardsForColumn,
  } = useBoard();

  // Stato del modal "Sposta in…"
  const [moveModalCardId, setMoveModalCardId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0079BF" />
        <Text style={styles.loadingText}>Caricamento board…</Text>
      </View>
    );
  }

  const cardBeingMoved = moveModalCardId
    ? cards.find(c => c.id === moveModalCardId)
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F5F7" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Board</Text>
        <Text style={styles.headerSub}>
          {cards.length} {cards.length === 1 ? 'card' : 'card totali'}
        </Text>
      </View>

      {/* Colonne — scorrimento orizzontale */}
      <FlatList
        data={columns}
        keyExtractor={col => col.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardContent}
        snapToInterval={COLUMN_WIDTH + 12}
        decelerationRate="fast"
        renderItem={({ item: col }) => (
          <Column
            column={col}
            cards={cardsForColumn(col.id)}
            onAddCard={addCard}
            onCardPress={(cardId) => router.push(`/card/${cardId}`)}
            onMoveCard={(cardId) => setMoveModalCardId(cardId)}
          />
        )}
      />

      {/* Modal spostamento card */}
      <Modal
        visible={moveModalCardId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMoveModalCardId(null)}
      >
        <TouchableOpacity
          style={styles.moveOverlay}
          activeOpacity={1}
          onPress={() => setMoveModalCardId(null)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.moveBox}>
              <Text style={styles.moveTitle}>Sposta card</Text>
              {cardBeingMoved && (
                <Text style={styles.moveCardTitle} numberOfLines={2}>
                  "{cardBeingMoved.title}"
                </Text>
              )}
              <Text style={styles.moveSub}>Scegli la colonna di destinazione:</Text>
              {columns.map(col => {
                const isCurrent = cardBeingMoved?.columnId === col.id;
                return (
                  <TouchableOpacity
                    key={col.id}
                    style={[
                      styles.moveOption,
                      isCurrent && styles.moveOptionCurrent,
                    ]}
                    onPress={async () => {
                      if (!isCurrent && moveModalCardId) {
                        await moveCard(moveModalCardId, col.id);
                      }
                      setMoveModalCardId(null);
                    }}
                    disabled={isCurrent}
                  >
                    <View style={[styles.moveColorDot, { backgroundColor: col.color }]} />
                    <Text style={[styles.moveOptionText, isCurrent && styles.moveOptionTextCurrent]}>
                      {col.title}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.moveCurrentLabel}>attuale</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.moveCancelBtn}
                onPress={() => setMoveModalCardId(null)}
              >
                <Text style={styles.moveCancelText}>Annulla</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    gap: 12,
  },
  loadingText: {
    color: '#5E6C84',
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#172B4D',
  },
  headerSub: {
    fontSize: 13,
    color: '#7A869A',
    marginTop: 2,
  },
  boardContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  // Move modal
  moveOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  moveBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  moveTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 6,
  },
  moveCardTitle: {
    fontSize: 13,
    color: '#5E6C84',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  moveSub: {
    fontSize: 13,
    color: '#7A869A',
    marginBottom: 12,
  },
  moveOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F4F5F7',
    marginBottom: 8,
    gap: 10,
  },
  moveOptionCurrent: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#0079BF',
  },
  moveColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  moveOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#172B4D',
    flex: 1,
  },
  moveOptionTextCurrent: {
    color: '#0079BF',
  },
  moveCurrentLabel: {
    fontSize: 11,
    color: '#0079BF',
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moveCancelBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
  },
  moveCancelText: {
    color: '#5E6C84',
    fontWeight: '600',
    fontSize: 15,
  },
});
