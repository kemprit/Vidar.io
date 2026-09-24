import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, ScrollView, TextInput, StyleSheet, RefreshControl, ActivityIndicator, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect} from '@react-navigation/native';
import {hrAPI} from '../../api';
import {Colors, R, Sp, Shadow} from '../../theme';

const fmt = n => (n ?? 0).toLocaleString('en-MU', {maximumFractionDigits: 0});
const scoreColor = s => s >= 750 ? Colors.safe : s >= 650 ? Colors.goldDim : Colors.clay;
const scoreLabel = s => s >= 750 ? 'Excellent' : s >= 650 ? 'Good' : 'Fair';

export default function HREmployeesScreen() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {const r = await hrAPI.employees(); setEmployees(r.data); setFiltered(r.data);}
    catch (e) {console.error(e);}
    finally {setLoading(false); setRefreshing(false);}
  };

  useFocusEffect(useCallback(() => {load();}, []));

  useEffect(() => {
    if (!search.trim()) return setFiltered(employees);
    const q = search.toLowerCase();
    setFiltered(employees.filter(e =>
      e.fullName.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      (e.department ?? '').toLowerCase().includes(q)
    ));
  }, [search, employees]);

  return (
    <View style={S.root}>
      <StatusBar backgroundColor={Colors.navy} barStyle="light-content"/>
      <LinearGradient colors={[Colors.navy, Colors.navyMid]} style={S.header}>
        <Text style={S.headerTitle}>Team</Text>
        <Text style={S.headerSub}>{employees.length} active employees</Text>
      </LinearGradient>

      <View style={S.searchRow}>
        <TextInput
          style={S.searchInput}
          placeholder="Search by name, ID, department…"
          placeholderTextColor={Colors.smoke}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={S.loader}><ActivityIndicator color={Colors.navyMid}/></View>
      ) : (
        <ScrollView
          style={S.scroll}
          contentContainerStyle={{padding: Sp.lg, gap: Sp.md, paddingBottom: 32}}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} colors={[Colors.navyMid]}/>}>

          {filtered.length === 0 ? (
            <View style={S.empty}>
              <Text style={S.emptyEmoji}>🔍</Text>
              <Text style={S.emptyTitle}>No employees found</Text>
              <Text style={S.emptySub}>Try a different search term</Text>
            </View>
          ) : filtered.map(e => (
            <View key={e.id} style={[S.empCard, Shadow.card]}>
              <View style={S.empTop}>
                <View style={S.empAvatar}>
                  <Text style={S.empAvatarTxt}>{e.fullName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={S.empName}>{e.fullName}</Text>
                  <Text style={S.empSub}>{e.employeeId}  ·  {e.jobTitle ?? 'Employee'}</Text>
                </View>
                <View style={[S.scoreBadge, {borderColor: scoreColor(e.trustScore ?? 0) + '40'}]}>
                  <Text style={[S.scoreVal, {color: scoreColor(e.trustScore ?? 0)}]}>{e.trustScore ?? '—'}</Text>
                  <Text style={S.scoreLbl}>{scoreLabel(e.trustScore ?? 0)}</Text>
                </View>
              </View>

              <View style={S.empStats}>
                <View style={S.empStat}>
                  <Text style={S.empStatLbl}>Net pay</Text>
                  <Text style={S.empStatVal}>Rs {e.latestNetPay ? fmt(e.latestNetPay) : '—'}</Text>
                </View>
                <View style={S.empStat}>
                  <Text style={S.empStatLbl}>Active advances</Text>
                  <Text style={[S.empStatVal, e.activeAdvances > 0 && {color: Colors.forest}]}>{e.activeAdvances}</Text>
                </View>
                <View style={S.empStat}>
                  <Text style={S.empStatLbl}>Clean months</Text>
                  <Text style={S.empStatVal}>{e.monthsClean ?? 0}</Text>
                </View>
              </View>

              {e.activeAdvances > 0 && (
                <View style={S.activeTag}>
                  <Text style={S.activeTagTxt}>💸  Advance currently active</Text>
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
  searchRow:    {backgroundColor: Colors.white, paddingHorizontal: Sp.lg, paddingVertical: Sp.sm, borderBottomWidth: 1, borderBottomColor: Colors.mist},
  searchInput:  {backgroundColor: Colors.cream, borderRadius: R.pill, paddingHorizontal: Sp.lg, paddingVertical: 10, fontSize: 14, color: Colors.ink, borderWidth: 1, borderColor: Colors.mist},
  empty:        {alignItems: 'center', paddingTop: 60},
  emptyEmoji:   {fontSize: 48, marginBottom: 12},
  emptyTitle:   {fontSize: 16, fontWeight: '700', color: Colors.ink},
  emptySub:     {fontSize: 12, color: Colors.smoke, marginTop: 4},
  empCard:      {backgroundColor: Colors.white, borderRadius: R.xl},
  empTop:       {flexDirection: 'row', alignItems: 'center', gap: 12, padding: Sp.lg, paddingBottom: Sp.sm},
  empAvatar:    {width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.navyMid + '20', alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  empAvatarTxt: {fontSize: 16, fontWeight: '800', color: Colors.navyMid},
  empName:      {fontSize: 14, fontWeight: '700', color: Colors.ink},
  empSub:       {fontSize: 11, color: Colors.smoke, marginTop: 2},
  scoreBadge:   {alignItems: 'center', borderWidth: 1.5, borderRadius: R.lg, paddingHorizontal: 10, paddingVertical: 6, flexShrink: 0},
  scoreVal:     {fontSize: 16, fontWeight: '800'},
  scoreLbl:     {fontSize: 9, color: Colors.smoke, fontWeight: '600'},
  empStats:     {flexDirection: 'row', marginHorizontal: Sp.lg, backgroundColor: Colors.cream, borderRadius: R.lg, padding: Sp.md, marginBottom: Sp.sm},
  empStat:      {flex: 1, alignItems: 'center'},
  empStatLbl:   {fontSize: 10, color: Colors.smoke, marginBottom: 2},
  empStatVal:   {fontSize: 14, fontWeight: '700', color: Colors.ink},
  activeTag:    {marginHorizontal: Sp.lg, marginBottom: Sp.md, backgroundColor: Colors.forest + '0D', borderRadius: R.md, padding: Sp.sm},
  activeTagTxt: {fontSize: 11, color: Colors.forest, fontWeight: '600'},
});
