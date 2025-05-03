import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Toast from '../../components/Toast'
import { useAddCouponMutation, useGetCouponByIdQuery, useUpdateCouponMutation } from '../../redux/apis/coupon.api'
import { useGetUsersQuery } from '../../redux/apis/user.api'
import { ICoupon } from '../../models/coupon.interface'

const defaultValues = {
  code: "",
  discountType: "",
  discountValue: "",
  expiryDate: "",
  usageLimit: "",
  minPurchase: "",
  maxDiscount: "",
  usersAllowed: [],
}

const AddPlan = React.memo(() => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [userOptions, setUsersOptions] = useState<{ label: string, value?: string }[]>([])

  const [addPlan, addStatus] = useAddCouponMutation()
  const [updatePlan, updateStatus] = useUpdateCouponMutation()
  const { data: couponData } = useGetCouponByIdQuery(id as string, { skip: !id })
  const { data: users } = useGetUsersQuery({ isFetchAll: true })

  const config: DataContainerConfig = useMemo(() => ({
    pageTitle: id ? 'Edit Coupon' : 'Add Coupon',
    backLink: '../'
  }), [id])

  const fields: FieldConfig[] = useMemo(() => ([
    {
      name: "code",
      type: "text",
      placeholder: "Code",
      rules: { required: true }
    },
    {
      name: "discountType",
      type: "select",
      placeholder: "Discount type",
      options: [
        { label: "Percentage", value: "Percentage" },
        { label: "Fixed Amount", value: "Fixed Amount" },
      ],
      rules: { required: true }
    },
    {
      name: "discountValue",
      type: "text",
      placeholder: "Discount Value",
      rules: { required: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
    },
    {
      name: "expiryDate",
      type: "date",
      placeholder: "Expiry Date",
      rules: { required: true },
    },
    {
      name: "usageLimit",
      type: "text",
      placeholder: "Usage Limit",
      rules: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
    },
    {
      name: "minPurchase",
      type: "text",
      placeholder: "Min Purchase",
      rules: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
    },
    {
      name: "maxDiscount",
      type: "text",
      placeholder: "Max Discount",
      rules: { required: false, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" },
    },
    {
      name: "usersAllowed",
      type: "autoComplete",
      multiple: true,
      options: userOptions,
      placeholder: "Select Users",
      rules: { required: false, array: true },
    },
  ]), [userOptions])


  const handleSave = useCallback(
    (values: z.infer<ReturnType<typeof customValidator>>) => {
      const mappedUsers = values.usersAllowed && users?.result
        ? users.result
          .filter(user => values.usersAllowed.includes(user._id))
          .map(({ _id, name }) => ({ _id, name }))
        : []

      const payload = { ...values, usersAllowed: mappedUsers } as ICoupon

      id && couponData ? updatePlan({ id, couponData: payload }) : addPlan(payload)
    }, [id, couponData, addPlan, updatePlan])

  const { handleSubmit, renderSingleInput, setValue, reset } = useDynamicForm({
    fields,
    defaultValues,
    schema: customValidator(fields),
    onSubmit: handleSave
  })

  useEffect(() => {
    if (id && couponData) {
      setValue("code", couponData.code)
      setValue("discountType", couponData.discountType)
      setValue("discountValue", couponData.discountValue)
      setValue("expiryDate", couponData.expiryDate)
      setValue("usageLimit", couponData.usageLimit)
      setValue("minPurchase", couponData.minPurchase)
      setValue("maxDiscount", couponData.maxDiscount)
      setValue("usersAllowed", couponData.usersAllowed?.map(item => item._id) || [])

    }
  }, [id, couponData, setValue])

  useEffect(() => {
    if (users?.result) {
      setUsersOptions(users.result.map((item) => ({ label: item.name, value: item._id })))
    }
  }, [users?.result])

  useEffect(() => {
    if (addStatus.isSuccess || updateStatus.isSuccess) {
      const timeout = setTimeout(() => navigate('/coupons'), 2000)
      return () => clearTimeout(timeout)
    }
  }, [addStatus.isSuccess, updateStatus.isSuccess, navigate])

  return <>
    {addStatus.isSuccess && <Toast type="success" message={addStatus.data?.message} />}
    {addStatus.isError && <Toast type="error" message={String(addStatus.error)} />}
    {updateStatus.isSuccess && <Toast type={updateStatus.data === "No Changes Detected" ? "info" : "success"} message={updateStatus.data} />}
    {updateStatus.isError && <Toast type="error" message={String(updateStatus.error)} />}

    <Box>
      <DataContainer config={config} />
      <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
        <Box component="form" onSubmit={handleSubmit(handleSave)}>
          <Grid2 container columnSpacing={2} rowSpacing={3} sx={{ px: 3 }} >

            {/* Code */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("code")}
            </Grid2>

            {/* Discount Type */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("discountType")}
            </Grid2>

            {/* Discount Value */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("discountValue")}
            </Grid2>

            {/* Expiry Date */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("expiryDate")}
            </Grid2>

            {/* Usage Limit */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("usageLimit")}
            </Grid2>

            {/* Min Purchase */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("minPurchase")}
            </Grid2>

            {/* Max Discount */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("maxDiscount")}
            </Grid2>

            {/* Users Allowed */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("usersAllowed")}
            </Grid2>

          </Grid2>

          <Divider sx={{ mt: 4, mb: 3 }} />

          <Box sx={{ textAlign: "end", px: 3 }}>
            <Button
              type='button'
              onClick={() => reset()}
              variant='contained'
              sx={{ backgroundColor: "#F3F3F3", py: 0.65 }}>
              Reset
            </Button>
            <Button
              type='submit'
              variant='contained'
              loading={id ? updateStatus.isLoading : addStatus.isLoading}
              sx={{ ml: 2, background: "#00c979", color: "white", py: 0.65 }}>
              Save
            </Button>
          </Box>
        </Box>
      </Paper >
    </Box >
  </>
})

export default AddPlan