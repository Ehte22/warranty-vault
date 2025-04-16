// import React, { memo, useCallback, useRef, useState, useEffect } from 'react'
// import { Text, View, StyleSheet } from 'react-native'
// import { AutocompleteDropdown, IAutocompleteDropdownRef } from 'react-native-autocomplete-dropdown'
// import { Surface } from 'react-native-paper'
// import { useCustomTheme } from '../context/ThemeContext'
// import { CustomTheme } from '../theme/theme'
// import { IFieldProps } from '../hooks/useDynamicForm'

// const AutoComplete: React.FC<IFieldProps> = memo(({ field, onChange }) => {
//     const [loading, setLoading] = useState(false)
//     const [options, setOptions] = useState<{ id: string, title: string }[] | null>(null)
//     const [selectedItem, setSelectedItem] = useState<string | null>(null)
//     const [isFocused, setIsFocused] = useState(false)
//     const dropdownRef = useRef<IAutocompleteDropdownRef>(null)

//     const { theme } = useCustomTheme()
//     const styles = customStyles(theme, isFocused)

//     const getSuggestions = useCallback(async (q: string) => {
//         const filterToken = q.toLowerCase()
//         if (typeof q !== 'string' || q.length < 3) {
//             setOptions(null)
//             return
//         }

//         setLoading(true)
//         try {
//             if (field?.options) {
//                 const filteredItems = field.options
//                     .filter((item: any) =>
//                         item.label.toLowerCase().includes(filterToken)
//                     )
//                     .map((item: any) => ({
//                         id: item.value.toString(),
//                         title: item.label,
//                     }))
//                 setOptions(filteredItems)
//             }
//         } catch (error) {
//             console.error('Error fetching suggestions:', error)
//             setOptions([])
//         } finally {
//             setLoading(false)
//         }
//     }, [field?.options])

//     const onClearPress = useCallback(() => {
//         if (field?.options) {
//             const filteredItems = field.options.map((item: any) => ({
//                 id: item.value.toString(),
//                 title: item.label,
//             }))
//             setOptions(filteredItems)
//         }
//     }, [field?.options])

//     useEffect(() => {
//         if (field?.options) {
//             const transformedOptions = field.options.map((item) => {
//                 return { id: item.value, title: item.label }
//             }) as { id: string, title: string }[]
//             setOptions(transformedOptions)
//         }
//     }, [field?.options, getSuggestions])

//     return (
//         <View style={styles.container}>
//             <Surface style={styles.surface}>
//                 <AutocompleteDropdown
//                     ref={dropdownRef}
//                     dataSet={options}
//                     onChangeText={getSuggestions}
//                     onSelectItem={item => {
//                         item && setSelectedItem(item.id)
//                     }}
//                     debounce={600}
//                     suggestionsListMaxHeight={300}
//                     onClear={onClearPress}
//                     // loading={loading}
//                     useFilter={false}
//                     textInputProps={{
//                         placeholder: field?.placeholder || "Search here...",
//                         placeholderTextColor: theme.dark ? "#D1D5DB" : "rgba(0, 0, 0, 0.7)",
//                         style: {
//                             color: theme.colors.text,
//                             height: '100%',
//                             paddingVertical: 0,
//                         },
//                         // onFocus: handleFocus,
//                         onBlur: () => setIsFocused(false),
//                     }}
//                     inputContainerStyle={{
//                         backgroundColor: 'transparent',
//                         borderWidth: 0,
//                         borderBottomWidth: 0,
//                         borderRadius: 0,
//                         height: '100%',
//                     }}
//                     containerStyle={{
//                         flexGrow: 1,
//                         height: '100%',
//                     }}
//                     suggestionsListContainerStyle={{
//                         backgroundColor: theme.colors.cardBg,
//                         borderColor: theme.colors.outline,
//                     }}
//                     renderItem={(item) => (
//                         <Text style={{
//                             color: theme.colors.text,
//                             padding: 16,
//                             borderBottomWidth: 1,
//                             borderBottomColor: theme.colors.outline,
//                         }}>
//                             {item.title}
//                         </Text>
//                     )}
//                     rightButtonsContainerStyle={{
//                         right: 8,
//                         height: '100%',
//                         alignSelf: 'center',
//                     }}
//                     inputHeight={52}
//                     closeOnBlur={true}
//                     initialValue={selectedItem ? selectedItem.toString() : undefined}
//                 />
//             </Surface>
//         </View>
//     )
// })

