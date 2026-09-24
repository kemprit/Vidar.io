import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View, StatusBar} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {Colors} from '../theme';

import AuthNavigator   from './AuthNavigator';
import WorkerNavigator from './WorkerNavigator';
import HRNavigator     from './HRNavigator';

const Root = createNativeStackNavigator();

export default function RootNavigator() {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: Colors.forest, alignItems: 'center', justifyContent: 'center'}}>
        <StatusBar backgroundColor={Colors.forest} barStyle="light-content" />
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor={user?.role === 'HR_ADMIN' ? Colors.navy : Colors.forest}
        barStyle="light-content"
      />
      <Root.Navigator screenOptions={{headerShown: false, animation: 'fade'}}>
        {!user ? (
          <Root.Screen name="Auth" component={AuthNavigator} />
        ) : user.role === 'HR_ADMIN' ? (
          <Root.Screen name="HR" component={HRNavigator} />
        ) : (
          <Root.Screen name="Worker" component={WorkerNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
