import React from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/api';

const RazorpayCheckoutScreen = ({ route, navigation }) => {
    const { feeId } = route.params;
    const [token, setToken] = React.useState(null);

    React.useEffect(() => {
        const fetchToken = async () => {
            const storedToken = await AsyncStorage.getItem('token');
            setToken(storedToken);
        };
        fetchToken();
    }, []);

    const onMessage = (event) => {
        try {
            const res = JSON.parse(event.nativeEvent.data);
            if (res.status === 'success') {
                Alert.alert('Payment Successful', 'Your fee has been paid successfully.', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else if (res.status === 'already_paid') {
                Alert.alert('Info', 'This fee is already paid.', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else if (res.status === 'dismissed') {
                Alert.alert('Payment Cancelled', 'You cancelled the payment.', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else if (res.status === 'error') {
                Alert.alert('Error', res.error || 'An error occurred during payment.', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (e) {
            console.error('WebView Message Error', e);
        }
    };

    if (!token) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#800000" />
            </View>
        );
    }

    const checkoutUrl = `${API_URL}/payments/checkout?feeId=${feeId}&token=${token}`;

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: checkoutUrl }}
                onMessage={onMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <ActivityIndicator style={styles.absoluteCenter} size="large" color="#800000" />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    absoluteCenter: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }
});

export default RazorpayCheckoutScreen;
