// import React, { useState, useEffect } from "react";
// import {
//   StyleSheet,
//   View,
//   Text,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Animated,
//   Keyboard,
//   TouchableOpacity,
//   Dimensions,
//   ScrollView,
//   TouchableWithoutFeedback,
// } from "react-native";
// import { Button, Input, Icon } from "react-native-elements";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { LinearGradient } from "expo-linear-gradient";
// import { useAuth } from "../../contexts/AuthContext";

// const { width, height } = Dimensions.get("window");

// const FoodDoodle = ({ style, name, size, rotation, delay }) => {
//   const fadeAnim = useState(new Animated.Value(0))[0];
//   const moveAnim = useState(new Animated.Value(0))[0];

//   useEffect(() => {
//     Animated.sequence([
//       Animated.delay(delay),
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.loop(
//           Animated.sequence([
//             Animated.timing(moveAnim, {
//               toValue: 1,
//               duration: 3000,
//               useNativeDriver: true,
//             }),
//             Animated.timing(moveAnim, {
//               toValue: 0,
//               duration: 3000,
//               useNativeDriver: true,
//             }),
//           ])
//         ),
//       ]),
//     ]).start();
//   }, []);

//   const translateY = moveAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, 10],
//   });

//   return (
//     <Animated.View
//       style={[
//         style,
//         {
//           opacity: fadeAnim,
//           transform: [
//             { rotate: `${rotation}deg` },
//             { translateY },
//           ],
//         },
//       ]}
//     >
//       <Icon
//         name={name}
//         type="material-community"
//         size={size}
//         color="rgba(255, 255, 255, 0.08)"
//       />
//     </Animated.View>
//   );
// };

// const LoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const { login, loading, error } = useAuth();
//   const [fadeAnim] = useState(new Animated.Value(0));
//   const [slideAnim] = useState(new Animated.Value(50));
//   const [focusedInput, setFocusedInput] = useState(null);

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       alert("Please enter email and password");
//       return;
//     }

//     Keyboard.dismiss();

//     const { success, error } = await login(email, password);

//     if (success) {
//       alert("Login successful");
//       navigation.navigate("MainApp");
//     } else {
//       alert(error);
//     }
//   };

//   const handleInputFocus = (inputName) => {
//     setFocusedInput(inputName);
//   };

//   const handleInputBlur = () => {
//     setFocusedInput(null);
//   };

//   const dismissKeyboard = () => {
//     Keyboard.dismiss();
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <LinearGradient colors={["#ff4500", "#cc3700"]} style={styles.gradient}>
//         <View style={styles.doodleContainer}>
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "5%", left: "5%" }]}
//             name="food"
//             size={45}
//             rotation={15}
//             delay={0}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "25%", left: "8%" }]}
//             name="pizza"
//             size={40}
//             rotation={-20}
//             delay={200}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "45%", left: "3%" }]}
//             name="noodles"
//             size={42}
//             rotation={10}
//             delay={400}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "65%", left: "7%" }]}
//             name="food-variant"
//             size={38}
//             rotation={-15}
//             delay={600}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "85%", left: "4%" }]}
//             name="hamburger"
//             size={44}
//             rotation={25}
//             delay={800}
//           />

//           <FoodDoodle
//             style={[styles.doodleBase, { top: "10%", left: "28%" }]}
//             name="food-croissant"
//             size={36}
//             rotation={-10}
//             delay={300}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "30%", left: "25%" }]}
//             name="coffee"
//             size={40}
//             rotation={20}
//             delay={500}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "50%", left: "28%" }]}
//             name="food-apple"
//             size={35}
//             rotation={-25}
//             delay={700}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "70%", left: "23%" }]}
//             name="cookie"
//             size={38}
//             rotation={15}
//             delay={900}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "90%", left: "27%" }]}
//             name="cupcake"
//             size={42}
//             rotation={-8}
//             delay={400}
//           />

//           <FoodDoodle
//             style={[styles.doodleBase, { top: "8%", left: "52%" }]}
//             name="food-fork-drink"
//             size={40}
//             rotation={12}
//             delay={600}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "28%", left: "48%" }]}
//             name="silverware-fork-knife"
//             size={35}
//             rotation={-18}
//             delay={800}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "48%", left: "53%" }]}
//             name="fruit-cherries"
//             size={38}
//             rotation={22}
//             delay={200}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "68%", left: "47%" }]}
//             name="ice-cream"
//             size={40}
//             rotation={-15}
//             delay={700}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "88%", left: "51%" }]}
//             name="coffee-outline"
//             size={36}
//             rotation={18}
//             delay={500}
//           />

