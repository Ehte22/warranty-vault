import { FlatList, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import DataContainer, { DataContainerConfig } from '@/src/components/DataContainer'
import { CustomTheme } from '@/src/theme/theme'
import { View } from 'react-native'
import { useCustomTheme } from '@/src/context/ThemeContext'
import { useDebounce } from '@/src/utils/useDebounce'
import { ActivityIndicator, Chip, DataTable, Surface, Text } from 'react-native-paper'
import ActionsMenu from '@/src/components/ActionMenu'
import Toast from '@/src/components/Toast'
import { IUser } from '@/src/models/user.interface'
import { useDeleteUserMutation, useGetUsersQuery, useUpdateUserStatusMutation } from '@/src/redux/apis/user.api'
import { RefreshControl } from 'react-native'

const Users = () => {
    const numberOfItemsPerPageList = [5, 10, 25, 50]

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [users, setUsers] = useState<IUser[]>([])
    const [page, setPage] = useState<number>(0)
    const [itemsPerPage, setItemsPerPage] = useState<number>(10)
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: "ascending" | "descending" } | null>(null)
    const [refreshing, setRefreshing] = useState(false);

    const config: DataContainerConfig = {
        pageTitle: "Users",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedUser,
        searchQuery: searchQuery
    }

    const debounceSearchQuery = useDebounce(searchQuery, 500)

    const { data, isLoading, refetch } = useGetUsersQuery({
        page: page + 1,
        limit: itemsPerPage,
        searchQuery: debounceSearchQuery.toLowerCase(),
        selectedUser
    })
    const [deleteUser, { data: message, isSuccess }] = useDeleteUserMutation()
    const [updateStatus, { data: statusMessage, error: statusError, isSuccess: statusUpdateSuccess, isError: statusUpdateError }] = useUpdateUserStatusMutation()

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, data?.pagination.totalEntries || 0);

    const handleSort = (key: string) => {
        const direction = sortConfig?.key === key && sortConfig.direction === "ascending"
            ? "descending" : "ascending"

        setSortConfig({ key, direction })

        setUsers([...users].sort((a, b) => {
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

    const handleRefresh = async () => {
        setRefreshing(true);
        setSearchQuery("");
        setSelectedUser("");
        setItemsPerPage(10);
        setPage(0);

        setTimeout(async () => {
            await refetch();
            setRefreshing(false);
        }, 600);
    };

    const handleStatusChange = (data: IUser) => {
        const status = data.status === "active" ? "inactive" : "active"
        updateStatus({ id: data._id as string, status })
    }

    const { theme } = useCustomTheme()
    const styles = customStyles(theme)

    useEffect(() => {
        if (data?.result) {
            const x = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            setUsers(x)
        }
    }, [data?.result])

    useEffect(() => {
        setPage(0)
    }, [itemsPerPage, debounceSearchQuery])


    if (isLoading) {
        return <View style={{ backgroundColor: theme.colors.background, flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator animating={true} size={32} color={theme.colors.primary} />
        </View>
    }

    return <>
        {isSuccess && <Toast type='success' message={message as string} />}
        {statusUpdateSuccess && <Toast type="success" message={statusMessage} />}
        {statusUpdateError && <Toast type="error" message={statusError as string} />}
        <View style={styles.container}>
            <DataContainer config={config} />
            <Surface style={styles.surface}>
                <ScrollView horizontal refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
                    <DataTable style={{ backgroundColor: theme.colors.cardBg }}>
                        <DataTable.Header>
                            <DataTable.Title
                                sortDirection={sortConfig?.key === "serialNo" ? sortConfig.direction : undefined}
                                onPress={() => handleSort("serialNo")}
                                style={{ width: 70, marginRight: 20 }}>
                                Sr. No.
                            </DataTable.Title>
                            <DataTable.Title
                                sortDirection={sortConfig?.key === "name" ? sortConfig.direction : undefined}
                                onPress={() => handleSort("name")}
                                style={{ width: 180, marginRight: 20 }}>
                                Name
                            </DataTable.Title>
                            <DataTable.Title
                                sortDirection={sortConfig?.key === "email" ? sortConfig.direction : undefined}
                                onPress={() => handleSort("email")}
                                style={{ width: 220, marginRight: 20 }}>
                                Email Address
                            </DataTable.Title>
                            <DataTable.Title
                                sortDirection={sortConfig?.key === "phone" ? sortConfig.direction : undefined}
                                onPress={() => handleSort("phone")}
                                style={{ width: 180, marginRight: 20 }}>
                                Phone Number
                            </DataTable.Title>
                            <DataTable.Title
                                style={{ width: 100, marginRight: 20 }}>
                                Profile
                            </DataTable.Title>
                            <DataTable.Title
                                sortDirection={sortConfig?.key === "status" ? sortConfig.direction : undefined}
                                onPress={() => handleSort("status")}
                                style={{ width: 120, marginRight: 20 }}>
                                Status
                            </DataTable.Title>
                            <DataTable.Title style={{ width: 80 }}>Actions</DataTable.Title>
                        </DataTable.Header>

                        <FlatList
                            data={users}
                            keyExtractor={(item) => item._id as string}
                            renderItem={({ item }) => {
                                return <DataTable.Row key={item._id}>
                                    <DataTable.Cell style={{ width: 70, marginRight: 20 }}>
                                        {item.serialNo}
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 180, marginRight: 20 }}>
                                        {item.name}
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 220, marginRight: 20 }}>
                                        {item.email}
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 180, marginRight: 20 }}>
                                        {item.phone || "N/A"}
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 100, marginRight: 20 }}>
                                        <Image
                                            source={
                                                item.profile
                                                    ? { uri: item.profile }
                                                    : require('../../../assets/images/logo.jpg')
                                            }
                                            style={{
                                                height: 40,
                                                width: 40,
                                                borderRadius: 4,
                                                borderColor: 'gray',
                                                borderWidth: 1,
                                            }}
                                            alt="profile.jpg"
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 120, marginRight: 20 }}>
                                        <TouchableOpacity onPress={() => handleStatusChange(item)}>
                                            <Chip
                                                mode="outlined"
                                                style={{
                                                    borderRadius: 4,
                                                    backgroundColor: item.status === "active" ? 'rgba(108, 181, 111, 0.1)' : 'rgba(227, 112, 104, 0.1)',
                                                    borderColor: item.status === "active" ? '#4caf50' : '#f44336',
                                                }}
                                                textStyle={{
                                                    color: item.status === "active" ? '#4caf50' : '#f44336',
                                                    fontSize: 12,
                                                }}
                                            >
                                                {item.status === "active" ? 'Active' : 'Inactive'}
                                            </Chip>
                                        </TouchableOpacity>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 80 }}>
                                        <ActionsMenu
                                            id={item._id as string}
                                            deleteAction={deleteUser}
                                            showDelete={false}
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

export default Users

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