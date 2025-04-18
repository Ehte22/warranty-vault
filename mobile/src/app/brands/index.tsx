import { FlatList, Image, RefreshControl, ScrollView, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import DataContainer, { DataContainerConfig } from '@/src/components/DataContainer'
import { CustomTheme } from '@/src/theme/theme'
import { View } from 'react-native'
import { useCustomTheme } from '@/src/context/ThemeContext'
import { useDeleteBrandMutation, useGetBrandsQuery } from '@/src/redux/apis/brand.api'
import { useDebounce } from '@/src/utils/useDebounce'
import { IBrand } from '@/src/models/brand.interface'
import { ActivityIndicator, DataTable, Surface, Text } from 'react-native-paper'
import ActionsMenu from '@/src/components/ActionMenu'
import Toast from '@/src/components/Toast'

const Brands = () => {
    const numberOfItemsPerPageList = [5, 10, 25, 50]

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [brands, setBrands] = useState<IBrand[]>([])
    const [page, setPage] = useState<number>(0)
    const [itemsPerPage, setItemsPerPage] = useState<number>(10)
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: "ascending" | "descending" } | null>(null)
    const [refreshing, setRefreshing] = useState(false);

    const config: DataContainerConfig = {
        pageTitle: "Brands",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedUser,
        searchQuery: searchQuery
    }

    const debounceSearchQuery = useDebounce(searchQuery, 500)

    const { data, isLoading, refetch } = useGetBrandsQuery({
        page: page + 1,
        limit: itemsPerPage,
        searchQuery: debounceSearchQuery.toLowerCase(),
        selectedUser,
    })
    const [deleteBrand, { data: message, isSuccess }] = useDeleteBrandMutation()

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, data?.pagination.totalEntries || 0);

    const { theme } = useCustomTheme()
    const styles = customStyles(theme)

    const handleSort = (key: string) => {
        const direction = sortConfig?.key === key && sortConfig.direction === "ascending"
            ? "descending" : "ascending"

        setSortConfig({ key, direction })

        setBrands([...brands].sort((a, b) => {
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


    useEffect(() => {
        if (data?.result) {
            const x = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            setBrands(x)
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
                            <DataTable.Title style={{ width: 250, marginRight: 20 }}>
                                Description
                            </DataTable.Title>
                            <DataTable.Title style={{ width: 100, marginRight: 20 }}>
                                Logo
                            </DataTable.Title>
                            <DataTable.Title style={{ width: 80 }}>Actions</DataTable.Title>
                        </DataTable.Header>

                        <FlatList
                            data={brands}
                            keyExtractor={(item) => item._id as string}
                            renderItem={({ item }) => {
                                return <DataTable.Row >
                                    <DataTable.Cell style={{ width: 70, marginRight: 20 }}>
                                        {item.serialNo}
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 180, marginRight: 20 }}>
                                        {item.name}
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 250, marginRight: 20 }}>
                                        <Text numberOfLines={2}>{item.description || 'N/A'}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 100, marginRight: 20 }}>
                                        <Image
                                            source={
                                                item.logo
                                                    ? { uri: item.logo }
                                                    : require('../../../assets/images/logo.jpg')
                                            }
                                            style={{
                                                height: 40,
                                                width: 40,
                                                borderRadius: 4,
                                                borderColor: 'gray',
                                                borderWidth: 1,
                                            }}
                                            alt="logo.jpg"
                                        />
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ width: 80 }}>
                                        <ActionsMenu
                                            id={item._id as string}
                                            deleteAction={deleteBrand}
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

export default Brands

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
        }
    })
}