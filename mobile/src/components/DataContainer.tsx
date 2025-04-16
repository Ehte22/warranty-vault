import React from 'react'
import FontAwesome6 from "react-native-vector-icons/FontAwesome6"
import { Text, TextInput, Surface } from 'react-native-paper';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { CustomTheme } from '../theme/theme';
import { useCustomTheme } from '../context/ThemeContext';
import { usePathname, useRouter } from 'expo-router';

export interface DataContainerConfig {
    pageTitle?: string;
    backLink?: string;
    showAddBtn?: boolean;
    showSearchBar?: boolean;
    showPagination?: boolean;
    showRefreshButton?: boolean;
    showSelector?: boolean;
    showBackBtn?: boolean;
    table?: boolean;
    tableData?: any
    tableColumns?: any
    totalRecords?: any
    totalPages?: any
    onSearch?: (query: string) => void;
    onSelect?: (query: string) => void;
    onPageChange?: any
    pageIndex?: number
    pageSize?: number
}

export interface DataContainerProps {
    config: DataContainerConfig
}

const DataContainer: React.FC<DataContainerProps> = ({ config }) => {
    const { theme } = useCustomTheme()
    const router = useRouter()
    const pathName = usePathname()

    const handleAdd = () => {
        router.push(`${pathName}/add` as any)
    }

    const handleRefresh = () => {
        router.replace(pathName as any)
    }

    const handleBack = () => {
        router.back()
    }

    const styles = customStyles(theme)
    return <>
        <Surface style={styles.container}>
            <View style={styles.titleContainer}>
                <Text variant='titleMedium'
                    style={{ fontSize: 19, color: theme.colors.text }}
                >
                    {config.pageTitle}
                </Text>

                <View style={styles.btnContainer}>
                    {
                        config.showRefreshButton && <TouchableOpacity style={styles.iconButton} onPress={handleRefresh}>
                            <FontAwesome6 name="rotate" size={16} color={theme.colors.btnText} />
                        </TouchableOpacity>
                    }

                    {
                        config.showAddBtn && <TouchableOpacity style={styles.iconButton} onPress={handleAdd}>
                            <FontAwesome6 name="plus" size={16} color={theme.colors.btnText} />
                        </TouchableOpacity>
                    }

                    {
                        config.showBackBtn && <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
                            <Text style={{ color: theme.colors.btnText, fontSize: 14, paddingHorizontal: 4, fontWeight: 'bold' }}>BACK</Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>

            {
                config.showSearchBar && <TextInput
                    mode="outlined"
                    label="Search"
                    onChangeText={config.onSearch}
                    right={
                        <TextInput.Icon
                            icon="magnify"
                            color="gray"
                            size={28}
                            forceTextInputFocus={false}
                        />
                    }
                    style={styles.input}
                    outlineColor="gray"
                    activeOutlineColor={theme.dark ? "white" : "black"}
                    outlineStyle={{ borderWidth: 1 }}
                    textColor={theme.colors.text}
                />
            }
        </Surface>
    </>
}

export default DataContainer

const customStyles = (theme: CustomTheme) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.colors.cardBg,
            padding: 16,
            borderRadius: 4,
            marginTop: 16,
            elevation: 4,
        },
        titleContainer: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
        },
        btnContainer: {
            display: "flex",
            flexDirection: "row",
            gap: 10
        },
        iconButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 4,
            paddingHorizontal: 10,
            paddingVertical: 8,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        input: {
            width: '100%',
            backgroundColor: theme.colors.cardBg,
            height: 42,
            marginTop: 10,
        },
    })
}