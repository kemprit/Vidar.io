import React, {useState, useRef} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useAuth} from '../../context/AuthContext';
import {Colors, R, Sp} from '../../theme';

export default function LoginScreen({navigation}) {
  const {login} = useAuth();
  const [mode, setMode]           = useState('worker');
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin]             = useState('');
  const [loading, setLoading]     = useState(false);
  const pinRef = useRef(null);

  const handleLogin = async () => {
    if (!employeeId.trim() || !pin.trim()) {
      return Alert.alert('Missing fields', 'Please enter your Employee ID and PIN.');
    }
    setLoading(true);
    try {
      await login(employeeId.trim().toUpperCase(), pin.trim());
    } catch (err) {
      Alert.alert(
        'Sign in failed',
        err.response
          ? err.response.data?.error || 'Invalid Employee ID or PIN.'
          : 'Cannot reach the server. Check your internet connection and try again.',
      );
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const demos = mode === 'worker'
    ? [['EMP001','1234','Amara Osei'],['EMP002','5678','Kofi Mensah'],['EMP003','2468','Priya Ramkhelawon']]
    : [['HR001','9999','Jean-Marie Duval'],['HR002','8888','Anisha Gobin']];

  return (
    <View style={S.root}>
      <StatusBar backgroundColor={Colors.forest} barStyle="light-content" />
      <LinearGradient
        colors={[Colors.forest, Colors.forestMid, Colors.forestLight]}
        style={S.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <ScrollView
            contentContainerStyle={S.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Brand */}
            <View style={S.brand}>
              <View style={S.logoBox}>
                <Text style={S.logoEmoji}>💸</Text>
              </View>
              <Text style={S.brandName}>Sékirité Lavenir</Text>
              <Text style={S.tagline}>
                Payroll-powered financial security{'\n'}for workers in Mauritius
              </Text>

              <View style={S.modeRow}>
                <TouchableOpacity
                  style={[S.modeBtn, mode === 'worker' && S.modeBtnActive]}
                  onPress={() => setMode('worker')}
                  activeOpacity={0.8}>
                  <Text style={[S.modeTxt, mode === 'worker' && S.modeTxtActive]}>Worker</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[S.modeBtn, mode === 'hr' && S.modeBtnActive]}
                  onPress={() => setMode('hr')}
                  activeOpacity={0.8}>
                  <Text style={[S.modeTxt, mode === 'hr' && S.modeTxtActive]}>HR / Employer</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sheet */}
            <View style={S.sheet}>
              <Text style={S.sheetTitle}>
                {mode === 'worker' ? 'Welcome back' : 'HR Sign in'}
              </Text>
              <Text style={S.sheetSub}>
                {mode === 'worker'
                  ? 'Sign in with your Employee ID and PIN'
                  : 'HR admin access — advance management'}
              </Text>

              <Text style={S.label}>
                {mode === 'worker' ? 'Employee ID' : 'HR Admin ID'}
              </Text>
              <TextInput
                style={S.input}
                placeholder={mode === 'worker' ? 'e.g. EMP001' : 'e.g. HR001'}
                placeholderTextColor={Colors.smoke}
                value={employeeId}
                onChangeText={t => setEmployeeId(t.toUpperCase())}
                autoCapitalize="characters"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => pinRef.current?.focus()}
              />

              <Text style={S.label}>PIN</Text>
              <TextInput
                ref={pinRef}
                style={[S.input, S.pinInput]}
                placeholder="••••"
                placeholderTextColor={Colors.smoke}
                value={pin}
                onChangeText={setPin}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                style={[
                  S.btn,
                  mode === 'hr' && {backgroundColor: Colors.navyMid},
                  loading && S.btnOff,
                ]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}>
                {loading
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={S.btnTxt}>Sign in  →</Text>}
              </TouchableOpacity>

              {/* Demo accounts */}
              <View style={S.demoBox}>
                <Text style={S.demoTitle}>Demo accounts — tap to autofill</Text>
                {demos.map(([id, p, name]) => (
                  <TouchableOpacity
                    key={id}
                    onPress={() => {setEmployeeId(id); setPin(p);}}
                    style={S.demoRow}>
                    <Text style={S.demoTxt}>
                      <Text style={S.demoId}>{id}</Text>
                      {'  ·  PIN '}
                      <Text style={S.demoId}>{p}</Text>
                      {'  —  '}{name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={S.registerRow}>
                <Text style={S.registerTxt}>
                  New user?{'  '}
                  <Text style={S.registerLink}>Create account</Text>
                </Text>
              </TouchableOpacity>

              <Text style={S.dpa}>
                Protected under the Mauritius Data Protection Act 2017
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const S = StyleSheet.create({
  root:          {flex: 1},
  gradient:      {flex: 1},
  scroll:        {flexGrow: 1, justifyContent: 'flex-end'},
  brand:         {alignItems: 'center', paddingTop: 56, paddingBottom: 32, paddingHorizontal: Sp.xl},
  logoBox:       {width: 72, height: 72, backgroundColor: Colors.gold, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16, elevation: 6},
  logoEmoji:     {fontSize: 36},
  brandName:     {fontSize: 30, fontWeight: '700', color: Colors.white, letterSpacing: -0.5},
  tagline:       {fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6, textAlign: 'center', lineHeight: 20},
  modeRow:       {flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: R.lg, padding: 4, marginTop: 24, gap: 4, alignSelf: 'stretch'},
  modeBtn:       {flex: 1, paddingVertical: 10, borderRadius: R.md, alignItems: 'center'},
  modeBtnActive: {backgroundColor: Colors.white},
  modeTxt:       {fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)'},
  modeTxtActive: {color: Colors.forest, fontWeight: '700'},
  sheet:         {backgroundColor: Colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: Sp.xl, paddingTop: 28},
  sheetTitle:    {fontSize: 22, fontWeight: '700', color: Colors.ink, marginBottom: 4},
  sheetSub:      {fontSize: 13, color: Colors.smoke, marginBottom: 24},
  label:         {fontSize: 12, fontWeight: '600', color: Colors.smoke, marginBottom: 6},
  input:         {backgroundColor: Colors.cream, borderWidth: 1.5, borderColor: Colors.mist, borderRadius: R.lg, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, color: Colors.ink, marginBottom: 16},
  pinInput:      {textAlign: 'center', fontSize: 24, letterSpacing: 12},
  btn:           {backgroundColor: Colors.forest, borderRadius: R.xl, paddingVertical: 15, alignItems: 'center', marginTop: 4, marginBottom: 20},
  btnOff:        {opacity: 0.6},
  btnTxt:        {color: Colors.white, fontSize: 16, fontWeight: '700'},
  demoBox:       {backgroundColor: Colors.mist, borderRadius: R.lg, padding: Sp.md, marginBottom: 20},
  demoTitle:     {fontSize: 11, fontWeight: '700', color: Colors.ink, marginBottom: 8},
  demoRow:       {paddingVertical: 5},
  demoTxt:       {fontSize: 12, color: Colors.smoke},
  demoId:        {color: Colors.forest, fontWeight: '700'},
  registerRow:   {alignItems: 'center', marginBottom: 16},
  registerTxt:   {fontSize: 13, color: Colors.smoke},
  registerLink:  {color: Colors.forest, fontWeight: '700'},
  dpa:           {textAlign: 'center', fontSize: 10, color: Colors.smoke, opacity: 0.7, paddingBottom: 8},
});
