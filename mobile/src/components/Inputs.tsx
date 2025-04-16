import { StyleSheet } from 'react-native'
import React from 'react'
import { IFieldProps } from '../hooks/useDynamicForm'
import { Surface, TextInput } from 'react-native-paper'
import { CustomTheme } from '../theme/theme'

const Inputs: React.FC<IFieldProps> = ({ field, onChange, onBlur, value, disabled, errors, theme }) => {
    const styles = customStyles(theme as CustomTheme)

    return <>
        <Surface style={styles.inputSurface}>
            <TextInput
                mode="outlined"
                label={field.placeholder}
                placeholder={field.placeholder}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors}
                disabled={disabled}
                placeholderTextColor={field.placeholder}
                multiline={field.multiline || false}
                numberOfLines={field.numberOfMultiline}
                outlineColor={theme?.dark ? theme?.colors.primary : "transparent"}
                keyboardType={field?.keyboardType || "default"}
                style={[styles.input, field.styles]}
                cursorColor="gray"
                outlineStyle={{ borderWidth: 1 }}
            />
        </Surface>
    </>
}

export default Inputs

const customStyles = (theme: CustomTheme) => {
    return StyleSheet.create({
        inputSurface: {
            margin: 0,
            borderRadius: 4,
            paddingTop: 0,
            paddingBottom: 0,
            marginTop: 16
        },
        input: {
            width: '100%',
            borderRadius: 4,
            backgroundColor: theme.colors.inputBackground,
            marginTop: -6.5,
            paddingTop: 0,
            paddingBottom: 0,
            fontSize: 16,
        },
        errorInputContainer: {
            borderColor: theme.colors.error,
        },
    })
}