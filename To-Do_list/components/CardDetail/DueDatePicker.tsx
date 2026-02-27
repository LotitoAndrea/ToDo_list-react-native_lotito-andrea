// Selezione data di scadenza  funziona su iOS, Android e Web

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  dueDate: number | null;
  onChange: (date: number | null) => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function parseDateString(s: string): number | null {
  const parts = s.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (isNaN(d) || isNaN(m) || isNaN(y) || y < 2000) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date.getTime();
}

export default function DueDatePicker({ dueDate, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(dueDate ? new Date(dueDate) : new Date());
  const [webText, setWebText] = useState(
    dueDate
      ? new Date(dueDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : ''
  );

  const isOverdue = dueDate !== null && dueDate < Date.now();

  function handleOpen() {
    setTempDate(dueDate ? new Date(dueDate) : new Date());
    setIsOpen(true);
  }

  function handleConfirm() {
    onChange(tempDate.getTime());
    setIsOpen(false);
  }

  function handleCancel() {
    setIsOpen(false);
  }

  // --- Web ---
  if (Platform.OS === 'web') {
    return (
      <View>
        <View style={styles.row}>
          <TextInput
            style={[styles.webInput, isOverdue && styles.webInputOverdue]}
            value={webText}
            onChangeText={setWebText}
            placeholder="GG/MM/AAAA"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
            maxLength={10}
            onBlur={() => {
              const ts = parseDateString(webText);
              if (ts) onChange(ts);
            }}
          />
          {dueDate && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => { onChange(null); setWebText(''); }}
            >
              <Text style={styles.removeBtnText}> Rimuovi</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.hint}>Inserisci nel formato GG/MM/AAAA</Text>
        {isOverdue && <Text style={styles.overdueWarning}> Scadenza superata</Text>}
      </View>
    );
  }

  // --- Android: dialogo nativo con OK / Annulla ---
  if (Platform.OS === 'android') {
    return (
      <View>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.dateBtn, isOverdue && styles.dateBtnOverdue, { flex: 1 }]}
            onPress={handleOpen}
          >
            <Text style={[styles.dateBtnText, isOverdue && styles.dateBtnTextOverdue]}>
              {dueDate ? ` ${formatDate(dueDate)}` : ' Aggiungi scadenza'}
            </Text>
          </TouchableOpacity>
          {dueDate && (
            <TouchableOpacity style={styles.removeBtn} onPress={() => onChange(null)}>
              <Text style={styles.removeBtnText}> Rimuovi</Text>
            </TouchableOpacity>
          )}
        </View>
        {isOverdue && <Text style={styles.overdueWarning}> Scadenza superata</Text>}
        {isOpen && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={(event: any, selected?: Date) => {
              setIsOpen(false);
              if (event.type === 'set' && selected) {
                onChange(selected.getTime());
              }
            }}
          />
        )}
      </View>
    );
  }

  // --- iOS: picker spinner INLINE (niente Modal, evita conflitti con
  //     KeyboardAvoidingView e ScrollView della schermata padre) ---
  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.dateBtn, isOverdue && styles.dateBtnOverdue, { flex: 1 }]}
          onPress={isOpen ? handleCancel : handleOpen}
        >
          <Text style={[styles.dateBtnText, isOverdue && styles.dateBtnTextOverdue]}>
            {dueDate ? ` ${formatDate(dueDate)}` : ' Aggiungi scadenza'}
          </Text>
          <Text style={styles.chevron}>{isOpen ? '' : ''}</Text>
        </TouchableOpacity>
        {dueDate && !isOpen && (
          <TouchableOpacity style={styles.removeBtn} onPress={() => onChange(null)}>
            <Text style={styles.removeBtnText}> Rimuovi</Text>
          </TouchableOpacity>
        )}
      </View>
      {isOverdue && !isOpen && <Text style={styles.overdueWarning}> Scadenza superata</Text>}

      {isOpen && (
        <View style={styles.inlinePickerContainer}>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            locale="it-IT"
            textColor="#FFFFFF"
            onChange={(_: any, selected?: Date) => {
              if (selected) setTempDate(selected);
            }}
            style={styles.spinner}
          />
          <View style={styles.pickerActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Annulla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}> Conferma</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateBtnOverdue: {
    backgroundColor: '#FFEBEE',
  },
  dateBtnText: {
    fontSize: 14,
    color: '#388E3C',
    fontWeight: '600',
    flex: 1,
  },
  dateBtnTextOverdue: {
    color: '#F44336',
  },
  chevron: {
    fontSize: 11,
    color: '#7A869A',
    marginLeft: 6,
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
  },
  removeBtnText: {
    fontSize: 13,
    color: '#F44336',
    fontWeight: '600',
  },
  overdueWarning: {
    marginTop: 4,
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  inlinePickerContainer: {
    backgroundColor: '#172B4D',
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
  },
  spinner: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  pickerActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.15)',
  },
  cancelBtnText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#0079BF',
  },
  confirmBtnText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  webInput: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#172B4D',
  },
  webInputOverdue: {
    backgroundColor: '#FFEBEE',
    color: '#F44336',
  },
  hint: {
    marginTop: 4,
    fontSize: 11,
    color: '#A0AEC0',
  },
});