//           <FoodDoodle
//             style={[styles.doodleBase, { top: "12%", left: "75%" }]}
//             name="food"
//             size={42}
//             rotation={-12}
//             delay={350}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "32%", left: "72%" }]}
//             name="pizza"
//             size={38}
//             rotation={25}
//             delay={550}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "52%", left: "76%" }]}
//             name="hamburger"
//             size={40}
//             rotation={-20}
//             delay={750}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "72%", left: "73%" }]}
//             name="noodles"
//             size={36}
//             rotation={15}
//             delay={950}
//           />
//           <FoodDoodle
//             style={[styles.doodleBase, { top: "92%", left: "77%" }]}
//             name="food-variant"
//             size={44}
//             rotation={-22}
//             delay={450}
//           />
//         </View>

//         <KeyboardAvoidingView
//           style={[styles.content, { zIndex: 1 }]}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             <TouchableWithoutFeedback onPress={dismissKeyboard}>
//               <View style={styles.innerContent}>
//                 <Animated.View
//                   style={[
//                     styles.formContainer,
//                     {
//                       opacity: fadeAnim,
//                       transform: [{ translateY: slideAnim }],
//                     },
//                   ]}
//                 >
//                   <View style={styles.header}>
//                     <Text style={styles.title}>Welcome Back!</Text>
//                     <Text style={styles.subtitle}>
//                       Sign in to your vendor account
//                     </Text>
//                   </View>

//                   <View style={styles.form}>
//                     <View
//                       style={[
//                         styles.inputWrapper,
//                         focusedInput === "email" && styles.inputWrapperFocused,
//                       ]}
//                     >
//                       <Icon
//                         name="email"
//                         type="material"
//                         size={24}
//                         color={focusedInput === "email" ? "#ff4500" : "#B2BEC3"}
//                         style={styles.inputIcon}
//                       />
//                       <Input
//                         placeholder="Email"
//                         value={email}
//                         onChangeText={setEmail}
//                         autoCapitalize="none"
//                         keyboardType="email-address"
//                         containerStyle={styles.inputContainer}
//                         inputContainerStyle={styles.inputField}
//                         inputStyle={styles.input}
//                         placeholderTextColor="#B2BEC3"
//                         onFocus={() => handleInputFocus("email")}
//                         onBlur={handleInputBlur}
//                         disabled={loading}
//                       />
//                     </View>

//                     <View
//                       style={[
//                         styles.inputWrapper,
//                         focusedInput === "password" &&
//                           styles.inputWrapperFocused,
//                       ]}
//                     >
//                       <Icon
//                         name="lock"
//                         type="material"
//                         size={24}
//                         color={
//                           focusedInput === "password" ? "#ff4500" : "#B2BEC3"
//                         }
//                         style={styles.inputIcon}
//                       />
//                       <Input
//                         placeholder="Password"
//                         value={password}
//                         onChangeText={setPassword}
//                         secureTextEntry={!showPassword}
//                         containerStyle={styles.inputContainer}
//                         inputContainerStyle={styles.inputField}
//                         inputStyle={styles.input}
//                         placeholderTextColor="#B2BEC3"
//                         onFocus={() => handleInputFocus("password")}
//                         onBlur={handleInputBlur}
//                         disabled={loading}
//                         rightIcon={
//                           <Icon
//                             name={
//                               showPassword ? "visibility" : "visibility-off"
//                             }
//                             type="material"
//                             size={24}
//                             color={
//                               focusedInput === "password"
//                                 ? "#ff4500"
//                                 : "#B2BEC3"
//                             }
//                             onPress={() => setShowPassword(!showPassword)}
//                           />
//                         }
//                       />
//                     </View>

//                     {error && (
//                       <Animated.View
//                         style={[styles.errorContainer, { opacity: fadeAnim }]}
//                       >
//                         <Icon
//                           name="error"
//                           type="material"
//                           size={20}
//                           color="#FF5252"
//                         />
//                         <Text style={styles.errorText}>{error}</Text>
//                       </Animated.View>
//                     )}

//                     <Button
//                       title="Forgot Password?"
//                       type="clear"
//                       titleStyle={styles.forgotPassword}
//                       containerStyle={styles.forgotPasswordContainer}
//                       disabled={loading}
//                     />

//                     <TouchableOpacity
//                       onPress={handleLogin}
//                       disabled={loading}
//                       activeOpacity={0.8}
//                     >
//                       <Animated.View
//                         style={[
//                           styles.loginButtonContainer,
//                           { opacity: loading ? 0.7 : 1 },
//                         ]}
//                       >
//                         <LinearGradient
//                           colors={["#ff4500", "#cc3700"]}
//                           start={{ x: 0, y: 0 }}
//                           end={{ x: 1, y: 0 }}
//                           style={styles.loginButton}
//                         >
//                           {loading ? (
//                             <ActivityIndicator color="#fff" />
//                           ) : (
//                             <Text style={styles.loginButtonText}>Login</Text>
//                           )}
//                         </LinearGradient>
//                       </Animated.View>
//                     </TouchableOpacity>
//                   </View>

