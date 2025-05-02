import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ActionsMenu from '../../components/ActionsMenu';
import { useDebounce } from '../../utils/useDebounce';
import { Chip, Paper, Stack } from '@mui/material';
import Toast from '../../components/Toast';
import { INotification } from '../../models/notification.interface';
import { useDeleteNotificationMutation, useGetNotificationQuery } from '../../redux/apis/notification.api';
import Loader from '../../components/Loader';

const Notifications = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [notifications, setNotifications] = useState<INotification[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: "Notifications",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedUser
    }), [])

    const debounceSearchQuery = useDebounce(searchQuery, 500)

    const { data, isLoading } = useGetNotificationQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debounceSearchQuery.toLowerCase(),
        selectedUser
    })
    const [deleteNotification, { data: message, isSuccess }] = useDeleteNotificationMutation()

    const columns: GridColDef[] = useMemo(() => [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4, },
        {
            field: 'product', headerName: 'Product', minWidth: 150, flex: 1,
            valueGetter: (_, row) => row.product.name || ""
        },
        {
            field: 'policy', headerName: 'Policy', minWidth: 150, flex: 1,
            valueGetter: (_, row) => row.policy.name || ""
        },
        {
            field: 'message', headerName: 'Message', minWidth: 300, flex: 2, sortable: false
        },
        {
            field: 'scheduleDate', headerName: 'Schedule Date', minWidth: 150, flex: 0.8,
            valueGetter: (_, row) => {
                const date = new Date(row.scheduleDate);
                return date.toISOString().split("T")[0];
            }
        },
        {
            field: 'status', headerName: 'Status', minWidth: 150, flex: 0.8,
            renderCell: (params) => {
                const handleClick = () => {
                    console.info('You clicked the Chip.');
                };
                return <Stack direction="row" sx={{ height: "100%", display: "flex", alignItems: "center" }} >
                    <Chip label={params.value} variant="outlined" onClick={handleClick} sx={{ borderRadius: 1 }} />
                </Stack>
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 100,
            flex: 0.6,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                return <>
                    <ActionsMenu id={params.row._id} deleteAction={deleteNotification} />
                </>
            }
        }
    ], [deleteNotification])

    useEffect(() => {
        if (data?.result) {
            const x = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            setNotifications(x)
        }
    }, [data?.result])

    const handlePaginationChange = useCallback((params: { page: number, pageSize: number }) => {
        setPagination({ page: params.page, pageSize: params.pageSize });
    }, [])

    if (isLoading) {
        return <Loader />
    }

    return <>
        {isSuccess && <Toast type='success' message={message as string} />}
        <DataContainer config={config} />
        <Paper sx={{ width: '100%', mt: 2 }}>
            <DataGrid
                rows={notifications}
                columns={columns}
                loading={isLoading}
                rowCount={data?.pagination.totalEntries || 0}
                paginationMode='server'
                pageSizeOptions={[5, 10, 20, 50]}
                paginationModel={{ page: pagination.page, pageSize: pagination.pageSize }}
                getRowId={(row) => row._id}
                onPaginationModelChange={handlePaginationChange}
                sx={{ border: 0 }}
            />
        </Paper >
    </>
})

export default Notifications