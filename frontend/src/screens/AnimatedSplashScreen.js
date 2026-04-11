import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Image, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withRepeat, 
  withSequence, 
  runOnJS,
  interpolate,
  withSpring
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const AnimatedSplashScreen = ({ onFinish }) => {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const logoPulse = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Logo entrance
    logoOpacity.value = withTiming(1, { duration: 1000 });
    logoScale.value = withSpring(1, { damping: 12 });

    // Logo continuous pulse
    logoPulse.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    ));

    // Text transition
    textOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(800, withTiming(0, { duration: 800 }));

    // Progress bar
    progressWidth.value = withDelay(1500, withTiming(1, { duration: 2000 }, (finished) => {
      if (finished && onFinish) {
        runOnJS(onFinish)();
      }
    }));
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value * logoPulse.value }
    ],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: interpolate(progressWidth.value, [0, 1], [0, width * 0.7]),
  }));

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LinearGradient
        colors={['#020617', '#0f172a', '#1e293b']}
        style={styles.background}
      />
      
      <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
        <View style={styles.glow} />
        <View style={styles.logoWrapper}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      <Animated.View style={[styles.textContainer, animatedTextStyle]}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>REDS</Text>
          <View style={styles.titleUnderline} />
        </View>
        <Text style={styles.subtitle}>University Management System</Text>
        
        <View style={styles.loadingWrapper}>
          <View style={styles.progressContainer}>
              <View style={styles.track} />
              <Animated.View style={[styles.line, animatedProgressStyle]}>
                <LinearGradient
                  colors={['#800000', '#dc2626', '#800000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
          </View>
          <Text style={styles.loadingText}>Initializing system modules...</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>Powered by Advanced Agentic Coding</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#800000',
    opacity: 0.15,
  },
  logoWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 25,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  titleWrapper: {
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 54,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 10,
    textAlign: 'center',
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#800000',
    marginTop: -5,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 3,
    marginTop: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  loadingWrapper: {
    marginTop: 60,
    alignItems: 'center',
  },
  progressContainer: {
    width: width * 0.7,
    height: 6,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 3,
  },
  track: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  line: {
    position: 'absolute',
    height: '100%',
    borderRadius: 3,
  },
  loadingText: {
    marginTop: 15,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerBrand: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  }
});

export default AnimatedSplashScreen;
