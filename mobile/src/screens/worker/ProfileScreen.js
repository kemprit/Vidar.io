import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {employeeAPI} from '../../api';
import {Colors, R, Sp, Shadow} from '../../theme';
import {trustLabel} from '../../utils/format';

export default function ProfileScreen() {
  const {user, logout} = useAuth();
  const nav = useNavigation();
  const [credit, setCredit] = useState(null);

  useEffect(() => {
    employeeAPI.credit().then(r => setCredit(r.data)).catch(() => {});
  }, []);

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'SL';

  const confirmLogout = () =>
    Alert.alert('Sign out', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign out', style: 'destructive', onPress: logout},
    ]);

  return (
    <View style={S.root}>
      <StatusBar backgroundColor={Colors.forest} barStyle="light-content" />
      <ScrollView style={S.scroll} contentContainerStyle={{paddingBottom: 40}} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.forest, Colors.forestMid]} style={S.hero}>
          <TouchableOpacity onPress={() => nav.goBack()} style={S.back}>
            <Text style={S.backTxt}>← Back</Text>
          </TouchableOpacity>
          <View style={S.avatar}><Text style={S.avatarTxt}>{initials}</Text></View>
          <Text style={S.name}>{user?.fullName}</Text>
          <Text style={S.jobTitle}>{user?.jobTitle ?? 'Employee'}  ·  {user?.employerName}</Text>
        </LinearGradient>

        {credit && (
          <View style={[S.card, {flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: -20}]}>
            <View style={S.trustRing}><Text style={S.trustScore}>{credit.trustScore}</Text></View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 14, fontWeight: '700', color: Colors.ink}}>Trust Score</Text>
              <Text style={{fontSize: 12, color: credit.trustScore >= 650 ? Colors.safe : Colors.clay, fontWeight: '600'}}>{trustLabel(credit.trustScore)}  ·  {credit.trustScore} / 850</Text>
              <View style={S.trustBar}><View style={[S.trustBarFill, {width: `${(credit.trustScore / 850) * 100}%`}]} /></View>
            </View>
          </View>
        )}

        {[
          {title: 'Employment', items: [
            {icon: '🏢', label: user?.employerName ?? 'Employer', right: '✅ Verified'},
            {icon: '📅', label: `${credit?.monthsClean ?? 0} months payroll history`},
            {icon: '💳', label: `Employee ID  ·  ${user?.employeeId}`},
          ]},
          {title: 'My rights', items: [
            {icon: '🛡️', label: 'Data rights & privacy',  onPress: () => nav.navigate('DataProtection')},
            {icon: '🏛️', label: 'Credit pathway',         onPress: () => nav.navigate('CreditPathway')},
          ]},
          {title: 'Wallet', items: [
            {icon: '📱', label: `${user?.mobileWallet ?? 'MCB Juice'}  ·  ${user?.walletNumber ? '****' + user.walletNumber.slice(-4) : 'Not set'}`},
          ]},
        ].map(section => (
          <View key={section.title} style={{marginHorizontal: Sp.lg, marginTop: Sp.xl}}>
            <Text style={S.sectionTitle}>{section.title.toUpperCase()}</Text>
            <View style={[S.card, {gap: 0, padding: 0, overflow: 'hidden', marginHorizontal: 0}]}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.onPress}
                  activeOpacity={item.onPress ? 0.7 : 1}
                  style={[S.itemRow, i > 0 && {borderTopWidth: 1, borderTopColor: Colors.mist}]}>
                  <Text style={{fontSize: 18}}>{item.icon}</Text>
                  <Text style={S.itemLbl}>{item.label}</Text>
                  {item.right
                    ? <Text style={{fontSize: 12, color: Colors.safe, fontWeight: '600'}}>{item.right}</Text>
                    : item.onPress ? <Text style={{color: Colors.smoke, fontSize: 18}}>›</Text> : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={S.logoutBtn} onPress={confirmLogout} activeOpacity={0.8}>
          <Text style={S.logoutTxt}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root:         {flex: 1, backgroundColor: Colors.cream},
  scroll:       {flex: 1},
  hero:         {paddingTop: Sp.xl, paddingBottom: 40, alignItems: 'center', paddingHorizontal: Sp.xl, position: 'relative'},
  back:         {position: 'absolute', top: Sp.xl, left: Sp.xl},
  backTxt:      {color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600'},
  avatar:       {width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)', elevation: 4},
  avatarTxt:    {fontSize: 26, fontWeight: '800', color: Colors.forest},
  name:         {fontSize: 22, fontWeight: '700', color: Colors.white, marginBottom: 4},
  jobTitle:     {fontSize: 12, color: 'rgba(255,255,255,0.55)'},
  card:         {backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, ...Shadow.card, padding: Sp.lg},
  trustRing:    {width: 64, height: 64, borderRadius: 32, borderWidth: 5, borderColor: Colors.forest, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  trustScore:   {fontSize: 20, fontWeight: '800', color: Colors.forest},
  trustBar:     {height: 4, backgroundColor: Colors.mist, borderRadius: 2, marginTop: 8, overflow: 'hidden'},
  trustBarFill: {height: 4, backgroundColor: Colors.forest, borderRadius: 2},
  sectionTitle: {fontSize: 11, fontWeight: '700', color: Colors.smoke, marginBottom: 8, letterSpacing: 0.5},
  itemRow:      {flexDirection: 'row', alignItems: 'center', gap: 14, padding: Sp.lg},
  itemLbl:      {flex: 1, fontSize: 14, fontWeight: '500', color: Colors.ink},
  logoutBtn:    {marginHorizontal: Sp.lg, marginTop: Sp.xl, borderWidth: 1.5, borderColor: Colors.clay, borderRadius: R.xl, paddingVertical: 15, alignItems: 'center'},
  logoutTxt:    {fontSize: 15, fontWeight: '700', color: Colors.clay},
});
