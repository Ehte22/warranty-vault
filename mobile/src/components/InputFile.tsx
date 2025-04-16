import { View, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import * as ImagePicker from "expo-image-picker"
import { Button, IconButton, Modal, Portal, Surface, Text } from 'react-native-paper';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { CustomTheme } from '../theme/theme';
import mime from "mime"
import { IFieldProps } from '../hooks/useDynamicForm';
import { useImagePreview } from '../context/ImageContext';
import { FlatList } from 'react-native';

const InputFile: React.FC<IFieldProps> = ({ field, setValue, theme }) => {

    const [openModal, setOpenModal] = useState<boolean>(false)

    const { previewImages, setPreviewImages } = useImagePreview()

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

            setPreviewImages([result.assets[0].uri])
            if (setValue) {
                setValue(field.name, image)
            }
            setOpenModal(false)
        }
    };

    const handleRemove = () => {
        if (setValue) {
            setValue(field.name, "")
        }
        setPreviewImages([])
        setOpenModal(false)
    }

    const styles = customStyles(theme as CustomTheme)

    return <>
        <Text variant="titleSmall" style={{ color: theme?.colors.text, marginTop: 6 }}>
            {field.placeholder}
        </Text>
        <Surface style={{ marginTop: 4, borderWidth: theme?.dark ? 1 : 0, borderColor: theme?.colors.primary, borderRadius: 4 }}>
            <View style={styles.imgContainer}>
                <IconButton icon={() => <AntDesign name="picture" size={40} color="lightgrey" />} />

                <Text style={styles.text}>Upload image here</Text>

                <Button
                    mode="contained"
                    onPress={() => setOpenModal(true)}
                    style={styles.uploadButton}
                    icon="upload"
                >
                    UPLOAD IMAGE
                </Button>

                <Text style={styles.caption}>PNG, JPG, GIF up to 10MB</Text>

                <ScrollView horizontal>
                    <FlatList
                        data={previewImages}
                        keyExtractor={(_, index) => index.toString()}
                        numColumns={1}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={styles.previewImage} />
                        )}
                    />
                </ScrollView>

            </View>
        </Surface>
        <Portal>
            <Modal visible={openModal} onDismiss={() => setOpenModal(false)} contentContainerStyle={styles.modal}>
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.modalTitle}>{field.displayName}</Text>
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
}

export default InputFile

const customStyles = (theme: CustomTheme) => {
    return StyleSheet.create({
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
        caption: {
            marginTop: 8,
            color: 'grey',
            fontSize: 12,
        },
        previewImage: {
            marginTop: 10,
            minWidth: 200,
            minHeight: 200,
            borderRadius: 8,
            resizeMode: "contain",
        },
    })
}