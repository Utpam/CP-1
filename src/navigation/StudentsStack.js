import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MenuScreen from '../screens/StudentScreens/MenuScreen';
import CartScreen from '../screens/StudentScreens/CartScreen';
import FadeSlideBox from '../screens/StudentScreens/FadeSlideBox';

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
            <Stack.Screen
                name="CartScreen"
                component={CartScreen}
                options={{
                    title: 'CartScreen',
                    headerBackVisible: false,
                }}
            />
            <Stack.Screen
                name="FadeSlideBox"
                component={FadeSlideBox}
                options={{
                    title: 'FadeSlideBox',
                    headerBackVisible: false,
                }}
            />
        </Stack.Navigator>
    );
}
