import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {Colors, R, Sp, Shadow} from '../../theme';

const RIGHTS = [
  {right: 'Right to Access',       article: 'Section 30', desc: 'Request a copy of all personal data we hold about you at any time.'},
  {right: 'Right to Rectification',article: 'Section 31', desc: 'Correct inaccurate or incomplete personal data.'},
  {right: 'Right to Erasure',      article: 'Section 32', desc: 'Request deletion of your data, subject to payroll retention obligations.'},
  {right: 'Right to Restriction',  article: 'Section 33', desc: 'Restrict how we process your data while a complaint is investigated.'},
  {right: 'Right to Portability',  article: 'Section 34', desc: 'Receive your payroll data in a machine-readable format (CSV / PDF).'},
  {right: 'Right to Object',       article: 'Section 35', desc: 'Object to processing for direct marketing or credit sharing at any time.'},
];

const TRUST_FACTORS = [
  {factor: 'Months of payroll',    weight: 35, icon: '📅', desc: 'Consistent payroll history from your employer'},
  {factor: 'Repayment record',     weight: 30, icon: '✅', desc: 'On-time advance repayments via payroll deduction'},
  {factor: 'Verified income',      weight: 20, icon: '💰', desc: 'MRA-compliant net pay from your payslips'},
  {factor: 'Savings behaviour',    weight: 10, icon: '🏦', desc: 'Completed savings goals (with consent)'},
  {factor: 'Employment stability', weight:  5, icon: '🏢', desc: 'Tenure and employer size'},
];

