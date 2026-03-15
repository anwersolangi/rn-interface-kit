import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Keyboard, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, interpolate } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OTPVerificationScreen() {
  

const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationState, setVerificationState] = useState('idle');
  const inputRefs = useRef([]);
  const shakeAnim = useSharedValue(0);
  const successAnim = useSharedValue(0);

useEffect(() => {
    const isComplete = otp.every(digit => digit !== '');
    if (isComplete) {
      handleAutoVerify();
    }
  }, [otp]);

const handleChange = (text, index) => {
    if (!/^\d*$/.test(text)) return;
    
    const newOtp = [...otp];
    
    if (text.length === 0) {
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }
    
    newOtp[index] = text[text.length - 1];
    setOtp(newOtp);

    if (text.length > 0 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleAutoVerify = async () => {
    Keyboard.dismiss();
    setVerificationState('loading');

    setTimeout(() => {
      setVerificationState('success');
      successAnim.value = withTiming(1, { duration: 400 });
    }, 1500);
  };

  const handleManualVerify = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      shakeAnim.value = withSequence(
        withSpring(-8, { damping: 8, stiffness: 200 }),
        withSpring(8, { damping: 8, stiffness: 200 }),
        withSpring(-8, { damping: 8, stiffness: 200 }),
        withSpring(0, { damping: 8, stiffness: 200 })
      );
      return;
    }
    handleAutoVerify();
  };



  

const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }]
  }));

  const buttonStyle = useAnimatedStyle(() => {
    const scale = interpolate(successAnim.value, [0, 0.5, 1], [1, 0.96, 1]);
    return {
      transform: [{ scale }]
    };
  });



  

const getButtonContent = () => {
    if (verificationState === 'loading') {
      return <ActivityIndicator color="#FFFFFF" size="small" />;
    }
    if (verificationState === 'success') {
      return (
        <View style={styles.buttonContent}>
          <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
          <Text style={styles.buttonText}>Verified</Text>
        </View>
      );
    }
    return <Text style={styles.buttonText}>Continue</Text>;
  };

  const isButtonDisabled = verificationState === 'loading' || verificationState === 'success';



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
<View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={'phone-portrait-outline'} color={'#8B5CF6'} size={35} />
          </View>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>
            We sent a code to your phone{'\n'}
            <Text style={styles.phone}>+1 (555) 123-4567</Text>
          </Text>
        </View>

        
<Animated.View style={[styles.otpContainer, shakeStyle]}>
          {otp.map((digit, index) => (
            <View key={index} style={styles.inputWrapper}>
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled
                ]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                caretHidden
                editable={verificationState === 'idle'}
              />
              {digit && <View style={styles.dot} />}
            </View>
          ))}
        </Animated.View>

        
<Pressable onPress={handleManualVerify} disabled={isButtonDisabled}>
          {({ pressed }) => (
            <Animated.View style={[
              styles.button,
              pressed && !isButtonDisabled && styles.buttonPressed,
              verificationState === 'success' && styles.buttonSuccess,
              buttonStyle
            ]}>
              {getButtonContent()}
            </Animated.View>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          <Pressable disabled={verificationState !== 'idle'}>
            {({ pressed }) => (
              <Text style={[
                styles.resendLink,
                pressed && styles.resendLinkPressed,
                verificationState !== 'idle' && styles.resendLinkDisabled
              ]}>
                Send again
              </Text>
            )}
          </Pressable>
        </View>






      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  
button: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 56,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonSuccess: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#71717A',
  },
  resendLink: {
    fontSize: 15,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  resendLinkPressed: {
    opacity: 0.7,
  },
  resendLinkDisabled: {
    opacity: 0.4,
  },

otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  otpInput: {
    height: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#27272A',
    backgroundColor: '#18181B',
    textAlign: 'center',
    fontSize: 0,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  dot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
  

header: {
    alignItems: 'center',
    marginBottom: 56,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 22,
  },
  phone: {
    color: '#A1A1AA',
    fontWeight: '600',
  },
  

});

