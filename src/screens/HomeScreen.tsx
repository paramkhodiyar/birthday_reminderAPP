// src/screens/HomeScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useTheme} from '../context/ThemeContext';
import {useBirthday, calculateAge, calculateNextBirthday} from '../context/BirthdayContext';
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

const HomeScreen = () => {
  const {colors} = useTheme();
  const {addBirthday} = useBirthday();
  const [selectedDate, setSelectedDate] = useState('');
  const [name, setName] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  // const MaterialIcon = MaterialIcons as any;
  
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 35,
      backgroundColor: colors.background,
    },
    safeareas : {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
    },
    headerContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  paddingBottom: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#E3D5C4', // soft brown divider to match
}
,
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    themeToggle: {
      padding: 10,
      borderRadius: 20,
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
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
      backgroundColor: colors.surface,
    },
    dateButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 15,
      backgroundColor: colors.surface,
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
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    calendarHeaderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    calendarHeaderText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginHorizontal: 5,
    },
    calculateButton: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    calculateButtonText: {
      color: colors.surface,
      fontSize: 18,
      fontWeight: '600',
    },
    resultContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    resultTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 15,
    },
    ageContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    ageItem: {
      alignItems: 'center',
    },
    ageNumber: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.primary,
    },
    ageLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    nextBirthdayContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
    },
    nextBirthdayText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
    },
    actionButton: {
      paddingVertical: 10,
      paddingHorizontal: 25,
      borderRadius: 20,
      minWidth: 100,
      alignItems: 'center',
    },
    saveButton: {
      backgroundColor: colors.success,
    },
    discardButton: {
      backgroundColor: colors.textSecondary,
    },
    actionButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    // Modal styles
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
    buttonFixedContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background,
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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

  const calculateAgeHandler = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date of birth');
      return;
    }

    const age = calculateAge(selectedDate);
    const nextBirthday = calculateNextBirthday(selectedDate);
    
    setCalculatedAge({
      age,
      nextBirthday,
      dateOfBirth: selectedDate,
      name: name || 'Unknown',
    });
    
    setShowResult(true);
    
    // Animate result appearance
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleSave = async () => {
    if (!calculatedAge) return;
    
    try {
      await addBirthday({
        name: calculatedAge.name,
        dateOfBirth: calculatedAge.dateOfBirth,
        age: calculatedAge.age,
        nextBirthday: calculatedAge.nextBirthday,
      });
      
      Alert.alert('Success', 'Birthday saved successfully!');
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save birthday');
    }
  };

  const handleDiscard = () => {
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setSelectedDate('');
    setCalculatedAge(null);
    setShowResult(false);
    slideAnim.setValue(0);
  };

  const {toggleTheme} = useTheme();

  return (
    <SafeAreaView style={styles.safeareas}>
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{paddingBottom: 120}} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Calculate Age</Text>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Icon name="brightness-6" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name (Optional)</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Birth</Text>
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
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
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

        {showResult && calculatedAge && (
          <Animated.View
            style={[
              styles.resultContainer,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              },
            ]}>
            <Text style={styles.resultTitle}>
              {calculatedAge.name !== 'Unknown' ? calculatedAge.name : 'Age Calculation'}
            </Text>
            
            <View style={styles.ageContainer}>
              <View style={styles.ageItem}>
                <Text style={styles.ageNumber}>{calculatedAge.age.years}</Text>
                <Text style={styles.ageLabel}>Years</Text>
              </View>
              <View style={styles.ageItem}>
                <Text style={styles.ageNumber}>{calculatedAge.age.months}</Text>
                <Text style={styles.ageLabel}>Months</Text>
              </View>
              <View style={styles.ageItem}>
                <Text style={styles.ageNumber}>{calculatedAge.age.days}</Text>
                <Text style={styles.ageLabel}>Days</Text>
              </View>
            </View>

            <View style={styles.nextBirthdayContainer}>
              <Text style={styles.nextBirthdayText}>
                Next Birthday: {calculatedAge.nextBirthday.date}
              </Text>
              <Text style={styles.nextBirthdayText}>
                {calculatedAge.nextBirthday.daysUntil === 0
                  ? 'Today is the birthday! 🎉'
                  : `${calculatedAge.nextBirthday.daysUntil} days to go`}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.discardButton]}
                onPress={handleDiscard}>
                <Text style={styles.actionButtonText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}>
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.buttonFixedContainer}>
        <TouchableOpacity style={styles.calculateButton} onPress={calculateAgeHandler}>
          <Text style={styles.calculateButtonText}>Calculate Age</Text>
        </TouchableOpacity>
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
    </View>
    </SafeAreaView>
  );
};

export default HomeScreen;