import React, { useState, FC } from 'react';
import { TextInput, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import authService from '@/services/auth.service';

type Mode = 'login' | 'register' | 'forgot';

const Auth: FC = () => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccess(false);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    resetForm();
  };

  const handleLogin = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await authService.login(email, password);
      router.push('/');
      if (typeof window !== 'undefined' && window.location) window.location.reload();
    } catch (error) {
      console.error('Login error (full):', error);
      const err = error as any;
      const resMessage =
        (err && err.response && err.response.data && (err.response.data.message || err.response.data.error)) ||
        (err && err.message) ||
        String(error);
      setError(typeof resMessage === 'object' ? JSON.stringify(resMessage) : resMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (): Promise<void> => {
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.register(email, password);
      setMode('login');
      resetForm();
    } catch (err: any) {
      console.error('Registration error (full):', err);
      const resMessage =
        (err && err.response && err.response.data && (err.response.data.message || err.response.data.error)) ||
        err.message ||
        String(err);
      setError(typeof resMessage === 'object' ? JSON.stringify(resMessage) : resMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('Forgot password error:', error);
      const err = error as any;
      const resMessage =
        (err && err.response && err.response.data && (err.response.data.message || err.response.data.error)) ||
        (err && err.message) ||
        String(error);
      setError(typeof resMessage === 'object' ? JSON.stringify(resMessage) : resMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Please enter your credentials to login</Text>
            <TextInput
              nativeID="auth-email"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
            <TextInput
              nativeID="auth-password"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              editable={!loading}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {loading && <ActivityIndicator size="small" />}
            <Button title="Login" onPress={handleLogin} disabled={loading} />
            <Button title="Register" onPress={() => handleModeChange('register')} />
            <Button title="Forgot Password?" onPress={() => handleModeChange('forgot')} />
          </>
        );
      case 'register':
        return (
          <>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>Please enter your email address and password to create an account.</Text>
            <TextInput
              nativeID="register-email"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
            <TextInput
              nativeID="register-password"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              editable={!loading}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title={loading ? 'Registering...' : 'Register'}
              onPress={handleRegister}
              disabled={loading}
            />
            <Button title="Back to Login" onPress={() => handleModeChange('login')} />
          </>
        );
      case 'forgot':
        return (
          <>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Please enter your email address to receive a password reset link.</Text>
            <TextInput
              nativeID="forgot-email"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>Check your email for password reset instructions</Text> : null}
            {loading && <ActivityIndicator size="small" />}
            <Button title="Send Reset Link" onPress={handleForgotPassword} disabled={!email || loading} />
            <Button title="Back to Login" onPress={() => handleModeChange('login')} />
          </>
        );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {renderForm()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Auth;

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8, borderRadius: 4 },
  error: { color: 'red', marginBottom: 8 },
  success: { color: 'green', marginBottom: 8 },
});