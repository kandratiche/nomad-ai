import { LightScreen } from "@/components/ui/LightScreen";
import { router } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TextInput, TouchableOpacity, Platform, Alert, StyleSheet } from "react-native";
import { SplitTitle } from "@/components/ui/SplitTitle";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import supabase from "@/lib/supabaseClient";
import { AuthContext } from "@/context/authContext";
import { CaptionText } from "@/components/ui/ThemedText";
import { useTranslation } from "react-i18next";

export default function UserLogin() {
    const { t } = useTranslation();

    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [isError, setIsError] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    const { user } = useContext(AuthContext);
    
    useEffect(() => {
        if (user) {
            router.replace("/home");
        }
    }, [user]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('userLogin.loginButton'), t('userLogin.fillAllFields'));
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setIsError(true);
                setErrorMessage(error.message);
                return;
            }

            if (data?.user) {
                console.log("Logged in:", data.user.email);

                if (Platform.OS === "web") {
                    alert(t('userLogin.loginSuccess'));
                    router.replace("/city-select");
                } else {
                    Alert.alert(t('userLogin.loginButton'), t('userLogin.loginSuccess'), [
                        { text: "OK", onPress: () => router.replace("/city-select") },
                    ]);
                }
            }
        } catch (err) {
            console.error(err);
            Alert.alert(t('userLogin.loginButton'), t('userLogin.somethingWrong'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <LightScreen>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity 
                        onPress={() => { router.push('/') }} 
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#0F172A" />
                    </TouchableOpacity>
                </View>

                <SplitTitle 
                    first={t('userLogin.signIn.first')} 
                    second={t('userLogin.signIn.second')} 
                    style={styles.title} 
                />

                <View style={styles.screenContainer}>
                    <View style={styles.fieldContainer}>
                        <GlassCardOnLight
                            style={styles.glassCard}
                            contentStyle={styles.glassCardContent}
                        >
                            <TextInput
                                placeholder={t('userLogin.emailPlaceholder')}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                style={styles.input}
                                placeholderTextColor="#94A3B8"
                                returnKeyType="send"
                            />
                        </GlassCardOnLight>
                    </View>

                    <View style={styles.fieldContainer}>
                        <GlassCardOnLight
                            style={styles.glassCard}
                            contentStyle={styles.glassCardContent}
                        >
                            <TextInput
                                placeholder={t('userLogin.passwordPlaceholder')}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                style={styles.input}
                                placeholderTextColor="#94A3B8"
                                returnKeyType="send"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons 
                                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                    size={20} 
                                    color="#94A3B8" 
                                />
                            </TouchableOpacity>
                        </GlassCardOnLight>
                    </View>

                    {isError && (
                        <View style={styles.fieldContainer}>
                            <CaptionText style={styles.errorText}>
                                {errorMessage}
                            </CaptionText>
                        </View>
                    )}

                    <View style={styles.fieldContainer}>
                       <TouchableOpacity 
                            style={[styles.button, loading && { opacity: 0.5 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? t('userLogin.loggingIn') : t('userLogin.loginButton')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LightScreen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginLeft: 0,
        paddingBottom: 12,
    },
    backButton: {
        top: 24,
        left: 24,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(241,245,249,0.95)",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        marginTop: 50,
        marginBottom: 20,
        marginLeft: 24,
    },
    glassCard: {
        borderRadius: 24,
        marginBottom: 20,
    },
    glassCardContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    input: {
        flex: 1,
        color: "#0F172A",
        fontSize: 16,
        paddingVertical: 4,
        ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
    },
    fieldContainer: {
        marginBottom: 8,
        width: "90%",
    },
    screenContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 124,
    },
    button: {
        width: '100%',
        marginTop: 12,
        borderRadius: 24,
        backgroundColor: "#2DD4BF",
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'center',  
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    errorText: {
        color: "#EF4444",
        fontSize: 14,
        fontWeight: "400",
        marginTop: 4,
    }
});
