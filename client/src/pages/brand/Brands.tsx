import { Paper } from '@mui/material';
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import { useDeleteBrandMutation, useGetBrandsQuery } from '../../redux/apis/brand.api'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IBrand } from '../../models/brand.interface';
import ActionsMenu from '../../components/ActionsMenu';
import { useDebounce } from '../../utils/useDebounce';
import Toast from '../../components/Toast';
import Loader from '../../components/Loader';

const Brands = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [brands, setBrands] = useState<IBrand[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: "Brands",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedUser
    }), [])

    const debounceSearchQuery = useDebounce(searchQuery, 500)

    const { data, isLoading } = useGetBrandsQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debounceSearchQuery.toLowerCase(),
        selectedUser
    })
    const [deleteBrand, { data: message, isSuccess }] = useDeleteBrandMutation()

    const columns: GridColDef[] = useMemo(() => [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4 },
        { field: 'name', headerName: 'Brand Name', minWidth: 200, flex: 1 },
        {
            field: 'description', headerName: 'Description', minWidth: 300, flex: 2,
            valueGetter: (_, row) => row.description || "N/A", sortable: false
        },
        {
            field: 'logo',
            headerName: 'Logo',
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
            field: 'actions',
            headerName: 'Actions',
            minWidth: 100,
            flex: 0.6,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                return <>
                    <ActionsMenu id={params.row._id} deleteAction={deleteBrand} />
                </>
            }
        }
    ], [deleteBrand])

    const handlePaginationChange = useCallback((params: { page: number, pageSize: number }) => {
        setPagination({ page: params.page, pageSize: params.pageSize });
    }, [])

    useEffect(() => {
        if (data?.result) {
            const updatedData = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            setBrands(updatedData)
        }
    }, [data?.result])

    if (isLoading) {
        return <Loader />
    }

    return <>
        {isSuccess && <Toast type='success' message={message} />}

        <DataContainer config={config} />
        <Paper sx={{ width: '100%', mt: 2 }}>
            <DataGrid
                rows={brands}
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

export default Brands