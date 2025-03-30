import { Paper } from '@mui/material';
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import ActionsMenu from '../../components/ActionsMenu';
import { useDebounce } from '../../utils/useDebounce';
import Toast from '../../components/Toast';
import { IPolicyType } from '../../models/policyType.interface';
import { useDeletePolicyTypeMutation, useGetPolicyTypesQuery } from '../../redux/apis/policyType.api';
import Loader from '../../components/Loader';

const policyTypes = () => {
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedUser, setSelectedUser] = useState<string>("")

    const config: DataContainerConfig = {
        pageTitle: "Policy types",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedUser
    }

    const [policyTypes, setPolicyTypes] = useState<IPolicyType[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })
    const debounceSearchQuery = useDebounce(searchQuery, 500)

    const { data, isLoading } = useGetPolicyTypesQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debounceSearchQuery.toLowerCase(),
        selectedUser
    })
    const [deletePolicyTypes, { data: message, isSuccess }] = useDeletePolicyTypeMutation()

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4, },
        { field: 'name', headerName: 'Name', minWidth: 200, flex: 1 },
        {
            field: 'description', headerName: 'Description', minWidth: 300, flex: 2,
            valueGetter: (_, row) => row.description || "N/A", sortable: false
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
                    <ActionsMenu id={params.row._id} deleteAction={deletePolicyTypes} />
                </>
            }
        }
    ];

    useEffect(() => {
        if (data?.result) {
            const x = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            setPolicyTypes(x)
        }
    }, [data?.result])

    if (isLoading) {
        return <Loader />
    }

    return <>
        {isSuccess && <Toast type='success' message={message as string} />}
        <DataContainer config={config} />
        <Paper sx={{ width: '100%', mt: 2 }}>
            <DataGrid
                rows={policyTypes}
                columns={columns}
                loading={isLoading}
                rowCount={data?.pagination.totalEntries || 0}
                paginationMode='server'
                pageSizeOptions={[5, 10, 20, 50]}
                paginationModel={{ page: pagination.page, pageSize: pagination.pageSize }}
                getRowId={(row) => row._id}
                onPaginationModelChange={(params) => {
                    setPagination({ page: params.page, pageSize: params.pageSize })
                }}
                sx={{ border: 0 }}
            />
        </Paper >
    </>
}

export default policyTypes