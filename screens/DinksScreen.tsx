import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { auth, db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const { height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Drinks'>;

const DrinkScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [motivation, setMotivation] = useState('3 months');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const now = new Date();

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event?.type === 'set' && selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event?.type === 'set' && selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, 'drinks'), {
        userId: user.uid,
        timestamp: Timestamp.fromDate(date),
        motivation: motivation,
      });
      navigation.navigate('Home');
    } catch (error) {
      console.error("Error saving drink:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Log Drink</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Your Goal Duration</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={motivation}
            onValueChange={(itemValue: React.SetStateAction<string>) => setMotivation(itemValue)}
            mode="dropdown"
            style={styles.picker}
          >
            <Picker.Item label="1 week" value="1 week" />
            <Picker.Item label="1 month" value="1 month" />
            <Picker.Item label="3 months" value="3 months" />
            <Picker.Item label="6 months" value="6 months" />
            <Picker.Item label="1 year" value="1 year" />
          </Picker>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>When did you last have a drink?</Text>
        <Text style={styles.subLabel}>Date</Text>
        <TouchableOpacity style={styles.inputField} onPress={() => setShowDatePicker(true)}>
          <Text>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        <Text style={[styles.subLabel, { marginTop: 12 }]}>Time</Text>
        <TouchableOpacity style={styles.inputField} onPress={() => setShowTimePicker(true)}>
          <Text>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="spinner"
            onChange={onTimeChange}
          />
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="#FFF9FB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Community')}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#FFF9FB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Create')}>
          <Ionicons name="create" size={24} color="#FFF9FB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings" size={24} color="#FFF9FB" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9FB',
    paddingHorizontal: 20,
    paddingTop: height * 0.05,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A1D23',
    marginBottom: height * 0.04,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A1D23',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    color: '#4A1D23',
    marginBottom: 4,
  },
  pickerWrapper: {
    backgroundColor: '#FCDCE4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F25077',
  },
  picker: {
    height: 50,
  },
  inputField: {
    backgroundColor: '#FCDCE4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F25077',
    padding: 12,
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#F25077',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: '#FFF9FB',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navbar: {
    position: 'absolute',
    bottom: 45,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#A93853',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 25,
  },
});

export default DrinkScreen;
