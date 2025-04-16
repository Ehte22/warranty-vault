import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, Button, Dialog, Portal, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCustomTheme } from '../context/ThemeContext';
import { CustomTheme } from '../theme/theme';
import { usePathname, useRouter } from 'expo-router';

interface IActionsProps {
    id: string;
    deleteAction: (id: string) => void;
    showDelete?: boolean;
    showEdit?: boolean;
}

const ActionsMenu: React.FC<IActionsProps> = ({
    id,
    deleteAction,
    showEdit = true,
    showDelete = true
}) => {
    const [visible, setVisible] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const router = useRouter()
    const pathName = usePathname()
    const cleanPath = pathName.replace(/^\//, "");


    const { theme } = useCustomTheme()

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleEdit = () => {
        closeMenu();
        router.push({ pathname: `${cleanPath}/add` as any, params: { id } });
    };

    const handleDelete = () => {
        deleteAction(id);
        setDialogVisible(false);
    };

    const styles = customStyles(theme)

    return (
        <View style={styles.container}>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <Button onPress={openMenu} style={{ alignItems: "flex-start", borderRadius: 4 }}>
                        <Icon name="more-vert" size={16} color={theme.colors.text} />
                    </Button>
                }
                contentStyle={styles.menuContent}
            >
                {showEdit && (
                    <Menu.Item
                        onPress={handleEdit}
                        title="Edit"
                        titleStyle={styles.menuItemText}
                    />
                )}
                {showDelete && (
                    <Menu.Item
                        onPress={() => {
                            closeMenu();
                            setDialogVisible(true);
                        }}
                        title="Delete"
                        titleStyle={styles.menuItemText}
                    />
                )}
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Portal>
                <Dialog
                    visible={dialogVisible}
                    onDismiss={() => setDialogVisible(false)}
                    style={styles.dialog}
                >
                    <Dialog.Title>Delete Item</Dialog.Title>
                    <Dialog.Content>
                        <Text>Are you sure you want to delete this item?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: "#f3f3f3" }]} onPress={() => setDialogVisible(false)}>
                            <Text style={{ color: "black", fontSize: 14, paddingHorizontal: 4, fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: "red" }]} onPress={handleDelete}>
                            <Text style={{ color: theme.colors.btnText, fontSize: 14, paddingHorizontal: 4, fontWeight: 'bold' }}>Delete</Text>
                        </TouchableOpacity>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const customStyles = (theme: CustomTheme) => {
    return StyleSheet.create({
        container: {
            position: 'relative',
            zIndex: 1,
        },
        menuContent: {
            backgroundColor: theme.colors.cardBg,
            borderRadius: 4,
            elevation: 3,
        },
        menuItemText: {
            color: theme.colors.text,
        },
        dialog: {
            backgroundColor: theme.colors.cardBg,
            borderRadius: 4,
        },
        iconButton: {
            borderRadius: 4,
            paddingHorizontal: 10,
            paddingVertical: 8,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
    });
}

export default ActionsMenu;