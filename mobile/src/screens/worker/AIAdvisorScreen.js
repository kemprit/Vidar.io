import React, {useState, useEffect, useRef} from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {aiAPI} from '../../api';
import {Colors, R, Sp, Shadow} from '../../theme';

const QUICK = [
  ['💼', 'Salary raise',    'How can I negotiate a salary raise in Mauritius?'],
  ['💡', 'Side income',     'What side income ideas work in Mauritius?'],
  ['📈', 'Investments',     'How should I invest my savings in Mauritius?'],
  ['🛡️', 'Emergency fund', 'How do I build an emergency fund?'],
  ['📊', 'Budget plan',     'Give me a 50/30/20 budget plan'],
];

export default function AIAdvisorScreen() {
  const [msgs, setMsgs]     = useState([]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef           = useRef(null);

  useEffect(() => {loadInitial();}, []);

  const loadInitial = async () => {
    setTyping(true);
    try {
      const r = await aiAPI.initial();
      setMsgs([{role: 'ai', type: 'initial', data: r.data}]);
    } catch {
      setMsgs([{role: 'ai', type: 'text', text: 'Hello! Ask me about salary, savings, or side income in Mauritius.'}]);
    } finally {setTyping(false);}
  };

  const send = async msg => {
    const text = msg || input.trim();
    if (!text || typing) {return;}
    setInput('');
    setMsgs(m => [...m, {role: 'user', text}]);
    setTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 100);
    try {
      const r = await aiAPI.chat(text);
      setMsgs(m => [...m, {role: 'ai', type: 'strategy', data: r.data.response}]);
    } catch {
      setMsgs(m => [...m, {role: 'ai', type: 'text', text: 'Sorry, try again.'}]);
    } finally {
      setTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 100);
    }
  };

  return (
    <View style={S.root}>
      <StatusBar backgroundColor="#12002e" barStyle="light-content" />
      <LinearGradient colors={['#12002e', '#2d1460', '#1a0533']} style={S.header}>
        <View style={S.badgeRow}>
          <View style={S.dot} />
          <Text style={S.badgeTxt}>PesaAI  ·  Active  ·  Mauritius context</Text>
        </View>
        <Text style={S.headerTitle}>Your Income Advisor</Text>
        <Text style={S.headerSub}>Trained on Mauritian salary data  ·  DPA 2017 compliant</Text>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={S.quickScroll}
        contentContainerStyle={{gap: 8, paddingHorizontal: Sp.lg, paddingVertical: 10}}>
        {QUICK.map(([icon, label, prompt]) => (
          <TouchableOpacity key={label} style={S.chip} onPress={() => send(prompt)} activeOpacity={0.8}>
            <Text style={S.chipTxt}>{icon}  {label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}
        keyboardVerticalOffset={0}>

        <ScrollView
          ref={scrollRef}
          style={S.messages}
          contentContainerStyle={{padding: Sp.lg, gap: 12, paddingBottom: 16}}
          showsVerticalScrollIndicator={false}>

          {msgs.map((msg, i) => (
            <View key={i} style={[S.msgRow, msg.role === 'user' && S.msgRowUser]}>
              {msg.role === 'ai' && (
                <LinearGradient colors={[Colors.purple, Colors.purpleLight]} style={S.aiAvatar}>
                  <Text style={{fontSize: 12, fontWeight: '800', color: Colors.white}}>P</Text>
                </LinearGradient>
              )}
              {msg.role === 'user'
                ? <View style={S.userBubble}><Text style={S.userTxt}>{msg.text}</Text></View>
                : msg.type === 'initial' ? <InitialMsg data={msg.data} onPrompt={send} />
                : msg.type === 'strategy' ? <StrategyMsg data={msg.data} />
                : <View style={S.aiBubble}><Text style={S.aiTxt}>{msg.text}</Text></View>
              }
            </View>
          ))}

          {typing && (
            <View style={S.msgRow}>
              <LinearGradient colors={[Colors.purple, Colors.purpleLight]} style={S.aiAvatar}>
                <Text style={{fontSize: 12, fontWeight: '800', color: Colors.white}}>P</Text>
              </LinearGradient>
              <View style={[S.aiBubble, {paddingVertical: 14, paddingHorizontal: 16}]}>
                <Text style={{color: Colors.smoke}}>Thinking…</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={S.inputRow}>
          <TextInput
            style={S.input}
            placeholder="Ask about salary, savings, side income…"
            placeholderTextColor={Colors.smoke}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={() => send()}
            disabled={!input.trim() || typing}
            activeOpacity={0.8}>
            <LinearGradient colors={[Colors.purple, Colors.purpleLight]} style={S.sendBtn}>
              <Text style={{color: Colors.white, fontSize: 16}}>▶</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function InitialMsg({data, onPrompt}) {
  return (
    <View style={S.aiBubble}>
      <Text style={[S.aiTxt, {fontWeight: '600', marginBottom: 8}]}>{data.greeting}</Text>
      <Text style={[S.aiTxt, {color: Colors.smoke, marginBottom: 12}]}>{data.contextLine}</Text>
      {data.quickStrategies?.map(s => (
        <TouchableOpacity key={s.title} style={S.stratCard} onPress={() => onPrompt(s.prompt)} activeOpacity={0.8}>
          <View style={S.stratHead}>
            <Text style={{fontSize: 18}}>{s.icon}</Text>
            <Text style={S.stratTitle} numberOfLines={2}>{s.title}</Text>
            <View style={S.stratBadge}><Text style={S.stratBadgeTxt}>{s.badge}</Text></View>
          </View>
          <Text style={S.stratDesc}>{s.desc}</Text>
          <Text style={S.stratPotential}>{s.potential}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StrategyMsg({data}) {
  return (
    <View style={S.aiBubble}>
      <Text style={[S.aiTxt, {marginBottom: 10}]}>{data.intro}</Text>
      {data.cards?.map(c => (
        <View key={c.title} style={S.stratCard}>
          <View style={S.stratHead}>
            <Text style={{fontSize: 18}}>{c.icon}</Text>
            <Text style={S.stratTitle} numberOfLines={2}>{c.title}</Text>
            <View style={S.stratBadge}><Text style={S.stratBadgeTxt}>{c.badge}</Text></View>
          </View>
          <Text style={S.stratDesc}>{c.desc}</Text>
          <Text style={S.stratPotential}>{c.potential}</Text>
        </View>
      ))}
      {data.followup && (
        <Text style={[S.aiTxt, {color: Colors.smoke, fontStyle: 'italic', marginTop: 8}]}>
          {data.followup}
        </Text>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  root:         {flex: 1, backgroundColor: '#12002e'},
  header:       {paddingHorizontal: Sp.xl, paddingTop: Sp.lg, paddingBottom: Sp.xl},
  badgeRow:     {flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(147,87,255,0.18)', borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(147,87,255,0.35)', marginBottom: 10},
  dot:          {width: 6, height: 6, borderRadius: 3, backgroundColor: '#d4a8ff'},
  badgeTxt:     {fontSize: 11, color: '#d4a8ff', fontWeight: '600'},
  headerTitle:  {fontSize: 22, fontWeight: '700', color: Colors.white, marginBottom: 4},
  headerSub:    {fontSize: 12, color: 'rgba(255,255,255,0.45)'},
  quickScroll:  {flexGrow: 0, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.mist},
  chip:         {backgroundColor: Colors.purplePale, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.purple + '30'},
  chipTxt:      {fontSize: 12, fontWeight: '600', color: Colors.purple},
  messages:     {flex: 1, backgroundColor: Colors.cream},
  msgRow:       {flexDirection: 'row', gap: 8, alignItems: 'flex-start'},
  msgRowUser:   {justifyContent: 'flex-end'},
  aiAvatar:     {width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2},
  userBubble:   {backgroundColor: Colors.purple, borderRadius: R.xl, borderBottomRightRadius: 4, padding: 12, maxWidth: '80%'},
  userTxt:      {fontSize: 14, color: Colors.white, lineHeight: 20},
  aiBubble:     {backgroundColor: Colors.white, borderRadius: R.xl, borderTopLeftRadius: 4, padding: 14, maxWidth: '85%', ...Shadow.card},
  aiTxt:        {fontSize: 13, color: Colors.ink, lineHeight: 20},
  stratCard:    {backgroundColor: Colors.purplePale, borderRadius: R.lg, borderWidth: 1, borderColor: Colors.purple + '20', padding: 10, marginTop: 8},
  stratHead:    {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6},
  stratTitle:   {flex: 1, fontSize: 12, fontWeight: '700', color: '#2d1460'},
  stratDesc:    {fontSize: 11, color: Colors.smoke, lineHeight: 17},
  stratPotential:{fontSize: 11, color: Colors.purple, fontWeight: '600', marginTop: 4},
  stratBadge:   {backgroundColor: Colors.purple + '18', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2},
  stratBadgeTxt:{fontSize: 9, color: Colors.purple, fontWeight: '700'},
  inputRow:     {flexDirection: 'row', gap: 8, padding: Sp.md, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.mist},
  input:        {flex: 1, backgroundColor: Colors.cream, borderWidth: 1.5, borderColor: Colors.mist, borderRadius: R.pill, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.ink},
  sendBtn:      {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
});
