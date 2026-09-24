import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {employeeAPI} from '../../api';
import {Colors, R, Sp, Shadow} from '../../theme';

const STEPS = [
  {emoji: '📋', title: 'Join & verify income',         desc: 'Employer connects payroll. Income verified directly.'},
  {emoji: '💸', title: 'Use advances responsibly',     desc: 'Each on-time repayment is recorded to your Trust Score history.'},
  {emoji: '🏛️', title: 'Build your Trust Score',      desc: 'Consistent payroll, no missed repayments, savings history.'},
  {emoji: '📄', title: 'Share verified income data',   desc: 'With your consent, banks see your verified net pay — not a self-declared figure.'},
  {emoji: '🏦', title: 'Access formal credit',         desc: 'MCB, DBM, or Mutual Aid can offer you a personal loan or mortgage.'},
];

const LENDERS = [
  {name: 'MCB Bank',             product: 'Personal Loan',     rate: '8.5%–12% p.a.', minScore: 700, badge: 'Preferred',  color: '#d73527', logo: 'MCB'},
  {name: 'DBM (Dev. Bank)',      product: 'SME / Housing Loan', rate: '4%–7% p.a.',   minScore: 650, badge: 'Gov-backed', color: '#1a5ea8', logo: 'DBM'},
  {name: 'Mutual Aid',           product: 'Emergency Loan',     rate: '9%–14% p.a.',  minScore: 600, badge: 'Inclusive',  color: Colors.safe, logo: 'MA'},
];

