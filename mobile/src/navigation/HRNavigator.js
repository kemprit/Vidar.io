import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {Colors} from '../theme';

import HRDashboardScreen from '../screens/hr/HRDashboardScreen';
import HRAdvancesScreen  from '../screens/hr/HRAdvancesScreen';
import HREmployeesScreen from '../screens/hr/HREmployeesScreen';

const Tab = createBottomTabNavigator();

function Icon({emoji, focused}) {
  return <Text style={{fontSize: 22, opacity: focused ? 1 : 0.45}}>{emoji}</Text>;
}

export default function HRNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.mist,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {fontSize: 10, fontWeight: '600'},
        tabBarActiveTintColor:   Colors.navyMid,
        tabBarInactiveTintColor: Colors.smoke,
      }}>
      <Tab.Screen name="Overview" component={HRDashboardScreen} options={{tabBarLabel: 'Overview', tabBarIcon: ({focused}) => <Icon emoji="📊" focused={focused} />}} />
      <Tab.Screen name="Requests" component={HRAdvancesScreen}  options={{tabBarLabel: 'Requests', tabBarIcon: ({focused}) => <Icon emoji="⏱️"  focused={focused} />}} />
      <Tab.Screen name="Team"     component={HREmployeesScreen} options={{tabBarLabel: 'Team',     tabBarIcon: ({focused}) => <Icon emoji="👥" focused={focused} />}} />
    </Tab.Navigator>
  );
}
