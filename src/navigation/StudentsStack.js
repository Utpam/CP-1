import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MenuScreen from '../screens/StudentScreens/MenuScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
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
                name="Menu"
                component={MenuScreen}
                options={{
                    title: 'Menu',
                    headerBackVisible: false,
                }}
            />
        </Stack.Navigator>
    );
}
