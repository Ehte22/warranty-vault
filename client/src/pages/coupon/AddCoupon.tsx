import { Box, Button, Divider, Grid2, Paper } from '@mui/material'
import DataContainer, { DataContainerConfig } from '../../components/DataContainer'
import useDynamicForm, { FieldConfig } from '../../hooks/useDynamicForm'
import { customValidator } from '../../utils/validator'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
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

const AddPlan = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [userOptions, setUsersOptions] = useState<{ label: string, value?: string }[]>([])

  const [addPlan, { data: addData, error: addError, isLoading: addLoading, isSuccess: isAddSuccess, isError: isAddError }] = useAddCouponMutation()
  const [updatePlan, { data: updateData, error: updateError, isLoading: updateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateCouponMutation()
  const { data } = useGetCouponByIdQuery(id as string, { skip: !id })
  const { data: users } = useGetUsersQuery({ isFetchAll: true })

  const config: DataContainerConfig = {
    pageTitle: id ? "Edit Coupon" : "Add Coupon",
    backLink: "../",
  }

  const fields: FieldConfig[] = [
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
  ]

  const schema = customValidator(fields)

  type FormValues = z.infer<typeof schema>

  const onSubmit = (values: FormValues) => {
    let x = values.usersAllowed

    if (Array.isArray(x)) {
      x = users?.result
        .filter((item) => x.includes(item._id))
        .map(user => ({ _id: user._id, name: user.name }))
    }

    const couponData = { ...values, usersAllowed: x } as ICoupon

    if (id && data) {
      updatePlan({ id, couponData })
    } else {
      addPlan(couponData)
    }
  }

  const { handleSubmit, renderSingleInput, setValue, reset } = useDynamicForm({ fields, defaultValues, schema, onSubmit })

  useEffect(() => {
    if (id && data) {
      setValue("code", data.code)
      setValue("discountType", data.discountType)
      setValue("discountValue", data.discountValue)
      setValue("expiryDate", data.expiryDate)
      setValue("usageLimit", data.usageLimit)
      setValue("minPurchase", data.minPurchase)
      setValue("maxDiscount", data.maxDiscount)
      setValue("usersAllowed", data.usersAllowed?.map(item => item._id) || [])

    }
  }, [id, data])

  useEffect(() => {
    if (users?.result) {
      const transformedData = users.result.map((item) => ({ label: item.name, value: item._id }))
      if (transformedData) {
        setUsersOptions(transformedData)
      }
    }
  }, [users?.result])

  useEffect(() => {
    if (isAddSuccess) {
      const timeout = setTimeout(() => {
        navigate("/coupons")
      }, 2000);
      return () => clearTimeout(timeout)
    }
  }, [isAddSuccess])

  useEffect(() => {
    if (isUpdateSuccess) {
      const timeout = setTimeout(() => {
        navigate("/coupons")
      }, 2000);
      return () => clearTimeout(timeout)
    }
  }, [isUpdateSuccess])

  return <>
    {isAddSuccess && !id && <Toast type="success" message={addData?.message} />}
    {isAddError && !id && <Toast type="error" message={addError as string} />}

    {isUpdateSuccess && id && <Toast type={updateData === "No Changes Detected" ? "info" : "success"} message={updateData as string} />}
    {isUpdateError && id && <Toast type="error" message={updateError as string} />}

    <Box>
      <DataContainer config={config} />
      <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
              loading={id ? updateLoading : addLoading}
              type='submit'
              variant='contained'
              sx={{ ml: 2, background: "#00c979", color: "white", py: 0.65 }}>
              Save
            </Button>
          </Box>
        </Box>
      </Paper >
    </Box >
  </>
}

export default AddPlan