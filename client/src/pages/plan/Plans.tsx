import { Chip, Paper, Stack } from '@mui/material';
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ActionsMenu from '../../components/ActionsMenu';
import { useDebounce } from '../../utils/useDebounce';
import Toast from '../../components/Toast';
import { IPlan } from '../../models/plan.interface';
import { useDeletePlanMutation, useGetPlansQuery, useUpdatePlanStatusMutation } from '../../redux/apis/plan.api';
import Loader from '../../components/Loader';

const Plans = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [plans, setPlans] = useState<IPlan[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: "Plans",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedUser
    }), [])

    const debounceSearchQuery = useDebounce(searchQuery, 500)

    const { data, isLoading } = useGetPlansQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debounceSearchQuery.toLowerCase(),
        selectedUser
    })
    const [deletePlan, { data: message, isSuccess }] = useDeletePlanMutation()
    const [updateStatus, { data: statusMessage, error: statusError, isSuccess: statusUpdateSuccess, isError: statusUpdateError }] = useUpdatePlanStatusMutation()

    const columns: GridColDef[] = useMemo(() => [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4, },
        { field: 'name', headerName: 'Name', minWidth: 150, flex: 1 },
        {
            field: 'price.monthly', headerName: 'Monthly Price', minWidth: 150, flex: 1,
            valueGetter: (_, row) => row.price.monthly || "N/A"
        },
        {
            field: 'price.yearly', headerName: 'Yearly Price', minWidth: 150, flex: 1,
            valueGetter: (_, row) => row.price.yearly || "N/A"
        },
        {
            field: 'isActive', headerName: 'Status', minWidth: 150, flex: 0.8,
            renderCell: (params) => {
                const handleStatusChange = () => {
                    updateStatus({ id: params.row._id, status: !params.value })
                };
                return <>
                    <Stack direction="row" sx={{ height: "100%", display: "flex", alignItems: "center" }} >
                        <Chip
                            label={params.value ? "Active" : "Inactive"}
                            color={params.value ? "success" : "error"}
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
                    <ActionsMenu id={params.row._id} deleteAction={deletePlan} />
                </>
            }
        }
    ], [updateStatus, deletePlan])

    useEffect(() => {
        if (data?.result) {
            const x = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            setPlans(x)
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
                rows={plans}
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

export default Plans