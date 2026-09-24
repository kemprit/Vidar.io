import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Alert, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect} from '@react-navigation/native';
import {hrAPI} from '../../api';
import {Colors, R, Sp, Shadow} from '../../theme';
import {fmtDate} from '../../utils/format';

const TABS = ['PENDING','APPROVED','DISBURSED','REPAID','REJECTED'];
const TAB_COLOR = {PENDING: Colors.goldDim, APPROVED: Colors.safe, DISBURSED: Colors.forest, REPAID: Colors.navyMid, REJECTED: Colors.clay};
const fmt  = n => (n ?? 0).toLocaleString('en-MU', {maximumFractionDigits: 0});
const fmtD = d => fmtDate(d, {day: 'numeric', month: 'short', year: '2-digit'});
const fmtRs = n => (n ?? 0).toLocaleString('en-MU', {minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2});

export default function HRAdvancesScreen() {
  const [tab, setTab]           = useState('PENDING');
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioning, setActioning]   = useState(null);

  const load = useCallback(async (t = tab) => {
    try {const r = await hrAPI.advances(t); setAdvances(r.data);}
    catch (e) {console.error(e);}
    finally {setLoading(false); setRefreshing(false);}
  }, [tab]);

  // Reload on tab switch and whenever the screen regains focus
  useFocusEffect(useCallback(() => {load(tab);}, [load, tab]));
  useEffect(() => {setLoading(true);}, [tab]);

  const action = (adv, act) => {
    Alert.alert(
      act === 'approve' ? 'Approve advance?' : 'Reject advance?',
      `${act === 'approve' ? 'Disburse' : 'Reject'} Rs ${fmt(adv.amount)} for ${adv.user?.fullName}?${adv.overCap ? '\n\n⚠️ This advance is over the employee\'s net cap.' : ''}`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: act === 'approve' ? 'Approve & disburse' : 'Reject', style: act === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            setActioning(adv.id);
            try {await hrAPI.actionAdvance(adv.id, {action: act}); load(tab);}
            catch (err) {Alert.alert('Failed', err.response?.data?.error ?? 'Please try again.');}
            finally {setActioning(null);}
          }},
      ]
    );
  };

  return (
    <View style={S.root}>
      <StatusBar backgroundColor={Colors.navy} barStyle="light-content"/>
      <LinearGradient colors={[Colors.navy, Colors.navyMid]} style={S.header}>
        <Text style={S.headerTitle}>Advance Requests</Text>
        <Text style={S.headerSub}>Review, approve, or reject employee advances</Text>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.tabScroll}
        contentContainerStyle={{gap: 6, paddingHorizontal: Sp.lg, paddingVertical: 10}}>
        {TABS.map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} activeOpacity={0.8}
            style={[S.tab, tab === t && {backgroundColor: TAB_COLOR[t] ?? Colors.forest}]}>
            <Text style={[S.tabTxt, tab === t && S.tabTxtActive]}>{t.charAt(0) + t.slice(1).toLowerCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={S.loader}><ActivityIndicator color={Colors.navyMid}/></View>
      ) : (
        <ScrollView
          style={S.scroll}
          contentContainerStyle={{padding: Sp.lg, gap: Sp.md, paddingBottom: 32}}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} colors={[Colors.navyMid]}/>}>

          {advances.length === 0 ? (
            <View style={S.empty}>
              <Text style={S.emptyEmoji}>✅</Text>
              <Text style={S.emptyTitle}>No {tab.toLowerCase()} advances</Text>
              <Text style={S.emptySub}>Pull to refresh</Text>
            </View>
          ) : advances.map(a => (
            <View key={a.id} style={[S.advCard, Shadow.card, a.overCap && S.advCardWarn]}>
              <View style={S.empRow}>
                <View style={S.empAvatar}>
                  <Text style={S.empAvatarTxt}>{a.user?.fullName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={S.empName}>{a.user?.fullName}</Text>
                  <Text style={S.empId}>{a.user?.employeeId}  ·  {a.user?.jobTitle ?? 'Employee'}</Text>
                </View>
                <View style={[S.statusBadge, {backgroundColor: TAB_COLOR[a.status] + '20'}]}>
                  <Text style={[S.statusTxt, {color: TAB_COLOR[a.status]}]}>
                    {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                  </Text>
                </View>
              </View>

              {a.overCap && (
                <View style={S.capWarn}>
                  <Text style={S.capWarnTxt}>⚠️  Over net cap ({a.pctOfCap}% of earned wages)</Text>
                </View>
              )}

              <View style={S.amtRow}>
                <View style={S.amtItem}><Text style={S.amtLbl}>Amount</Text><Text style={S.amtVal}>Rs {fmt(a.amount)}</Text></View>
                <View style={S.amtItem}><Text style={S.amtLbl}>Fee (2.5%)</Text><Text style={S.amtVal}>Rs {fmtRs(a.fee)}</Text></View>
                <View style={S.amtItem}><Text style={S.amtLbl}>Total to deduct</Text><Text style={[S.amtVal, {color: Colors.forest}]}>Rs {fmtRs(a.totalToRepay)}</Text></View>
              </View>

              <View style={S.metaRow}>
                <Text style={S.metaTxt}>Days: {a.daysWorked}/{a.totalDays}</Text>
                <Text style={S.metaTxt}>Cap: Rs {fmt(a.netCap)}</Text>
                <Text style={S.metaTxt}>{fmtD(a.requestedAt)}</Text>
              </View>

              {a.status === 'PENDING' && (
                <View style={S.actionRow}>
                  <TouchableOpacity style={[S.rejectBtn, actioning === a.id && {opacity: 0.5}]}
                    onPress={() => action(a, 'reject')} disabled={!!actioning} activeOpacity={0.8}>
                    {actioning === a.id ? <ActivityIndicator size="small" color={Colors.clay}/> : <Text style={S.rejectTxt}>Reject</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={[S.approveBtn, actioning === a.id && {opacity: 0.5}]}
                    onPress={() => action(a, 'approve')} disabled={!!actioning} activeOpacity={0.85}>
                    {actioning === a.id ? <ActivityIndicator size="small" color={Colors.white}/> : <Text style={S.approveTxt}>Approve & Disburse</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  root:         {flex: 1, backgroundColor: Colors.cream},
  scroll:       {flex: 1},
  loader:       {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cream, paddingTop: 80},
  header:       {paddingHorizontal: Sp.xl, paddingTop: Sp.lg, paddingBottom: Sp.xl},
  headerTitle:  {fontSize: 22, fontWeight: '700', color: Colors.white, marginBottom: 4},
  headerSub:    {fontSize: 12, color: 'rgba(255,255,255,0.5)'},
  tabScroll:    {flexGrow: 0, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.mist},
  tab:          {paddingHorizontal: 16, paddingVertical: 8, borderRadius: R.pill, backgroundColor: Colors.mist},
  tabTxt:       {fontSize: 12, fontWeight: '600', color: Colors.smoke},
  tabTxtActive: {color: Colors.white},
  empty:        {alignItems: 'center', paddingTop: 60},
  emptyEmoji:   {fontSize: 48, marginBottom: 12},
  emptyTitle:   {fontSize: 16, fontWeight: '700', color: Colors.ink},
  emptySub:     {fontSize: 12, color: Colors.smoke, marginTop: 4},
  advCard:      {backgroundColor: Colors.white, borderRadius: R.xl},
  advCardWarn:  {borderWidth: 1.5, borderColor: Colors.clay + '50'},
  empRow:       {flexDirection: 'row', alignItems: 'center', gap: 12, padding: Sp.lg, paddingBottom: Sp.sm},
  empAvatar:    {width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.mist, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  empAvatarTxt: {fontSize: 14, fontWeight: '700', color: Colors.navyMid},
  empName:      {fontSize: 14, fontWeight: '700', color: Colors.ink},
  empId:        {fontSize: 11, color: Colors.smoke, marginTop: 2},
  statusBadge:  {borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4},
  statusTxt:    {fontSize: 11, fontWeight: '700'},
  capWarn:      {marginHorizontal: Sp.lg, backgroundColor: Colors.clayPale, borderRadius: R.md, padding: Sp.sm, marginBottom: Sp.sm},
  capWarnTxt:   {fontSize: 11, color: Colors.clay},
  amtRow:       {flexDirection: 'row', backgroundColor: Colors.mist, marginHorizontal: Sp.lg, borderRadius: R.lg, padding: Sp.md, gap: 8, marginBottom: Sp.sm},
  amtItem:      {flex: 1},
  amtLbl:       {fontSize: 10, color: Colors.smoke, marginBottom: 2},
  amtVal:       {fontSize: 13, fontWeight: '700', color: Colors.ink},
  metaRow:      {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Sp.lg, paddingBottom: Sp.sm},
  metaTxt:      {fontSize: 10, color: Colors.smoke},
  actionRow:    {flexDirection: 'row', gap: 10, padding: Sp.lg, paddingTop: Sp.sm},
  rejectBtn:    {flex: 1, borderWidth: 1.5, borderColor: Colors.clay, borderRadius: R.lg, paddingVertical: 12, alignItems: 'center'},
  rejectTxt:    {fontSize: 14, fontWeight: '700', color: Colors.clay},
  approveBtn:   {flex: 2, backgroundColor: Colors.forest, borderRadius: R.lg, paddingVertical: 12, alignItems: 'center'},
  approveTxt:   {fontSize: 14, fontWeight: '700', color: Colors.white},
});
