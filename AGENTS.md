# AGENTS.md – Chef2Home Native

Guidelines for AI coding agents working on this React Native (Expo) project. Follow these practices for consistent structure, usability, and performance on Android and iOS.

---

## 1. Project Overview

**Chef2Home** native is a food subscription and meal-booking mobile app built with:

- **Expo ~54** + **React 19** + **React Native 0.81** + **TypeScript**
- **React Navigation 7** (native-stack + bottom-tabs)
- **Redux Toolkit** + **redux-persist** (AsyncStorage) for auth and theme
- **React Native Paper** (MD3) for UI
- **Axios** (API client with interceptors for auth refresh)

### Key Directories

| Path | Purpose |
|------|---------|
| `src/screens/` | Screen components (auth, Home, Booking, Subscription, Settings) |
| `src/navigation/` | RootNavigator, AuthStack, MainTabs, types |
| `src/store/` | Redux slices (auth, theme), store config with persist |
| `src/api/` | client (clientApi + interceptors), authApi, userApi, mealsApi, subscription*, etc. |
| `src/hooks/` | useGetSubscription, useGetPreference, useCreateInvoice, etc. |
| `src/utils/` | error.utils, string.utils, url.utils, googleSignIn |
| `src/constants/` | theme (CHEF_ORANGE, CHEF_GREEN, etc.) |
| `src/types/` | Shared types |

### Entry

`index.ts` → `App.tsx` (ReduxProvider, PersistGate, PaystackProvider, PaperProvider, NavigationContainer, RootNavigator).

---

## 2. Development Environment

### Commands

| Command | Purpose |
|---------|---------|
| `npm run start` | Start Expo dev server. **Use this while iterating.** |
| `npm run android` | Run on Android device/emulator. |
| `npm run ios` | Run on iOS simulator/device. |

Prefer `expo start` during iteration; avoid full native builds in agent sessions when possible.

### Setup

1. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_BASE_URL`, `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY`, `EXPO_PUBLIC_GOOGLE_*` as needed.
2. Run `npm install`.
3. Run `npm run start` to start the app. Config is read via `expo-constants` / `app.config.js` `extra`.

---

## 3. React Native Best Practices

### Performance (Android and iOS)

- **Lists**: Use `FlatList` (or `SectionList`) for scrollable lists; avoid mapping large arrays to views. Use `keyExtractor`, `getItemLayout` when item height is fixed, and `windowSize` / `maxToRenderPerBatch` if needed for long lists.
- **Avoid inline functions in list props**: Pass stable callbacks (e.g. `useCallback`) to `renderItem` and list item components to reduce re-renders.
- **Images**: Prefer `Image` / `ImageBackground` with explicit dimensions or `resizeMode`; avoid unconstrained images that cause layout thrash. Use `PixelRatio` or resolution-specific assets where relevant.
- **Heavy work off JS thread**: Avoid blocking the JS thread with long sync work; use interaction managers or native modules for heavy ops where appropriate.
- **Memoization**: Use `React.memo` for list item components and `useCallback` / `useMemo` where props or dependencies are stable and prevent unnecessary re-renders.

### Usability (Android and iOS)

- **Touch targets**: Minimum ~44pt (dp) for interactive elements; use `hitSlop` or padding so taps are reliable on both platforms.
- **Safe area**: Use `react-native-safe-area-context` (SafeAreaView / useSafeAreaInsets) for notches, status bar, and home indicator so content is not obscured.
- **Keyboard**: Use `KeyboardAvoidingView` (with `behavior` and `keyboardVerticalOffset` as needed) for forms so fields stay visible on both platforms.
- **Platform differences**: Use `Platform.select()` or `Platform.OS` for platform-specific styles or logic (e.g. Android back button, iOS large titles) and test on both.
- **Accessibility**: Add `accessibilityLabel`, `accessibilityRole`, and `accessibilityHint` where it helps; ensure focus order and contrast where applicable.

### Code-level

- **Styles**: Use `StyleSheet.create` for style objects; avoid inline style objects for static styles.
- **Navigation**: Typed params via `navigation/types` and `NativeStackScreenProps`; avoid untyped `navigation.navigate`.
- **API**: Use `clientApi` from `src/api/client.ts` for all HTTP calls; handle errors with `getErrorMessage` from `utils/error.utils`.

---

## 4. Conventions and Structure

### Naming

- **Components**: PascalCase (`HomeScreen.tsx`, `AuthLayout.tsx`).
- **Hooks**: `use` prefix, camelCase; colocate in `src/hooks/` when shared.
- **Utils**: camelCase (`error.utils.ts`, `string.utils.ts`).

### Imports

- Group external packages first, then internal (e.g. `../store`, `../api`). Use existing relative paths (no `@/` alias in this project).
- Use type-only imports where appropriate: `import type { AuthStackParamList } from '../../navigation/types';`

### Theme

- Use `constants/theme.ts` (e.g. `CHEF_ORANGE`, `CHEF_GREEN`) and the Paper theme in `App.tsx` for consistency.

### React Patterns

- Prefer **functional components**.
- Extract reusable logic into **custom hooks** in `src/hooks/`.
- Keep components focused; split large components into smaller ones.

---

## 5. Quality and PR

- Ensure the app runs with `npm run start`; use `npm run android` and `npm run ios` when changing native config or dependencies.
- Follow existing patterns in the same feature (screens, api, store).
- Fix TypeScript and linter errors before committing.

---

## 6. Summary

1. Use `npm run start` for development; avoid full native builds during agent sessions when possible.
2. Use `FlatList` for lists, `StyleSheet.create` for styles, and `clientApi` for HTTP.
3. Respect safe areas, touch targets (~44pt), and keyboard avoidance for Android and iOS.
4. Use typed navigation and `constants/theme.ts` for consistency.
5. Follow the existing directory layout and naming in `src/`.