export default function DataProtectionScreen() {
  const nav = useNavigation();

  return (
    <View style={S.root}>
      <StatusBar backgroundColor="#0a1628" barStyle="light-content"/>
      <ScrollView style={S.scroll} contentContainerStyle={{paddingBottom: 40}} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0a1628', '#1a2a5e']} style={S.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={S.back}><Text style={S.backTxt}>← Back</Text></TouchableOpacity>
          <Text style={S.headerTitle}>Data Protection</Text>
          <Text style={S.headerSub}>Your rights under the Mauritius{'\n'}Data Protection Act 2017</Text>
        </LinearGradient>

        <View style={[S.lawBadge, Shadow.card]}>
          <View style={S.lawIcon}><Text style={{fontSize: 24}}>🏛️</Text></View>
          <View style={{flex: 1}}>
            <Text style={S.lawTitle}>Data Protection Act 2017</Text>
            <Text style={S.lawSub}>Act No. 20 of 2017  ·  Republic of Mauritius{'\n'}Sékirité Lavenir is a registered Data Controller</Text>
          </View>
        </View>

        <Text style={S.sectionTitle}>What data we hold about you</Text>
        <View style={[S.card, Shadow.card]}>
          {[
            {icon: '🪪', label: 'Identity',       detail: 'Full name, Employee ID, National ID (hashed)'},
            {icon: '💰', label: 'Payroll',        detail: 'Gross salary, deductions, net pay, pay dates — from your employer\'s system'},
            {icon: '💸', label: 'Advances',       detail: 'Amount, date, fee, repayment status per cycle'},
            {icon: '🏦', label: 'Savings',        detail: 'Savings pot labels, targets, completion — only if you create them'},
            {icon: '🤖', label: 'AI interactions',detail: 'Chat messages and AI tips — stored for context only, never sold'},
          ].map((item, i, arr) => (
            <View key={item.label} style={[S.dataRow, i < arr.length - 1 && S.dataBorder]}>
              <Text style={{fontSize: 20, flexShrink: 0, marginTop: 2}}>{item.icon}</Text>
              <View style={{flex: 1}}>
                <Text style={S.dataLbl}>{item.label}</Text>
                <Text style={S.dataDetail}>{item.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={S.sectionTitle}>How your Trust Score is calculated</Text>
        <View style={[S.card, Shadow.card]}>
          {TRUST_FACTORS.map((f, i, arr) => (
            <View key={f.factor} style={[S.dataRow, i < arr.length - 1 && S.dataBorder]}>
              <Text style={{fontSize: 20}}>{f.icon}</Text>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={S.dataLbl}>{f.factor}</Text>
                  <Text style={{fontSize: 12, fontWeight: '700', color: Colors.navyMid}}>{f.weight}%</Text>
                </View>
                <View style={S.tBar}><View style={[S.tBarFill, {width: `${f.weight}%`}]} /></View>
                <Text style={S.dataDetail}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={S.sectionTitle}>Your legal rights</Text>
        {RIGHTS.map(r => (
          <View key={r.right} style={[S.rightCard, Shadow.card]}>
            <View style={S.rightHead}>
              <Text style={S.rightTitle}>{r.right}</Text>
              <View style={S.artBadge}><Text style={S.artTxt}>{r.article}</Text></View>
            </View>
            <Text style={S.rightDesc}>{r.desc}</Text>
          </View>
        ))}

        <View style={[S.contactCard, Shadow.card]}>
          <Text style={S.contactTitle}>Exercise your rights</Text>
          <Text style={S.contactDesc}>
            Contact our Data Protection Officer at:{'\n'}dpo@sekiritelavenir.mu{'\n\n'}
            We respond within 28 days, as required by the Act.
          </Text>
          <View style={S.offBadge}>
            <Text style={S.offBadgeTxt}>🇲🇺  Regulated under Mauritius law</Text>
          </View>
        </View>
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
  headerTitle:  {fontSize: 24, fontWeight: '700', color: Colors.white, marginBottom: 6},
  headerSub:    {fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 20},
  lawBadge:     {flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, marginTop: -20, padding: Sp.lg},
  lawIcon:      {width: 52, height: 52, backgroundColor: Colors.navy + '0D', borderRadius: R.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  lawTitle:     {fontSize: 14, fontWeight: '700', color: Colors.ink, marginBottom: 4},
  lawSub:       {fontSize: 11, color: Colors.smoke, lineHeight: 17},
  sectionTitle: {fontSize: 13, fontWeight: '700', color: Colors.ink, marginHorizontal: Sp.lg, marginTop: Sp.xl, marginBottom: Sp.sm},
  card:         {backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, overflow: 'hidden'},
  dataRow:      {flexDirection: 'row', gap: 12, padding: Sp.lg, alignItems: 'flex-start'},
  dataBorder:   {borderBottomWidth: 1, borderBottomColor: Colors.mist},
  dataLbl:      {fontSize: 13, fontWeight: '600', color: Colors.ink, marginBottom: 2},
  dataDetail:   {fontSize: 11, color: Colors.smoke, lineHeight: 17},
  tBar:         {height: 4, backgroundColor: Colors.mist, borderRadius: 2, marginTop: 6, marginBottom: 4, overflow: 'hidden'},
  tBarFill:     {height: 4, backgroundColor: Colors.navyMid, borderRadius: 2},
  rightCard:    {backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, marginTop: Sp.sm, padding: Sp.lg},
  rightHead:    {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  rightTitle:   {fontSize: 13, fontWeight: '700', color: Colors.ink},
  artBadge:     {backgroundColor: Colors.navyMid + '15', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3},
  artTxt:       {fontSize: 10, color: Colors.navyMid, fontWeight: '700'},
  rightDesc:    {fontSize: 12, color: Colors.smoke, lineHeight: 18},
  contactCard:  {backgroundColor: Colors.navyMid, borderRadius: R.xl, marginHorizontal: Sp.lg, marginTop: Sp.md, padding: Sp.xl},
  contactTitle: {fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 10},
  contactDesc:  {fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 22},
  offBadge:     {marginTop: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start'},
  offBadgeTxt:  {fontSize: 12, color: 'rgba(255,255,255,0.82)', fontWeight: '600'},
});
