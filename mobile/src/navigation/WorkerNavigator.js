import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, View} from 'react-native';
import {Colors} from '../theme';

import HomeScreen           from '../screens/worker/HomeScreen';
import AdvanceScreen        from '../screens/worker/AdvanceScreen';
import PayslipScreen        from '../screens/worker/PayslipScreen';
import InsightsScreen       from '../screens/worker/InsightsScreen';
import AIAdvisorScreen      from '../screens/worker/AIAdvisorScreen';
import ProfileScreen        from '../screens/worker/ProfileScreen';
import CreditPathwayScreen  from '../screens/worker/CreditPathwayScreen';
import DataProtectionScreen from '../screens/worker/DataProtectionScreen';
import SavingsScreen        from '../screens/worker/SavingsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Icon({emoji, focused}) {
  return (
    <Text style={{fontSize: 22, opacity: focused ? 1 : 0.45}}>
      {emoji}
    </Text>
  );
}

function Tabs() {
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
        tabBarActiveTintColor:   Colors.forest,
        tabBarInactiveTintColor: Colors.smoke,
      }}>
      <Tab.Screen name="Home"     component={HomeScreen}      options={{tabBarLabel: 'Home',    tabBarIcon: ({focused}) => <Icon emoji="🏠" focused={focused} />}} />
      <Tab.Screen name="Advance"  component={AdvanceScreen}   options={{tabBarLabel: 'Advance', tabBarIcon: ({focused}) => <Icon emoji="💸" focused={focused} />}} />
      <Tab.Screen name="Payslip"  component={PayslipScreen}   options={{tabBarLabel: 'Payslip', tabBarIcon: ({focused}) => <Icon emoji="📄" focused={focused} />}} />
      <Tab.Screen name="Insights" component={InsightsScreen}  options={{tabBarLabel: 'Insights',tabBarIcon: ({focused}) => <Icon emoji="📊" focused={focused} />}} />
      <Tab.Screen name="AI"       component={AIAdvisorScreen} options={{tabBarLabel: 'AI',      tabBarIcon: ({focused}) => <Icon emoji="🤖" focused={focused} />}} />
    </Tab.Navigator>
  );
}

export default function WorkerNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="Tabs"           component={Tabs} />
      <Stack.Screen name="Profile"        component={ProfileScreen} />
      <Stack.Screen name="CreditPathway"  component={CreditPathwayScreen} />
      <Stack.Screen name="DataProtection" component={DataProtectionScreen} />
      <Stack.Screen name="Savings"        component={SavingsScreen} />
    </Stack.Navigator>
  );
}
