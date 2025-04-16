import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { IFieldProps } from '../hooks/useDynamicForm';
import { Surface } from 'react-native-paper';
import { CustomTheme } from '../theme/theme';

const DateField: React.FC<IFieldProps> = ({ field, value, onChange, errors, theme }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowPicker(false);

        if (onChange) {
            if (event.type === 'set' && selectedDate) {
                const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');

                onChange(formattedDate)
            } else {
                onChange("")
            }
        }
    };


    const styles = customStyles(theme as CustomTheme, showPicker)

    return (
        <View style={styles.container}>
            <Surface style={[styles.surface, errors && styles.errorInputContainer]}>
                <TouchableOpacity
                    onPress={() => setShowPicker(true)}
                    style={[styles.input, errors && styles.errorInput]}
                >
                    <Text style={[styles.text, !value && styles.placeholder]}>
                        {value ? dayjs(value).format('YYYY-MM-DD') : field.placeholder}
                    </Text>
                </TouchableOpacity>
            </Surface>

            {showPicker && (
                <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display={'spinner'}
                    onChange={handleDateChange}
                />
            )}
        </View>
    );
};

const customStyles = (theme: CustomTheme, showPicker: boolean) => {
    return StyleSheet.create({
        container: {
            width: '100%',
            marginTop: 16,
        },
        surface: {
            height: 56,
            borderRadius: 4,
            backgroundColor: theme?.colors.cardBg,
            borderWidth: theme?.dark || showPicker ? 1 : 0, borderColor: theme?.colors.primary
        },
        input: {
            borderRadius: 4,
            paddingHorizontal: 12,
            height: "100%"
        },
        errorInput: {
            borderColor: 'red',
        },
        text: {
            fontSize: 16,
            color: theme.colors.text,
            marginVertical: "auto"
        },
        placeholder: {
            color: theme.dark ? theme.colors.text : "#000000B3",
            marginVertical: "auto"
        },
        errorInputContainer: {
            borderColor: theme.colors.error,
            borderWidth: 1
        }
    });
}

export default DateField;