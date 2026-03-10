# Task: Generate Android APK for Expo Project

Generate a downloadable APK file for testing on Android devices using EAS Build.

## Status: 🗓️ PLANNED

---

## 📋 PRE-FLIGHT CHECKS
- [x] `eas-cli` installed (v16.28.0 detected)
- [x] Logged into Expo (`suriyavj33` detected)
- [x] `frontend/app.json` has `android.package` defined (`com.suriya033.clgproject`)
- [ ] `eas.json` configured for APK output

---

## 🛠️ IMPLEMENTATION PLAN

### Phase 1: Configuration
1. **Initialize EAS**: Run `eas build:configure` to generate basic `eas.json`.
2. **Configure APK Output**: Modify `eas.json` to include a profile that outputs an APK (`buildType: "apk"`).

### Phase 2: Execution
1. **Start Build**: Run `eas build -p android --profile preview` (using 'preview' as the APK profile).
2. **Monitor**: Track build progress on Expo dashboard.

### Phase 3: Delivery
1. **QR Code/Link**: Provide the download link to the user once the build is finished.

---

## ⚠️ RISK ASSESSMENT
- **Build Failures**: Missing local assets or native module incompatibilities.
- **Credentials**: EAS might ask for Android keystore (will select "let Expo handle it").

---

## 🏁 VERIFICATION CRITERIA
- [ ] `eas.json` exists with APK configuration.
- [ ] EAS build starts successfully.
- [ ] Downloadable APK link is generated.
