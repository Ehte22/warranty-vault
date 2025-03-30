import { useEffect, useState } from 'react';
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ActionsMenu from '../../components/ActionsMenu';
import { useDeleteProductMutation, useGetProductsQuery } from '../../redux/apis/product.api';
import { IProduct } from '../../models/product.interface';
import { useDebounce } from '../../utils/useDebounce';
import { Paper } from '@mui/material';
import Toast from '../../components/Toast';
import Loader from '../../components/Loader';

const Products = () => {
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [selectedUser, setSelectedUser] = useState<string>("")

    const config: DataContainerConfig = {
        pageTitle: "Products",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedUser
    }

    const [products, setProducts] = useState<IProduct[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })
    const debounceSearchQuery = useDebounce(searchQuery, 500)

    const { data, isLoading } = useGetProductsQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debounceSearchQuery.toLowerCase(),
        selectedUser
    })
    const [deleteProduct, { data: message, isSuccess }] = useDeleteProductMutation()

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4 },
        { field: 'name', headerName: 'Name', minWidth: 200, flex: 1 },
        {
            field: 'brand', headerName: 'Brand', minWidth: 200, flex: 1,
            valueGetter: (_, row) => row.brand.name || ""
        },
        { field: 'model', headerName: 'Model', minWidth: 200, flex: 1 },
        {
            field: 'purchaseDate', headerName: 'Purchase Date', minWidth: 150, flex: 0.7,
            valueGetter: (_, row) => {
                const date = new Date(row.purchaseDate);
                return date.toISOString().split("T")[0];
            }
        },
        {
            field: 'image',
            headerName: 'Image',
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
                    <ActionsMenu id={params.row._id} deleteAction={deleteProduct} />
                </>
            }
        }
    ];

    useEffect(() => {
        if (data?.result) {
            const x = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            setProducts(x)
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
                rows={products}
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

export default Products