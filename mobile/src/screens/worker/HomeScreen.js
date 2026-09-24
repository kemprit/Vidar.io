import React, {useState, useCallback} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {employeeAPI} from '../../api';
import {Colors, R, Sp, Shadow} from '../../theme';
import {fmtDate, greeting} from '../../utils/format';

const fmt  = n => (n ?? 0).toLocaleString('en-MU', {maximumFractionDigits: 0});
const ACT_ICON  = {advance: '💸', savings: '🏦', bill: '⚡', repayment: '✅', ai: '🤖'};
const ACT_COLOR = {CREDIT: Colors.safe, DEBIT: Colors.clay, NEUTRAL: Colors.smoke};

export default function HomeScreen() {
  const {user} = useAuth();
  const nav    = useNavigation();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await employeeAPI.dashboard();
      setData(r.data);
    } catch (e) {console.error(e);}
    finally {setLoading(false); setRefreshing(false);}
  }, []);

  // Reload whenever the tab regains focus so balances reflect new advances
  useFocusEffect(useCallback(() => {load();}, [load]));

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';
  const initials  = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() ?? 'SL';
  const rentPot   = data?.savingsPots?.find(p => p.label.toLowerCase().includes('rent'));

  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: Colors.forest, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={S.root}>
      <StatusBar backgroundColor={Colors.forest} barStyle="light-content" />
      <ScrollView
        style={S.scroll}
        contentContainerStyle={{paddingBottom: 24}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {setRefreshing(true); load();}}
            colors={[Colors.gold]}
            tintColor={Colors.gold}
          />
        }>

        {/* ── Hero ── */}
        <LinearGradient colors={[Colors.forest, Colors.forestMid, Colors.forestLight]} style={S.hero}>
          <View style={S.heroTop}>
            <View>
              <Text style={S.greeting}>{greeting()}</Text>
              <Text style={S.heroName}>{firstName} 👋</Text>
            </View>
            <TouchableOpacity
              style={S.avatar}
              onPress={() => nav.navigate('Profile')}
              activeOpacity={0.8}>
              <Text style={S.avatarTxt}>{initials}</Text>
            </TouchableOpacity>
          </View>

          <Text style={S.heroLabel}>Available now · {data?.maxPct ?? 50}% of net earned wages</Text>
          <Text style={S.heroAmt}>
            <Text style={S.heroRs}>Rs </Text>
            {fmt(data?.availableNow)}
          </Text>
          <Text style={S.heroSub}>
            Based on {data?.daysWorked} days worked · after PAYE & NPF
          </Text>

          <View style={S.badge}>
            <View style={S.badgeDot} />
            <Text style={S.badgeTxt}>
              {user?.employerName ?? 'Payroll'}  ·  Verified  ·  MRA compliant
            </Text>
          </View>
        </LinearGradient>

        {/* ── Rent nudge ── */}
        {rentPot && rentPot.targetAmount - rentPot.savedAmount > 0 && (
          <View style={[S.card, S.nudge, Shadow.card]}>
            <Text style={{fontSize: 22}}>🏦</Text>
            <View style={{flex: 1}}>
              <Text style={S.nudgeTitle}>Set aside Rs {fmt(rentPot.targetAmount)} for rent</Text>
              <Text style={S.nudgeSub}>
                Rs {fmt(rentPot.targetAmount - rentPot.savedAmount)} still needed  ·  Payday {fmtDate(data?.payDate)}
              </Text>
            </View>
            <TouchableOpacity style={S.nudgeBtn} onPress={() => nav.navigate('Savings')} activeOpacity={0.8}>
              <Text style={S.nudgeBtnTxt}>Save →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Strip ── */}
        <View style={[S.card, S.strip, Shadow.card]}>
          {[
            ['Days worked', `${data?.daysWorked} / ${data?.totalDays}`],
            ['Net earned',  `Rs ${fmt(data?.netEarned)}`],
            ['Payday',      fmtDate(data?.payDate)],
          ].map(([l, v], i, arr) => (
            <React.Fragment key={l}>
              <View style={S.stripItem}>
                <Text style={S.stripLabel}>{l}</Text>
                <Text style={[S.stripVal, i === 1 && {color: Colors.forest}]}>{v}</Text>
              </View>
              {i < arr.length - 1 && <View style={S.stripDiv} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Cap note ── */}
        <View style={S.capNote}>
          <Text style={S.capNoteTxt}>
            <Text style={{fontWeight: '700', color: Colors.forest}}>Cap = net pay: </Text>
            Your advance limit is {data?.maxPct ?? 50}% of your net salary (after PAYE + NPF), pro-rated to days worked.
          </Text>
        </View>

        {/* ── Cycle progress ── */}
        <View style={[S.card, Shadow.card]}>
          <View style={S.cycleRow}>
            <Text style={S.cardTitle}>Pay cycle progress</Text>
            <Text style={S.cycleDays}>{data?.daysLeft} days left</Text>
          </View>
          <View style={S.progressBg}>
            <View style={[S.progressFill, {width: `${data?.cycleProgress ?? 0}%`}]} />
          </View>
          <View style={S.cycleFooter}>
            <Text style={S.cycleLbl}>Day 1</Text>
            <Text style={S.cycleLbl}>{data?.cycleProgress ?? 0}% complete</Text>
            <Text style={S.cycleLbl}>Day {data?.totalDays}</Text>
          </View>
        </View>

        {/* ── Quick actions ── */}
        <Text style={S.sectionTitle}>What do you need?</Text>
        <View style={S.grid}>
          <TouchableOpacity style={[S.actionCard, {backgroundColor: Colors.forest}]} onPress={() => nav.navigate('Advance')} activeOpacity={0.85}>
            <View style={[S.actionIcon, {backgroundColor: 'rgba(255,255,255,0.15)'}]}><Text style={S.actionEmoji}>💸</Text></View>
            <Text style={[S.actionTitle, {color: Colors.white}]}>Get Advance</Text>
            <Text style={[S.actionSub, {color: 'rgba(255,255,255,0.6)'}]}>Up to Rs {fmt(data?.availableNow)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[S.actionCard, {backgroundColor: Colors.goldPale, borderWidth: 1, borderColor: Colors.gold + '50'}]} onPress={() => nav.navigate('Payslip')} activeOpacity={0.85}>
            <View style={[S.actionIcon, {backgroundColor: Colors.gold + '40'}]}><Text style={S.actionEmoji}>📄</Text></View>
            <Text style={S.actionTitle}>My Payslip</Text>
            <Text style={S.actionSub}>MRA verified</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[S.actionCard, {backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.mist}]} onPress={() => nav.navigate('Insights')} activeOpacity={0.85}>
            <View style={[S.actionIcon, {backgroundColor: Colors.mist}]}><Text style={S.actionEmoji}>📊</Text></View>
            <Text style={S.actionTitle}>Spending</Text>
            <Text style={S.actionSub}>This month</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[S.actionCard, {backgroundColor: Colors.navy}]} onPress={() => nav.navigate('AI')} activeOpacity={0.85}>
            <View style={[S.actionIcon, {backgroundColor: Colors.purple + '50'}]}><Text style={S.actionEmoji}>🤖</Text></View>
            <Text style={[S.actionTitle, {color: Colors.white}]}>AI Advisor</Text>
            <Text style={[S.actionSub, {color: Colors.purpleLight}]}>Income strategy</Text>
          </TouchableOpacity>
        </View>

        {/* ── Activity ── */}
        <View style={S.actSection}>
          <View style={S.actHeader}>
            <Text style={[S.sectionTitle, {marginHorizontal: 0, marginTop: 0, marginBottom: 0}]}>Recent activity</Text>
            <TouchableOpacity onPress={() => nav.navigate('Insights')}>
              <Text style={S.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {(data?.activity ?? []).map((item, i, arr) => (
            <View key={item.id} style={[S.actRow, i < arr.length - 1 && S.actBorder]}>
              <View style={S.actIcon}>
                <Text style={{fontSize: 18}}>{ACT_ICON[item.type] ?? '📋'}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={S.actLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={S.actDate}>
                  {fmtDate(item.createdAt)}
                </Text>
              </View>
              {item.amount ? (
                <Text style={[S.actAmount, {color: ACT_COLOR[item.direction]}]}>
                  {item.direction === 'CREDIT' ? '+' : item.direction === 'DEBIT' ? '−' : ''}
                  Rs {fmt(item.amount)}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root:         {flex: 1, backgroundColor: Colors.cream},
  scroll:       {flex: 1},
  hero:         {paddingHorizontal: Sp.xl, paddingTop: Sp.xl, paddingBottom: 36},
  heroTop:      {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20},
  greeting:     {fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 2},
  heroName:     {fontSize: 18, fontWeight: '700', color: Colors.white},
  avatar:       {width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center'},
  avatarTxt:    {fontSize: 14, fontWeight: '800', color: Colors.forest},
  heroLabel:    {fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4},
  heroAmt:      {fontSize: 44, fontWeight: '800', color: Colors.white, lineHeight: 52},
  heroRs:       {fontSize: 20, fontWeight: '600'},
  heroSub:      {fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4},
  badge:        {flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 14, borderWidth: 1, borderColor: 'rgba(245,200,66,0.25)'},
  badgeDot:     {width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold},
  badgeTxt:     {fontSize: 11, color: 'rgba(255,255,255,0.82)', fontWeight: '500'},
  card:         {backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, marginTop: Sp.md, padding: Sp.lg},
  nudge:        {flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, borderLeftColor: Colors.safe, marginTop: -12},
  nudgeTitle:   {fontSize: 12, fontWeight: '700', color: Colors.safe},
  nudgeSub:     {fontSize: 10, color: Colors.smoke, marginTop: 2},
  nudgeBtn:     {backgroundColor: Colors.safe, borderRadius: R.lg, paddingHorizontal: 12, paddingVertical: 8},
  nudgeBtnTxt:  {color: Colors.white, fontSize: 11, fontWeight: '700'},
  strip:        {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  stripItem:    {flex: 1, alignItems: 'center'},
  stripLabel:   {fontSize: 10, color: Colors.smoke, marginBottom: 4},
  stripVal:     {fontSize: 15, fontWeight: '700', color: Colors.ink},
  stripDiv:     {width: 1, height: 32, backgroundColor: Colors.mist},
  capNote:      {marginHorizontal: Sp.lg, marginTop: Sp.sm, backgroundColor: Colors.forest + '0D', borderRadius: R.lg, padding: Sp.md},
  capNoteTxt:   {fontSize: 11, color: Colors.forest, lineHeight: 17},
  cycleRow:     {flexDirection: 'row', justifyContent: 'space-between', marginBottom: Sp.md},
  cardTitle:    {fontSize: 13, fontWeight: '600', color: Colors.ink},
  cycleDays:    {fontSize: 12, color: Colors.smoke},
  progressBg:   {height: 8, backgroundColor: Colors.mist, borderRadius: 4, overflow: 'hidden', marginBottom: 6},
  progressFill: {height: 8, borderRadius: 4, backgroundColor: Colors.forest},
  cycleFooter:  {flexDirection: 'row', justifyContent: 'space-between'},
  cycleLbl:     {fontSize: 10, color: Colors.smoke},
  sectionTitle: {fontSize: 14, fontWeight: '700', color: Colors.ink, marginHorizontal: Sp.lg, marginTop: Sp.xl, marginBottom: Sp.md},
  seeAll:       {fontSize: 12, color: Colors.forest, fontWeight: '600'},
  grid:         {flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: Sp.lg, gap: 10},
  actionCard:   {width: '47%', borderRadius: R.xl, padding: Sp.lg},
  actionIcon:   {width: 40, height: 40, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', marginBottom: 12},
  actionEmoji:  {fontSize: 20},
  actionTitle:  {fontSize: 13, fontWeight: '700', color: Colors.ink},
  actionSub:    {fontSize: 10, color: Colors.smoke, marginTop: 2},
  actSection:   {marginHorizontal: Sp.lg, backgroundColor: Colors.white, borderRadius: R.xl, paddingHorizontal: Sp.lg, marginTop: Sp.xl, marginBottom: 8},
  actHeader:    {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Sp.lg, paddingBottom: Sp.xs},
  actRow:       {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14},
  actBorder:    {borderBottomWidth: 1, borderBottomColor: Colors.mist},
  actIcon:      {width: 42, height: 42, borderRadius: R.lg, backgroundColor: Colors.mist, alignItems: 'center', justifyContent: 'center'},
  actLabel:     {fontSize: 13, fontWeight: '500', color: Colors.ink},
  actDate:      {fontSize: 11, color: Colors.smoke, marginTop: 2},
  actAmount:    {fontSize: 13, fontWeight: '700'},
});