// const customStyles = (theme: CustomTheme, isFocused: boolean) => {
//     return StyleSheet.create({
//         container: {
//             width: '100%',
//             marginTop: 16,
//         },
//         surface: {
//             elevation: 2,
//             borderRadius: 4,
//             height: 56,
//             backgroundColor: theme.colors.cardBg,
//             borderWidth: theme.dark || isFocused ? 1 : 0,
//             borderColor: theme.colors.primary
//         },
//         selectedItem: {
//             marginTop: 8,
//             fontSize: 14,
//             opacity: 0.7,
//         },
//     })
// }

// export default AutoComplete

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { AutocompleteDropdown, AutocompleteDropdownItem, IAutocompleteDropdownRef } from 'react-native-autocomplete-dropdown';
import { Surface } from 'react-native-paper';
import { useCustomTheme } from '../context/ThemeContext';
import { CustomTheme } from '../theme/theme';
import { IFieldProps } from '../hooks/useDynamicForm';

const AutoComplete: React.FC<IFieldProps> = memo(({ field, onChange, errors, value }) => {
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const dropdownRef = useRef<IAutocompleteDropdownRef>(null);
    const { theme } = useCustomTheme();
    const styles = customStyles(theme, isFocused);

    const defaultOptions = useMemo<AutocompleteDropdownItem[]>(() => {
        if (!field?.options) return [];
        return field.options.map(item => ({
            id: item.value?.toString(),
            title: item.label,
        })) as AutocompleteDropdownItem[]
    }, [field?.options]);

    const [options, setOptions] = useState(defaultOptions);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        setOptions(defaultOptions);
    }, [defaultOptions]);

    const handleSelectItem = useCallback((item: AutocompleteDropdownItem | null) => {
        if (onChange) {
            if (item) {
                onChange(item.id);
            } else {
                onChange('');
            }
        }
    }, [onChange]);

    const getSuggestions = useCallback(async (q: string) => {
        const filterToken = q.toLowerCase();
        setLoading(true);
        try {
            if (typeof q === 'string' && q.length >= 1) {
                const filteredItems = defaultOptions.filter(option =>
                    option.title?.toLowerCase().includes(filterToken)
                );

                setOptions(filteredItems);
            } else {
                setOptions(defaultOptions);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setOptions(defaultOptions);
        } finally {
            setLoading(false);
        }
    }, [defaultOptions]);

    const onClearPress = useCallback(() => {
        setOptions(defaultOptions);
        handleSelectItem(null);
    }, [defaultOptions, handleSelectItem]);

    return (
        <View style={styles.container}>
            <Surface style={[styles.surface, errors && styles.errorInputContainer]}>
                <AutocompleteDropdown
                    ref={dropdownRef}
                    dataSet={options}
                    loading={loading}
                    onChangeText={getSuggestions}
                    onSelectItem={handleSelectItem}
                    debounce={600}
                    onFocus={() => setIsFocused(true)}
                    suggestionsListMaxHeight={300}
                    onClear={onClearPress}
                    useFilter={false}
                    textInputProps={{
                        value: defaultOptions.find(item => item.id === value)?.title as string,
                        placeholder: field?.placeholder || "Search...",
                        placeholderTextColor: theme.dark ? "#D1D5DB" : "#000000B3",
                        style: {
                            color: theme.colors.text,
                            height: '100%',
                            paddingVertical: 0,
                        },
                        onFocus: handleFocus,
                        onBlur: () => setIsFocused(false),
                    }}
                    inputContainerStyle={styles.inputContainer}

                    containerStyle={{
                        flexGrow: 1,
                        height: '100%',
                    }}
                    suggestionsListContainerStyle={{
                        backgroundColor: theme.colors.cardBg,
                        borderColor: theme.colors.outline,
                    }}
                    renderItem={(item) => (
                        <Text style={{
                            color: theme.colors.text,
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: theme.colors.outline,
                        }}>
                            {item.title}
                        </Text>
                    )}
                    rightButtonsContainerStyle={{
                        right: 8,
                        height: '100%',
                        alignSelf: 'center',
                    }}
                    inputHeight={52}
                    closeOnBlur={true}
                />
            </Surface>
        </View>
    );
});

const customStyles = (theme: CustomTheme, isFocused: boolean) => {
    return StyleSheet.create({
        container: {
            width: '100%',
            marginTop: 16,
        },
        surface: {
            elevation: 2,
            borderRadius: 4,
            height: 56,
            backgroundColor: theme.colors.cardBg,
            borderWidth: isFocused || theme.dark ? 1 : 0,
            borderColor: theme.colors.primary
        },
        inputContainer: {
            backgroundColor: 'transparent',
            borderWidth: 0,
            borderBottomWidth: 0,
            borderRadius: 0,
            height: '100%',

        },
        errorInputContainer: {
            borderColor: theme.colors.error,
            borderWidth: 1
        },
        selectedItem: {
            marginTop: 8,
            fontSize: 14,
            opacity: 0.7,
        },
    })
}

export default AutoComplete;