import { StyleSheet } from 'react-native';

import { CHEF_GREEN, ERROR_RED, GRAY_600 } from '../../../constants/theme';

export const authStyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#101928',
  },
  inputOtp: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 18,
    letterSpacing: 4,
    color: '#101928',
  },
  button: { marginTop: 8 },
  errorText: { color: ERROR_RED, marginBottom: 12, fontSize: 14 },
  switchBtn: { marginTop: 24, alignSelf: 'center' },
  linkText: { color: CHEF_GREEN, fontSize: 14 },
  linkTextMuted: { color: GRAY_600, fontSize: 14 },
  resendRow: { marginTop: 24, alignItems: 'center' },
});
