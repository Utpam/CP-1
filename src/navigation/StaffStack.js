import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StudentsOrderScreen from '../screens/StaffScreens/StudentsOrderScreen';
import EditMenuScreen from '../screens/StaffScreens/EditMenuScreen';

const Stack = createNativeStackNavigator();

export default function StaffStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#8A2BE2' },
                headerTintColor: '#fff',
                headerShown: false,
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="StudentsOrder"
                component={StudentsOrderScreen}
                options={{
                    title: 'StudentsOrder',
                    headerBackVisible: false,
                }}
            />
            <Stack.Screen
                name="EditMenu"
                component={EditMenuScreen}
                options={{
                    title: 'EditMenu',
                    headerBackVisible: false,
                }}
            />
        </Stack.Navigator>
    );
}
