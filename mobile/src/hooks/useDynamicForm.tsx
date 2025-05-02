import { useForm, Controller, FieldValues, DefaultValues, Path, UseFormSetValue, useFieldArray, ArrayPath, FieldErrors, ControllerRenderProps, FieldArray } from "react-hook-form";
import { ZodSchema } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ValidationRules } from "../utils/validator";
import AutoComplete from "../components/AutoComplete";
import { HelperText, Text } from "react-native-paper";
import { useCustomTheme } from "../context/ThemeContext";
import Inputs from "../components/Inputs";
import { CustomTheme } from "../theme/theme";
import { View } from "react-native";
import InputFile from "../components/InputFile";
import DateField from "../components/DateField";

export interface FieldConfig {
    name: string;
    label?: string;
    type: "text" | "password" | "email" | "number" | "color" | "range" | "date" | "time" | "select" | "radio" | "checkbox" | "file" | "textarea" | "formGroup" | "formArray" | "submit" | "autoComplete";
    keyboardType?: "ascii-capable" | "default" | "decimal-pad" | "email-address" | "name-phone-pad" | "number-pad" | "numbers-and-punctuation" | "numeric" | "phone-pad" | "twitter" | "url" | "visible-password" | "web-search"
    placeholder?: string;
    options?: { name?: string | number, label?: string; value?: string | number, description?: string | number, disabled?: boolean, className?: string }[];
    className?: string
    styles?: { [key: string]: string | number }
    size?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
    accept?: string
    multiple?: boolean
    multiline?: boolean
    numberOfMultiline?: number
    displayName?: string
    legend?: string
    text?: string
    rows?: number
    cols?: number
    formArray?: FieldConfig[],
    formGroup?: {
        [key: string]: FieldConfig
    },
    object?: boolean
    rules: ValidationRules
}

export interface IFieldProps {
    controllerField?: ControllerRenderProps<any, any>,
    field: FieldConfig
    onChange?: (...event: any[]) => void
    onBlur?: () => void
    value?: any
    theme?: CustomTheme
    setValue?: UseFormSetValue<any>
    errors?: boolean
    previewImages?: string | string[];
    setPreviewImages?: React.Dispatch<React.SetStateAction<string | string[] | undefined>>;
    disabled?: boolean
}

interface DynamicFormProps<T extends FieldValues> {
    schema: ZodSchema<T>;
    fields: FieldConfig[];
    onSubmit: (data: T) => void;
    defaultValues: DefaultValues<T>
}

const getErrorMessage = <T extends FieldValues>(
    fieldName: string,
    index: number,
    subFieldName: string,
    errors: FieldErrors<T>
) => {
    const fieldErrors = errors[fieldName];
    if (fieldErrors && Array.isArray(fieldErrors)) {
        const error = fieldErrors[index];
        if (error) {
            return error[subFieldName]?.message || null;
        }
    }
    return null;
};