//                   <View style={styles.footer}>
//                     <Text style={styles.footerText}>
//                       Don't have an account?{" "}
//                     </Text>
//                     <Button
//                       title="Sign Up"
//                       type="clear"
//                       titleStyle={styles.signUpButton}
//                       onPress={() => navigation.navigate("Signup")}
//                       disabled={loading}
//                     />
//                   </View>
//                 </Animated.View>
//               </View>
//             </TouchableWithoutFeedback>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </LinearGradient>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   gradient: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     justifyContent: "center",
//     position: 'relative',
//   },
//   formContainer: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 30,
//     margin: 20,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 10,
//     },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 10,
//     zIndex: 2,
//   },
//   header: {
//     marginBottom: 30,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: "bold",
//     color: "#2D3436",
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#636E72",
//     textAlign: "center",
//   },
//   form: {
//     marginBottom: 5,
//   },
//   inputWrapper: {
//     backgroundColor: "#F8F9FA",
//     borderRadius: 15,
//     marginBottom: 15,
//     paddingHorizontal: 15,
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#DFE6E9",
//     height: 56,
//   },
//   inputWrapperFocused: {
//     borderColor: "#ff4500",
//     shadowColor: "#ff4500",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   inputContainer: {
//     flex: 1,
//     paddingHorizontal: 0,
//     height: 56,
//     paddingBottom: 0,
//     marginBottom: 0,
//   },
//   inputField: {
//     borderBottomWidth: 0,
//     paddingVertical: 0,
//     minHeight: 40,
//     height: 56,
//     marginTop: 0,
//     marginBottom: 0,
//     paddingTop: 0,
//     paddingBottom: 0,
//     alignItems: 'center',
//   },
//   input: {
//     fontSize: 16,
//     color: "#2D3436",
//     height: 56,
//     paddingVertical: 0,
//     marginTop: 0,
//     marginBottom: 0,
//   },
//   errorContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFE8E8",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 15,
//   },
//   errorText: {
//     color: "#FF5252",
//     fontSize: 14,
//     marginLeft: 8,
//   },
//   forgotPasswordContainer: {
//     alignItems: "flex-end",
//     marginBottom: 25,
//   },
//   forgotPassword: {
//     color: "#ff4500",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   loginButtonContainer: {
//     borderRadius: 15,
//     overflow: "hidden",
//     marginBottom: 20,
//   },
//   loginButton: {
//     paddingVertical: 15,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loginButtonText: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   footer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   footerText: {
//     color: "#636E72",
//     fontSize: 16,
//   },
//   signUpButton: {
//     color: "#ff4500",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   innerContent: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   doodleContainer: {
//     ...StyleSheet.absoluteFillObject,
//     zIndex: 0,
//   },
//   doodleBase: {
//     position: 'absolute',
//   },
// });

// export default LoginScreen;

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
import { supabase } from "../../services/authclient";
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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      Keyboard.dismiss();

      // Call the API to login
      const result = await login(email, password);
      // console.log("Logged in user:", user);

      if (result.success) {
        console.log("Logged in user:", result);
        // Navigate to main app on successful login
        navigation.navigate("MainApp");
      } else {
        console.log("Login failed:", result.error);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Login failed. Please try again.");
    }
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
                        name="email"
                        type="material"
                        size={24}
                        color="rgba(255, 255, 255, 0.8)"
                        style={styles.inputIcon}
                      />
                      <Input
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
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
                        value={password}
                        onChangeText={setPassword}
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

                    {error && (
                      <View style={styles.errorContainer}>
                        <Icon
                          name="error"
                          type="material"
                          size={20}
                          color="#E10600"
                        />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    )}

                    <Button
                      title={loading ? "" : "Login"}
                      buttonStyle={styles.signupButton}
                      containerStyle={styles.buttonContainer}
                      onPress={handleLogin}
                      disabled={loading}
                      icon={loading ? <ActivityIndicator color="#fff" /> : null}
                    />
                  </View>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>
                      Already have an account?{" "}
                    </Text>
                    <Button
                      title="Sign Up"
                      type="clear"
                      titleStyle={styles.loginButton}
                      onPress={() => navigation.navigate("Signup")}
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: "#E10600",
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

export default LoginScreen;
