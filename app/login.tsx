import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const emailLabelPosition = useSharedValue(0);
  const passwordLabelPosition = useSharedValue(0);
  const emailGlow = useSharedValue(0);
  const passwordGlow = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const isFormValid = email.length > 0 && password.length > 0;

  const handleEmailFocus = () => {
    setEmailFocused(true);
    emailLabelPosition.value = withTiming(1, { duration: 150 });
    emailGlow.value = withTiming(1, { duration: 150 });
  };

  const handleEmailBlur = () => {
    setEmailFocused(false);
    if (email.length === 0) {
      emailLabelPosition.value = withTiming(0, { duration: 150 });
    }
    emailGlow.value = withTiming(0, { duration: 150 });
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
    passwordLabelPosition.value = withTiming(1, { duration: 150 });
    passwordGlow.value = withTiming(1, { duration: 150 });
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    if (password.length === 0) {
      passwordLabelPosition.value = withTiming(0, { duration: 150 });
    }
    passwordGlow.value = withTiming(0, { duration: 150 });
  };

  const handleLogin = () => {
    if (!isFormValid) return;
    buttonScale.value = withTiming(0.96, { duration: 100 }, () => {
      buttonScale.value = withTiming(1, { duration: 100 });
    });
  };

  const emailLabelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(emailLabelPosition.value, [0, 1], [22, 6]);
    const scale = interpolate(emailLabelPosition.value, [0, 1], [1, 0.8]);
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const passwordLabelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(passwordLabelPosition.value, [0, 1], [22, 6]);
    const scale = interpolate(passwordLabelPosition.value, [0, 1], [1, 0.8]);
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const emailGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(emailGlow.value, [0, 1], [0, 0.4]);
    return {
      shadowOpacity: opacity,
    };
  });

  const passwordGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(passwordGlow.value, [0, 1], [0, 0.4]);
    return {
      shadowOpacity: opacity,
    };
  });

  const buttonScaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  React.useEffect(() => {
    if (email.length > 0) {
      emailLabelPosition.value = withTiming(1, { duration: 150 });
    }
  }, []);

  React.useEffect(() => {
    if (password.length > 0) {
      passwordLabelPosition.value = withTiming(1, { duration: 150 });
    }
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#020617', '#0F172A', '#1E1B4B', '#0F172A']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.decorativeCircle} />
        <View style={styles.decorativeCircleBottom} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>✦</Text>
              </View>

              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.subtitle}>
                Enter your credentials to access your account
              </Text>

              <View style={styles.brandTag}>
                <View style={styles.brandDot} />
                <Text style={styles.brandText}>GhostAuth · RNInterfaceKit</Text>
              </View>
            </View>

            

            <View style={styles.inputContainer}>
              <Animated.View
                style={[
                  styles.inputWrapper,
                  emailGlowStyle,
                  {
                    shadowColor: '#06B6D4',
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 16,
                  },
                ]}
              >
                <Animated.Text style={[styles.label, emailLabelStyle]}>
                  Email Address
                </Animated.Text>
                <TextInput
                  style={[styles.input, emailFocused && styles.inputFocused]}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  accessibilityLabel="Email input"
                  placeholderTextColor="transparent"
                />
              </Animated.View>
            </View>

            <View style={styles.inputContainer}>
              <Animated.View
                style={[
                  styles.inputWrapper,
                  passwordGlowStyle,
                  {
                    shadowColor: '#06B6D4',
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 16,
                  },
                ]}
              >
                <Animated.Text style={[styles.label, passwordLabelStyle]}>
                  Password
                </Animated.Text>
                <TextInput
                  style={[styles.input, passwordFocused && styles.inputFocused]}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  secureTextEntry
                  autoComplete="password"
                  accessibilityLabel="Password input"
                  placeholderTextColor="transparent"
                />
              </Animated.View>
            </View>

            <Pressable style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            

            <Animated.View style={buttonScaleStyle}>
              <Pressable
                style={styles.button}
                onPress={handleLogin}
                disabled={!isFormValid}
                accessibilityLabel="Login button"
                accessibilityState={{ disabled: !isFormValid }}
              >
                {isFormValid ? (
                  <LinearGradient
                    colors={['#06B6D4', '#0891B2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonText}>Continue</Text>
                      <Text style={styles.buttonIcon}>→</Text>
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={[styles.buttonGradient, styles.buttonDisabled]}>
                    <View style={styles.buttonContent}>
                      <Text style={[styles.buttonText, styles.buttonTextDisabled]}>
                        Continue
                      </Text>
                      <Text style={[styles.buttonIcon, styles.buttonIconDisabled]}>
                        →
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            </Animated.View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text style={styles.link}>Create Account</Text>
              </Text>
            </View>

            <View style={styles.securityNote}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>
                Secured with 256-bit encryption
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    top: -100,
    right: -100,
  },
  decorativeCircleBottom: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    bottom: -80,
    left: -80,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    marginBottom: 56,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  iconText: {
    fontSize: 32,
    color: '#06B6D4',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '400',
    lineHeight: 24,
  },
  brandTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06B6D4',
    marginRight: 8,
  },
  brandText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  inputFocused: {
    borderColor: 'rgba(6, 182, 212, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  label: {
    position: 'absolute',
    left: 20,
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 12,
  },
  forgotPasswordText: {
    color: '#06B6D4',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  buttonTextDisabled: {
    color: 'rgba(148, 163, 184, 0.5)',
  },
  buttonIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  buttonIconDisabled: {
    color: 'rgba(148, 163, 184, 0.5)',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '400',
  },
  link: {
    color: '#06B6D4',
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  securityIcon: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 6,
  },
  securityText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
});