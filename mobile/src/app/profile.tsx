import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
    Avatar,
    Text,
    Title,
    Caption,
    Button,
    TextInput,
    Divider,
    IconButton,
    HelperText,
    ActivityIndicator,
    Portal,
    Modal,
    Surface
} from 'react-native-paper';
import { useCustomTheme } from '../context/ThemeContext';
import { CustomTheme } from '../theme/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGetUserByIdQuery, useUpdateUserMutation } from '../redux/apis/user.api';
import Toast from '../components/Toast';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker"
import mime from "mime"

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [previewImage, setPreviewImage] = useState<string>("")

    const { theme } = useCustomTheme()
    const { user } = useSelector((state: RootState) => state.auth)
    const styles = customStyles(theme)

    const [updateProfile, { data, error, isLoading, isError, isSuccess }] = useUpdateUserMutation()
    const { data: userData, isSuccess: userGetSuccess } = useGetUserByIdQuery(user?._id || "", { skip: !user?._id })

    const pickImageAsync = async (mode?: string) => {
        let result
        if (mode === "gallery") {
            await ImagePicker.requestMediaLibraryPermissionsAsync()
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            })
        } else {
            await ImagePicker.requestCameraPermissionsAsync()
            result = await ImagePicker.launchCameraAsync({
                cameraType: ImagePicker.CameraType.back,
                allowsEditing: true,
                quality: 1,
                base64: true
            });

        }

        if (!result.canceled) {
            const image = {
                name: result.assets[0].fileName || result.assets[0].uri.split("/").pop(),
                uri: result.assets[0].uri,
                type: result.assets[0].mimeType || mime.getType(result.assets[0].uri)
            }

            setPreviewImage(result.assets[0].uri)
            if (setValue) {
                setValue("profile", image as any)
            }
            setOpenModal(false)
        }
    };

    const handleRemove = () => {
        if (setValue) {
            setValue("profile", "")
        }
        setPreviewImage("")
        setOpenModal(false)
    }

    const schema = z.object({
        email: z.string().min(1, "Field email address is required").email("Please enter a valid email address"),
        phone: z.string().min(1, "Field phone number is required").regex(/^[6-9]\d{9}$/, { message: "Invalid format for phone number" }),
        profile: z.union([
            z.object({
                name: z.string(),
                uri: z.string(),
                type: z.string()
            }),
            z.string()
        ]).optional()
    })

    type FormValues = z.infer<typeof schema>

    const { control, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
        resolver: zodResolver(schema), defaultValues: {
            email: userData?.email || "",
            phone: userData?.phone || "",
            profile: userData?.profile || ""
        }
    })

    const onSubmit = (values: FormValues) => {

        const formData = new FormData()

        formData.append('email', values.email);
        formData.append('phone', values.phone);

        if (values.profile) {
            if (typeof values.profile === 'string') {
                formData.append('profile', values.profile);
            } else {
                formData.append('profile', {
                    uri: values.profile.uri,
                    type: values.profile.type || 'image/jpeg',
                    name: values.profile.name || 'profile.jpg'
                } as any);
            }
        }

        if (userData?._id) {
            let remove = "false"
            if (values.profile === "" && userData?.profile) {
                remove = "true"
            }
            formData.append("remove", remove)
            updateProfile({ id: userData._id, userData: formData })
        }
    };

    useEffect(() => {
        if (userGetSuccess && userData) {
            setPreviewImage(userData.profile as string)
        }
    }, [userGetSuccess])

    useEffect(() => {
        if (isSuccess) {
            setIsEditing(false)
        }
    }, [isSuccess])

    return <>
        {isSuccess && <Toast type='success' message={data} />}
        {isError && <Toast type='error' message={error as string} />}

        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View >
                    <Avatar.Image
                        source={previewImage ? { uri: previewImage } : require("../../assets/images/profile.png")}
                        size={120}
                        style={styles.avatar}
                    />
                    <TouchableOpacity onPress={() => setOpenModal(true)}>
                        {isEditing && (
                            <View style={styles.cameraIcon}>
                                <Ionicons name="camera" size={24} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <IconButton
                    icon={isEditing ? 'check' : 'pencil'}
                    onPress={isEditing ? () => setIsEditing(false) : () => setIsEditing(true)}
                    style={styles.editButton}
                    size={24}
                />
            </View>

            <View style={styles.userInfoSection}>
                <Title style={styles.title}>{userData?.name}</Title>

                <View style={styles.infoBox}>
                    {isEditing ? (
                        <View>
                            <Controller
                                control={control}
                                name='email'
                                render={({ field: { onChange, onBlur, value } }) => {
                                    return <TextInput
                                        label="Email"
                                        mode="outlined"
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        style={styles.input}
                                        keyboardType="email-address"
                                        error={!!errors.email}
                                    />
                                }}
                            />
                            {
                                errors.email && <HelperText type="error" >
                                    {errors.email.message}
                                </HelperText>
                            }
                        </View>
                    ) : <>
                        <Text style={styles.label}>Email:</Text>
                        <Caption style={styles.caption}>{userData?.email}</Caption>
                    </>}
                </View>

                <Divider style={styles.divider} />

                <View style={styles.infoBox}>
                    {isEditing ? (
                        <View>
                            <Controller
                                control={control}
                                name='phone'
                                render={({ field: { onChange, onBlur, value } }) => {
                                    return <TextInput
                                        label="Phone"
                                        mode="outlined"
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        style={styles.input}
                                        keyboardType="phone-pad"
                                        error={!!errors.phone}
                                    />
                                }}
                            />
                            {
                                errors.phone && <HelperText type="error" >
                                    {errors.phone.message}
                                </HelperText>
                            }
                        </View>
                    ) : <>
                        <Text style={styles.label}>Phone:</Text>
                        <Caption style={styles.caption}>{userData?.phone}</Caption>
                    </>}
                </View>

                <Divider style={styles.divider} />

                {isEditing && (
                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        style={styles.saveButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size={19} animating={true} color={theme.colors.btnText} />
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                )}
            </View>
        </ScrollView>

        <Portal>
            <Modal visible={openModal} onDismiss={() => setOpenModal(false)} contentContainerStyle={styles.modal}>
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.modalTitle}>Brand Logo</Text>
                    <TouchableOpacity onPress={() => setOpenModal(false)}>
                        <MaterialCommunityIcons name='close' size={24} color={theme?.colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Surface style={styles.modalIconSurface}>
                            <TouchableOpacity style={{ alignItems: "center" }} onPress={() => pickImageAsync()}>
                                <MaterialCommunityIcons name='camera-outline' size={32} color={theme?.colors.primary} />
                                <Text style={{ marginTop: 2, color: theme?.colors.text }}>Camera</Text>
                            </TouchableOpacity>
                        </Surface>
                    </View>

                    <View style={styles.gridItem}>
                        <Surface style={styles.modalIconSurface}>
                            <TouchableOpacity style={{ alignItems: "center" }} onPress={() => pickImageAsync("gallery")}>
                                <MaterialCommunityIcons name='image-outline' size={32} color={theme?.colors.primary} />
                                <Text style={{ marginTop: 2, color: theme?.colors.text }}>Gallery</Text>
                            </TouchableOpacity>
                        </Surface>
                    </View>

                    <View style={styles.gridItem}>
                        <Surface style={styles.modalIconSurface}>
                            <TouchableOpacity style={{ alignItems: "center" }} onPress={handleRemove}>
                                <MaterialCommunityIcons name='trash-can-outline' size={32} color={theme?.colors.text} />
                                <Text style={{ marginTop: 2, color: theme?.colors.text }}>Remove</Text>
                            </TouchableOpacity>
                        </Surface>
                    </View>
                </View>
            </Modal>
        </Portal >
    </>
};

const customStyles = (theme: CustomTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: theme.dark ? theme.colors.cardBg : "#f3f3f3",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        position: 'relative',
    },
    avatar: {
        marginBottom: 10,
        backgroundColor: 'white',
    },
    editButton: {
        position: 'absolute',
        right: 20,
        top: 20,
        backgroundColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(242, 229, 229, 0.81)',
    },
    userInfoSection: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoBox: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        color: '#333',
    },
    caption: {
        fontSize: 16,
        lineHeight: 24,
    },
    divider: {
        marginVertical: 15,
    },
    input: {
        backgroundColor: theme.colors.inputBackground,
    },
    saveButton: {
        marginTop: 20,
        borderRadius: 4,
        paddingVertical: 5,
    },
    cameraIcon: {
        position: 'absolute',
        right: 6,
        bottom: 6,
        backgroundColor: theme.colors.primary,
        borderRadius: "50%",
        padding: 4,
    },
    modal: {
        backgroundColor: theme.colors.cardBg,
        padding: 20,
        marginHorizontal: 24,
        borderRadius: 4,
    },
    modalTitle: {
        fontSize: 18,
        color: theme.colors.text,
        fontWeight: "bold",
        marginBottom: 4
    },
    modalIconSurface: {
        backgroundColor: theme.colors.cardBg,
        paddingVertical: 10,
        borderRadius: 6
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    gridItem: {
        width: '30%',
        marginBottom: 8,
    },
    imgContainer: {
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground,
        paddingVertical: 10,
        borderRadius: 4
    },
    text: {
        marginVertical: 8,
        textAlign: 'center',
    },
    uploadButton: {
        marginVertical: 8,
        backgroundColor: theme.colors.primary,
        borderRadius: 4,
        color: theme.colors.btnText
    },
});

export default Profile;