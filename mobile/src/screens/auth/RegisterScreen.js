import React, {useState, useEffect} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useAuth} from '../../context/AuthContext';
import {authAPI} from '../../api';
import {Colors, R, Sp} from '../../theme';

export default function RegisterScreen({navigation}) {
  const {register} = useAuth();
  const [step, setStep]           = useState(1);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [form, setForm]           = useState({
    employeeId: '', fullName: '', jobTitle: '',
    mobileWallet: 'MCB Juice', walletNumber: '',
    pin: '', pinConfirm: '', employerId: '',
  });

  useEffect(() => {
    authAPI.employers().then(r => setEmployers(r.data)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const next = () => {
    if (step === 1) {
      if (!form.employeeId || !form.fullName) {
        return Alert.alert('Required', 'Employee ID and Full Name are required.');
      }
      setStep(2);
    } else if (step === 2) {
      if (!/^\d{4}$/.test(form.pin)) {
        return Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      }
      if (form.pin !== form.pinConfirm) {
        return Alert.alert('PIN mismatch', 'The two PINs do not match.');
      }
      setStep(3);
    }
  };

  const submit = async () => {
    if (!form.employerId) {
      return Alert.alert('Required', 'Please select your employer.');
    }
    setLoading(true);
    try {
      await register({
        employeeId:   form.employeeId.toUpperCase(),
        fullName:     form.fullName,
        pin:          form.pin,
        employerId:   parseInt(form.employerId, 10),
        jobTitle:     form.jobTitle || undefined,
        mobileWallet: form.mobileWallet,
        walletNumber: form.walletNumber || undefined,
      });
    } catch (err) {
      Alert.alert('Registration failed', err.response?.data?.error || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={S.root}>
      <StatusBar backgroundColor={Colors.forest} barStyle="light-content" />
      <LinearGradient colors={[Colors.forest, Colors.forestMid]} style={S.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <ScrollView
            contentContainerStyle={S.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={S.header}>
              <TouchableOpacity
                onPress={() => (step > 1 ? setStep(s => s - 1) : navigation.goBack())}
                style={S.back}>
                <Text style={S.backTxt}>←  Back</Text>
              </TouchableOpacity>
              <View style={S.logoBox}>
                <Text style={{fontSize: 28}}>💸</Text>
              </View>
              <Text style={S.brandName}>Sékirité Lavenir</Text>
              <Text style={S.brandSub}>Create your account</Text>

              {/* Step dots */}
              <View style={S.dots}>
                {[1,2,3].map(s => (
                  <View
                    key={s}
                    style={[S.dot, s === step && S.dotActive, s < step && S.dotDone]}
                  />
                ))}
              </View>
            </View>

            {/* Sheet */}
            <View style={S.sheet}>
              <Text style={S.stepTitle}>
                {step === 1 ? 'Your details' : step === 2 ? 'Choose a PIN' : 'Your employer'}
              </Text>
              <Text style={S.stepSub}>
                {step === 1
                  ? 'Basic information to identify you on the platform'
                  : step === 2
                  ? 'A 4-digit PIN you\'ll use every time you sign in'
                  : 'Select your employer to link your payroll'}
              </Text>

              {/* Step 1 */}
              {step === 1 && (
                <>
                  <Text style={S.label}>Employee ID *</Text>
                  <TextInput
                    style={S.input}
                    placeholder="e.g. EMP001"
                    placeholderTextColor={Colors.smoke}
                    value={form.employeeId}
                    onChangeText={t => set('employeeId', t.toUpperCase())}
                    autoCapitalize="characters"
                  />

                  <Text style={S.label}>Full name *</Text>
                  <TextInput
                    style={S.input}
                    placeholder="As on your NIC"
                    placeholderTextColor={Colors.smoke}
                    value={form.fullName}
                    onChangeText={t => set('fullName', t)}
                  />

                  <Text style={S.label}>Job title</Text>
                  <TextInput
                    style={S.input}
                    placeholder="e.g. Senior Engineer"
                    placeholderTextColor={Colors.smoke}
                    value={form.jobTitle}
                    onChangeText={t => set('jobTitle', t)}
                  />

                  <Text style={S.label}>Mobile wallet</Text>
                  <View style={S.walletRow}>
                    {['MCB Juice', 'MyT Money'].map(w => (
                      <TouchableOpacity
                        key={w}
                        style={[S.walletBtn, form.mobileWallet === w && S.walletBtnOn]}
                        onPress={() => set('mobileWallet', w)}>
                        <Text style={[S.walletTxt, form.mobileWallet === w && S.walletTxtOn]}>
                          {w}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={S.label}>Wallet number</Text>
                  <TextInput
                    style={S.input}
                    placeholder="e.g. 57821234"
                    placeholderTextColor={Colors.smoke}
                    value={form.walletNumber}
                    onChangeText={t => set('walletNumber', t)}
                    keyboardType="phone-pad"
                  />

                  <TouchableOpacity style={S.btn} onPress={next} activeOpacity={0.85}>
                    <Text style={S.btnTxt}>Continue  →</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <>
                  <Text style={S.label}>Choose a 4-digit PIN *</Text>
                  <TextInput
                    style={[S.input, S.pinInput]}
                    placeholder="••••"
                    placeholderTextColor={Colors.smoke}
                    value={form.pin}
                    onChangeText={t => set('pin', t.replace(/\D/g, ''))}
                    secureTextEntry
                    keyboardType="number-pad"
                    maxLength={4}
                  />

                  <Text style={S.label}>Confirm PIN *</Text>
                  <TextInput
                    style={[S.input, S.pinInput]}
                    placeholder="••••"
                    placeholderTextColor={Colors.smoke}
                    value={form.pinConfirm}
                    onChangeText={t => set('pinConfirm', t.replace(/\D/g, ''))}
                    secureTextEntry
                    keyboardType="number-pad"
                    maxLength={4}
                  />

                  <View style={S.infoBox}>
                    <Text style={S.infoTxt}>
                      🔒  Your PIN is hashed with bcrypt and never stored in plain text. Compliant with Mauritius DPA 2017.
                    </Text>
                  </View>

                  <TouchableOpacity style={S.btn} onPress={next} activeOpacity={0.85}>
                    <Text style={S.btnTxt}>Continue  →</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <>
                  <Text style={S.label}>Select employer *</Text>
                  {employers.map(e => (
                    <TouchableOpacity
                      key={e.id}
                      style={[S.empRow, form.employerId === String(e.id) && S.empRowOn]}
                      onPress={() => set('employerId', String(e.id))}>
                      <View style={{flex: 1}}>
                        <Text style={S.empName}>{e.name}</Text>
                        <Text style={S.empTan}>{e.tan}</Text>
                      </View>
                      {form.employerId === String(e.id) && (
                        <Text style={S.empCheck}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}

                  <Text style={S.dpaTxt}>
                    By registering you consent to data processing under the Mauritius DPA 2017. Your payroll data is never sold to third parties.
                  </Text>

                  <TouchableOpacity
                    style={[S.btn, loading && S.btnOff]}
                    onPress={submit}
                    disabled={loading}
                    activeOpacity={0.85}>
                    {loading
                      ? <ActivityIndicator color={Colors.white} />
                      : <Text style={S.btnTxt}>Create account</Text>}
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={S.loginRow}>
                <Text style={S.loginTxt}>
                  Already have an account?{'  '}
                  <Text style={S.loginLink}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const S = StyleSheet.create({
  root:         {flex: 1},
  gradient:     {flex: 1},
  scroll:       {flexGrow: 1, justifyContent: 'flex-end'},
  header:       {alignItems: 'center', paddingTop: 24, paddingBottom: 28, paddingHorizontal: Sp.xl, position: 'relative'},
  back:         {position: 'absolute', top: 24, left: Sp.xl},
  backTxt:      {color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600'},
  logoBox:      {width: 60, height: 60, backgroundColor: Colors.gold, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12, elevation: 4},
  brandName:    {fontSize: 26, fontWeight: '700', color: Colors.white},
  brandSub:     {fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4},
  dots:         {flexDirection: 'row', gap: 6, marginTop: 16},
  dot:          {width: 16, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)'},
  dotActive:    {width: 28, backgroundColor: Colors.gold},
  dotDone:      {backgroundColor: 'rgba(255,255,255,0.5)'},
  sheet:        {backgroundColor: Colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: Sp.xl, paddingTop: 28},
  stepTitle:    {fontSize: 20, fontWeight: '700', color: Colors.ink, marginBottom: 4},
  stepSub:      {fontSize: 13, color: Colors.smoke, marginBottom: 24},
  label:        {fontSize: 12, fontWeight: '600', color: Colors.smoke, marginBottom: 6},
  input:        {backgroundColor: Colors.cream, borderWidth: 1.5, borderColor: Colors.mist, borderRadius: R.lg, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, color: Colors.ink, marginBottom: 16},
  pinInput:     {textAlign: 'center', fontSize: 24, letterSpacing: 12},
  walletRow:    {flexDirection: 'row', gap: 10, marginBottom: 16},
  walletBtn:    {flex: 1, paddingVertical: 12, borderRadius: R.lg, borderWidth: 1.5, borderColor: Colors.mist, alignItems: 'center'},
  walletBtnOn:  {borderColor: Colors.forest, backgroundColor: Colors.forest + '10'},
  walletTxt:    {fontSize: 13, fontWeight: '600', color: Colors.smoke},
  walletTxtOn:  {color: Colors.forest},
  infoBox:      {backgroundColor: Colors.mist, borderRadius: R.lg, padding: Sp.md, marginBottom: 16},
  infoTxt:      {fontSize: 12, color: Colors.smoke, lineHeight: 18},
  empRow:       {padding: 14, borderRadius: R.lg, borderWidth: 1.5, borderColor: Colors.mist, flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  empRowOn:     {borderColor: Colors.forest, backgroundColor: Colors.forest + '08'},
  empName:      {fontSize: 14, fontWeight: '600', color: Colors.ink},
  empTan:       {fontSize: 10, color: Colors.smoke, marginTop: 2},
  empCheck:     {fontSize: 18, color: Colors.forest, fontWeight: '700'},
  dpaTxt:       {fontSize: 11, color: Colors.smoke, lineHeight: 16, marginBottom: 20},
  btn:          {backgroundColor: Colors.forest, borderRadius: R.xl, paddingVertical: 15, alignItems: 'center', marginBottom: 16},
  btnOff:       {opacity: 0.6},
  btnTxt:       {color: Colors.white, fontSize: 16, fontWeight: '700'},
  loginRow:     {alignItems: 'center', paddingBottom: 8},
  loginTxt:     {fontSize: 13, color: Colors.smoke},
  loginLink:    {color: Colors.forest, fontWeight: '700'},
});
