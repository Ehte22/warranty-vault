import { Chip, Paper, Stack } from '@mui/material';
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ActionsMenu from '../../components/ActionsMenu';
import { useDebounce } from '../../utils/useDebounce';
import Toast from '../../components/Toast';
import Loader from '../../components/Loader';
import { useDeleteCouponMutation, useGetCouponsQuery, useUpdateCouponStatusMutation } from '../../redux/apis/coupon.api';
import { ICoupon } from '../../models/coupon.interface';

const Coupons = React.memo(() => {
    const [searchQuery, setSearchQuery] = useState<string>("")

    const config: DataContainerConfig = useMemo(() => ({
        pageTitle: "Coupons",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        onSearch: setSearchQuery,
    }), [])

    const [coupons, setCoupons] = useState<ICoupon[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })
    const debounceSearchQuery = useDebounce(searchQuery, 500)

    const { data, isLoading } = useGetCouponsQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debounceSearchQuery.toLowerCase(),
    })
    const [deleteCoupon, { data: deleteMsg, isSuccess: deleteSuccess }] = useDeleteCouponMutation()
    const [updateCouponsStatus, { data: statusMsg, error: statusError, isSuccess: statusUpdateSuccess, isError: statusUpdateError }] = useUpdateCouponStatusMutation()

    const columns: GridColDef[] = useMemo(() => [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4, },
        { field: 'code', headerName: 'Code', minWidth: 150, flex: 1 },
        { field: 'discountType', headerName: 'Discount Type', minWidth: 150, flex: 1 },
        { field: 'discountValue', headerName: 'Discount', minWidth: 120, flex: 1 },
        {
            field: 'expiryDate', headerName: 'Expiry Date', minWidth: 120, flex: 1,
            valueGetter: (_, row) => {
                const date = new Date(row.expiryDate)
                return date.toISOString().split("T")[0]
            }
        },
        {
            field: 'usageLimit', headerName: 'Usage Limit', minWidth: 120, flex: 1,
            valueGetter: (_, row) => row.usageLimit || "N/A"
        },
        {
            field: 'minPurchase', headerName: 'Min Purchase', minWidth: 120, flex: 1,
            valueGetter: (_, row) => row.minPurchase || "N/A"
        },
        {
            field: 'maxDiscount', headerName: 'Max Discount', minWidth: 120, flex: 1,
            valueGetter: (_, row) => row.maxDiscount || "N/A"
        },
        {
            field: 'isActive', headerName: 'Status', minWidth: 120, flex: 0.8,
            renderCell: (params) => {
                const handleStatusChange = () => {
                    updateCouponsStatus({ id: params.row._id, status: !params.value })
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
                    <ActionsMenu id={params.row._id} deleteAction={deleteCoupon} />
                </>
            }
        }
    ], [deleteCoupon, updateCouponsStatus])

    const handlePaginationChange = useCallback((params: { page: number, pageSize: number }) => {
        setPagination({ page: params.page, pageSize: params.pageSize });
    }, [])

    useEffect(() => {
        if (data?.result) {
            const x = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            setCoupons(x)
        }
    }, [data?.result])

    if (isLoading) {
        return <Loader />
    }

    return <>
        {deleteSuccess && <Toast type='success' message={deleteMsg as string} />}
        {statusUpdateSuccess && <Toast type="success" message={statusMsg} />}
        {statusUpdateError && <Toast type="error" message={statusError as string} />}
        <DataContainer config={config} />
        <Paper sx={{ width: '100%', mt: 2 }}>
            <DataGrid
                rows={coupons}
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

export default Coupons