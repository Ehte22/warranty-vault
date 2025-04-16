import React from 'react'
import { Avatar, Button } from 'react-native-paper'
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useGetUserByIdQuery } from '../redux/apis/user.api';

const AccountMenu = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    const { data } = useGetUserByIdQuery(user?._id || "", { skip: !user?._id })

    return <>
        <Button style={{ marginRight: -16 }}>
            {data?.profile ? (
                <Avatar.Image size={32} source={{ uri: data?.profile }} />
            ) : (
                <View><Ionicons name="person-circle" size={32} color="#dedede" /></View>
            )}
        </Button>
    </>
}

export default AccountMenu