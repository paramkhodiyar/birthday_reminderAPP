// src/components/AddBirthdayModal.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../context/ThemeContext';
import {useBirthday, calculateAge, calculateNextBirthday} from '../context/BirthdayContext';

interface AddBirthdayModalProps {
  visible: boolean;
  onClose: () => void;
}

const {height: screenHeight} = Dimensions.get('window');

const AddBirthdayModal: React.FC<AddBirthdayModalProps> = ({visible, onClose}) => {
  const {colors} = useTheme();
  const {addBirthday} = useBirthday();
  const [name, setName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [slideAnim] = useState(new Animated.Value(screenHeight));
  
  // New state for year/month selection
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);

  // Generate years (from 1900 to current year)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  const months = [
    {name: 'January', value: 1},
    {name: 'February', value: 2},
    {name: 'March', value: 3},
    {name: 'April', value: 4},
    {name: 'May', value: 5},
    {name: 'June', value: 6},
    {name: 'July', value: 7},
    {name: 'August', value: 8},
    {name: 'September', value: 9},
    {name: 'October', value: 10},
    {name: 'November', value: 11},
    {name: 'December', value: 12},
  ];

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: screenHeight * 0.9,
      minHeight: screenHeight * 0.6,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      padding: 5,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    dateButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 15,
      backgroundColor: colors.background,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateButtonText: {
      fontSize: 16,
      color: selectedDate ? colors.text : colors.textSecondary,
    },
    calendarContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 10,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    calendarHeaderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    calendarHeaderText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginHorizontal: 5,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 10,
    },
    button: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: colors.textSecondary,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    disabledButton: {
      backgroundColor: colors.border,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.surface,
    },
    requiredText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    // Modal styles for year/month pickers
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      maxHeight: '60%',
      width: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    modalItem: {
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalItemText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },
    selectedModalItem: {
      backgroundColor: colors.primary + '20',
    },
    selectedModalItemText: {
      color: colors.primary,
      fontWeight: '600',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center',
    },
    modalCancelButton: {
      backgroundColor: colors.textSecondary,
    },
    modalConfirmButton: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
    updateCalendarDate(year, selectedMonth);
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setShowMonthPicker(false);
    updateCalendarDate(selectedYear, month);
  };

  const updateCalendarDate = (year: number, month: number) => {
    const dateString = `${year}-${month.toString().padStart(2, '0')}-01`;
    setCalendarDate(dateString);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date of birth');
      return;
    }

    try {
      const age = calculateAge(selectedDate);
      const nextBirthday = calculateNextBirthday(selectedDate);

      await addBirthday({
        name: name.trim(),
        dateOfBirth: selectedDate,
        age,
        nextBirthday,
      });

      Alert.alert('Success', 'Birthday added successfully!');
      handleClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add birthday');
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedDate('');
    setShowCalendar(false);
    setShowYearPicker(false);
    setShowMonthPicker(false);
    onClose();
  };

  const isFormValid = name.trim() && selectedDate;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Birthday</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={{paddingBottom: 20}} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Name <Text style={styles.requiredText}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Date of Birth <Text style={styles.requiredText}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCalendar(!showCalendar)}>
                <Text style={styles.dateButtonText}>
                  {selectedDate || 'Select date of birth'}
                </Text>
                <Icon
                  name={showCalendar ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {showCalendar && (
              <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity
                    style={styles.calendarHeaderButton}
                    onPress={() => setShowYearPicker(true)}>
                    <Icon name="date-range" size={20} color={colors.text} />
                    <Text style={styles.calendarHeaderText}>{selectedYear}</Text>
                    <Icon name="keyboard-arrow-down" size={20} color={colors.text} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.calendarHeaderButton}
                    onPress={() => setShowMonthPicker(true)}>
                    <Icon name="event" size={20} color={colors.text} />
                    <Text style={styles.calendarHeaderText}>
                      {months.find(m => m.value === selectedMonth)?.name}
                    </Text>
                    <Icon name="keyboard-arrow-down" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                <Calendar
                  key={calendarDate}
                  current={calendarDate}
                  onDayPress={handleDateSelect}
                  markedDates={{
                    [selectedDate]: {
                      selected: true,
                      selectedColor: colors.primary,
                    },
                  }}
                  theme={{
                    backgroundColor: colors.background,
                    calendarBackground: colors.background,
                    textSectionTitleColor: colors.text,
                    selectedDayBackgroundColor: colors.primary,
                    selectedDayTextColor: colors.surface,
                    todayTextColor: colors.primary,
                    dayTextColor: colors.text,
                    textDisabledColor: colors.textSecondary,
                    arrowColor: colors.primary,
                    monthTextColor: colors.text,
                    textDayFontWeight: '500',
                    textMonthFontWeight: '700',
                    textDayHeaderFontWeight: '600',
                  }}
                  maxDate={new Date().toISOString().split('T')[0]}
                  hideArrows={true}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                isFormValid ? styles.saveButton : styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={!isFormValid}>
              <Text style={styles.buttonText}>Save Birthday</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Year</Text>
            <FlatList
              data={generateYears()}
              keyExtractor={(item) => item.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item === selectedYear && styles.selectedModalItem,
                  ]}
                  onPress={() => handleYearSelect(item)}>
                  <Text
                    style={[
                      styles.modalItemText,
                      item === selectedYear && styles.selectedModalItemText,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowYearPicker(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <FlatList
              data={months}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.value === selectedMonth && styles.selectedModalItem,
                  ]}
                  onPress={() => handleMonthSelect(item.value)}>
                  <Text
                    style={[
                      styles.modalItemText,
                      item.value === selectedMonth && styles.selectedModalItemText,
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowMonthPicker(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default AddBirthdayModal;