const useDynamicForm = <T extends FieldValues>({
    schema,
    fields,
    onSubmit,
    defaultValues
}: DynamicFormProps<T>) => {

    const [disabledFields, setDisabledFields] = useState<string[]>([]);

    const { theme } = useCustomTheme()

    const {
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        watch,
        reset,
        getValues
    } = useForm<T>({
        resolver: zodResolver(schema),
        defaultValues
    });

    const formArray = fields.find((item) => item.type === "formArray")

    const { fields: arrayFields, append, remove } = useFieldArray({
        control,
        name: formArray?.name as ArrayPath<T>
    })

    const disableField = (fieldName: string, isDisabled: boolean) => {
        setDisabledFields((prev) => {
            if (isDisabled) {
                return [...prev, fieldName];
            } else {
                return prev.filter((field) => field !== fieldName);
            }
        });
    };

    // Function to render a single input field
    const renderInput = (field: FieldConfig) => {

        return <>
            <View key={field.name}>
                <Text variant="titleSmall" style={{ color: theme.colors.text }}>
                    {field.label}
                </Text>
                <Controller
                    key={field.name}
                    name={field.name as Path<T>}
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => {
                        const error = errors[field.name as keyof T]?.message?.toString()
                        const isError = Boolean(error)

                        switch (field.type) {
                            case "text":
                            case "password":
                            case "email":
                            case "number":
                            case "color":
                            case "range":
                            case "time":
                                return <>
                                    <Inputs
                                        field={field}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        theme={theme}
                                        errors={isError}
                                        disabled={disabledFields.includes(field.name)} />
                                </>

                            case "date":
                                return <>
                                    <DateField
                                        field={field}
                                        onChange={onChange}
                                        value={value}
                                        errors={isError}
                                        theme={theme}
                                    />
                                </>

                            // case "select":
                            //     return <>
                            //         <Selects controllerField={controllerField} field={field} errors={errors[field.name as keyof T]?.message?.toString()} />
                            //     </>

                            case "autoComplete":
                                return <>

                                    <AutoComplete
                                        field={field}
                                        onChange={onChange}
                                        value={value}
                                        errors={isError}
                                    />
                                </>

                            // case "radio":
                            //     return <>
                            //         <Radios controllerField={controllerField} field={field} />
                            //     </>

                            // case "checkbox":
                            //     return <>
                            //         <Checkboxes controllerField={controllerField} field={field} />
                            //     </>

                            case "file":
                                return <>
                                    <InputFile
                                        field={field}
                                        setValue={setValue}
                                        theme={theme}
                                    />
                                </>

                            // case "textarea":
                            //     return <>
                            //         <Textarea
                            //             controllerField={controllerField}
                            //             field={field}
                            //             errors={errors[field.name as keyof T]?.message?.toString()}
                            //         />
                            //     </>

                            // case "formGroup":
                            //     return <>
                            //         <div key={field.name}>
                            //             <Typography variant="h4" >
                            //                 {field.displayName}
                            //             </Typography>
                            //             <Grid2 container columnSpacing={2}>
                            //                 {field.formGroup &&
                            //                     Object.entries(field.formGroup).map(([_, subField]) => {
                            //                         const fieldName = `${field.name}.${subField.name}`;
                            //                         return (
                            //                             <Grid2 key={fieldName} size={subField.size}>
                            //                                 <InputLabel htmlFor={subField.name} sx={{ fontWeight: 500, color: "black" }}>
                            //                                     {subField.label}
                            //                                 </InputLabel>
                            //                                 <Controller
                            //                                     key={fieldName}
                            //                                     name={fieldName as Path<T>}
                            //                                     control={control}
                            //                                     rules={subField.rules}
                            //                                     render={({ field: controllerField }) => {
                            //                                         switch (subField.type) {
                            //                                             case "text":
                            //                                             case "password":
                            //                                             case "email":
                            //                                             case "number":
                            //                                             case "color":
                            //                                             case "range":
                            //                                             case "date":
                            //                                             case "time":
                            //                                                 return <>
                            //                                                     <Inputs
                            //                                                         controllerField={controllerField}
                            //                                                         field={subField}
                            //                                                         errors={
                            //                                                             errors[field.name] &&
                            //                                                             (errors[field.name] as Record<string, any>)[subField.name]?.message && (
                            //                                                                 <Typography variant="caption" color="error">
                            //                                                                     {(errors[field.name] as Record<string, any>)[subField.name]?.message}
                            //                                                                 </Typography>
                            //                                                             )
                            //                                                         }
                            //                                                     />
                            //                                                 </>

                            //                                             case "select":
                            //                                                 return <>
                            //                                                     <Selects controllerField={controllerField} field={subField}
                            //                                                         errors={
                            //                                                             errors[field.name] &&
                            //                                                             (errors[field.name] as Record<string, any>)[subField.name]?.message && (
                            //                                                                 <Typography variant="caption" color="error">
                            //                                                                     {(errors[field.name] as Record<string, any>)[subField.name]?.message}
                            //                                                                 </Typography>
                            //                                                             )
                            //                                                         } />
                            //                                                 </>

                            //                                             case "autoComplete":
                            //                                                 return <>
                            //                                                     <AutoComplete controllerField={controllerField} field={subField} errors={
                            //                                                         errors[field.name] &&
                            //                                                         (errors[field.name] as Record<string, any>)[subField.name]?.message && (
                            //                                                             <Typography variant="caption" color="error">
                            //                                                                 {(errors[field.name] as Record<string, any>)[subField.name]?.message}
                            //                                                             </Typography>
                            //                                                         )
                            //                                                     } />
                            //                                                 </>

                            //                                             // case "radio":
                            //                                             //     return <>
                            //                                             //         <Radios controllerField={controllerField} field={subField} />
                            //                                             //     </>

                            //                                             // case "checkbox":
                            //                                             //     return <>
                            //                                             //         <Checkboxes controllerField={controllerField} field={subField} />
                            //                                             //     </>

                            //                                             case "file":
                            //                                                 return <>
                            //                                                     <InputFile
                            //                                                         controllerField={controllerField}
                            //                                                         field={subField}
                            //                                                         setValue={setValue}
                            //                                                         errors={
                            //                                                             errors[field.name] &&
                            //                                                             (errors[field.name] as Record<string, any>)[subField.name]?.message && (
                            //                                                                 <Typography variant="caption" color="error">
                            //                                                                     {(errors[field.name] as Record<string, any>)[subField.name]?.message}
                            //                                                                 </Typography>
                            //                                                             )
                            //                                                         }
                            //                                                     />
                            //                                                 </>

                            //                                             case "textarea":
                            //                                                 return <>
                            //                                                     <Textarea controllerField={controllerField} field={subField} errors={
                            //                                                         errors[field.name] &&
                            //                                                         (errors[field.name] as Record<string, any>)[subField.name]?.message && (
                            //                                                             <Typography variant="caption" color="error">
                            //                                                                 {(errors[field.name] as Record<string, any>)[subField.name]?.message}
                            //                                                             </Typography>
                            //                                                         )
                            //                                                     } />
                            //                                                 </>
                            //                                             default:
                            //                                                 return <></>;
                            //                                         }
                            //                                     }}
                            //                                 />
                            //                                 {errors[field.name] &&
                            //                                     (errors[field.name] as Record<string, any>)[subField.name]?.message && (
                            //                                         <Typography variant="caption" color="error">
                            //                                             {(errors[field.name] as Record<string, any>)[subField.name]?.message}
                            //                                         </Typography>
                            //                                     )}

                            //                             </Grid2>
                            //                         );
                            //                     })}
                            //             </Grid2>
                            //         </div>
                            //     </>

                            // case "formArray":
                            //     return <>
                            //         <div key={field.name}>
                            //             {arrayFields.map((item, index) => (
                            //                 <div key={item.id}>
                            //                     <Grid2 >
                            //                         {field.formArray?.map((subField) => {
                            //                             const fieldName = `${field.name}[${index}].${subField.name}`;

                            //                             return (
                            //                                 <Grid2
                            //                                     key={`${fieldName}-${subField.name}`}
                            //                                     size={subField.size}
                            //                                 >
                            //                                     <InputLabel htmlFor={subField.name} sx={{ fontWeight: 500, color: "black" }}>
                            //                                         {subField.label}
                            //                                     </InputLabel>
                            //                                     <Controller
                            //                                         key={fieldName}
                            //                                         name={fieldName as Path<T>}
                            //                                         control={control}
                            //                                         rules={subField.rules}
                            //                                         render={({ field: controllerField }) => {
                            //                                             switch (subField.type) {
                            //                                                 case "text":
                            //                                                 case "password":
                            //                                                 case "email":
                            //                                                 case "number":
                            //                                                 case "color":
                            //                                                 case "range":
                            //                                                 case "time":
                            //                                                     return <>
                            //                                                         <Inputs
                            //                                                             controllerField={controllerField}
                            //                                                             field={subField}
                            //                                                             errors={(getErrorMessage(field.name, index, subField.name, errors)) && (
                            //                                                                 <Typography variant="caption" color="error">
                            //                                                                     {getErrorMessage(field.name, index, subField.name, errors)}
                            //                                                                 </Typography>
                            //                                                             )}
                            //                                                         />
                            //                                                     </>

                            //                                                 case "date":
                            //                                                     return <>
                            //                                                         <DateField
                            //                                                             controllerField={controllerField}
                            //                                                             field={field}
                            //                                                             errors={(getErrorMessage(field.name, index, subField.name, errors)) && (
                            //                                                                 <Typography variant="caption" color="error">
                            //                                                                     {getErrorMessage(field.name, index, subField.name, errors)}
                            //                                                                 </Typography>
                            //                                                             )} />
                            //                                                     </>

                            //                                                 case "select":
                            //                                                     return <>
                            //                                                         <Selects
                            //                                                             controllerField={controllerField} field={subField}
                            //                                                             errors={(getErrorMessage(field.name, index, subField.name, errors)) && (
                            //                                                                 <Typography variant="caption" color="error">
                            //                                                                     {getErrorMessage(field.name, index, subField.name, errors)}
                            //                                                                 </Typography>
                            //                                                             )}
                            //                                                         />
                            //                                                     </>

                            //                                                 case "autoComplete":
                            //                                                     return <>
                            //                                                         <AutoComplete
                            //                                                             controllerField={controllerField}
                            //                                                             field={subField}
                            //                                                             errors={(getErrorMessage(field.name, index, subField.name, errors)) && (
                            //                                                                 <Typography variant="caption" color="error">
                            //                                                                     {getErrorMessage(field.name, index, subField.name, errors)}
                            //                                                                 </Typography>
                            //                                                             )}
                            //                                                         />
                            //                                                     </>

                            //                                                 // case "radio":
                            //                                                 //     return <>
                            //                                                 //         <Radios controllerField={controllerField} field={subField} />
                            //                                                 //     </>

                            //                                                 // case "checkbox":
                            //                                                 //     return <>
                            //                                                 //         <Checkboxes controllerField={controllerField} field={subField} />
                            //                                                 //     </>

                            //                                                 case "file":
                            //                                                     return <>
                            //                                                         <InputFile
                            //                                                             controllerField={controllerField}
                            //                                                             field={subField}
                            //                                                             setValue={setValue}
                            //                                                             errors={(getErrorMessage(field.name, index, subField.name, errors)) && (
                            //                                                                 <Typography variant="caption" color="error">
                            //                                                                     {getErrorMessage(field.name, index, subField.name, errors)}
                            //                                                                 </Typography>
                            //                                                             )}
                            //                                                         />
                            //                                                     </>

                            //                                                 case "textarea":
                            //                                                     return <>
                            //                                                         <Textarea
                            //                                                             controllerField={controllerField}
                            //                                                             field={subField}
                            //                                                             errors={(getErrorMessage(field.name, index, subField.name, errors)) && (
                            //                                                                 <Typography variant="caption" color="error">
                            //                                                                     {getErrorMessage(field.name, index, subField.name, errors)}
                            //                                                                 </Typography>
                            //                                                             )}
                            //                                                         />
                            //                                                     </>

                            //                                                 default:
                            //                                                     return <></>
                            //                                             }
                            //                                         }}
                            //                                     />
                            //                                     {(getErrorMessage(field.name, index, subField.name, errors)) && (
                            //                                         <Typography variant="caption" color="error">
                            //                                             {getErrorMessage(field.name, index, subField.name, errors)}
                            //                                         </Typography>
                            //                                     )}
                            //                                 </Grid2>
                            //                             );
                            //                         })}
                            //                     </ Grid2>

                            //                     <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, my: 2 }}>
                            //                         {arrayFields.length > 1 &&
                            //                             <IconButton
                            //                                 type='button'
                            //                                 onClick={() => remove(index)}
                            //                                 sx={{
                            //                                     backgroundColor: '#f3f3f3',
                            //                                     borderRadius: "4px",
                            //                                     px: "12px",
                            //                                     boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                            //                                 }}
                            //                             >
                            //                                 <FontAwesomeIcon icon={faMinus} fontSize="16px" />
                            //                             </IconButton>
                            //                         }
                            //                         {(arrayFields.length - 1) === index &&
                            //                             <IconButton
                            //                                 type='button'
                            //                                 sx={{
                            //                                     backgroundColor: '#f3f3f3',
                            //                                     borderRadius: "4px",
                            //                                     px: "12px",
                            //                                     boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
                            //                                 }}
                            //                                 onClick={() => {
                            //                                     if (arrayFields.length > 0) {
                            //                                         const defaultField = arrayFields.reduce((acc: any, field) => {
                            //                                             Object.keys(field).forEach((key) => { acc[key] = "" });
                            //                                             return acc;
                            //                                         }, {} as FieldArray<T, ArrayPath<T>>);

                            //                                         append(defaultField as FieldArray<T, ArrayPath<T>>);
                            //                                     }
                            //                                 }}>
                            //                                 <FontAwesomeIcon icon={faPlus} fontSize="16px" />
                            //                             </IconButton>
                            //                         }

                            //                     </Box>
                            //                 </div>
                            //             ))}

                            //         </div >
                            //     </>

                            // case "submit":
                            //     return (
                            //         <button
                            //             type="submit"
                            //             className={field.className}
                            //         >
                            //             {field.displayName}
                            //         </button>
                            //     );
                            default:
                                return <></>;
                        }
                    }}
                />
                <View >
                    {errors[field.name as keyof T]?.message && (
                        <HelperText type="error" style={{ marginBottom: -10, padding: 0 }}>
                            {errors[field.name as keyof T]?.message?.toString()}
                        </HelperText>
                    )}
                </View>
            </ View>
        </>
    };

    // Function to render the full form
    const renderFullForm = () => {
        return <>
            {/* <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                    {fields.map((field) => <div key={field.name}>{renderInput(field)}</div>)}
                </div>
            </form> */}
        </>
    };

    // Function to render a single input
    const renderSingleInput = (fieldName: string) => {
        const field = fields.find((f) => f.name === fieldName);

        if (!field) return null;
        return renderInput(field);
    };


    return {
        renderFullForm,
        renderSingleInput,
        handleSubmit,
        errors,
        watch,
        reset,
        control,
        append,
        remove,
        getValues,
        setValue,
        disableField
    };
};

export default useDynamicForm;