import React, {useState, useCallback} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, RefreshControl, ActivityIndicator, Alert, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {hrAPI} from '../../api';
import {Colors, R, Sp, Shadow} from '../../theme';

const fmt = n => (n ?? 0).toLocaleString('en-MU', {maximumFractionDigits: 0});

export default function HRDashboardScreen() {
  const {user, logout} = useAuth();
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);

  const load = useCallback(async () => {
    try {const r = await hrAPI.dashboard(); setData(r.data);}
    catch (e) {console.error(e);}
    finally {setLoading(false); setRefreshing(false);}
  }, []);

  useFocusEffect(useCallback(() => {load();}, [load]));

  const toggleAutoApprove = async () => {
    const next = !data.policy.autoApprove;
    setData(d => ({...d, policy: {...d.policy, autoApprove: next}}));
    setSavingPolicy(true);
    try {await hrAPI.updatePolicy({autoApprove: next});}
    catch {setData(d => ({...d, policy: {...d.policy, autoApprove: !next}})); Alert.alert('Error', 'Policy update failed.');}
    finally {setSavingPolicy(false);}
  };

  if (loading) return <View style={{flex:1, backgroundColor: Colors.navy, alignItems:'center', justifyContent:'center'}}><ActivityIndicator color={Colors.gold} size="large"/></View>;

  const s = data?.stats;
  const p = data?.policy;
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() ?? 'HR';

  return (
    <View style={S.root}>
      <StatusBar backgroundColor={Colors.navy} barStyle="light-content"/>
      <ScrollView
        style={S.scroll}
        contentContainerStyle={{paddingBottom: 32}}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} colors={[Colors.gold]} tintColor={Colors.gold}/>}>

        <LinearGradient colors={[Colors.navy, Colors.navyMid]} style={S.header}>
          <View style={S.headerTop}>
            <View>
              <Text style={S.headerSub}>HR Admin Dashboard</Text>
              <Text style={S.headerTitle}>{data?.employerName ?? 'Employer'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Sign out', 'Are you sure?', [{text: 'Cancel', style: 'cancel'}, {text: 'Sign out', style: 'destructive', onPress: logout}])}
              style={S.avatar} activeOpacity={0.8}>
              <Text style={S.avatarTxt}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={S.statsGrid}>
          <View style={[S.statCard, {backgroundColor: Colors.white}]}>
            <Text style={S.statIcon}>👥</Text><Text style={S.statVal}>{s?.totalEmployees}</Text><Text style={S.statLbl}>Active employees</Text>
          </View>
          <View style={[S.statCard, {backgroundColor: Colors.goldPale, borderWidth: 1, borderColor: Colors.gold + '40'}]}>
            <Text style={S.statIcon}>⏳</Text><Text style={[S.statVal, {color: Colors.goldDim}]}>{s?.pendingAdvances}</Text><Text style={S.statLbl}>Pending advances</Text>
          </View>
          <View style={[S.statCard, {backgroundColor: Colors.safePale}]}>
            <Text style={S.statIcon}>💸</Text><Text style={[S.statVal, {color: Colors.safe, fontSize: 16}]}>Rs {fmt(s?.disbursedThisCycle)}</Text><Text style={S.statLbl}>Disbursed this cycle</Text>
          </View>
          <View style={[S.statCard, {backgroundColor: (s?.failedDeductions ?? 0) > 0 ? Colors.clayPale : Colors.mist}]}>
            <Text style={S.statIcon}>⚠️</Text><Text style={[S.statVal, {color: (s?.failedDeductions ?? 0) > 0 ? Colors.clay : Colors.smoke}]}>{s?.failedDeductions}</Text><Text style={S.statLbl}>Overdue requests</Text>
          </View>
        </View>

        <View style={[S.floatCard, Shadow.strong]}>
          <LinearGradient colors={[Colors.forest, Colors.forestLight]} style={S.floatGrad}>
            <View>
              <Text style={S.floatLbl}>Employer float balance</Text>
              <Text style={S.floatAmt}>Rs {fmt(p?.floatBalance ?? 0)}</Text>
              <Text style={S.floatSub}>Available for advance disbursements</Text>
            </View>
            <View style={S.floatBadge}><Text style={S.floatBadgeTxt}>✅ Operational</Text></View>
          </LinearGradient>
        </View>

        <Text style={S.sectionTitle}>ADVANCE POLICY</Text>
        <View style={[S.card, Shadow.card]}>
          <View style={S.policyRow}>
            <View style={{flex: 1}}>
              <Text style={S.policyLbl}>Auto-approve advances</Text>
              <Text style={S.policySub}>{p?.autoApprove ? 'Eligible advances are automatically disbursed instantly' : 'All advances require manual HR approval'}</Text>
            </View>
            <Switch value={p?.autoApprove ?? false} onValueChange={toggleAutoApprove} disabled={savingPolicy} trackColor={{false: Colors.mist, true: Colors.safe}} thumbColor={Colors.white}/>
          </View>
          {[
            ['Max per cycle', `${p?.maxPerCycle} advance(s) per pay cycle per employee`, `${p?.maxPerCycle} max`],
            ['Advance cap', `${p?.maxPct}% of net pay (after PAYE + NPF)`, `${p?.maxPct}% net`],
            ['Probation exclusion', `Employees on probation (${p?.probationMonths} months) excluded`, p?.excludeProbation ? 'On' : 'Off'],
          ].map(([label, sub, val], i) => (
            <View key={label} style={[S.policyRow, {borderTopWidth: 1, borderTopColor: Colors.mist}]}>
              <View style={{flex: 1}}>
                <Text style={S.policyLbl}>{label}</Text>
                <Text style={S.policySub}>{sub}</Text>
              </View>
              <Text style={S.policyBadge}>{val}</Text>
            </View>
          ))}
        </View>

        {(s?.pendingAdvances ?? 0) > 0 && (
          <View style={[S.pendingCard, Shadow.card]}>
            <Text style={{fontSize: 32, marginBottom: 8}}>⏳</Text>
            <Text style={S.pendingTitle}>{s.pendingAdvances} advance{s.pendingAdvances > 1 ? 's' : ''} awaiting approval</Text>
            <Text style={S.pendingSub}>Total: Rs {fmt(s?.pendingTotal)}  ·  Tap Requests tab to review</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root:         {flex: 1, backgroundColor: Colors.cream},
  scroll:       {flex: 1},
  header:       {paddingHorizontal: Sp.xl, paddingTop: Sp.lg, paddingBottom: Sp.xl},
  headerTop:    {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  headerSub:    {fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 2},
  headerTitle:  {fontSize: 20, fontWeight: '700', color: Colors.white},
  avatar:       {width: 40, height: 40, backgroundColor: Colors.gold, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  avatarTxt:    {fontSize: 14, fontWeight: '800', color: Colors.navy},
  statsGrid:    {flexDirection: 'row', flexWrap: 'wrap', gap: 10, margin: Sp.lg},
  statCard:     {width: '47%', borderRadius: R.xl, padding: Sp.lg, ...Shadow.card},
  statIcon:     {fontSize: 22, marginBottom: 8},
  statVal:      {fontSize: 20, fontWeight: '800', color: Colors.ink, marginBottom: 4},
  statLbl:      {fontSize: 11, color: Colors.smoke},
  floatCard:    {marginHorizontal: Sp.lg, marginBottom: Sp.md, borderRadius: R.xl, overflow: 'hidden'},
  floatGrad:    {padding: Sp.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  floatLbl:     {fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4},
  floatAmt:     {fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 4},
  floatSub:     {fontSize: 11, color: 'rgba(255,255,255,0.5)'},
  floatBadge:   {backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 8},
  floatBadgeTxt:{fontSize: 12, color: Colors.gold, fontWeight: '700'},
  sectionTitle: {fontSize: 11, fontWeight: '700', color: Colors.smoke, marginHorizontal: Sp.lg, marginTop: Sp.xl, marginBottom: Sp.sm, letterSpacing: 0.5},
  card:         {backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, overflow: 'hidden'},
  policyRow:    {flexDirection: 'row', alignItems: 'center', padding: Sp.lg, gap: 12},
  policyLbl:    {fontSize: 13, fontWeight: '600', color: Colors.ink, marginBottom: 2},
  policySub:    {fontSize: 11, color: Colors.smoke, lineHeight: 17},
  policyBadge:  {fontSize: 13, fontWeight: '700', color: Colors.navyMid},
  pendingCard:  {backgroundColor: Colors.goldPale, borderRadius: R.xl, marginHorizontal: Sp.lg, marginTop: Sp.md, padding: Sp.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.gold + '40', ...Shadow.card},
  pendingTitle: {fontSize: 15, fontWeight: '700', color: Colors.forest, marginBottom: 4, textAlign: 'center'},
  pendingSub:   {fontSize: 12, color: Colors.smoke, textAlign: 'center'},
});