export default function CreditPathwayScreen() {
  const nav = useNavigation();
  const [credit, setCredit]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [consents, setConsents] = useState({consentIncome: false, consentTenure: false, consentRepayment: false, consentSpending: false, consentSavings: false});

  useEffect(() => {
    employeeAPI.credit().then(r => {
      setCredit(r.data);
      const {consentIncome, consentTenure, consentRepayment, consentSpending, consentSavings} = r.data;
      setConsents({consentIncome, consentTenure, consentRepayment, consentSpending, consentSavings});
    }).finally(() => setLoading(false));
  }, []);

  const toggle = async key => {
    const next = !consents[key];
    setConsents(c => ({...c, [key]: next}));
    setSaving(true);
    try {
      await employeeAPI.updateConsent({[key]: next});
    } catch {
      setConsents(c => ({...c, [key]: !next}));
      Alert.alert('Error', 'Failed to update consent. Please try again.');
    } finally {setSaving(false);}
  };

  if (loading) return <View style={{flex:1, backgroundColor: Colors.navyMid, alignItems:'center', justifyContent:'center'}}><ActivityIndicator color={Colors.gold} size="large"/></View>;

  const score = credit?.trustScore ?? 0;
  const scoreColor = score >= 750 ? Colors.safe : score >= 650 ? Colors.gold : Colors.clay;

  return (
    <View style={S.root}>
      <StatusBar backgroundColor={Colors.navyMid} barStyle="light-content"/>
      <ScrollView style={S.scroll} contentContainerStyle={{paddingBottom: 40}} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.navyMid, Colors.navy]} style={S.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={S.back}><Text style={S.backTxt}>← Back</Text></TouchableOpacity>
          <Text style={S.headerTitle}>Credit Pathway</Text>
          <Text style={S.headerSub}>From payroll to a formal bank loan  ·  Mauritius DPA 2017</Text>
          <View style={S.scoreBox}>
            <Text style={S.scoreLbl}>Trust Score</Text>
            <Text style={[S.score, {color: scoreColor}]}>{score}</Text>
            <Text style={S.scoreMax}> / 850</Text>
          </View>
        </LinearGradient>

        <Text style={S.sectionTitle}>Your 5-step journey to formal credit</Text>
        {STEPS.map((step, i) => {
          const done = i === 0 || (i === 1 && (credit?.totalAdvances ?? 0) > 0) || (i === 2 && score > 600);
          return (
            <View key={i} style={S.stepRow}>
              <View style={[S.stepDot, done && S.stepDotDone]}>
                <Text style={[S.stepDotTxt, !done && {color: Colors.smoke}]}>{done ? '✓' : String(i + 1)}</Text>
              </View>
              <View style={S.stepContent}>
                <Text style={{fontSize: 22, flexShrink: 0, marginTop: 2}}>{step.emoji}</Text>
                <View style={{flex: 1}}>
                  <Text style={S.stepTitle}>{step.title}</Text>
                  <Text style={S.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <Text style={S.sectionTitle}>Data sharing consents</Text>
        <View style={S.dpaBox}>
          <Text style={S.dpaTxt}>🛡️  You are always in control. Withdraw consent anytime under DPA 2017 Section 35.</Text>
        </View>
        <View style={[S.card, Shadow.card]}>
          {[
            {key: 'consentIncome',    label: 'Verified income',    sub: 'Required for any loan',          required: true},
            {key: 'consentTenure',    label: 'Employment history', sub: 'Start date and employer',        required: true},
            {key: 'consentRepayment', label: 'Repayment history',  sub: 'Advance repayment track record', required: true},
            {key: 'consentSpending',  label: 'Spending patterns',  sub: 'Category breakdown (optional)',  required: false},
            {key: 'consentSavings',   label: 'Savings behaviour',  sub: 'Savings completion rate (optional)', required: false},
          ].map((c, i, arr) => (
            <View key={c.key} style={[S.consentRow, i < arr.length - 1 && S.consentBorder]}>
              <View style={{flex: 1}}>
                <Text style={S.consentLbl}>{c.label} {c.required && <Text style={{color: Colors.clay}}>*</Text>}</Text>
                <Text style={S.consentSub}>{c.sub}</Text>
              </View>
              <Switch
                value={consents[c.key]}
                onValueChange={() => !c.required && toggle(c.key)}
                disabled={c.required || saving}
                trackColor={{false: Colors.mist, true: Colors.forest}}
                thumbColor={Colors.white}
              />
            </View>
          ))}
        </View>

        <Text style={S.sectionTitle}>Partner lenders in Mauritius</Text>
        {LENDERS.map(l => {
          const eligible = score >= l.minScore;
          return (
            <View key={l.name} style={[S.lenderCard, Shadow.card]}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10}}>
                <View style={[S.lenderLogo, {backgroundColor: l.color}]}>
                  <Text style={S.lenderLogoTxt}>{l.logo}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={S.lenderName}>{l.name}</Text>
                  <Text style={S.lenderProduct}>{l.product}</Text>
                </View>
                <View style={[S.lenderBadge, {backgroundColor: l.color + '15'}]}>
                  <Text style={[S.lenderBadgeTxt, {color: l.color}]}>{l.badge}</Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View><Text style={S.lStat}>Rate</Text><Text style={S.lStatVal}>{l.rate}</Text></View>
                <View style={{alignItems: 'center'}}><Text style={S.lStat}>Min Score</Text><Text style={S.lStatVal}>{l.minScore}</Text></View>
                <View style={{alignItems: 'flex-end'}}>
                  <Text style={S.lStat}>Status</Text>
                  <Text style={[S.lStatVal, {color: eligible ? Colors.safe : Colors.clay}]}>
                    {eligible ? '✅ Eligible' : `🔐 +${l.minScore - score} pts`}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root:         {flex: 1, backgroundColor: Colors.cream},
  scroll:       {flex: 1},
  header:       {paddingHorizontal: Sp.xl, paddingTop: Sp.xl, paddingBottom: Sp.xxl},
  back:         {marginBottom: 16},
  backTxt:      {color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600'},
  headerTitle:  {fontSize: 24, fontWeight: '700', color: Colors.white, marginBottom: 4},
  headerSub:    {fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16},
  scoreBox:     {flexDirection: 'row', alignItems: 'baseline', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: R.xl, paddingHorizontal: Sp.lg, paddingVertical: 12, alignSelf: 'flex-start', gap: 6},
  scoreLbl:     {fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600'},
  score:        {fontSize: 40, fontWeight: '800'},
  scoreMax:     {fontSize: 20, color: 'rgba(255,255,255,0.3)', fontWeight: '600'},
  sectionTitle: {fontSize: 13, fontWeight: '700', color: Colors.ink, marginHorizontal: Sp.lg, marginTop: Sp.xl, marginBottom: Sp.md},
  stepRow:      {flexDirection: 'row', marginHorizontal: Sp.lg, marginBottom: Sp.sm},
  stepDot:      {width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.mist, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 12, zIndex: 1},
  stepDotDone:  {backgroundColor: Colors.forest},
  stepDotTxt:   {fontSize: 11, fontWeight: '700', color: Colors.white},
  stepContent:  {flex: 1, flexDirection: 'row', gap: 10, backgroundColor: Colors.white, borderRadius: R.lg, padding: Sp.md, marginBottom: 8},
  stepTitle:    {fontSize: 13, fontWeight: '700', color: Colors.ink, marginBottom: 4},
  stepDesc:     {fontSize: 12, color: Colors.smoke, lineHeight: 18},
  dpaBox:       {marginHorizontal: Sp.lg, backgroundColor: Colors.navy + '0D', borderRadius: R.lg, padding: Sp.md, borderWidth: 1, borderColor: Colors.navy + '1A', marginBottom: Sp.md},
  dpaTxt:       {fontSize: 12, color: Colors.navyMid, lineHeight: 18},
  card:         {backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, overflow: 'hidden'},
  consentRow:   {flexDirection: 'row', alignItems: 'center', padding: Sp.lg, gap: 12},
  consentBorder:{borderBottomWidth: 1, borderBottomColor: Colors.mist},
  consentLbl:   {fontSize: 13, fontWeight: '600', color: Colors.ink, marginBottom: 2},
  consentSub:   {fontSize: 11, color: Colors.smoke},
  lenderCard:   {backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, marginTop: Sp.sm, padding: Sp.lg},
  lenderLogo:   {width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  lenderLogoTxt:{fontSize: 12, fontWeight: '800', color: Colors.white},
  lenderName:   {fontSize: 14, fontWeight: '700', color: Colors.ink},
  lenderProduct:{fontSize: 11, color: Colors.smoke},
  lenderBadge:  {borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3},
  lenderBadgeTxt:{fontSize: 10, fontWeight: '700'},
  lStat:        {fontSize: 10, color: Colors.smoke},
  lStatVal:     {fontSize: 12, fontWeight: '700', color: Colors.ink},
});
