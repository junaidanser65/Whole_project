import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import { Button, Input, Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { apiClient } from "../../services/api";

const { width, height } = Dimensions.get("window");

const FoodDoodle = ({ style, name, size, rotation, delay }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const moveAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(moveAnim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(moveAnim, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    ]).start();
  }, []);

  const translateY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ rotate: `${rotation}deg` }, { translateY }],
        },
      ]}
    >
      <Icon
        name={name}
        type="material-community"
        size={size}
        color="rgba(255, 255, 255, 0.08)"
      />
    </Animated.View>
  );
};

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, loading, error } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [signupError, setSignupError] = useState(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);


 const handleSignup = async () => {
   setSignupError(null);

   try {
     Keyboard.dismiss();

     // Form validation
     if (
       !formData.name ||
       !formData.phone_number ||
       !formData.email ||
       !formData.password
     ) {
       const errorMessage = "Please fill in all fields";
       alert(errorMessage);
       setSignupError(errorMessage);
       return;
     }

     if (formData.password.length < 6) {
       const errorMessage = "Password must be at least 6 characters long";
       setSignupError(errorMessage);
       return;
     }

     const userData = {
       name: formData.name,
       email: formData.email,
       password: formData.password,
       phone_number: formData.phone_number,
     };

     console.log("Sending signup data:", userData);

     const user = await apiClient.signup(userData);
     console.log("User after signup:", user);

     alert("Signup successful! Welcome, " + user.name);
     navigation.navigate("Login");
   } catch (error) {
     console.error("Signup API error:", error);
     setSignupError(error?.message || "Signup failed");
   }
 };


  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#ff4500", "#cc3700"]} style={styles.gradient}>
        <View style={styles.doodleContainer}>
          {/* First Row */}
          <FoodDoodle
            style={[styles.doodleBase, { top: "2%", left: "5%" }]}
            name="food"
            size={45}
            rotation={15}
            delay={0}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "8%", left: "25%" }]}
            name="pizza"
            size={38}
            rotation={-20}
            delay={200}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "5%", left: "45%" }]}
            name="noodles"
            size={42}
            rotation={10}
            delay={400}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "3%", left: "65%" }]}
            name="food-variant"
            size={40}
            rotation={-15}
            delay={600}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "7%", left: "85%" }]}
            name="hamburger"
            size={44}
            rotation={25}
            delay={800}
          />

          {/* Second Row */}
          <FoodDoodle
            style={[styles.doodleBase, { top: "20%", left: "8%" }]}
            name="food-croissant"
            size={40}
            rotation={-10}
            delay={300}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "25%", left: "30%" }]}
            name="coffee"
            size={36}
            rotation={20}
            delay={500}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "22%", left: "55%" }]}
            name="food-apple"
            size={42}
            rotation={-25}
            delay={700}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "18%", left: "78%" }]}
            name="cookie"
            size={38}
            rotation={15}
            delay={900}
          />

          {/* Third Row */}
          <FoodDoodle
            style={[styles.doodleBase, { top: "40%", left: "12%" }]}
            name="food-fork-drink"
            size={40}
            rotation={12}
            delay={600}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "45%", left: "35%" }]}
            name="silverware-fork-knife"
            size={35}
            rotation={-18}
            delay={800}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "42%", left: "60%" }]}
            name="fruit-cherries"
            size={38}
            rotation={22}
            delay={200}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "38%", left: "82%" }]}
            name="ice-cream"
            size={40}
            rotation={-15}
            delay={700}
          />

          {/* Fourth Row */}
          <FoodDoodle
            style={[styles.doodleBase, { top: "60%", left: "5%" }]}
            name="food"
            size={42}
            rotation={-12}
            delay={350}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "65%", left: "28%" }]}
            name="pizza"
            size={38}
            rotation={25}
            delay={550}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "62%", left: "52%" }]}
            name="hamburger"
            size={40}
            rotation={-20}
            delay={750}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "58%", left: "75%" }]}
            name="noodles"
            size={36}
            rotation={15}
            delay={950}
          />

          {/* Fifth Row */}
          <FoodDoodle
            style={[styles.doodleBase, { top: "80%", left: "15%" }]}
            name="food-variant"
            size={44}
            rotation={-22}
            delay={450}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "85%", left: "38%" }]}
            name="cupcake"
            size={40}
            rotation={18}
            delay={650}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "82%", left: "62%" }]}
            name="food-croissant"
            size={42}
            rotation={-15}
            delay={850}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "88%", left: "85%" }]}
            name="coffee"
            size={38}
            rotation={20}
            delay={1050}
          />

          {/* Additional Scattered Doodles */}
          <FoodDoodle
            style={[styles.doodleBase, { top: "15%", left: "42%" }]}
            name="cookie"
            size={35}
            rotation={8}
            delay={250}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "35%", left: "88%" }]}
            name="food-apple"
            size={38}
            rotation={-28}
            delay={550}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "55%", left: "18%" }]}
            name="ice-cream"
            size={40}
            rotation={15}
            delay={850}
          />
          <FoodDoodle
            style={[styles.doodleBase, { top: "75%", left: "48%" }]}
            name="fruit-cherries"
            size={36}
            rotation={-12}
            delay={1150}
          />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.content, { zIndex: 1 }]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.innerContent}>
                <Animated.View
                  style={[styles.formContainer, { opacity: fadeAnim }]}
                >
                  <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>
                  </View>

                  <View style={styles.form}>
                    <View style={styles.inputWrapper}>
                      <Icon
                        name="person"
                        type="material"
                        size={24}
                        color="rgba(255, 255, 255, 0.8)"
                        style={styles.inputIcon}
                      />
                      <Input
                        placeholder="First Name"
                        value={formData.name}
                        onChangeText={(value) => updateFormData("name", value)}
                        containerStyle={styles.inputContainer}
                        inputContainerStyle={styles.inputField}
                        inputStyle={styles.input}
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        disabled={loading}
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Icon
                        name="email"
                        type="material"
                        size={24}
                        color="rgba(255, 255, 255, 0.8)"
                        style={styles.inputIcon}
                      />
                      <Input
                        placeholder="Email"
                        value={formData.email}
                        onChangeText={(value) => updateFormData("email", value)}
                        containerStyle={styles.inputContainer}
                        inputContainerStyle={styles.inputField}
                        inputStyle={styles.input}
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        disabled={loading}
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Icon
                        name="lock"
                        type="material"
                        size={24}
                        color="rgba(255, 255, 255, 0.8)"
                        style={styles.inputIcon}
                      />
                      <Input
                        placeholder="Password"
                        value={formData.password}
                        onChangeText={(value) =>
                          updateFormData("password", value)
                        }
                        containerStyle={styles.inputContainer}
                        inputContainerStyle={styles.inputField}
                        inputStyle={styles.input}
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        secureTextEntry={!showPassword}
                        disabled={loading}
                        rightIcon={
                          <Icon
                            name={
                              showPassword ? "visibility" : "visibility-off"
                            }
                            type="material"
                            size={24}
                            color="rgba(255, 255, 255, 0.8)"
                            onPress={() => setShowPassword(!showPassword)}
                          />
                        }
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Icon
                        name="credit-card"
                        type="material"
                        size={24}
                        color="rgba(255, 255, 255, 0.8)"
                        style={styles.inputIcon}
                      />
                      <Input
                        placeholder="CNIC Number"
                        value={formData.phone_number}
                        onChangeText={(value) =>
                          updateFormData("phone_number", value)
                        }
                        containerStyle={styles.inputContainer}
                        inputContainerStyle={styles.inputField}
                        inputStyle={styles.input}
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        disabled={loading}
                      />
                    </View>

                    {error && (
                      <View style={styles.errorContainer}>
                        <Icon
                          name="error"
                          type="material"
                          size={20}
                          color="#FF5252"
                        />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    )}

                    <Button
                      title={loading ? "" : "Sign Up"}
                      buttonStyle={styles.signupButton}
                      containerStyle={styles.buttonContainer}
                      onPress={handleSignup}
                      disabled={loading}
                      icon={loading ? <ActivityIndicator color="#fff" /> : null}
                    />
                  </View>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>
                      Already have an account?{" "}
                    </Text>
                    <Button
                      title="Login"
                      type="clear"
                      titleStyle={styles.loginButton}
                      onPress={() => navigation.navigate("Login")}
                      disabled={loading}
                    />
                  </View>
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  innerContent: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "transparent",
    borderRadius: 30,
    padding: 20,
    backdropFilter: "blur(10px)",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  form: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.87)",
    height: 56,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 0,
    height: 56,
  },
  inputField: {
    borderBottomWidth: 0,
    paddingVertical: 0,
    height: 56,
  },
  input: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: "#FF5252",
    fontSize: 14,
    marginLeft: 8,
  },
  signupButton: {
    backgroundColor: "#ff4500",
    borderRadius: 15,
    paddingVertical: 15,
    marginTop: 10,
  },
  buttonContainer: {
    marginVertical: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  loginButton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  doodleContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  doodleBase: {
    position: "absolute",
  },
});

export default SignupScreen;