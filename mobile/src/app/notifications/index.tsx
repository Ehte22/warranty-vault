import { FlatList, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import DataContainer, { DataContainerConfig } from '@/src/components/DataContainer'
import { CustomTheme } from '@/src/theme/theme'
import { View } from 'react-native'
import { useCustomTheme } from '@/src/context/ThemeContext'
import { useDeleteBrandMutation, useGetBrandsQuery } from '@/src/redux/apis/brand.api'
import { useDebounce } from '@/src/utils/useDebounce'
import { Chip, DataTable, PaperProvider, Surface, Text } from 'react-native-paper'
import ActionsMenu from '@/src/components/ActionMenu'
import Toast from '@/src/components/Toast'
import { BorderlessButton } from 'react-native-gesture-handler'
import { useDeleteNotificationMutation, useGetNotificationQuery } from '@/src/redux/apis/notification.api'
import { INotification } from '@/src/models/notification.interface'

const Notifications = () => {
    const numberOfItemsPerPageList = [5, 10, 25, 50]

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [notifications, setNotifications] = useState<INotification[]>([])
    const [page, setPage] = useState<number>(0)
    const [itemsPerPage, setItemsPerPage] = useState<number>(10)
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: "ascending" | "descending" } | null>(null)


    const config: DataContainerConfig = {
        pageTitle: "Notifications",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedUser
    }

    const debounceSearchQuery = useDebounce(searchQuery, 500)

    const { data, isLoading } = useGetNotificationQuery({
        page: page + 1,
        limit: itemsPerPage,
        searchQuery: debounceSearchQuery.toLowerCase(),
        selectedUser
    })
    const [deleteNotification, { data: message, isSuccess }] = useDeleteNotificationMutation()

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, data?.pagination.totalEntries || 0);

    const handleSort = (key: string) => {
        const direction = sortConfig?.key === key && sortConfig.direction === "ascending"
            ? "descending" : "ascending"

        setSortConfig({ key, direction })

        setNotifications([...notifications].sort((a, b) => {
            const getValue = (item: any, k: string) => {
                const [parent, child] = k.split('.');
                return child ? item[parent]?.[child] : item[k]
            };

            const valA = getValue(a, key);
            const valB = getValue(b, key);

            if (typeof valA === 'number' && typeof valB === 'number') {
                return direction === 'ascending' ? valA - valB : valB - valA;
            }

            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();

            if (strA < strB) return direction === 'ascending' ? -1 : 1;
            if (strA > strB) return direction === 'ascending' ? 1 : -1;
            return 0;
        }));
    }

    const { theme } = useCustomTheme()
    const styles = customStyles(theme)

    useEffect(() => {
        if (data?.result) {
            const x = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            setNotifications(x)
        }
    }, [data?.result])

    useEffect(() => {
        setPage(0)
    }, [itemsPerPage, debounceSearchQuery])


    if (isLoading) {
        return <Text>Loading...</Text>
    }

    return <>
        {isSuccess && <Toast type='success' message={message as string} />}
        <View style={styles.container}>
            <DataContainer config={config} />
            <Surface style={styles.surface}>
                <ScrollView horizontal>
                    <DataTable style={{ backgroundColor: theme.colors.cardBg }}>
                        <DataTable.Header>
                            <DataTable.Title
                                sortDirection={sortConfig?.key === "serialNo" ? sortConfig.direction : undefined}
                                onPress={() => handleSort("serialNo")}
                                style={{ width: 70, marginRight: 20 }}>
                                Sr. No.
                            </DataTable.Title>
                            <DataTable.Title
                                sortDirection={sortConfig?.key === "product.name" ? sortConfig.direction : undefined}
                                onPress={() => handleSort("product.name")}
                                style={{ width: 180, marginRight: 20 }}>
                                Product
                            </DataTable.Title>
                            <DataTable.Title
                                sortDirection={sortConfig?.key === "policy.name" ? sortConfig.direction : undefined}
                                onPress={() => handleSort("policy.name")}
                                style={{ width: 180, marginRight: 20 }}>
                                Policy
                            </DataTable.Title>
                            <DataTable.Title style={{ width: 250, marginRight: 20 }}>
                                Message
                            </DataTable.Title>
                            <DataTable.Title
                                sortDirection={sortConfig?.key === "scheduleDate" ? sortConfig.direction : undefined}
                                onPress={() => handleSort("scheduleDate")}
                                style={{ width: 120, marginRight: 20 }}>
                                Schedule Date
                            </DataTable.Title>
                            <DataTable.Title style={{ width: 120, marginRight: 20 }}>
                                Status
                            </DataTable.Title>
                            <DataTable.Title style={{ width: 80 }}>Actions</DataTable.Title>
                        </DataTable.Header>

                        <FlatList
                            data={notifications}
                            keyExtractor={(item) => item._id as string}
                            renderItem={({ item }) => {
                                const scheduleDate = new Date(item.scheduleDate).toISOString().split("T")[0]

                                return <DataTable.Row key={item._id}>
                                    <DataTable.Cell style={{ width: 70, marginRight: 20 }}>
                                        {item.serialNo}
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 180, marginRight: 20 }}>
                                        {item.product?.name}
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 180, marginRight: 20 }}>
                                        {item.policy?.name}
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 250, marginRight: 20 }}>
                                        <Text numberOfLines={2}>{item.message}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 120, marginRight: 20 }}>
                                        {scheduleDate}
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 120, marginRight: 20 }}>
                                        <TouchableOpacity>
                                            <Chip mode='outlined' style={{ borderRadius: 4 }}>{item.status}</Chip>
                                        </TouchableOpacity>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 80 }}>
                                        <ActionsMenu
                                            id={item._id as string}
                                            deleteAction={deleteNotification}
                                        />
                                    </DataTable.Cell>
                                </DataTable.Row>
                            }}
                        />

                        <DataTable.Pagination
                            theme={{
                                colors: {
                                    primary: theme.colors.text,
                                },
                            }}
                            page={page}
                            numberOfPages={data?.pagination.totalPages || 0}
                            onPageChange={(newPage) => setPage(newPage)}
                            label={`${from + 1}-${to} of ${data?.pagination.totalEntries}`}
                            showFastPaginationControls
                            numberOfItemsPerPageList={numberOfItemsPerPageList}
                            numberOfItemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            selectPageDropdownLabel={'Rows Per Page'}
                        />
                    </DataTable>
                </ScrollView>
            </Surface>
        </View >

    </>
}

export default Notifications

const customStyles = (theme: CustomTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            paddingVertical: 16,
            paddingHorizontal: 10,
            backgroundColor: theme.colors.bgSecondary,
            width: "100%",
        },
        surface: {
            backgroundColor: theme.colors.cardBg,
            width: "100%",
            flexShrink: 1,
            marginTop: 20
        },
    })
}