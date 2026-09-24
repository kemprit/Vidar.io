import React, {useState, useCallback} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import {useFocusEffect} from '@react-navigation/native';
import {employeeAPI} from '../../api';
import {Colors, R, Sp, Shadow} from '../../theme';

const fmt  = n => (n ?? 0).toLocaleString('en-MU', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const fmtN = n => (n ?? 0).toLocaleString('en-MU', {maximumFractionDigits: 0});

export default function AdvanceScreen() {
  const [dash, setDash]       = useState(null);
  const [amount, setAmount]   = useState(500);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal]     = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await employeeAPI.dashboard();
      setDash(r.data);
      const def = Math.round((r.data.availableNow * 0.4) / 100) * 100;
      setAmount(Math.max(100, Math.min(def, r.data.availableNow)));
    } catch (e) {console.error(e);}
    finally {setLoading(false);}
  }, []);

  useFocusEffect(useCallback(() => {load();}, [load]));

  const max   = Math.max(dash?.availableNow ?? 0, 100);
  const fee   = parseFloat((amount * 0.025).toFixed(2));
  const total = amount + fee;
  const ps    = dash?.latestPayslip;
  const pending = modal?.advance?.status === 'PENDING';

  const request = async () => {
    if (amount < 100) {return Alert.alert('Minimum', 'Minimum advance is Rs 100.');}
    if (amount > (dash?.availableNow ?? 0)) {
      return Alert.alert('Exceeds limit', `Available: Rs ${fmtN(dash?.availableNow)}`);
    }
    setSubmitting(true);
    try {
      const r = await employeeAPI.requestAdvance({amount});
      setModal(r.data);
      load();
    } catch (err) {
      Alert.alert('Request failed', err.response?.data?.error ?? 'Please try again.');
    } finally {setSubmitting(false);}
  };

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
        contentContainerStyle={{paddingBottom: 32}}
        showsVerticalScrollIndicator={false}>

        <LinearGradient colors={[Colors.forest, Colors.forestMid]} style={S.header}>
          <Text style={S.headerSub}>Your net wages, working for you</Text>
          <Text style={S.headerTitle}>Get a wage advance</Text>
          <View style={S.eligBadge}>
            <Text style={S.eligTxt}>✅  Eligible  ·  Rs {fmtN(dash?.availableNow)} available</Text>
          </View>
        </LinearGradient>

        <View style={[S.card, Shadow.strong, {marginTop: -16}]}>
          {/* Net breakdown */}
          <View style={S.breakdown}>
            <Text style={S.breakdownHdr}>HOW YOUR CAP IS CALCULATED</Text>
            {[
              ['Basic salary (gross)',    ps?.grossSalary,   false],
              ps?.transportAllow > 0 && ['Transport allowance', ps?.transportAllow, false],
              ['Less: PAYE income tax',  ps?.payeTax,        true],
              ['Less: NPF employee (3%)',ps?.npfEmployee,    true],
              ps?.nsf > 0 && ['Less: NSF contribution', ps?.nsf, true],
            ].filter(Boolean).map(([l, v, red]) => (
              <View key={l} style={S.bRow}>
                <Text style={S.bLabel}>{l}</Text>
                <Text style={[S.bVal, red && {color: Colors.clay}]}>
                  {red ? '− ' : ''}Rs {fmt(v)}
                </Text>
              </View>
            ))}
            <View style={S.divider} />
            <View style={S.bRow}>
              <Text style={[S.bLabel, {fontWeight: '700', color: Colors.ink}]}>Net monthly pay</Text>
              <Text style={[S.bVal, {color: Colors.forest, fontWeight: '700'}]}>Rs {fmt(ps?.netPay)}</Text>
            </View>
            <View style={S.capBox}>
              <Text style={S.capTxt}>
                🔒  Cap = {dash?.maxPct ?? 50}% of net earned, less advances this cycle  =  <Text style={{fontWeight: '700'}}>Rs {fmtN(dash?.availableNow)}</Text>
              </Text>
            </View>
          </View>

          {/* Slider */}
          <View style={S.sliderSection}>
            <View style={S.sliderLbls}>
              <Text style={S.sliderLblTxt}>Choose amount</Text>
              <Text style={S.sliderLblTxt}>Max: Rs {fmtN(max)}</Text>
            </View>
            <Text style={S.amtDisplay}>
              Rs <Text style={S.amtBig}>{fmtN(amount)}</Text>
            </Text>
            <Slider
              style={S.slider}
              minimumValue={100}
              maximumValue={max}
              step={100}
              value={amount}
              onValueChange={setAmount}
              minimumTrackTintColor={Colors.forest}
              maximumTrackTintColor={Colors.mist}
              thumbTintColor={Colors.forest}
            />
          </View>

          {/* Fee summary */}
          <View style={S.feeSummary}>
            {[
              ['Advance amount',   `Rs ${fmt(amount)}`],
              ['Service fee (2.5%)', `Rs ${fmt(fee)}`],
            ].map(([l, v]) => (
              <View key={l} style={S.feeRow}>
                <Text style={S.feeLbl}>{l}</Text>
                <Text style={S.feeVal}>{v}</Text>
              </View>
            ))}
            <View style={S.divider} />
            <View style={S.feeRow}>
              <Text style={[S.feeLbl, {fontWeight: '700', color: Colors.ink}]}>Auto-deducted on payday</Text>
              <Text style={[S.feeVal, {color: Colors.forest, fontWeight: '700'}]}>Rs {fmt(total)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[S.btn, (submitting || (dash?.availableNow ?? 0) < 100) && S.btnOff]}
            onPress={request}
            disabled={submitting || (dash?.availableNow ?? 0) < 100}
            activeOpacity={0.85}>
            {submitting
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={S.btnTxt}>Get Rs {fmtN(amount)} now  →</Text>}
          </TouchableOpacity>
        </View>

        {/* Nudge */}
        <View style={S.nudge}>
          <Text style={{fontSize: 18}}>💡</Text>
          <Text style={S.nudgeTxt}>
            <Text style={{fontWeight: '700', color: Colors.safe}}>Consider saving first. </Text>
            Completing your Rent Savings Pot costs zero fees and builds your Trust Score.
          </Text>
        </View>

        {/* How it works */}
        <View style={S.howCard}>
          <Text style={S.howTitle}>How it works</Text>
          {[
            ['1','Payroll connected by your employer','Employer links their payroll to Sékirité Lavenir. Net pay and pay dates are verified directly.'],
            ['2','Cap is always net pay','After PAYE and NPF. You can never borrow more than what actually lands in your account.'],
            ['3','Money to MCB Juice or MyT Money','Disbursed to your registered mobile wallet within minutes.'],
            ['4','Auto-deducted from payroll','Your employer deducts advance + fee from salary before payday.'],
          ].map(([num, title, desc]) => (
            <View key={num} style={S.howRow}>
              <View style={S.howNum}><Text style={S.howNumTxt}>{num}</Text></View>
              <View style={{flex: 1}}>
                <Text style={S.howStepTitle}>{title}</Text>
                <Text style={S.howStepDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Success modal */}
      <Modal visible={!!modal} transparent animationType="slide">
        <View style={S.overlay}>
          <View style={S.modalSheet}>
            <View style={S.drag} />
            <Text style={S.modalEmoji}>{pending ? '⏳' : '🎉'}</Text>
            <Text style={S.modalTitle}>{pending ? 'Request sent to HR' : 'Money is on its way!'}</Text>
            <Text style={S.modalDesc}>
              {pending
                ? `Your request for Rs ${fmtN(modal?.advance?.amount)} is awaiting HR approval.`
                : `Rs ${fmtN(modal?.advance?.amount)} is being sent to your wallet. Usually arrives in under 5 minutes.`}
              {'\n\n'}Total of Rs{' '}
              <Text style={{fontWeight: '700'}}>{fmt(modal?.advance?.totalToRepay)}</Text>
              {' '}will be auto-deducted on payday.
            </Text>
            <TouchableOpacity style={S.btn} onPress={() => setModal(null)} activeOpacity={0.85}>
              <Text style={S.btnTxt}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const S = StyleSheet.create({
  root:         {flex: 1, backgroundColor: Colors.cream},
  scroll:       {flex: 1},
  header:       {paddingHorizontal: Sp.xl, paddingTop: Sp.xl, paddingBottom: 36},
  headerSub:    {fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 4},
  headerTitle:  {fontSize: 22, fontWeight: '700', color: Colors.white, marginBottom: 14},
  eligBadge:    {backgroundColor: 'rgba(245,200,66,0.15)', borderWidth: 1, borderColor: 'rgba(245,200,66,0.3)', borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start'},
  eligTxt:      {fontSize: 11, color: 'rgba(255,255,255,0.82)', fontWeight: '500'},
  card:         {backgroundColor: Colors.white, borderRadius: R.xxl, marginHorizontal: Sp.lg, padding: Sp.xl},
  breakdown:    {backgroundColor: Colors.cream, borderRadius: R.lg, padding: Sp.md, marginBottom: Sp.lg},
  breakdownHdr: {fontSize: 10, fontWeight: '700', color: Colors.smoke, letterSpacing: 0.5, marginBottom: 10},
  bRow:         {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4},
  bLabel:       {fontSize: 12, color: Colors.smoke},
  bVal:         {fontSize: 12, fontWeight: '600', color: Colors.ink},
  capBox:       {backgroundColor: Colors.forest + '10', borderRadius: R.md, padding: Sp.sm, marginTop: 8},
  capTxt:       {fontSize: 11, color: Colors.forest},
  divider:      {height: 1, backgroundColor: Colors.mist, marginVertical: 8},
  sliderSection:{marginBottom: Sp.lg},
  sliderLbls:   {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4},
  sliderLblTxt: {fontSize: 12, color: Colors.smoke},
  amtDisplay:   {textAlign: 'center', fontSize: 18, color: Colors.smoke, marginTop: 8},
  amtBig:       {fontSize: 48, fontWeight: '800', color: Colors.forest},
  slider:       {width: '100%', height: 40},
  feeSummary:   {backgroundColor: Colors.mist, borderRadius: R.lg, padding: Sp.md, marginBottom: Sp.lg},
  feeRow:       {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4},
  feeLbl:       {fontSize: 12, color: Colors.smoke},
  feeVal:       {fontSize: 12, fontWeight: '600', color: Colors.ink},
  btn:          {backgroundColor: Colors.forest, borderRadius: R.xl, paddingVertical: 15, alignItems: 'center'},
  btnOff:       {opacity: 0.5},
  btnTxt:       {color: Colors.white, fontSize: 16, fontWeight: '700'},
  nudge:        {flexDirection: 'row', gap: 10, marginHorizontal: Sp.lg, marginTop: Sp.md, backgroundColor: Colors.safePale, borderRadius: R.lg, padding: Sp.md, borderWidth: 1, borderColor: Colors.safe + '30'},
  nudgeTxt:     {flex: 1, fontSize: 12, color: Colors.ink, lineHeight: 18},
  howCard:      {marginHorizontal: Sp.lg, marginTop: Sp.md, backgroundColor: Colors.white, borderRadius: R.xl, padding: Sp.xl},
  howTitle:     {fontSize: 14, fontWeight: '700', color: Colors.ink, marginBottom: Sp.lg},
  howRow:       {flexDirection: 'row', gap: 12, marginBottom: 16},
  howNum:       {width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.forest, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2},
  howNumTxt:    {fontSize: 11, fontWeight: '700', color: Colors.white},
  howStepTitle: {fontSize: 12, fontWeight: '700', color: Colors.ink, marginBottom: 4},
  howStepDesc:  {fontSize: 11, color: Colors.smoke, lineHeight: 17},
  overlay:      {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  modalSheet:   {backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: Sp.xl, paddingTop: 20, paddingBottom: 40},
  drag:         {width: 36, height: 4, backgroundColor: Colors.mist, borderRadius: 2, alignSelf: 'center', marginBottom: 20},
  modalEmoji:   {fontSize: 48, textAlign: 'center', marginBottom: 12},
  modalTitle:   {fontSize: 22, fontWeight: '700', color: Colors.forest, textAlign: 'center', marginBottom: 12},
  modalDesc:    {fontSize: 14, color: Colors.smoke, textAlign: 'center', lineHeight: 22, marginBottom: 24},
});
