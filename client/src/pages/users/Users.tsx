import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ActionsMenu from '../../components/ActionsMenu';
import { useDebounce } from '../../utils/useDebounce';
import { Chip, Paper, Stack } from '@mui/material';
import Toast from '../../components/Toast';
import { IUser } from '../../models/user.interface';
import { useDeleteUserMutation, useGetUsersQuery, useUpdateUserStatusMutation } from '../../redux/apis/user.api';
import Loader from '../../components/Loader';

const Users = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [users, setUsers] = useState<IUser[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: "Users",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedUser
    }), [])

    const debounceSearchQuery = useDebounce(searchQuery, 500)

    const { data, isLoading } = useGetUsersQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debounceSearchQuery.toLowerCase(),
        selectedUser
    })

    const [deleteUser, { data: message, isSuccess }] = useDeleteUserMutation()
    const [updateStatus, { data: statusMessage, error: statusError, isSuccess: statusUpdateSuccess, isError: statusUpdateError }] = useUpdateUserStatusMutation()

    const columns: GridColDef[] = useMemo(() => [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4 },
        { field: 'name', headerName: 'Name', minWidth: 200, flex: 1 },
        { field: 'email', headerName: 'Email Address', minWidth: 280, flex: 1.5 },
        { field: 'phone', headerName: 'Phone Number', minWidth: 220, flex: 1.2 },
        {
            field: 'profile',
            headerName: 'Profile',
            minWidth: 100,
            flex: 0.7,
            sortable: false,
            renderCell: (params) => (
                <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                }}>
                    <img
                        src={`${params.value}` || "/logo.jpg"}
                        alt="Brand Logo"
                        style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px", border: "1px solid grey" }}
                    />
                </div>
            ),
        },
        {
            field: 'status', headerName: 'Status', minWidth: 150, flex: 0.8,
            renderCell: (params) => {
                const handleStatusChange = () => {
                    updateStatus({ id: params.row._id, status: params.value === "active" ? "inactive" : "active" })
                };
                return <>
                    <Stack direction="row" sx={{ height: "100%", display: "flex", alignItems: "center" }} >
                        <Chip
                            label={params.value === "active" ? "Active" : "Inactive"}
                            color={params.value === "active" ? "success" : "error"}
                            variant="outlined"
                            onClick={handleStatusChange}
                            sx={{ borderRadius: 1 }} />
                    </Stack>
                </>
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
                    <ActionsMenu id={params.row._id} deleteAction={deleteUser} showDelete={false} />
                </>
            }
        }
    ], [deleteUser, updateStatus])

    useEffect(() => {
        if (data?.result) {
            const x = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            setUsers(x)
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
        {statusUpdateSuccess && <Toast type="success" message={statusMessage} />}
        {statusUpdateError && <Toast type="error" message={statusError as string} />}
        <DataContainer config={config} />
        <Paper sx={{ width: '100%', mt: 2 }}>
            <DataGrid
                rows={users}
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
        </Paper>
    </>
})

export default Users