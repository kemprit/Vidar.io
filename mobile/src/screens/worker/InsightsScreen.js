import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, StyleSheet, ActivityIndicator, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {employeeAPI} from '../../api';
import {Colors, R, Sp, Shadow} from '../../theme';

const fmt = n => (n ?? 0).toLocaleString('en-MU', {maximumFractionDigits: 0});

const CATS = [
  {icon: '🏠', label: 'Housing & Rent',    pct: 33},
  {icon: '🛒', label: 'Food & Groceries',  pct: 25},
  {icon: '🚌', label: 'Transport',          pct: 10},
  {icon: '⚡', label: 'CEB / Utilities',   pct: 4 },
  {icon: '📦', label: 'Other',              pct: 28},
];

export default function InsightsScreen() {
  const [dash, setDash]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeAPI.dashboard().then(r => setDash(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: Colors.forest, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  const netPay = dash?.netMonthly ?? 13474;
  const spent  = Math.round(netPay * 0.635);
  // Last four months ending with the current one
  const months = [3, 2, 1, 0].map(k => {
    const d = new Date();
    d.setMonth(d.getMonth() - k, 1);
    return d.toLocaleDateString('en-MU', {month: 'short'});
  });
  const values = [62, 78, 55, 88];

  return (
    <View style={S.root}>
      <StatusBar backgroundColor={Colors.forest} barStyle="light-content" />
      <ScrollView
        style={S.scroll}
        contentContainerStyle={{paddingBottom: 32}}
        showsVerticalScrollIndicator={false}>

        <LinearGradient colors={[Colors.forest, Colors.forestMid]} style={S.header}>
          <Text style={S.headerTitle}>Spending insights</Text>
          <Text style={S.headerSub}>Estimated from your net pay  ·  Based on your consent</Text>
        </LinearGradient>

        <View style={[S.card, Shadow.card]}>
          <Text style={S.cardTitle}>Total spent this month</Text>
          <Text style={S.spentAmt}>Rs {fmt(spent)}</Text>
          <Text style={S.spentSub}>of Rs {fmt(netPay)} net pay</Text>

          {/* Bar chart */}
          <View style={S.barChart}>
            {months.map((m, i) => (
              <View key={m} style={S.barCol}>
                <View style={S.barTrack}>
                  <View style={[S.barFill, {
                    height: `${values[i]}%`,
                    backgroundColor: i === months.length - 1 ? Colors.forest : Colors.mist,
                  }]} />
                </View>
                <Text style={S.barLbl}>{m}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nudge */}
        <LinearGradient colors={[Colors.safe, Colors.forestLight]} style={S.nudge}>
          <Text style={{fontSize: 24}}>🏦</Text>
          <View style={{flex: 1}}>
            <Text style={S.nudgeTitle}>Rent week is approaching</Text>
            <Text style={S.nudgeSub}>
              Set aside your rent amount now — before spending starts. No fee, no interest.
            </Text>
          </View>
        </LinearGradient>

        {CATS.map(({icon, label, pct}) => {
          const amount = Math.round(spent * pct / 100);
          return (
            <View key={label} style={[S.catCard, Shadow.card]}>
              <Text style={{fontSize: 22}}>{icon}</Text>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={S.catLbl}>{label}</Text>
                  <Text style={S.catAmt}>Rs {fmt(amount)}</Text>
                </View>
                <View style={S.catBar}>
                  <View style={[S.catBarFill, {width: `${pct}%`}]} />
                </View>
                <Text style={S.catPct}>{pct}% of spending</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root:        {flex: 1, backgroundColor: Colors.cream},
  scroll:      {flex: 1},
  header:      {paddingHorizontal: Sp.xl, paddingTop: Sp.xl, paddingBottom: Sp.xl},
  headerTitle: {fontSize: 22, fontWeight: '700', color: Colors.white, marginBottom: 4},
  headerSub:   {fontSize: 12, color: 'rgba(255,255,255,0.55)'},
  card:        {backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, marginTop: Sp.md, padding: Sp.xl},
  cardTitle:   {fontSize: 13, fontWeight: '600', color: Colors.smoke, marginBottom: 4},
  spentAmt:    {fontSize: 32, fontWeight: '800', color: Colors.forest},
  spentSub:    {fontSize: 12, color: Colors.smoke},
  barChart:    {flexDirection: 'row', gap: 8, height: 120, alignItems: 'stretch', marginTop: Sp.lg},
  barCol:      {flex: 1, alignItems: 'center', gap: 4},
  barTrack:    {flex: 1, width: '70%', justifyContent: 'flex-end'},
  barFill:     {borderRadius: 4, width: '100%'},
  barLbl:      {fontSize: 10, color: Colors.smoke},
  nudge:       {flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: Sp.lg, marginTop: Sp.md, borderRadius: R.xl, padding: Sp.lg},
  nudgeTitle:  {fontSize: 12, fontWeight: '700', color: Colors.gold, marginBottom: 4},
  nudgeSub:    {fontSize: 11, color: 'rgba(255,255,255,0.82)', lineHeight: 17},
  catCard:     {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, marginTop: Sp.sm, padding: Sp.lg},
  catLbl:      {fontSize: 13, fontWeight: '600', color: Colors.ink},
  catAmt:      {fontSize: 13, fontWeight: '700', color: Colors.ink},
  catBar:      {height: 6, backgroundColor: Colors.mist, borderRadius: 3, marginTop: 8, overflow: 'hidden'},
  catBarFill:  {height: 6, backgroundColor: Colors.forest, borderRadius: 3},
  catPct:      {fontSize: 10, color: Colors.smoke, marginTop: 4},
});
