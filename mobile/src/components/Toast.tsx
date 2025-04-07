import React, { useState } from 'react';
import { Snackbar, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

interface IToastProps {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}

const Toast: React.FC<IToastProps> = ({ type, message }) => {
    const [open, setOpen] = useState(true)

    const onDismiss = () => {
        setOpen(false)
    }

    return <>
        <View style={styles.container}>
            <Snackbar
                visible={open}
                onDismiss={onDismiss}
                duration={3000}
                action={{
                    label: 'Close',
                    onPress: onDismiss,
                    textColor: "white"
                }}
                style={[styles.snackbar, typeStyle[type]]}
            >
                {message}
            </Snackbar>
        </View>
    </>
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        left: 16,
        zIndex: 9999,
        color: "white"
    },
    snackbar: {
        borderRadius: 4,
    },
});

const typeStyle = {
    success: { backgroundColor: '#4caf50' },
    error: { backgroundColor: '#f44336' },
    info: { backgroundColor: '#2196f3' },
    warning: { backgroundColor: '#ff9800' },
};

export default Toast;
