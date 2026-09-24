import React, {useState, useCallback} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  ActivityIndicator, Alert, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {employeeAPI} from '../../api';
import {Colors, R, Sp, Shadow} from '../../theme';
import {fmtDate} from '../../utils/format';

const fmt = n => (n ?? 0).toLocaleString('en-MU', {maximumFractionDigits: 0});
const QUICK_ADD = [100, 500, 1000];

export default function SavingsScreen() {
  const nav = useNavigation();
  const [pots, setPots]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busyId, setBusyId]     = useState(null);
  const [custom, setCustom]     = useState({});
  const [label, setLabel]       = useState('');
  const [target, setTarget]     = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {const r = await employeeAPI.savings(); setPots(r.data);}
    catch (e) {console.error(e);}
    finally {setLoading(false);}
  }, []);

  useFocusEffect(useCallback(() => {load();}, [load]));

  const addTo = async (pot, amount) => {
    if (!amount || amount <= 0) {return Alert.alert('Enter an amount', 'Type how much you want to save.');}
    setBusyId(pot.id);
    try {
      const {data} = await employeeAPI.updateSavingsPot(pot.id, {savedAmount: pot.savedAmount + amount});
      setPots(ps => ps.map(p => (p.id === pot.id ? data : p)));
      setCustom(c => ({...c, [pot.id]: ''}));
      if (data.status === 'COMPLETED') {
        Alert.alert('Goal reached 🎉', `"${pot.label}" is fully funded.`);
      }
    } catch (err) {
      Alert.alert('Could not save', err.response?.data?.error ?? 'Please try again.');
    } finally {setBusyId(null);}
  };

  const create = async () => {
    const amt = parseFloat(target);
    if (!label.trim() || !amt || amt <= 0) {
      return Alert.alert('Missing details', 'Give your pot a name and a target amount.');
    }
    setCreating(true);
    try {
      const {data} = await employeeAPI.createSavingsPot({label: label.trim(), targetAmount: amt});
      setPots(ps => [data, ...ps]);
      setLabel('');
      setTarget('');
    } catch (err) {
      Alert.alert('Could not create pot', err.response?.data?.error ?? 'Please try again.');
    } finally {setCreating(false);}
  };

  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: Colors.forest, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  const totalSaved = pots.reduce((s, p) => s + p.savedAmount, 0);

  return (
    <KeyboardAvoidingView style={S.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar backgroundColor={Colors.forest} barStyle="light-content" />
      <ScrollView contentContainerStyle={{paddingBottom: 40}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.forest, Colors.forestMid]} style={S.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={S.back}>
            <Text style={S.backTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={S.headerTitle}>Savings pots</Text>
          <Text style={S.headerSub}>No fees, no interest  ·  Builds your Trust Score</Text>
          <View style={S.totalBadge}>
            <Text style={S.totalTxt}>🏦  Rs {fmt(totalSaved)} saved across {pots.length} pot{pots.length === 1 ? '' : 's'}</Text>
          </View>
        </LinearGradient>

        {pots.length === 0 && (
          <View style={[S.card, Shadow.card, {alignItems: 'center'}]}>
            <Text style={{fontSize: 32, marginBottom: 8}}>🌱</Text>
            <Text style={S.potLabel}>No savings pots yet</Text>
            <Text style={S.potSub}>Create your first pot below.</Text>
          </View>
        )}

        {pots.map(p => {
          const pct  = Math.min(100, Math.round((p.savedAmount / p.targetAmount) * 100));
          const done = p.status === 'COMPLETED' || pct >= 100;
          const busy = busyId === p.id;
          return (
            <View key={p.id} style={[S.card, Shadow.card]}>
              <View style={S.potHead}>
                <View style={{flex: 1}}>
                  <Text style={S.potLabel}>{p.label}</Text>
                  <Text style={S.potSub}>
                    Rs {fmt(p.savedAmount)} of Rs {fmt(p.targetAmount)}
                    {p.targetDate ? `  ·  by ${fmtDate(p.targetDate, {day: 'numeric', month: 'short', year: 'numeric'})}` : ''}
                  </Text>
                </View>
                <Text style={[S.pct, done && {color: Colors.safe}]}>{done ? '✅' : `${pct}%`}</Text>
              </View>
              <View style={S.bar}><View style={[S.barFill, {width: `${pct}%`}]} /></View>

              {!done && (
                <>
                  <Text style={S.needTxt}>Rs {fmt(p.targetAmount - p.savedAmount)} still needed</Text>
                  <View style={S.quickRow}>
                    {QUICK_ADD.map(a => (
                      <TouchableOpacity key={a} style={S.quickBtn} disabled={busy} onPress={() => addTo(p, Math.min(a, p.targetAmount - p.savedAmount))} activeOpacity={0.8}>
                        <Text style={S.quickTxt}>+ Rs {fmt(a)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={S.customRow}>
                    <TextInput
                      style={[S.input, {flex: 1}]}
                      placeholder="Other amount"
                      placeholderTextColor={Colors.smoke}
                      keyboardType="number-pad"
                      value={custom[p.id] ?? ''}
                      onChangeText={t => setCustom(c => ({...c, [p.id]: t.replace(/[^0-9]/g, '')}))}
                    />
                    <TouchableOpacity style={[S.saveBtn, busy && {opacity: 0.5}]} disabled={busy} onPress={() => addTo(p, parseFloat(custom[p.id]))} activeOpacity={0.85}>
                      {busy ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={S.saveTxt}>Save</Text>}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          );
        })}

        <Text style={S.sectionTitle}>Create a new pot</Text>
        <View style={[S.card, Shadow.card, {marginTop: 0}]}>
          <TextInput style={[S.input, {marginBottom: Sp.sm}]} placeholder="Name, e.g. School fees" placeholderTextColor={Colors.smoke} value={label} onChangeText={setLabel} />
          <TextInput style={[S.input, {marginBottom: Sp.md}]} placeholder="Target amount (Rs)" placeholderTextColor={Colors.smoke} keyboardType="number-pad" value={target} onChangeText={t => setTarget(t.replace(/[^0-9]/g, ''))} />
          <TouchableOpacity style={[S.createBtn, creating && {opacity: 0.5}]} disabled={creating} onPress={create} activeOpacity={0.85}>
            {creating ? <ActivityIndicator color={Colors.white} /> : <Text style={S.createTxt}>Create pot</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  root:         {flex: 1, backgroundColor: Colors.cream},
  header:       {paddingHorizontal: Sp.xl, paddingTop: Sp.xl, paddingBottom: 28},
  back:         {marginBottom: Sp.md},
  backTxt:      {color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600'},
  headerTitle:  {fontSize: 22, fontWeight: '700', color: Colors.white},
  headerSub:    {fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4},
  totalBadge:   {backgroundColor: 'rgba(245,200,66,0.15)', borderWidth: 1, borderColor: 'rgba(245,200,66,0.3)', borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start', marginTop: 14},
  totalTxt:     {fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500'},
  card:         {backgroundColor: Colors.white, borderRadius: R.xl, marginHorizontal: Sp.lg, marginTop: Sp.md, padding: Sp.lg},
  potHead:      {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10},
  potLabel:     {fontSize: 15, fontWeight: '700', color: Colors.ink},
  potSub:       {fontSize: 12, color: Colors.smoke, marginTop: 2},
  pct:          {fontSize: 16, fontWeight: '800', color: Colors.forest},
  bar:          {height: 8, backgroundColor: Colors.mist, borderRadius: 4, overflow: 'hidden'},
  barFill:      {height: 8, backgroundColor: Colors.safe, borderRadius: 4},
  needTxt:      {fontSize: 11, color: Colors.smoke, marginTop: 8, marginBottom: 10},
  quickRow:     {flexDirection: 'row', gap: 8, marginBottom: 10},
  quickBtn:     {flex: 1, backgroundColor: Colors.safePale, borderRadius: R.lg, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.safe + '30'},
  quickTxt:     {fontSize: 12, fontWeight: '700', color: Colors.safe},
  customRow:    {flexDirection: 'row', gap: 8},
  input:        {backgroundColor: Colors.cream, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.mist, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.ink},
  saveBtn:      {backgroundColor: Colors.safe, borderRadius: R.lg, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center'},
  saveTxt:      {color: Colors.white, fontWeight: '700', fontSize: 14},
  sectionTitle: {fontSize: 14, fontWeight: '700', color: Colors.ink, marginHorizontal: Sp.lg, marginTop: Sp.xl, marginBottom: Sp.md},
  createBtn:    {backgroundColor: Colors.forest, borderRadius: R.xl, paddingVertical: 14, alignItems: 'center'},
  createTxt:    {color: Colors.white, fontSize: 15, fontWeight: '700'},
});
