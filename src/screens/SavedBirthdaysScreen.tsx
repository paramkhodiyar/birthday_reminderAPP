// src/screens/SavedBirthdaysScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../context/ThemeContext';
import {useBirthday, Birthday} from '../context/BirthdayContext';
import BirthdayCard from '../components/BirthdayCards';
import AddBirthdayModal from '../components/AddBirthdayModal';
import NotificationService from '../services/NotificationService';


const SavedBirthdaysScreen = () => {
  const {colors} = useTheme();
  const {birthdays, removeBirthday, updateBirthdays} = useBirthday();
  const [selectedDate, setSelectedDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showCalendar, setShowCalendar] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);

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

  // Calendar generation functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  useEffect(() => {
    if (birthdays.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [birthdays]);
  

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: 10,
    },
    header: {
      flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  paddingBottom: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#E3D5C4',
  paddingHorizontal: 20,
  marginTop: 35,
},
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    testButton: {
      padding: 10,
      marginRight: 10,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 25,
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      marginBottom: 20,
      opacity: 0.5,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    listContent: {
      paddingTop: 15,
      paddingBottom: 20,
    },
    statsContainer: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginTop: 15,
      borderRadius: 12,
      padding: 15,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    statsText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
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
      width: '80%',
      maxHeight: '60%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 15,
    },
    modalItem: {
      padding: 15,
      borderRadius: 8,
      marginVertical: 2,
    },
    selectedModalItem: {
      backgroundColor: colors.primary,
    },
    modalItemText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },
    selectedModalItemText: {
      color: colors.surface,
      fontWeight: '600',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 15,
    },
    modalButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      minWidth: 80,
    },
    modalCancelButton: {
      backgroundColor: colors.textSecondary,
    },
    modalButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    // Calendar specific styles
    calendarContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      margin: 20,
      padding: 15,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 3,
      maxHeight: 400, // Make calendar scrollable
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    calendarHeaderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.primary + '20',
    },
    calendarHeaderText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginRight: 5,
    },
    calendarWeekHeader: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
      paddingVertical: 5,
    },
    weekDayText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      width: 35,
      textAlign: 'center',
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
    },
    calendarDay: {
      width: 35,
      height: 35,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 2,
      borderRadius: 17.5,
    },
    calendarDayText: {
      fontSize: 14,
      color: colors.text,
    },
    selectedCalendarDay: {
      backgroundColor: colors.primary,
    },
    selectedCalendarDayText: {
      color: colors.surface,
      fontWeight: '600',
    },
    emptyCalendarDay: {
      width: 35,
      height: 35,
      margin: 2,
    },
    calendarActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: colors.textSecondary + '20',
    },
    calendarActionButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      minWidth: 80,
    },
    cancelButton: {
      backgroundColor: colors.textSecondary + '20',
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    confirmButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await updateBirthdays();
    setRefreshing(false);
  };

  const handleDateSelect = (day: number) => {
    const dateString = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setSelectedDate(dateString);
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

  const confirmDateSelection = () => {
    if (selectedDate) {
      setShowCalendar(false);
      // Here you can handle the confirmed date selection
      Alert.alert('Date Selected', `Selected date: ${selectedDate}`);
    }
  };

  const calculateAgeHandler = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date of birth');
      return;
    }
  };

  const handleDeleteBirthday = (birthday: Birthday) => {
    Alert.alert(
      'Delete Birthday',
      `Are you sure you want to delete ${birthday.name}'s birthday?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeBirthday(birthday.id),
        },
      ]
    );
  };

  const renderBirthdayItem = ({item, index}: {item: Birthday; index: number}) => (
    <BirthdayCard
      birthday={item}
      onDelete={() => handleDeleteBirthday(item)}
      index={index}
    />
  );

  const renderCalendarDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={index} style={styles.emptyCalendarDay} />;
    }

    const isSelected = selectedDate === `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          isSelected && styles.selectedCalendarDay,
        ]}
        onPress={() => handleDateSelect(day)}>
        <Text
          style={[
            styles.calendarDayText,
            isSelected && styles.selectedCalendarDayText,
          ]}>
          {day}
        </Text>
      </TouchableOpacity>
    );
  };

  const upcomingBirthdays = birthdays
    .filter(b => b.nextBirthday.daysUntil <= 30)
    .sort((a, b) => a.nextBirthday.daysUntil - b.nextBirthday.daysUntil);

  if (birthdays.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Birthdays</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}>
            <Icon name="add" size={28} color={colors.surface} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.emptyContainer}>
          <Icon 
            name="cake" 
            size={80} 
            color={colors.textSecondary} 
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No Birthdays Saved</Text>
          <Text style={styles.emptySubtitle}>
            Start by calculating someone's age and save their birthday, or tap the + button to add a new birthday.
          </Text>
        </View>

        <AddBirthdayModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Birthdays</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => NotificationService.showTestNotification()}>
            <Icon name="notifications" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}>
            <Icon name="add" size={28} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {upcomingBirthdays.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {upcomingBirthdays.length} upcoming birthday{upcomingBirthdays.length !== 1 ? 's' : ''} in the next 30 days
          </Text>
        </View>
      )}

      {/* Calendar Section - Now Scrollable */}
      {showCalendar && (
        <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.calendarHeaderButton}
              onPress={() => setShowMonthPicker(true)}>
              <Text style={styles.calendarHeaderText}>
                {months.find(m => m.value === selectedMonth)?.name}
              </Text>
              <Icon name="keyboard-arrow-down" size={20} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.calendarHeaderButton}
              onPress={() => setShowYearPicker(true)}>
              <Text style={styles.calendarHeaderText}>{selectedYear}</Text>
              <Icon name="keyboard-arrow-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarWeekHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {generateCalendarDays().map((day, index) => renderCalendarDay(day, index))}
          </View>

          <View style={styles.calendarActions}>
            <TouchableOpacity
              style={[styles.calendarActionButton, styles.cancelButton]}
              onPress={() => setShowCalendar(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.calendarActionButton, styles.confirmButton]}
              onPress={confirmDateSelection}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <Animated.View style={[styles.listContainer, {opacity: fadeAnim}]}>
        <FlatList
          data={birthdays.sort((a, b) => a.nextBirthday.daysUntil - b.nextBirthday.daysUntil)}
          renderItem={renderBirthdayItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      <AddBirthdayModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

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
              showsVerticalScrollIndicator={false}
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
              showsVerticalScrollIndicator={false}
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
  );
};

export default SavedBirthdaysScreen;