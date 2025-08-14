// src/components/BirthdayCard.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../context/ThemeContext';
import {Birthday} from '../context/BirthdayContext';

interface BirthdayCardProps {
  birthday: Birthday;
  onDelete: () => void;
  index: number;
}

const BirthdayCard: React.FC<BirthdayCardProps> = ({birthday, onDelete, index}) => {
  const {colors} = useTheme();
  const [slideAnim] = useState(new Animated.Value(-100));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  }, []);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: 15,
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 6,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingBottom: 15,
    },
    nameContainer: {
      flex: 1,
    },
    name: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    birthDate: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
    },
    ageContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 20,
      paddingBottom: 15,
    },
    ageItem: {
      alignItems: 'center',
    },
    ageNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
    },
    ageLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    nextBirthdayContainer: {
      backgroundColor: colors.background,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextBirthdayText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 8,
      fontWeight: '500',
    },
    todayBirthday: {
      backgroundColor: colors.success,
    },
    todayText: {
      color: colors.surface,
      fontWeight: '600',
    },
    upcomingBirthday: {
      backgroundColor: colors.accent,
    },
    upcomingText: {
      color: colors.surface,
      fontWeight: '600',
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getNextBirthdayStyle = () => {
    if (birthday.nextBirthday.daysUntil === 0) {
      return [styles.nextBirthdayContainer, styles.todayBirthday];
    } else if (birthday.nextBirthday.daysUntil <= 7) {
      return [styles.nextBirthdayContainer, styles.upcomingBirthday];
    }
    return styles.nextBirthdayContainer;
  };

  const getNextBirthdayTextStyle = () => {
    if (birthday.nextBirthday.daysUntil === 0) {
      return [styles.nextBirthdayText, styles.todayText];
    } else if (birthday.nextBirthday.daysUntil <= 7) {
      return [styles.nextBirthdayText, styles.upcomingText];
    }
    return styles.nextBirthdayText;
  };

  const getNextBirthdayIcon = () => {
    if (birthday.nextBirthday.daysUntil === 0) {
      return 'celebration';
    } else if (birthday.nextBirthday.daysUntil <= 7) {
      return 'cake';
    }
    return 'event';
  };

  const getNextBirthdayIconColor = () => {
    if (birthday.nextBirthday.daysUntil === 0 || birthday.nextBirthday.daysUntil <= 7) {
      return colors.surface;
    }
    return colors.primary;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {translateX: slideAnim},
            {scale: scaleAnim},
          ],
        },
      ]}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{birthday.name || 'Unknown'}</Text>
          <Text style={styles.birthDate}>
            Born: {formatDate(birthday.dateOfBirth)}
          </Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Icon name="delete-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.ageContainer}>
        <View style={styles.ageItem}>
          <Text style={styles.ageNumber}>{birthday.age.years}</Text>
          <Text style={styles.ageLabel}>Years</Text>
        </View>
        <View style={styles.ageItem}>
          <Text style={styles.ageNumber}>{birthday.age.months}</Text>
          <Text style={styles.ageLabel}>Months</Text>
        </View>
        <View style={styles.ageItem}>
          <Text style={styles.ageNumber}>{birthday.age.days}</Text>
          <Text style={styles.ageLabel}>Days</Text>
        </View>
      </View>

      <View style={getNextBirthdayStyle()}>
        <Icon
          name={getNextBirthdayIcon()}
          size={18}
          color={getNextBirthdayIconColor()}
        />
        <Text style={getNextBirthdayTextStyle()}>
          {birthday.nextBirthday.daysUntil === 0
            ? 'Today is the birthday! 🎉'
            : birthday.nextBirthday.daysUntil === 1
            ? 'Tomorrow!'
            : `${birthday.nextBirthday.daysUntil} days to go`}
        </Text>
      </View>
    </Animated.View>
  );
};

export default BirthdayCard;