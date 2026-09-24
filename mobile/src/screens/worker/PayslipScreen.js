import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {employeeAPI} from '../../api';
import {Colors, R, Sp, Shadow} from '../../theme';

const fmt  = n => (n ?? 0).toLocaleString('en-MU', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const fmtN = n => (n ?? 0).toLocaleString('en-MU', {maximumFractionDigits: 0});

export default function PayslipScreen() {
  const [payslips, setPayslips] = useState([]);
  const [credit, setCredit]     = useState(null);
  const [idx, setIdx]           = useState(0);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([employeeAPI.payslips(), employeeAPI.credit()])
      .then(([p, c]) => {setPayslips(p.data); setCredit(c.data);})
      .finally(() => setLoading(false));
  }, []);

  const ps = payslips[idx];
  if (loading) return <View style={{flex:1, backgroundColor: Colors.forest, alignItems:'center', justifyContent:'center'}}><ActivityIndicator color={Colors.gold} size="large"/></View>;

  return (
    <View style={S.root}>
      <StatusBar backgroundColor={Colors.forest} barStyle="light-content"/>
      <ScrollView style={S.scroll} contentContainerStyle={{paddingBottom: 32}} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.forest, Colors.forestMid]} style={S.header}>
          <Text style={S.headerTitle}>My Payslip</Text>
          <Text style={S.headerSub}>MRA-verified income record</Text>
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.tabScroll}
          contentContainerStyle={{gap: 8, paddingHorizontal: Sp.lg, paddingVertical: Sp.md}}>
          {payslips.map((p, i) => (
            <TouchableOpacity key={p.id} onPress={() => setIdx(i)}
              style={[S.tab, i === idx && S.tabActive]}>
              <Text style={[S.tabTxt, i === idx && S.tabTxtActive]}>{p.periodLabel}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {ps && (
          <View style={[S.card, Shadow.card]}>
            <View style={S.empBand}>
              <View style={S.empLogo}><Text style={S.empLogoTxt}>{(ps.user?.employer?.name ?? 'E').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</Text></View>
              <View>
                <Text style={S.empName}>{ps.user?.employer?.name ?? 'Employer'}</Text>
                <Text style={S.empVerified}>✅  Verified  ·  {ps.user?.employer?.tan}</Text>
              </View>
            </View>
            <Text style={S.period}>Pay period: {ps.periodLabel}</Text>
            {[
              ['Basic salary',           ps.grossSalary,    false],
              ps.transportAllow > 0 && ['Transport allowance', ps.transportAllow, false],
              ['PAYE income tax (MRA)',  ps.payeTax,        true ],
              ['NPF employee (3%)',      ps.npfEmployee,    true ],
              ps.nsf > 0 && ['NSF contribution', ps.nsf,   true ],
              ps.advanceDeducted > 0 && ['SL advance repaid', ps.advanceDeducted, true],
            ].filter(Boolean).map(([l, v, red]) => (
              <View key={l} style={S.slipRow}>
                <Text style={S.slipLbl}>{l}</Text>
                <Text style={[S.slipVal, red && {color: Colors.clay}]}>{red ? '− ' : ''}Rs {fmt(v)}</Text>
              </View>
            ))}
            <View style={S.slipTotal}>
              <Text style={S.slipTotalLbl}>Net pay</Text>
              <Text style={S.slipTotalVal}>Rs {fmt(ps.netPay)}</Text>
            </View>
            <LinearGradient colors={[Colors.forest, Colors.forestLight]} style={S.takeHome}>
              <Text style={S.takeHomeLbl}>You take home</Text>
              <Text style={S.takeHomeAmt}>Rs {fmtN(ps.netPay)}</Text>
            </LinearGradient>
          </View>
        )}

        {credit && (
          <View style={[S.card, Shadow.card, {marginTop: Sp.md}]}>
            <Text style={S.trustTitle}>Trust Score</Text>
            <View style={S.trustRow}>
              <View style={S.trustRing}><Text style={S.trustScore}>{credit.trustScore}</Text></View>
              <View style={{flex: 1, gap: 6}}>
                {[
                  [`${credit.monthsClean} months payroll history`, true],
                  [`${Math.max(0, (credit.totalAdvances ?? 0) - (credit.missedRepayments ?? 0))} on-time repayments`, true],
                  ['Net income verified (MRA)', true],
                  ['Spending data: ' + (credit.consentSpending ? 'shared ✅' : 'not shared'), credit.consentSpending],
                ].map(([l, active]) => (
                  <View key={l} style={{flexDirection:'row', alignItems:'center', gap: 8}}>
                    <View style={[S.dot, active && {backgroundColor: Colors.forest}]}/>
                    <Text style={S.dotLbl}>{l}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root:         {flex: 1, backgroundColor: Colors.cream},
  scroll:       {flex: 1},
  header:       {paddingHorizontal: Sp.xl, paddingTop: Sp.xl, paddingBottom: Sp.xl},
  headerTitle:  {fontSize: 22, fontWeight: '700', color: Colors.white, marginBottom: 4},
  headerSub:    {fontSize: 12, color: 'rgba(255,255,255,0.55)'},
  tabScroll:    {flexGrow: 0},
  tab:          {paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.pill, backgroundColor: Colors.white},
  tabActive:    {backgroundColor: Colors.forest},
  tabTxt:       {fontSize: 12, fontWeight: '600', color: Colors.smoke},
  tabTxtActive: {color: Colors.white},
  card:         {backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, overflow: 'hidden'},
  empBand:      {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.gold, padding: Sp.md},
  empLogo:      {width: 36, height: 36, backgroundColor: Colors.forest, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  empLogoTxt:   {fontSize: 11, fontWeight: '800', color: Colors.gold},
  empName:      {fontSize: 12, fontWeight: '700', color: Colors.forest},
  empVerified:  {fontSize: 10, color: Colors.forestMid},
  period:       {fontSize: 11, color: Colors.smoke, padding: Sp.md, paddingBottom: 0},
  slipRow:      {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Sp.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.mist},
  slipLbl:      {fontSize: 12, color: Colors.smoke},
  slipVal:      {fontSize: 12, fontWeight: '600', color: Colors.ink},
  slipTotal:    {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Sp.md, paddingVertical: 14},
  slipTotalLbl: {fontSize: 15, fontWeight: '700', color: Colors.ink},
  slipTotalVal: {fontSize: 15, fontWeight: '700', color: Colors.forest},
  takeHome:     {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Sp.lg},
  takeHomeLbl:  {fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500'},
  takeHomeAmt:  {fontSize: 22, fontWeight: '800', color: Colors.gold},
  trustTitle:   {fontSize: 14, fontWeight: '700', color: Colors.ink, padding: Sp.lg, paddingBottom: 0},
  trustRow:     {flexDirection: 'row', alignItems: 'center', gap: 16, padding: Sp.lg, paddingTop: Sp.md},
  trustRing:    {width: 64, height: 64, borderRadius: 32, borderWidth: 6, borderColor: Colors.forest, alignItems: 'center', justifyContent: 'center'},
  trustScore:   {fontSize: 20, fontWeight: '800', color: Colors.forest},
  dot:          {width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.smoke},
  dotLbl:       {fontSize: 11, color: Colors.smoke, flex: 1},
});
